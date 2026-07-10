import { ai, MODEL } from "./config.js";
import { z } from "zod";

const classificationSchema = z.object({
  tags: z.array(z.string()).min(1).max(5).describe("List of 1 to 5 relevant technical or topical tags."),
  audienceLevel: z.enum(["Beginner", "Intermediate", "Advanced", "All Levels"]),
  resourceType: z.enum([
    "Documentation", "Course", "Video", "Book", "Practice", "Project",
    "Article", "Tool", "Dataset", "Template", "Roadmap", "Interview Prep",
    "Research", "Checklist"
  ]),
  estimatedDuration: z.string().describe("e.g., '2 hours', '4 weeks', '15 mins'"),
  qualityScore: z.number().min(0).max(100).describe("Estimated quality out of 100 based on provider reputation")
});

export type ResourceClassification = z.infer<typeof classificationSchema>;

// Need to define a generic JSON schema structure because GenAI SDK needs its own TypeSchema object if we strictly bind it.
// Or we can rely on standard JSON parsing and Zod validation. We will use Zod parsing of the textual response.

export async function classifyResource(
  title: string, 
  provider: string, 
  description: string
): Promise<ResourceClassification> {
  const fallback: ResourceClassification = {
    tags: ["Tech"],
    audienceLevel: "All Levels",
    resourceType: "Article",
    estimatedDuration: "Varies",
    qualityScore: 85
  };

  try {
    const prompt = `
      You are an expert technical librarian. Classify the following educational resource.
      Do not invent fake information. Reply strictly in JSON format.
      
      Resource Title: "${title}"
      Provider: "${provider}"
      Description: "${description}"
      
      Output JSON matching exactly this TypeScript interface:
      {
        "tags": string[], // 1 to 5 relevant tags
        "audienceLevel": "Beginner" | "Intermediate" | "Advanced" | "All Levels",
        "resourceType": "Documentation" | "Course" | "Video" | "Book" | "Practice" | "Project" | "Article" | "Tool" | "Dataset" | "Template" | "Roadmap" | "Interview Prep" | "Research" | "Checklist",
        "estimatedDuration": string, // e.g. "2 hours"
        "qualityScore": number // 0-100
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
    const result = classificationSchema.safeParse(parsed);
    
    if (result.success) {
      return result.data;
    }
    
    console.warn(`[AI Classify] Zod validation failed for "${title}":`, result.error.message);
    return fallback;
  } catch (error) {
    console.error(`[AI Classify] Failed for "${title}":`, error);
    return fallback;
  }
}
