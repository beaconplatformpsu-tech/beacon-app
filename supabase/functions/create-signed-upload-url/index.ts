// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyFirebaseAuth } from "../_shared/verifyFirebaseAuth.ts";
import { firebaseDbGet } from "../_shared/firebaseAdminRest.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

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
    const body = await req.json();
    const { bucket, fileName, contentType } = body;

    if (!bucket || !fileName) {
      return new Response(JSON.stringify({ error: "Missing bucket or fileName" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const allowedBuckets = ["avatars", "cv-files", "project-submissions", "resource-files"];
    if (!allowedBuckets.includes(bucket)) {
      return new Response(JSON.stringify({ error: "Invalid bucket" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Path Security Enforcement
    let finalPath = "";
    if (bucket === "resource-files") {
      const role: string | null = await firebaseDbGet(`users/${callerUid}/role`);
      if (role !== "admin") {
        return new Response(JSON.stringify({ error: "Only admins can upload resource files" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        });
      }
      finalPath = `${fileName}`;
    } else {
      // User uploads must be scoped to their UID
      finalPath = `${callerUid}/${fileName}`;
    }

    const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials in Edge Function env");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(finalPath);

    if (error || !data) {
      console.error("Supabase Storage Error:", error);
      return new Response(JSON.stringify({ error: "Failed to generate signed URL" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ 
      signedUrl: data.signedUrl, 
      path: finalPath,
      token: data.token // Required for PUT request depending on supabase-js version
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("Upload URL generation error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
