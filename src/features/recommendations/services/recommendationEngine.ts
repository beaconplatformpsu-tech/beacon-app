import { GoogleGenAI } from "@google/genai";
import type { 
  UserSkillType, 
  ExtendedCareerPathSkill, 
  ResourceTypeData, 
  CareerPathType 
} from "@/lib/validation";
import { EngineRecommendation } from "../types";

// Initialize Gemini - Expects process.env.GEMINI_API_KEY to be set
const ai = new GoogleGenAI({}); 

const PROFICIENCY_WEIGHTS: Record<string, number> = {
  "Beginner": 1,
  "Intermediate": 2,
  "Advanced": 3,
  "Expert": 4
};

export const recommendationEngine = {
  /**
   * Deterministically finds missing or weak skills for a given career path
   */
  findSkillGaps(
    userSkills: UserSkillType[],
    pathSkills: ExtendedCareerPathSkill[]
  ): string[] {
    const gaps: string[] = [];
    
    // We primarily care about "Core" and "Secondary" skills for gaps
    const targetSkills = pathSkills.filter(s => s.importanceLevel === "core" || s.importanceLevel === "important");
    
    for (const target of targetSkills) {
      const uSkill = userSkills.find(us => us.skillId === target.skillId);
      
      // If user doesn't have the skill at all
      if (!uSkill) {
        gaps.push(target.skillId);
        continue;
      }
      
      // If user has the skill but is only a Beginner and it's a Core skill
      const weight = PROFICIENCY_WEIGHTS[uSkill.proficiency] || 1;
      if (target.importanceLevel === "core" && weight < 2) {
        gaps.push(target.skillId);
      }
    }
    
    return gaps;
  },

  /**
   * Finds matching resources for skill gaps using audience heuristics
   */
  findResourcesForGaps(
    gaps: string[],
    allResources: ResourceTypeData[],
    userProficiencyAvg: number
  ): ResourceTypeData[] {
    const recommended: ResourceTypeData[] = [];
    
    for (const skillId of gaps) {
      // Find resources targeting this skill
      const matching = allResources.filter(r => r.skillIds?.includes(skillId));
      
      if (matching.length === 0) continue;
      
      // Apply Heuristics
      let selected = matching[0]; // fallback
      
      if (userProficiencyAvg <= 1.5) {
        // Prefer Beginner or Documentation/Courses
        const beginnerMatch = matching.find(r => r.difficultyLevel === "Beginner" || r.resourceType === "Course");
        if (beginnerMatch) selected = beginnerMatch;
      } else if (userProficiencyAvg <= 2.5) {
        // Prefer Practice or Projects
        const interMatch = matching.find(r => r.resourceType === "Practice" || r.resourceType === "Checklist");
        if (interMatch) selected = interMatch;
      } else {
        // Prefer Advanced or Interview Prep
        const advMatch = matching.find(r => r.difficultyLevel === "Advanced" || r.resourceType === "Guide");
        if (advMatch) selected = advMatch;
      }
      
      // Avoid pushing duplicates
      if (!recommended.find(r => r.id === selected.id)) {
        recommended.push(selected);
      }
    }
    
    // Limit to top 3 to avoid overwhelming the student
    return recommended.slice(0, 3);
  },

  /**
   * Generates a safe, explainable recommendation using deterministic data + AI formatting
   */
  async generateRecommendation(
    userSkills: UserSkillType[],
    pathSkills: ExtendedCareerPathSkill[],
    careerPath: CareerPathType,
    allResources: ResourceTypeData[]
  ): Promise<EngineRecommendation | null> {
    
    // 1. Deterministic Gap Analysis
    const missingSkills = this.findSkillGaps(userSkills, pathSkills);
    if (missingSkills.length === 0) return null; // No gaps, no recommendation needed!

    // Calculate average proficiency to drive resource heuristics
    const avgProf = userSkills.length > 0 
      ? userSkills.reduce((acc, curr) => acc + (PROFICIENCY_WEIGHTS[curr.proficiency] || 1), 0) / userSkills.length
      : 1;
      
    // 2. Deterministic Resource Matching
    const recommendedResources = this.findResourcesForGaps(missingSkills, allResources, avgProf);
    
    if (recommendedResources.length === 0) return null; // We have no resources to help them.

    // 3. AI Explanation Generation (Strictly contained, no URL invention allowed)
    // We only feed the AI exactly what it is allowed to talk about.
    const prompt = `
      You are an encouraging academic AI advisor.
      The student is pursuing the "${careerPath.title}" career path.
      They are missing or weak in these skill IDs: ${missingSkills.join(", ")}.
      
      I have ALREADY found the exact resources they need from our database:
      ${recommendedResources.map(r => `- ${r.title} (${r.resourceType})`).join("\n")}
      
      Write a short, professional, and highly encouraging JSON response containing:
      1. "explanation": A 2-3 sentence paragraph explaining WHY they need to learn these skills for this career path and how these specific resources will help.
      2. "nextSteps": An array of 2-3 short, actionable next steps focusing ONLY on the resources provided above.
      
      CRITICAL RULE: DO NOT INVENT ANY URLs, EXTERNAL LINKS, OR RESOURCES. ONLY mention the resources explicitly listed above.
      
      Output MUST be valid JSON matching this schema:
      {
        "explanation": "string",
        "nextSteps": ["string", "string"]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const aiResult = JSON.parse(response.text || "{}");
      
      return {
        missingSkills,
        recommendedResources,
        nextSteps: aiResult.nextSteps || ["Start reviewing the recommended resources."],
        priorityScore: 85, // Could be calculated dynamically based on Core vs Optional missing
        explanation: aiResult.explanation || "These resources will help fill the gaps in your knowledge for your selected career path."
      };
    } catch (error) {
      console.error("AI Generation Failed. Falling back to deterministic output.", error);
      // Fallback to pure deterministic without AI flavor if API fails
      return {
        missingSkills,
        recommendedResources,
        nextSteps: ["Review the recommended resources below to improve your core skills."],
        priorityScore: 70,
        explanation: `To progress in ${careerPath.title}, you need to strengthen your core skills.`
      };
    }
  }
};
