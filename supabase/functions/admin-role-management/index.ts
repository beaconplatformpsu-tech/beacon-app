import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyFirebaseAuth } from "../_shared/verifyFirebaseAuth.ts";
import { firebaseDbPatch, firebaseDbPost } from "../_shared/firebaseAdminRest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authResult = await verifyFirebaseAuth(req);
    if (authResult.error || !authResult.payload) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: authResult.status,
      });
    }

    const callerUid = authResult.payload.uid as string;
    
    // In our DB structure, the super_admin check is done via user_admin_meta or custom claims.
    // If custom claims aren't fully set, we fallback to checking the RTDB directly for the caller's role.
    const meta: any = await import("../_shared/firebaseAdminRest.ts").then(m => m.firebaseDbGet(`user_admin_meta/${callerUid}`));
    if (!meta || meta.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Only super_admin can perform this action." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const body = await req.json();
    const { targetUid, role } = body;

    if (!targetUid || !["student", "admin", "super_admin"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid parameters." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1. Update the role in the DB
    await firebaseDbPatch(`user_admin_meta/${targetUid}`, {
      role: role,
      updatedByAdmin: callerUid,
      updatedAt: new Date().toISOString()
    });

    // 2. Audit log
    await firebaseDbPost(`system/admin_logs`, {
      adminUid: callerUid,
      action: "UPDATE_ROLE",
      targetType: "user",
      targetId: targetUid,
      createdAt: new Date().toISOString(),
      metadata: { newRole: role }
    });

    // Note: Since we are using RTDB for authorization rules (e.g. root.child('user_admin_meta').child(auth.uid).child('role').val() === 'super_admin'), 
    // updating it here securely is sufficient to grant the user permissions without needing to set Firebase Custom Claims.
    // If Custom Claims were strictly required, we would need the Firebase Admin Node.js SDK or a REST equivalent for identitytoolkit:setAccountInfo.

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Admin Role Update Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
