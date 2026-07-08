import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1";
import { z } from "npm:zod@^3.24.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SkillSchema = z.object({
  name: z.string().max(100),
  proficiency: z.number().min(1).max(5).optional(),
});

const CareerPathSchema = z.object({
  title: z.string().max(200),
  demandLevel: z.string().max(50).optional(),
  requiredSkills: z.array(z.object({
    skillName: z.string().max(100),
    requiredLevel: z.number().optional()
  })).max(20),
});

const RequestSchema = z.object({
  userSkills: z.array(SkillSchema).max(50),
  careerPaths: z.array(CareerPathSchema).max(20),
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

    const { userSkills, careerPaths } = parseResult.data;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert Computer Science Career Counselor and Technical Mentor. 
      I am a student using a career guidance platform. 
      
      Here are the skills I currently have:
      ${JSON.stringify(userSkills, null, 2)}
      
      Here are the top career paths available in my platform's database:
      ${JSON.stringify(careerPaths, null, 2)}
      
      Based STRICTLY on this data, please provide a highly personalized, encouraging career and learning recommendation for me.
      
      Format your response in Markdown:
      1. Start with a brief, encouraging summary of my current skill profile.
      2. Identify the single best Career Path for me from the provided list based on my skills, and explain why.
      3. List the 2 to 3 most critical skills I need to learn next to bridge the gap for that specific career path.
      
      Do not hallucinate skills or career paths that are not in the provided JSON. Be concise, professional, and use a premium tone.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(JSON.stringify({ recommendation: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("AI Mentor Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate mentorship guidance. Please try again later." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
