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
    
    // Check if caller is an admin
    const callerRole: string | null = await import("../_shared/firebaseAdminRest.ts").then(m => m.firebaseDbGet(`users/${callerUid}/role`));
    if (callerRole !== "admin") {
      return new Response(JSON.stringify({ error: "Only admin can perform this action." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const body = await req.json();
    const { targetUid, role } = body;

    if (!targetUid || !["student", "admin"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid parameters." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1. Update the role in the DB
    await firebaseDbPatch(`users/${targetUid}`, {
      role: role,
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

    // Note: Since we are using RTDB for authorization rules, 
    // updating it here securely is sufficient to grant the user permissions.
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
