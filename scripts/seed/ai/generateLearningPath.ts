import { ai, MODEL } from "./config.js";
import { z } from "zod";

const learningPathSchema = z.object({
  beginnerStage: z.string().describe("What to focus on when starting out."),
  intermediateStage: z.string().describe("Core skills and projects to build."),
  advancedStage: z.string().describe("Specialized, deep-dive topics."),
  portfolioStage: z.string().describe("Types of projects to build for a portfolio."),
  interviewStage: z.string().describe("How to prepare for interviews in this field.")
});

export type LearningPath = z.infer<typeof learningPathSchema>;

export async function generateLearningPath(
  careerTitle: string, 
  coreSkills: string[]
): Promise<LearningPath> {
  const fallback: LearningPath = {
    beginnerStage: "Start by learning the fundamental concepts and basic syntax.",
    intermediateStage: "Move on to building small projects and understanding architecture.",
    advancedStage: "Focus on optimization, scalability, and complex system design.",
    portfolioStage: "Build 2-3 full-stack applications that solve real-world problems.",
    interviewStage: "Practice data structures, algorithms, and behavioral questions."
  };

  try {
    const prompt = `
      You are a senior career mentor. Generate a 5-stage learning path for a ${careerTitle}.
      Core related skills: ${coreSkills.join(", ")}.
      Do not invent fake jobs or fake links. Provide actionable advice for each stage.
      Reply strictly in JSON format.
      
      Output JSON matching exactly this TypeScript interface:
      {
        "beginnerStage": string,
        "intermediateStage": string,
        "advancedStage": string,
        "portfolioStage": string,
        "interviewStage": string
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
    const result = learningPathSchema.safeParse(parsed);
    
    if (result.success) {
      return result.data;
    }
    
    console.warn(`[AI LearningPath] Zod validation failed for "${careerTitle}":`, result.error.message);
    return fallback;
  } catch (error) {
    console.error(`[AI LearningPath] Failed for "${careerTitle}":`, error);
    return fallback;
  }
}
