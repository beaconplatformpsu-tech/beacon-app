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
    const { bucket, path } = body;

    if (!bucket || !path) {
      return new Response(JSON.stringify({ error: "Missing bucket or path" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const allowedPrivateBuckets = ["cv-files", "project-submissions", "resource-files"];
    if (!allowedPrivateBuckets.includes(bucket)) {
      return new Response(JSON.stringify({ error: "Invalid bucket for signed download" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Path Security Enforcement for downloads
    if (bucket === "resource-files") {
      // Resource files might be public, but if they are restricted or require a signed URL:
      // Ensure the user has the right to download (e.g. active student, admin, etc.)
      // We will allow any authenticated user to download a resource for now.
    } else {
      // For CVs and Project Submissions, the path MUST start with their UID,
      // UNLESS they are an admin.
      if (!path.startsWith(`${callerUid}/`)) {
        const meta: any = await firebaseDbGet(`user_admin_meta/${callerUid}`);
        if (!meta || meta.role !== "admin") {
          return new Response(JSON.stringify({ error: "Unauthorized: You can only access your own files." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          });
        }
      }
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

    // Generate a signed URL valid for 60 seconds
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60);

    if (error || !data) {
      console.error("Supabase Storage Error:", error);
      return new Response(JSON.stringify({ error: "Failed to generate signed download URL" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ signedUrl: data.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("Download URL generation error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
