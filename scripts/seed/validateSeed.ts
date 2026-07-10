import { ID } from "../../src/types/database";

export function validateSeedPayload(payload: Record<string, any>): string[] {
  const errors: string[] = [];

  // Data references
  const publicContent = payload["public_content"] || {};
  const skillCategories = payload["public_content/skill_categories"] || publicContent.skill_categories || {};
  const careerCategories = payload["public_content/career_categories"] || publicContent.career_categories || {};
  const academicCategories = payload["public_content/academic_categories"] || publicContent.academic_categories || {};
  const skills = payload["public_content/skills"] || publicContent.skills || {};
  const careerPaths = payload["public_content/career_paths"] || publicContent.career_paths || {};
  const resources = payload["public_content/resources"] || publicContent.resources || {};
  const quizzes = payload["public_content/quizzes"] || publicContent.quizzes || {};
  const answerKeys = payload["system/quiz_answer_keys"] || {};
  const platformSettings = payload["platform_settings"] || {};

  const allSlugs = new Set<string>();

  // Helper to validate arrays
  const requireArray = (obj: any, path: string, field: string) => {
    if (!Array.isArray(obj[field])) {
      errors.push(`${path} is missing required array field '${field}'`);
    }
  };

  // Helper to validate dummy content
  const validateNoDummyContent = (obj: any, path: string) => {
    const str = JSON.stringify(obj).toLowerCase();
    if (str.includes("example.com")) {
      errors.push(`${path} contains dummy URL 'example.com'`);
    }
  };

  // 1. Skill Categories
  Object.values(skillCategories).forEach((cat: any) => {
    if (allSlugs.has(cat.slug)) errors.push(`Duplicate slug in skill categories: ${cat.slug}`);
    allSlugs.add(cat.slug);
    validateNoDummyContent(cat, `SkillCategory ${cat.id}`);
  });

  // 2. Career Categories
  Object.values(careerCategories).forEach((cat: any) => {
    if (allSlugs.has(cat.slug)) errors.push(`Duplicate slug in career categories: ${cat.slug}`);
    allSlugs.add(cat.slug);
    validateNoDummyContent(cat, `CareerCategory ${cat.id}`);
  });

  // 3. Academic Categories
  Object.values(academicCategories).forEach((cat: any) => {
    if (allSlugs.has(cat.slug)) errors.push(`Duplicate slug in academic categories: ${cat.slug}`);
    allSlugs.add(cat.slug);
    validateNoDummyContent(cat, `AcademicCategory ${cat.id}`);
  });

  // 4. Skills
  Object.values(skills).forEach((skill: any) => {
    if (allSlugs.has(skill.slug)) errors.push(`Duplicate slug in skills: ${skill.slug}`);
    allSlugs.add(skill.slug);
    if (!skillCategories[skill.categoryId]) errors.push(`Skill ${skill.id} references missing category: ${skill.categoryId}`);
    if (skill.name) errors.push(`Skill ${skill.id} uses legacy 'name' instead of 'title'`);
    validateNoDummyContent(skill, `Skill ${skill.id}`);
  });

  // 5. Career Paths
  Object.values(careerPaths).forEach((path: any) => {
    if (allSlugs.has(path.slug)) errors.push(`Duplicate slug in career paths: ${path.slug}`);
    allSlugs.add(path.slug);
    if (path.categoryId && !careerCategories[path.categoryId]) {
      errors.push(`Career Path ${path.id} references missing category: ${path.categoryId}`);
    }
    validateNoDummyContent(path, `CareerPath ${path.id}`);
  });

  // 6. Resources
  Object.values(resources).forEach((res: any) => {
    if (allSlugs.has(res.slug)) errors.push(`Duplicate slug in resources: ${res.slug}`);
    allSlugs.add(res.slug);
    requireArray(res, `Resource ${res.id}`, "skillIds");
    requireArray(res, `Resource ${res.id}`, "careerPathIds");
    requireArray(res, `Resource ${res.id}`, "academicCategoryIds");
    
    res.skillIds?.forEach((id: string) => {
      if (!skills[id]) errors.push(`Resource ${res.id} references missing skill: ${id}`);
    });
    res.careerPathIds?.forEach((id: string) => {
      if (!careerPaths[id]) errors.push(`Resource ${res.id} references missing career path: ${id}`);
    });
    res.academicCategoryIds?.forEach((id: string) => {
      if (!academicCategories[id]) errors.push(`Resource ${res.id} references missing academic category: ${id}`);
    });
    validateNoDummyContent(res, `Resource ${res.id}`);
  });

  // 7. Quizzes and Answer Keys
  Object.values(quizzes).forEach((quiz: any) => {
    // Check answer keys exist
    if (!answerKeys[quiz.id]) {
      errors.push(`Quiz ${quiz.id} is missing an answer key in system/quiz_answer_keys`);
    }
    // Check no exposed answers
    Object.values(quiz.questions || {}).forEach((q: any) => {
      if (q.correctOptionIndex !== undefined || q.explanation !== undefined) {
        errors.push(`Quiz ${quiz.id} exposes correctOptionIndex or explanation in public_content!`);
      }
    });
  });

  // 8. Secrets Validation
  const platformPrivateStr = JSON.stringify(platformSettings?.private || {}).toLowerCase();
  if (platformPrivateStr.includes("api_key") || platformPrivateStr.includes("apikey") || platformPrivateStr.includes("secret")) {
    errors.push(`platform_settings/private contains suspected secrets!`);
  }

  // File Reference check across payload
  const fullPayloadStr = JSON.stringify(payload);
  if (fullPayloadStr.includes("signedUrl")) {
    errors.push(`Payload contains forbidden 'signedUrl' fields (permanent signed URLs are not allowed)`);
  }

  return errors;
}
