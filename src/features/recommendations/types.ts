import { ResourceTypeData } from "@/lib/validation";

export interface EngineRecommendation {
  missingSkills: string[];
  recommendedResources: ResourceTypeData[];
  nextSteps: string[];
  priorityScore: number; // 0-100, where 100 is most urgent
  explanation: string;
}

// User's current skill profile mapped by skill ID to their proficiency weight (1-4)
export type UserSkillProfile = Record<string, number>;

// Required skills mapped by skill ID to priority
export type RequiredSkillProfile = Record<string, "Core" | "Secondary" | "Optional">;
