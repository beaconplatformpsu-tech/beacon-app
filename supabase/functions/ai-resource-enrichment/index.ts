import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1";
import { z } from "npm:zod@^3.24.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  pathTitle: z.string().max(200),
  userSkills: z.array(z.string().max(100)).max(50),
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

    const { pathTitle, userSkills } = parseResult.data;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Act as an expert technical career advisor. I am a CS student targeting the role of ${pathTitle}. 
    Here are my current skills: ${JSON.stringify(userSkills)}.
    
    Instead of inventing fake internships, please generate 3 generic, real-world job titles or roles related to this path that I should search for on platforms like LinkedIn or Indeed.
    For each generic role, provide a "matchPercentage" (integer) strictly based on my specific skills versus typical industry requirements for that role.
    Also list the "missingSkills" I should learn to become a stronger candidate.

    Return ONLY a JSON array of objects. Format: [{"title": "Junior Backend Engineer", "company": "General Tech Industry", "description": "Focuses on server-side logic and APIs.", "matchPercentage": 85, "missingSkills": ["Docker", "AWS"], "sourceUrl": "https://www.linkedin.com/jobs/search/?keywords=Junior%20Backend%20Engineer"}]`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const parsed = JSON.parse(textResponse);

    // Map to strict CareerOpportunity schema
    const mappedOpportunities = parsed.map((opp: any) => ({
      id: crypto.randomUUID(),
      title: opp.title,
      company: opp.company || "General Tech Industry",
      description: opp.description,
      sourceUrl: opp.sourceUrl || "#",
      matchPercentage: opp.matchPercentage,
      missingSkills: opp.missingSkills || [],
      isVerified: false,
      generatedByAI: true,
      disclaimer: "Suggested search direction"
    }));

    return new Response(JSON.stringify(mappedOpportunities), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Resource Enrichment Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate resource insights." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
