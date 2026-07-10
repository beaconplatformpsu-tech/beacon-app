import { ai, MODEL } from "./config.js";
import { z } from "zod";

const academicTemplateSchema = z.object({
  items: z.array(z.string()).min(3).max(10).describe("List of checklist items or outline headers")
});

export type AcademicTemplate = z.infer<typeof academicTemplateSchema>;

export async function generateAcademicTemplate(
  templateType: "weekly study plan" | "exam revision checklist" | "project proposal outline" | "graduation project report checklist" | "CV checklist" | "GitHub portfolio checklist" | "LinkedIn profile checklist"
): Promise<AcademicTemplate> {
  const fallback: AcademicTemplate = {
    items: [
      "Review core requirements",
      "Draft initial outline",
      "Gather necessary resources",
      "Execute plan",
      "Review and refine"
    ]
  };

  try {
    const prompt = `
      You are an academic advisor. Generate a highly practical checklist/outline for a student.
      Template requested: "${templateType}".
      Do not invent fake tools or links. Be concise and professional.
      Reply strictly in JSON format.
      
      Output JSON matching exactly this TypeScript interface:
      {
        "items": string[] // 3 to 10 actionable items or headers
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
    const result = academicTemplateSchema.safeParse(parsed);
    
    if (result.success) {
      return result.data;
    }
    
    console.warn(`[AI Template] Zod validation failed for "${templateType}":`, result.error.message);
    return fallback;
  } catch (error) {
    console.error(`[AI Template] Failed for "${templateType}":`, error);
    return fallback;
  }
}
