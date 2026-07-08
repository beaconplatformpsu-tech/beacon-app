import type { UserSkillType as UserSkill, SkillType as Skill, CareerPathSkillType } from "@/lib/validation";

export const PROFICIENCY_WEIGHTS: Record<string, number> = {
  Beginner: 1, 
  Intermediate: 2, 
  Advanced: 3, 
  Expert: 4,
};

// Extended type for backwards compatibility with untyped minimumProficiencyLevel
type ExtendedCareerPathSkill = CareerPathSkillType & { minimumProficiencyLevel?: string };

export function computeMatchScore(
  pathId: string,
  careerPathSkills: Record<string, ExtendedCareerPathSkill>,
  skills: Record<string, Skill>,
  userSkills: UserSkill[]
): number {
  const requiredSkills = Object.values(careerPathSkills).filter((cps) => cps.careerPathId === pathId);
  
  if (requiredSkills.length === 0) return 0;
  
  let totalScore = 0;
  
  requiredSkills.forEach((reqSkill) => {
    const globalSkill = skills[reqSkill.skillId] || {};
    const skillName = globalSkill.name?.toLowerCase();
    const reqWeight = (reqSkill.minimumProficiencyLevel && PROFICIENCY_WEIGHTS[reqSkill.minimumProficiencyLevel]) || 2; // Default to Intermediate
    
    const userSkill = userSkills.find((us) => us.name?.toLowerCase() === skillName);
    
    if (userSkill) {
      const userWeight = PROFICIENCY_WEIGHTS[userSkill.proficiency] || 1; // Default to Beginner
      totalScore += Math.min(userWeight / reqWeight, 1);
    }
  });
  
  return Math.round((totalScore / requiredSkills.length) * 100);
}
