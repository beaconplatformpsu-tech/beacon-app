import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1";
import { verifyFirebaseAuth } from "../_shared/verifyFirebaseAuth.ts";
import { firebaseDbGet, firebaseDbPatch, firebaseDbPost } from "../_shared/firebaseAdminRest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authResult = await verifyFirebaseAuth(req, { requireEmailVerified: true });
    if (authResult.error || !authResult.payload) {
      return new Response(JSON.stringify({ error: authResult.error }), { headers: corsHeaders, status: authResult.status });
    }
    const uid = authResult.payload.uid as string;

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("Server configuration error.");

    const body = await req.json();
    const { cvText } = body;

    if (!cvText || typeof cvText !== 'string' || cvText.length > 50000) {
      return new Response(JSON.stringify({ error: "Invalid CV text." }), { headers: corsHeaders, status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
    });

    const prompt = `You are an elite technical career advisor and ATS system.
    Analyze the following CV text:
    """
    ${cvText}
    """
    
    Return exactly a JSON object matching this structure:
    {
      "score": 85,
      "strengths": ["string"],
      "weaknesses": ["string"],
      "missingSkills": ["string"],
      "actionableFeedback": ["string"]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const analysis = JSON.parse(text);

    // Save to DB
    await firebaseDbPatch(`user_private/${uid}/cv_analysis`, {
      latestAnalysis: analysis,
      analyzedAt: new Date().toISOString()
    });

    // Write AI Usage log
    await firebaseDbPost(`system/ai_usage_logs`, {
      uid,
      feature: "analyze_cv",
      status: "success",
      createdAt: new Date().toISOString()
    });

    return new Response(JSON.stringify({ success: true, analysis }), { headers: corsHeaders, status: 200 });
  } catch (error: any) {
    console.error("CV Analysis Error:", error);
    return new Response(JSON.stringify({ error: "Failed to analyze CV. Please try again later." }), { headers: corsHeaders, status: 500 });
  }
});
