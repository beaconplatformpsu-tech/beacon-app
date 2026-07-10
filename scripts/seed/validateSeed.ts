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
  const relations = payload["relations"] || {};
  const indexes = payload["indexes"] || {};
  const stats = payload["stats"] || {};
  const aiLogs = payload["system/ai_usage_logs"] || {};

  const allSlugs = new Set<string>();
  const allIds = new Set<string>();

  // Helper to validate arrays
  const requireArray = (obj: any, path: string, field: string) => {
    if (!Array.isArray(obj[field])) {
      errors.push(`${path} is missing required array field '${field}'`);
    }
  };

  const trackId = (id: string, path: string) => {
    if (allIds.has(id)) errors.push(`Duplicate ID found: ${id} at ${path}`);
    allIds.add(id);
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
    trackId(cat.id, "SkillCategory");
    validateNoDummyContent(cat, `SkillCategory ${cat.id}`);
  });

  // 2. Career Categories
  Object.values(careerCategories).forEach((cat: any) => {
    if (allSlugs.has(cat.slug)) errors.push(`Duplicate slug in career categories: ${cat.slug}`);
    allSlugs.add(cat.slug);
    trackId(cat.id, "CareerCategory");
    validateNoDummyContent(cat, `CareerCategory ${cat.id}`);
  });

  // 3. Academic Categories
  Object.values(academicCategories).forEach((cat: any) => {
    if (allSlugs.has(cat.slug)) errors.push(`Duplicate slug in academic categories: ${cat.slug}`);
    allSlugs.add(cat.slug);
    trackId(cat.id, "AcademicCategory");
    validateNoDummyContent(cat, `AcademicCategory ${cat.id}`);
  });

  // 4. Skills
  Object.values(skills).forEach((skill: any) => {
    if (allSlugs.has(skill.slug)) errors.push(`Duplicate slug in skills: ${skill.slug}`);
    allSlugs.add(skill.slug);
    trackId(skill.id, "Skill");
    if (!skillCategories[skill.categoryId]) errors.push(`Skill ${skill.id} references missing category: ${skill.categoryId}`);
    if (skill.name) errors.push(`Skill ${skill.id} uses legacy 'name' instead of 'title'`);
    validateNoDummyContent(skill, `Skill ${skill.id}`);
  });

  // 5. Career Paths
  Object.values(careerPaths).forEach((path: any) => {
    if (allSlugs.has(path.slug)) errors.push(`Duplicate slug in career paths: ${path.slug}`);
    allSlugs.add(path.slug);
    trackId(path.id, "CareerPath");
    if (path.categoryId && !careerCategories[path.categoryId]) {
      errors.push(`Career Path ${path.id} references missing category: ${path.categoryId}`);
    }
    validateNoDummyContent(path, `CareerPath ${path.id}`);
  });

  // 6. Resources
  Object.values(resources).forEach((res: any) => {
    if (allSlugs.has(res.slug)) errors.push(`Duplicate slug in resources: ${res.slug}`);
    allSlugs.add(res.slug);
    trackId(res.id, "Resource");
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
    trackId(quiz.id, "Quiz");
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

  // AI Usage Log checks
  Object.values(aiLogs).forEach((log: any) => {
    if (log.prompt || log.rawPrompt) {
      errors.push(`AI usage log ${log.id} contains raw prompt strings!`);
    }
  });

  // Check that stats match counts
  if (stats.skillsCount !== undefined && stats.skillsCount !== Object.keys(skills).length) {
    errors.push(`Stats skillsCount (${stats.skillsCount}) does not match actual length (${Object.keys(skills).length})`);
  }
  if (stats.resourcesCount !== undefined && stats.resourcesCount !== Object.keys(resources).length) {
    errors.push(`Stats resourcesCount (${stats.resourcesCount}) does not match actual length (${Object.keys(resources).length})`);
  }

  // 9. Projects
  const projects = payload["public_content/projects"] || publicContent.projects || {};
  Object.values(projects).forEach((proj: any) => {
    trackId(proj.id, "Project");
    requireArray(proj, `Project ${proj.id}`, "skillIds");
    requireArray(proj, `Project ${proj.id}`, "careerPathIds");
  });

  // 10. Relations
  const careerPathSkills = relations["career_path_skills"] || {};
  Object.entries(careerPathSkills).forEach(([cpId, cpSkills]: any) => {
    if (!careerPaths[cpId]) errors.push(`career_path_skills relation uses invalid careerPathId: ${cpId}`);
    Object.keys(cpSkills).forEach((skillId: string) => {
      if (!skills[skillId]) errors.push(`career_path_skills relation for ${cpId} uses invalid skillId: ${skillId}`);
    });
  });

  const learningPathSteps = relations["learning_path_steps"] || {};
  const learningPathsData = payload["public_content/learning_paths"] || publicContent.learning_paths || {};
  const practiceTasks = payload["public_content/practice_tasks"] || publicContent.practice_tasks || {};
  Object.entries(learningPathSteps).forEach(([lpId, lpSteps]: any) => {
    if (!learningPathsData[lpId]) errors.push(`learning_path_steps relation uses invalid learningPathId: ${lpId}`);
    Object.values(lpSteps).forEach((step: any) => {
      if (step.type === "resource" && (!step.resourceId || !resources[step.resourceId])) errors.push(`Step ${step.id} has invalid resourceId`);
      if (step.type === "practice_task" && (!step.practiceTaskId || !practiceTasks[step.practiceTaskId])) errors.push(`Step ${step.id} has invalid practiceTaskId`);
      if (step.type === "quiz" && (!step.quizId || !quizzes[step.quizId])) errors.push(`Step ${step.id} has invalid quizId`);
      if (step.type === "project" && (!step.projectId || !projects[step.projectId])) errors.push(`Step ${step.id} has invalid projectId`);
    });
  });

  // 11. Legacy Paths & Enums
  if (payload["public_content/academic_support_resources"] || publicContent.academic_support_resources) {
    errors.push("Payload contains legacy path academic_support_resources");
  }
  if (payload["user_skills"]) {
    errors.push("Payload contains legacy path user_skills");
  }

  // 12. Resource Enums
  Object.values(resources).forEach((res: any) => {
    if (res.resourceType === "book") errors.push(`Resource ${res.id} uses invalid resourceType 'book'`);
  });

  return errors;
}
