import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1";
import { z } from "npm:zod@^3.24.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  major: z.string().max(200),
  careerLevel: z.string().max(100),
  skillsList: z.string().max(2000),
  tasksList: z.string().max(2000),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("Server configuration error.");

    const body = await req.json();
    const parseResult = RequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request payload." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { major, careerLevel, skillsList, tasksList } = parseResult.data;

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

    return new Response(JSON.stringify(parsedRecommendations), {
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
