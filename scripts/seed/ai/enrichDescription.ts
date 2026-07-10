import { ai, MODEL } from "./config.js";
import { z } from "zod";

const descriptionSchema = z.object({
  description: z.string().describe("A concise 1-2 sentence summary."),
  longDescription: z.string().describe("A professional, 2-3 paragraph detailed explanation of what the resource covers and why it's useful.")
});

export type EnrichedDescription = z.infer<typeof descriptionSchema>;

export async function enrichDescription(
  title: string, 
  shortDescription: string
): Promise<EnrichedDescription> {
  const fallback: EnrichedDescription = {
    description: shortDescription,
    longDescription: `${shortDescription} This resource provides excellent coverage of the topic and is highly recommended for students.`
  };

  try {
    const prompt = `
      You are an expert technical writer. Improve the following resource description.
      Do not invent fake links, jobs, or pricing. Keep the tone professional.
      Reply strictly in JSON format.
      
      Resource Title: "${title}"
      Current Description: "${shortDescription}"
      
      Output JSON matching exactly this TypeScript interface:
      {
        "description": string, // 1-2 sentence improved summary
        "longDescription": string // 2-3 paragraph detailed breakdown
      }
    `;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return fallback;

    const parsed = JSON.parse(text);
    const result = descriptionSchema.safeParse(parsed);
    
    if (result.success) {
      return result.data;
    }
    
    console.warn(`[AI Enrich] Zod validation failed for "${title}":`, result.error.message);
    return fallback;
  } catch (error) {
    console.error(`[AI Enrich] Failed for "${title}":`, error);
    return fallback;
  }
}
