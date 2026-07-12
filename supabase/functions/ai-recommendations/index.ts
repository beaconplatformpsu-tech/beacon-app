import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1";
import { verifyFirebaseAuth } from "../_shared/verifyFirebaseAuth.ts";
import { firebaseDbGet, firebaseDbPatch } from "../_shared/firebaseAdminRest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("Server configuration error.");

    const authResult = await verifyFirebaseAuth(req, { requireEmailVerified: true });
    if (authResult.error || !authResult.payload) {
      return new Response(JSON.stringify({ error: authResult.error }), { headers: corsHeaders, status: authResult.status });
    }
    const uid = authResult.payload.uid as string;

    // 1. Fetch user data directly from RTDB using admin privileges
    const userProfile = await firebaseDbGet(`users/${uid}`);
    if (!userProfile) {
      return new Response(JSON.stringify({ error: "User profile not found." }), { headers: corsHeaders, status: 404 });
    }

    const userPrivate = await firebaseDbGet(`user_private/${uid}`);
    
    const major = userProfile.major || "Unknown";
    const careerLevel = userProfile.academicLevel || "Unknown";
    
    let skillsList = "None";
    if (userPrivate?.skill_progress) {
      skillsList = Object.keys(userPrivate.skill_progress).join(", ");
    }
    
    let tasksList = "None";
    if (userPrivate?.tasks) {
      tasksList = Object.values(userPrivate.tasks).map((t: any) => t.title).join(", ");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
    });

    const prompt = `You are an elite technical career advisor for Computer Science students.
    Student Profile: Major in ${major}, Current Level: ${careerLevel}.
    Current Skills: ${skillsList}.
    Current Active Tasks: ${tasksList}.
    
    Provide exactly 3 highly personalized, actionable recommendations. Tie them explicitly to their active tasks and existing skills to help them reach professional tech industry career paths.
    Make the advice specific, pragmatic, and highly advanced. Avoid generic platitudes.
    
    Return ONLY a valid JSON array of objects matching this exact structure:
    [
      {
        "title": "Short catchy title",
        "description": "Specific, actionable technical advice linking their skills to a career path.",
        "type": "Skill" | "Career" | "Academic" | "Productivity",
        "actionText": "Short action (e.g. Explore Path)",
        "actionLink": "/career" | "/skills" | "/support"
      }
    ]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Ensure the response is valid JSON before sending to client
    const parsedRecommendations = JSON.parse(text);

    // Save recommendations back to user's private data securely
    const updates: Record<string, any> = {};
    parsedRecommendations.forEach((rec: any, index: number) => {
      updates[`rec_${Date.now()}_${index}`] = {
        ...rec,
        createdAt: new Date().toISOString(),
        isRead: false
      };
    });
    
    await firebaseDbPatch(`user_private/${uid}/recommendations`, updates);

    // Write AI Usage log
    await import("../_shared/firebaseAdminRest.ts").then(m => m.firebaseDbPost(`system/ai_usage_logs`, {
      uid,
      feature: "generate_recommendations",
      status: "success",
      createdAt: new Date().toISOString()
    }));

    return new Response(JSON.stringify({ success: true, recommendations: parsedRecommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("AI Recommendation Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate recommendations. Please try again later." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
