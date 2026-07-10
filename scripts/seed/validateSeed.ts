type SeedPayload = Record<string, any>;
type BooleanIndex = Record<string, Record<string, true>>;

const VALID_RESOURCE_TYPES = new Set([
  "documentation",
  "course",
  "guide",
  "practice",
  "article",
  "tool",
  "roadmap",
  "template",
  "checklist",
]);

const VALID_LEVELS = new Set(["beginner", "intermediate", "advanced", "expert", "all_levels"]);
const VALID_IMPORTANCE = new Set(["core", "important", "optional"]);
const VALID_STEP_TYPES = new Set(["resource", "practice_task", "quiz", "project", "milestone"]);

function getNode(payload: SeedPayload, path: string, fallback: any = {}) {
  if (payload[path] !== undefined) return payload[path];

  const parts = path.split("/");
  let current: any = payload;

  for (const part of parts) {
    if (current?.[part] === undefined) return fallback;
    current = current[part];
  }

  return current ?? fallback;
}

function addIndex(index: BooleanIndex, primaryId?: string, secondaryId?: string) {
  if (!primaryId || !secondaryId) return;
  if (!index[primaryId]) index[primaryId] = {};
  index[primaryId][secondaryId] = true;
}

function sortIndex(index: BooleanIndex): BooleanIndex {
  const sorted: BooleanIndex = {};
  for (const key of Object.keys(index).sort()) {
    sorted[key] = {};
    for (const child of Object.keys(index[key]).sort()) {
      sorted[key][child] = true;
    }
  }
  return sorted;
}


function compareIndex(name: string, expected: BooleanIndex, actual: BooleanIndex, errors: string[]) {
  const expectedSorted = sortIndex(expected || {});
  const actualSorted = sortIndex(actual || {});

  if (JSON.stringify(expectedSorted) !== JSON.stringify(actualSorted)) {
    errors.push(`Index mismatch for ${name}`);
  }
}

function hasDuplicate(values: string[]) {
  return new Set(values).size !== values.length;
}

function hasOwn(obj: any, key: string) {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

export function validateSeedPayload(payload: SeedPayload): string[] {
  const errors: string[] = [];

  const publicContent = getNode(payload, "public_content", {});
  const skillCategories = getNode(payload, "public_content/skill_categories", publicContent.skill_categories || {});
  const careerCategories = getNode(payload, "public_content/career_categories", publicContent.career_categories || {});
  const academicCategories = getNode(payload, "public_content/academic_categories", publicContent.academic_categories || {});
  const skills = getNode(payload, "public_content/skills", publicContent.skills || {});
  const careerPaths = getNode(payload, "public_content/career_paths", publicContent.career_paths || {});
  const resources = getNode(payload, "public_content/resources", publicContent.resources || {});
  const learningPaths = getNode(payload, "public_content/learning_paths", publicContent.learning_paths || {});
  const practiceTasks = getNode(payload, "public_content/practice_tasks", publicContent.practice_tasks || {});
  const quizzes = getNode(payload, "public_content/quizzes", publicContent.quizzes || {});
  const projects = getNode(payload, "public_content/projects", publicContent.projects || {});
  const announcements = getNode(payload, "public_content/announcements", publicContent.announcements || {});
  const relations = getNode(payload, "relations", {});
  const careerPathSkills = getNode(payload, "relations/career_path_skills", relations.career_path_skills || {});
  const learningPathSteps = getNode(payload, "relations/learning_path_steps", relations.learning_path_steps || {});
  const indexes = getNode(payload, "indexes", {});
  const stats = getNode(payload, "stats", {});
  const platformSettings = getNode(payload, "platform_settings", {});
  const answerKeys = getNode(payload, "system/quiz_answer_keys", {});
  const aiLogs = getNode(payload, "system/ai_usage_logs", {});

  const serialized = JSON.stringify(payload);
  const lower = serialized.toLowerCase();

  const forbiddenFragments = [
    "task_auto_",
    "proj_auto_",
    "quiz_auto_",
    "generated practice task",
    "generated project",
    "generated quiz",
    "generated for mvp seeding",
    "requirement 1",
    "requirement 2",
    "requirement 3",
    "example.com",
    "dummy",
    "placeholder",
    "academic_support_resources",
    "user_skills",
    "path_fullstack_developer",
  ];

  for (const fragment of forbiddenFragments) {
    if (lower.includes(fragment)) {
      errors.push(`Payload contains forbidden legacy or filler content: ${fragment}`);
    }
  }

  if (serialized.includes("signedUrl")) errors.push("Payload contains signedUrl. Store only stable storage metadata, not permanent signed URLs.");
  if (lower.includes("correctoptionindex") && lower.includes("public_content") && JSON.stringify(quizzes).toLowerCase().includes("correctoptionindex")) {
    errors.push("Public quizzes expose correctOptionIndex.");
  }

  const platformPrivate = JSON.stringify(platformSettings.private || {}).toLowerCase();
  for (const token of ["apikey", "api_key", "secret", "token", "password", "credential", "private_key"]) {
    if (platformPrivate.includes(token)) errors.push(`platform_settings/private contains suspected secret token: ${token}`);
  }

  Object.values(aiLogs).forEach((log: any) => {
    if (hasOwn(log, "prompt") || hasOwn(log, "rawPrompt")) {
      errors.push(`AI usage log ${log.id || "unknown"} contains raw prompt data.`);
    }
  });

  const idOwners = new Map<string, string>();
  const slugOwners = new Map<string, string>();

  function trackEntity(entity: any, collection: string, requireSlug = true) {
    if (!entity?.id) errors.push(`${collection} entity is missing id`);
    if (entity?.id) {
      const owner = idOwners.get(entity.id);
      if (owner) errors.push(`Duplicate id ${entity.id} in ${collection}; already used by ${owner}`);
      idOwners.set(entity.id, collection);
    }

    if (requireSlug) {
      if (!entity?.slug) errors.push(`${collection} ${entity?.id || "unknown"} is missing slug`);
      if (entity?.slug) {
        const slugKey = `${collection}:${entity.slug}`;
        const owner = slugOwners.get(slugKey);
        if (owner) errors.push(`Duplicate slug ${entity.slug} within ${collection}`);
        slugOwners.set(slugKey, entity.id);
      }
    }

    if (!entity?.title) errors.push(`${collection} ${entity?.id || "unknown"} is missing title`);
    if (entity?.isActive !== true && entity?.isActive !== false) errors.push(`${collection} ${entity?.id || "unknown"} is missing boolean isActive`);
    if (!entity?.createdAt) errors.push(`${collection} ${entity?.id || "unknown"} is missing createdAt`);
    if (!entity?.updatedAt) errors.push(`${collection} ${entity?.id || "unknown"} is missing updatedAt`);
  }

  Object.values(skillCategories).forEach((cat: any) => {
    trackEntity(cat, "skill_categories");
    if (typeof cat.description !== "string" || !cat.description.trim()) errors.push(`Skill category ${cat.id} is missing description`);
    if (typeof cat.sortOrder !== "number") errors.push(`Skill category ${cat.id} is missing numeric sortOrder`);
  });

  Object.values(careerCategories).forEach((cat: any) => {
    trackEntity(cat, "career_categories");
    if (typeof cat.description !== "string" || !cat.description.trim()) errors.push(`Career category ${cat.id} is missing description`);
    if (typeof cat.sortOrder !== "number") errors.push(`Career category ${cat.id} is missing numeric sortOrder`);
  });

  Object.values(academicCategories).forEach((cat: any) => {
    trackEntity(cat, "academic_categories");
    if (typeof cat.description !== "string" || !cat.description.trim()) errors.push(`Academic category ${cat.id} is missing description`);
    if (typeof cat.sortOrder !== "number") errors.push(`Academic category ${cat.id} is missing numeric sortOrder`);
  });

  Object.values(skills).forEach((skill: any) => {
    trackEntity(skill, "skills");
    if (hasOwn(skill, "name")) errors.push(`Skill ${skill.id} uses legacy name field.`);
    if (!skillCategories[skill.categoryId]) errors.push(`Skill ${skill.id} references missing skill category ${skill.categoryId}`);
    if (skill.difficultyLevel && !VALID_LEVELS.has(skill.difficultyLevel)) errors.push(`Skill ${skill.id} has invalid difficultyLevel ${skill.difficultyLevel}`);
    if (!Array.isArray(skill.tags)) errors.push(`Skill ${skill.id} is missing tags array`);
  });

  Object.values(careerPaths).forEach((careerPath: any) => {
    trackEntity(careerPath, "career_paths");
    if (!careerCategories[careerPath.categoryId]) errors.push(`Career path ${careerPath.id} references missing career category ${careerPath.categoryId}`);
    if (!careerPath.longDescription) errors.push(`Career path ${careerPath.id} is missing longDescription`);
  });

  Object.values(resources).forEach((resource: any) => {
    trackEntity(resource, "resources");
    if (!resource.provider) errors.push(`Resource ${resource.id} is missing provider`);
    if (!VALID_RESOURCE_TYPES.has(resource.resourceType)) errors.push(`Resource ${resource.id} has invalid resourceType ${resource.resourceType}`);
    if (resource.difficultyLevel && !VALID_LEVELS.has(resource.difficultyLevel)) errors.push(`Resource ${resource.id} has invalid difficultyLevel ${resource.difficultyLevel}`);
    for (const field of ["skillIds", "careerPathIds", "academicCategoryIds", "tags"]) {
      if (!Array.isArray(resource[field])) errors.push(`Resource ${resource.id} is missing ${field} array`);
      if (Array.isArray(resource[field]) && hasDuplicate(resource[field])) errors.push(`Resource ${resource.id} has duplicate values in ${field}`);
    }
    if (resource.sourceType === "external" && (!resource.url || !String(resource.url).startsWith("https://"))) {
      errors.push(`External resource ${resource.id} must have a real https URL`);
    }
    (resource.skillIds || []).forEach((id: string) => { if (!skills[id]) errors.push(`Resource ${resource.id} references missing skill ${id}`); });
    (resource.careerPathIds || []).forEach((id: string) => { if (!careerPaths[id]) errors.push(`Resource ${resource.id} references missing career path ${id}`); });
    (resource.academicCategoryIds || []).forEach((id: string) => { if (!academicCategories[id]) errors.push(`Resource ${resource.id} references missing academic category ${id}`); });
  });

  Object.values(learningPaths).forEach((lp: any) => {
    trackEntity(lp, "learning_paths", false);
    if (!careerPaths[lp.careerPathId]) errors.push(`Learning path ${lp.id} references missing career path ${lp.careerPathId}`);
    if (!VALID_LEVELS.has(lp.difficultyLevel)) errors.push(`Learning path ${lp.id} has invalid difficultyLevel ${lp.difficultyLevel}`);
  });

  Object.values(practiceTasks).forEach((task: any) => {
    trackEntity(task, "practice_tasks", false);
    if (!Array.isArray(task.skillIds) || task.skillIds.length === 0) errors.push(`Practice task ${task.id} must have skillIds`);
    (task.skillIds || []).forEach((id: string) => { if (!skills[id]) errors.push(`Practice task ${task.id} references missing skill ${id}`); });
  });

  Object.values(projects).forEach((project: any) => {
    trackEntity(project, "projects", false);
    for (const field of ["skillIds", "careerPathIds", "requirements"]) {
      if (!Array.isArray(project[field]) || project[field].length === 0) errors.push(`Project ${project.id} must have non-empty ${field}`);
    }
    (project.skillIds || []).forEach((id: string) => { if (!skills[id]) errors.push(`Project ${project.id} references missing skill ${id}`); });
    (project.careerPathIds || []).forEach((id: string) => { if (!careerPaths[id]) errors.push(`Project ${project.id} references missing career path ${id}`); });
  });

  const quizQuestionTexts = new Set<string>();
  Object.values(quizzes).forEach((quiz: any) => {
    trackEntity(quiz, "quizzes", false);
    if (!Array.isArray(quiz.skillIds) || quiz.skillIds.length === 0) errors.push(`Quiz ${quiz.id} must have skillIds`);
    (quiz.skillIds || []).forEach((id: string) => { if (!skills[id]) errors.push(`Quiz ${quiz.id} references missing skill ${id}`); });
    if (!answerKeys[quiz.id]) errors.push(`Quiz ${quiz.id} is missing an answer key`);
    const questions = Object.values(quiz.questions || {}) as any[];
    if (questions.length < 3) errors.push(`Quiz ${quiz.id} should contain at least 3 questions`);
    questions.forEach((question: any) => {
      if (question.correctOptionIndex !== undefined || question.explanation !== undefined) {
        errors.push(`Quiz ${quiz.id} exposes answer data in public_content`);
      }
      if (!Array.isArray(question.options) || question.options.length < 4) errors.push(`Quiz ${quiz.id}/${question.id} must have at least 4 options`);
      const key = String(question.questionText || "").trim().toLowerCase();
      if (!key) errors.push(`Quiz ${quiz.id}/${question.id} is missing questionText`);
      if (key && quizQuestionTexts.has(key)) errors.push(`Repeated quiz question detected: ${question.questionText}`);
      if (key) quizQuestionTexts.add(key);
    });
  });

  Object.entries(answerKeys).forEach(([quizId, key]: [string, any]) => {
    if (!quizzes[quizId]) errors.push(`Answer key ${quizId} has no matching public quiz`);
    Object.entries(key.questions || {}).forEach(([questionId, answer]: [string, any]) => {
      const publicQuestion = quizzes[quizId]?.questions?.[questionId];
      if (!publicQuestion) errors.push(`Answer key ${quizId}/${questionId} has no matching public question`);
      if (typeof answer.correctOptionIndex !== "number") errors.push(`Answer key ${quizId}/${questionId} is missing numeric correctOptionIndex`);
      if (publicQuestion?.options && (answer.correctOptionIndex < 0 || answer.correctOptionIndex >= publicQuestion.options.length)) {
        errors.push(`Answer key ${quizId}/${questionId} correctOptionIndex is out of range`);
      }
    });
  });

  Object.entries(careerPathSkills).forEach(([careerPathId, skillMap]: [string, any]) => {
    if (!careerPaths[careerPathId]) errors.push(`career_path_skills references missing career path ${careerPathId}`);
    Object.entries(skillMap || {}).forEach(([skillId, relation]: [string, any]) => {
      if (!skills[skillId]) errors.push(`career_path_skills ${careerPathId} references missing skill ${skillId}`);
      if (!VALID_IMPORTANCE.has(relation.importanceLevel)) errors.push(`career_path_skills ${careerPathId}/${skillId} has invalid importanceLevel`);
      if (!VALID_LEVELS.has(relation.minimumProficiencyLevel)) errors.push(`career_path_skills ${careerPathId}/${skillId} has invalid minimumProficiencyLevel`);
    });
  });

  Object.entries(learningPathSteps).forEach(([learningPathId, steps]: [string, any]) => {
    if (!learningPaths[learningPathId]) errors.push(`learning_path_steps references missing learning path ${learningPathId}`);
    Object.values(steps || {}).forEach((step: any) => {
      if (!VALID_STEP_TYPES.has(step.type)) errors.push(`Learning step ${step.id} has invalid type ${step.type}`);
      if (step.learningPathId !== learningPathId) errors.push(`Learning step ${step.id} learningPathId does not match parent ${learningPathId}`);
      if (step.type === "resource" && (!step.resourceId || !resources[step.resourceId])) errors.push(`Learning step ${step.id} references invalid resourceId ${step.resourceId}`);
      if (step.type === "practice_task" && (!step.practiceTaskId || !practiceTasks[step.practiceTaskId])) errors.push(`Learning step ${step.id} references invalid practiceTaskId ${step.practiceTaskId}`);
      if (step.type === "quiz" && (!step.quizId || !quizzes[step.quizId])) errors.push(`Learning step ${step.id} references invalid quizId ${step.quizId}`);
      if (step.type === "project" && (!step.projectId || !projects[step.projectId])) errors.push(`Learning step ${step.id} references invalid projectId ${step.projectId}`);
    });
  });

  const minimums = [
    ["skill categories", skillCategories, 10],
    ["career categories", careerCategories, 10],
    ["academic categories", academicCategories, 10],
    ["skills", skills, 25],
    ["career paths", careerPaths, 10],
    ["resources", resources, 30],
    ["learning paths", learningPaths, 6],
    ["practice tasks", practiceTasks, 18],
    ["projects", projects, 12],
    ["quizzes", quizzes, 10],
    ["announcements", announcements, 1],
  ] as const;

  for (const [label, collection, minimum] of minimums) {
    if (Object.keys(collection).length < minimum) errors.push(`Expected at least ${minimum} ${label}, found ${Object.keys(collection).length}`);
  }

  const expectedIndexes: Record<string, BooleanIndex> = {
    resources_by_skill: {},
    resources_by_type: {},
    resources_by_level: {},
    resources_by_career_path: {},
    resources_by_academic_category: {},
    skills_by_category: {},
    career_paths_by_category: {},
    learning_paths_by_career_path: {},
    projects_by_skill: {},
    projects_by_career_path: {},
    quizzes_by_skill: {},
    practice_tasks_by_skill: {},
  };

  Object.values(skills).forEach((skill: any) => addIndex(expectedIndexes.skills_by_category, skill.categoryId, skill.id));
  Object.values(careerPaths).forEach((careerPath: any) => addIndex(expectedIndexes.career_paths_by_category, careerPath.categoryId, careerPath.id));
  Object.values(learningPaths).forEach((lp: any) => addIndex(expectedIndexes.learning_paths_by_career_path, lp.careerPathId, lp.id));
  Object.values(resources).forEach((resource: any) => {
    addIndex(expectedIndexes.resources_by_type, resource.resourceType, resource.id);
    addIndex(expectedIndexes.resources_by_level, resource.difficultyLevel, resource.id);
    (resource.skillIds || []).forEach((skillId: string) => addIndex(expectedIndexes.resources_by_skill, skillId, resource.id));
    (resource.careerPathIds || []).forEach((careerPathId: string) => addIndex(expectedIndexes.resources_by_career_path, careerPathId, resource.id));
    (resource.academicCategoryIds || []).forEach((academicCategoryId: string) => addIndex(expectedIndexes.resources_by_academic_category, academicCategoryId, resource.id));
  });
  Object.values(projects).forEach((project: any) => {
    (project.skillIds || []).forEach((skillId: string) => addIndex(expectedIndexes.projects_by_skill, skillId, project.id));
    (project.careerPathIds || []).forEach((careerPathId: string) => addIndex(expectedIndexes.projects_by_career_path, careerPathId, project.id));
  });
  Object.values(quizzes).forEach((quiz: any) => (quiz.skillIds || []).forEach((skillId: string) => addIndex(expectedIndexes.quizzes_by_skill, skillId, quiz.id)));
  Object.values(practiceTasks).forEach((task: any) => (task.skillIds || []).forEach((skillId: string) => addIndex(expectedIndexes.practice_tasks_by_skill, skillId, task.id)));

  for (const [indexName, expected] of Object.entries(expectedIndexes)) {
    compareIndex(indexName, expected, indexes[indexName] || {}, errors);
  }

  const expectedStats: Record<string, number> = {
    resourcesCount: Object.keys(resources).length,
    skillsCount: Object.keys(skills).length,
    careerPathsCount: Object.keys(careerPaths).length,
    academicCategoriesCount: Object.keys(academicCategories).length,
    careerCategoriesCount: Object.keys(careerCategories).length,
    skillCategoriesCount: Object.keys(skillCategories).length,
  };

  for (const [field, expected] of Object.entries(expectedStats)) {
    if (stats[field] !== expected) errors.push(`Stats ${field} (${stats[field]}) does not match actual count (${expected})`);
  }

  const skillResourceCoverage = new Set<string>();
  Object.values(resources).forEach((resource: any) => (resource.skillIds || []).forEach((skillId: string) => skillResourceCoverage.add(skillId)));
  Object.keys(skills).forEach((skillId) => {
    if (!skillResourceCoverage.has(skillId)) errors.push(`Skill ${skillId} has no resource coverage`);
  });

  Object.keys(careerPaths).forEach((careerPathId) => {
    if (!careerPathSkills[careerPathId]) errors.push(`Career path ${careerPathId} has no career_path_skills relation`);
    const hasLearningPath = Object.values(learningPaths).some((lp: any) => lp.careerPathId === careerPathId);
    if (!hasLearningPath) errors.push(`Career path ${careerPathId} has no learning path`);
    const hasProject = Object.values(projects).some((project: any) => (project.careerPathIds || []).includes(careerPathId));
    if (!hasProject) errors.push(`Career path ${careerPathId} has no portfolio project`);
    const hasResource = Object.values(resources).some((resource: any) => (resource.careerPathIds || []).includes(careerPathId));
    if (!hasResource) errors.push(`Career path ${careerPathId} has no resource coverage`);
  });

  return errors;
}
