type SeedPayload = Record<string, unknown>;
type UnknownRecord = Record<string, unknown>;
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

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function getNode(payload: SeedPayload, path: string, fallback: UnknownRecord = {}): UnknownRecord {
  const direct = payload[path];

  if (isRecord(direct)) {
    return direct;
  }

  const parts = path.split("/");
  let current: unknown = payload;

  for (const part of parts) {
    if (!isRecord(current) || current[part] === undefined) {
      return fallback;
    }

    current = current[part];
  }

  return isRecord(current) ? current : fallback;
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function hasOwn(obj: unknown, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

function hasDuplicate(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

function addIndex(index: BooleanIndex, primaryId?: string, secondaryId?: string) {
  if (!primaryId || !secondaryId) return;

  if (!index[primaryId]) {
    index[primaryId] = {};
  }

  index[primaryId][secondaryId] = true;
}

function sortIndex(index: BooleanIndex): BooleanIndex {
  const sorted: BooleanIndex = {};

  for (const key of Object.keys(index || {}).sort()) {
    sorted[key] = {};

    for (const child of Object.keys(index[key] || {}).sort()) {
      sorted[key][child] = true;
    }
  }

  return sorted;
}

function normalizeBooleanIndex(value: unknown): BooleanIndex {
  const source = asRecord(value);
  const normalized: BooleanIndex = {};

  for (const [primaryId, children] of Object.entries(source)) {
    if (!isRecord(children)) continue;

    for (const [secondaryId, enabled] of Object.entries(children)) {
      if (enabled === true) {
        addIndex(normalized, primaryId, secondaryId);
      }
    }
  }

  return normalized;
}

function compareIndex(name: string, expected: BooleanIndex, actualRaw: unknown, errors: string[]) {
  const expectedSorted = sortIndex(expected || {});
  const actualSorted = sortIndex(normalizeBooleanIndex(actualRaw));

  if (JSON.stringify(expectedSorted) !== JSON.stringify(actualSorted)) {
    errors.push(`Index mismatch for ${name}`);
  }
}

function collectionValues(collection: UnknownRecord): UnknownRecord[] {
  return Object.values(collection).filter(isRecord);
}

function collectionEntries(collection: UnknownRecord): [string, UnknownRecord][] {
  return Object.entries(collection).filter((entry): entry is [string, UnknownRecord] => isRecord(entry[1]));
}

function objectCount(collection: UnknownRecord): number {
  return Object.keys(collection || {}).length;
}

function validateNoForbiddenContent(payload: SeedPayload, errors: string[]) {
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

  if (serialized.includes("signedUrl")) {
    errors.push("Payload contains signedUrl. Store only stable storage metadata, not permanent signed URLs.");
  }
}

function validateNoSecrets(platformSettings: UnknownRecord, errors: string[]) {
  const privateSettings = asRecord(platformSettings.private);
  const privateSerialized = JSON.stringify(privateSettings).toLowerCase();

  const forbiddenSecretTokens = [
    "apikey",
    "api_key",
    "secret",
    "token",
    "password",
    "credential",
    "private_key",
    "service_role",
  ];

  for (const token of forbiddenSecretTokens) {
    if (privateSerialized.includes(token)) {
      errors.push(`platform_settings/private contains suspected secret token: ${token}`);
    }
  }
}

function validateEntityBase(
  entity: UnknownRecord,
  collection: string,
  errors: string[],
  options: { requireSlug?: boolean; requireTitle?: boolean; requireIsActive?: boolean } = {}
) {
  const requireSlug = options.requireSlug ?? true;
  const requireTitle = options.requireTitle ?? true;
  const requireIsActive = options.requireIsActive ?? true;

  const id = getString(entity.id);

  if (!id) {
    errors.push(`${collection} entity is missing id`);
  }

  if (requireSlug && !getString(entity.slug)) {
    errors.push(`${collection} ${id || "unknown"} is missing slug`);
  }

  if (requireTitle && !getString(entity.title)) {
    errors.push(`${collection} ${id || "unknown"} is missing title`);
  }

  if (requireIsActive && getBoolean(entity.isActive) === undefined) {
    errors.push(`${collection} ${id || "unknown"} is missing boolean isActive`);
  }

  if (!getString(entity.createdAt)) {
    errors.push(`${collection} ${id || "unknown"} is missing createdAt`);
  }

  if (!getString(entity.updatedAt)) {
    errors.push(`${collection} ${id || "unknown"} is missing updatedAt`);
  }
}

function validateUniqueIdsAndSlugs(
  collections: Array<{ name: string; data: UnknownRecord; requireSlug: boolean }>,
  errors: string[]
) {
  const idOwners = new Map<string, string>();
  const slugOwners = new Map<string, string>();

  for (const collection of collections) {
    for (const entity of collectionValues(collection.data)) {
      const id = getString(entity.id);
      const slug = getString(entity.slug);

      if (id) {
        const owner = idOwners.get(id);

        if (owner) {
          errors.push(`Duplicate id ${id} in ${collection.name}; already used by ${owner}`);
        }

        idOwners.set(id, collection.name);
      }

      if (collection.requireSlug && slug) {
        const slugKey = `${collection.name}:${slug}`;
        const owner = slugOwners.get(slugKey);

        if (owner) {
          errors.push(`Duplicate slug ${slug} within ${collection.name}; already used by ${owner}`);
        }

        slugOwners.set(slugKey, id);
      }
    }
  }
}

export function validateSeedPayload(payload: SeedPayload): string[] {
  const errors: string[] = [];

  const publicContent = getNode(payload, "public_content", {});
  const skillCategories = getNode(payload, "public_content/skill_categories", asRecord(publicContent.skill_categories));
  const careerCategories = getNode(payload, "public_content/career_categories", asRecord(publicContent.career_categories));
  const academicCategories = getNode(payload, "public_content/academic_categories", asRecord(publicContent.academic_categories));
  const skills = getNode(payload, "public_content/skills", asRecord(publicContent.skills));
  const careerPaths = getNode(payload, "public_content/career_paths", asRecord(publicContent.career_paths));
  const resources = getNode(payload, "public_content/resources", asRecord(publicContent.resources));
  const learningPaths = getNode(payload, "public_content/learning_paths", asRecord(publicContent.learning_paths));
  const practiceTasks = getNode(payload, "public_content/practice_tasks", asRecord(publicContent.practice_tasks));
  const quizzes = getNode(payload, "public_content/quizzes", asRecord(publicContent.quizzes));
  const projects = getNode(payload, "public_content/projects", asRecord(publicContent.projects));
  const announcements = getNode(payload, "public_content/announcements", asRecord(publicContent.announcements));

  const relations = getNode(payload, "relations", {});
  const careerPathSkills = getNode(payload, "relations/career_path_skills", asRecord(relations.career_path_skills));
  const learningPathSteps = getNode(payload, "relations/learning_path_steps", asRecord(relations.learning_path_steps));

  const indexes = getNode(payload, "indexes", {});
  const stats = getNode(payload, "stats", {});
  const platformSettings = getNode(payload, "platform_settings", {});
  const answerKeys = getNode(payload, "system/quiz_answer_keys", {});
  const aiLogs = getNode(payload, "system/ai_usage_logs", {});

  validateNoForbiddenContent(payload, errors);
  validateNoSecrets(platformSettings, errors);

  for (const log of collectionValues(aiLogs)) {
    if (hasOwn(log, "prompt") || hasOwn(log, "rawPrompt") || hasOwn(log, "fullPrompt")) {
      errors.push(`AI usage log ${getString(log.id) || "unknown"} contains raw prompt data.`);
    }
  }

  validateUniqueIdsAndSlugs(
    [
      { name: "skill_categories", data: skillCategories, requireSlug: true },
      { name: "career_categories", data: careerCategories, requireSlug: true },
      { name: "academic_categories", data: academicCategories, requireSlug: true },
      { name: "skills", data: skills, requireSlug: true },
      { name: "career_paths", data: careerPaths, requireSlug: true },
      { name: "resources", data: resources, requireSlug: true },
      { name: "learning_paths", data: learningPaths, requireSlug: false },
      { name: "practice_tasks", data: practiceTasks, requireSlug: false },
      { name: "projects", data: projects, requireSlug: false },
      { name: "quizzes", data: quizzes, requireSlug: false },
      { name: "announcements", data: announcements, requireSlug: false },
    ],
    errors
  );

  for (const category of collectionValues(skillCategories)) {
    validateEntityBase(category, "skill_categories", errors);
    if (!getString(category.description).trim()) {
      errors.push(`Skill category ${getString(category.id) || "unknown"} is missing description`);
    }
    if (getNumber(category.sortOrder) === undefined) {
      errors.push(`Skill category ${getString(category.id) || "unknown"} is missing numeric sortOrder`);
    }
  }

  for (const category of collectionValues(careerCategories)) {
    validateEntityBase(category, "career_categories", errors);
    if (!getString(category.description).trim()) {
      errors.push(`Career category ${getString(category.id) || "unknown"} is missing description`);
    }
    if (getNumber(category.sortOrder) === undefined) {
      errors.push(`Career category ${getString(category.id) || "unknown"} is missing numeric sortOrder`);
    }
  }

  for (const category of collectionValues(academicCategories)) {
    validateEntityBase(category, "academic_categories", errors);
    if (!getString(category.description).trim()) {
      errors.push(`Academic category ${getString(category.id) || "unknown"} is missing description`);
    }
    if (getNumber(category.sortOrder) === undefined) {
      errors.push(`Academic category ${getString(category.id) || "unknown"} is missing numeric sortOrder`);
    }
  }

  for (const skill of collectionValues(skills)) {
    const skillId = getString(skill.id);

    validateEntityBase(skill, "skills", errors);

    if (hasOwn(skill, "name")) {
      errors.push(`Skill ${skillId || "unknown"} uses legacy name field.`);
    }

    const categoryId = getString(skill.categoryId);

    if (!categoryId || !skillCategories[categoryId]) {
      errors.push(`Skill ${skillId || "unknown"} references missing skill category ${categoryId || "empty"}`);
    }

    const difficultyLevel = getString(skill.difficultyLevel);

    if (difficultyLevel && !VALID_LEVELS.has(difficultyLevel)) {
      errors.push(`Skill ${skillId || "unknown"} has invalid difficultyLevel ${difficultyLevel}`);
    }

    if (!Array.isArray(skill.tags)) {
      errors.push(`Skill ${skillId || "unknown"} is missing tags array`);
    } else if (hasDuplicate(getStringArray(skill.tags))) {
      errors.push(`Skill ${skillId || "unknown"} has duplicate tags`);
    }
  }

  for (const careerPath of collectionValues(careerPaths)) {
    const careerPathId = getString(careerPath.id);
    const categoryId = getString(careerPath.categoryId);

    validateEntityBase(careerPath, "career_paths", errors);

    if (!categoryId || !careerCategories[categoryId]) {
      errors.push(`Career path ${careerPathId || "unknown"} references missing career category ${categoryId || "empty"}`);
    }

    if (!getString(careerPath.longDescription).trim()) {
      errors.push(`Career path ${careerPathId || "unknown"} is missing longDescription`);
    }
  }

  for (const resource of collectionValues(resources)) {
    const resourceId = getString(resource.id);

    validateEntityBase(resource, "resources", errors);

    if (!getString(resource.provider)) {
      errors.push(`Resource ${resourceId || "unknown"} is missing provider`);
    }

    const resourceType = getString(resource.resourceType);

    if (!VALID_RESOURCE_TYPES.has(resourceType)) {
      errors.push(`Resource ${resourceId || "unknown"} has invalid resourceType ${resourceType || "empty"}`);
    }

    const difficultyLevel = getString(resource.difficultyLevel);

    if (difficultyLevel && !VALID_LEVELS.has(difficultyLevel)) {
      errors.push(`Resource ${resourceId || "unknown"} has invalid difficultyLevel ${difficultyLevel}`);
    }

    for (const field of ["skillIds", "careerPathIds", "academicCategoryIds", "tags"]) {
      const values = getStringArray(resource[field]);

      if (!Array.isArray(resource[field])) {
        errors.push(`Resource ${resourceId || "unknown"} is missing ${field} array`);
      }

      if (values.length > 0 && hasDuplicate(values)) {
        errors.push(`Resource ${resourceId || "unknown"} has duplicate values in ${field}`);
      }
    }

    if (getString(resource.sourceType) === "external" && !getString(resource.url).startsWith("https://")) {
      errors.push(`External resource ${resourceId || "unknown"} must have a real https URL`);
    }

    for (const skillId of getStringArray(resource.skillIds)) {
      if (!skills[skillId]) {
        errors.push(`Resource ${resourceId || "unknown"} references missing skill ${skillId}`);
      }
    }

    for (const careerPathId of getStringArray(resource.careerPathIds)) {
      if (!careerPaths[careerPathId]) {
        errors.push(`Resource ${resourceId || "unknown"} references missing career path ${careerPathId}`);
      }
    }

    for (const academicCategoryId of getStringArray(resource.academicCategoryIds)) {
      if (!academicCategories[academicCategoryId]) {
        errors.push(`Resource ${resourceId || "unknown"} references missing academic category ${academicCategoryId}`);
      }
    }
  }

  for (const learningPath of collectionValues(learningPaths)) {
    const learningPathId = getString(learningPath.id);
    const careerPathId = getString(learningPath.careerPathId);
    const difficultyLevel = getString(learningPath.difficultyLevel);

    validateEntityBase(learningPath, "learning_paths", errors, { requireSlug: false });

    if (!careerPathId || !careerPaths[careerPathId]) {
      errors.push(`Learning path ${learningPathId || "unknown"} references missing career path ${careerPathId || "empty"}`);
    }

    if (!VALID_LEVELS.has(difficultyLevel)) {
      errors.push(`Learning path ${learningPathId || "unknown"} has invalid difficultyLevel ${difficultyLevel || "empty"}`);
    }
  }

  for (const task of collectionValues(practiceTasks)) {
    const taskId = getString(task.id);
    const skillIds = getStringArray(task.skillIds);

    validateEntityBase(task, "practice_tasks", errors, { requireSlug: false });

    if (skillIds.length === 0) {
      errors.push(`Practice task ${taskId || "unknown"} must have skillIds`);
    }

    if (hasDuplicate(skillIds)) {
      errors.push(`Practice task ${taskId || "unknown"} has duplicate skillIds`);
    }

    if (!VALID_LEVELS.has(getString(task.difficultyLevel))) {
      errors.push(`Practice task ${taskId || "unknown"} has invalid difficultyLevel ${getString(task.difficultyLevel) || "empty"}`);
    }

    if (getNumber(task.estimatedTimeMinutes) === undefined) {
      errors.push(`Practice task ${taskId || "unknown"} is missing numeric estimatedTimeMinutes`);
    }

    for (const skillId of skillIds) {
      if (!skills[skillId]) {
        errors.push(`Practice task ${taskId || "unknown"} references missing skill ${skillId}`);
      }
    }
  }

  for (const project of collectionValues(projects)) {
    const projectId = getString(project.id);
    const skillIds = getStringArray(project.skillIds);
    const careerPathIds = getStringArray(project.careerPathIds);
    const requirements = getArray(project.requirements);

    validateEntityBase(project, "projects", errors, { requireSlug: false });

    if (skillIds.length === 0) {
      errors.push(`Project ${projectId || "unknown"} must have non-empty skillIds`);
    }

    if (careerPathIds.length === 0) {
      errors.push(`Project ${projectId || "unknown"} must have non-empty careerPathIds`);
    }

    if (requirements.length === 0) {
      errors.push(`Project ${projectId || "unknown"} must have non-empty requirements`);
    }

    if (hasDuplicate(skillIds)) {
      errors.push(`Project ${projectId || "unknown"} has duplicate skillIds`);
    }

    if (hasDuplicate(careerPathIds)) {
      errors.push(`Project ${projectId || "unknown"} has duplicate careerPathIds`);
    }

    if (!VALID_LEVELS.has(getString(project.difficultyLevel))) {
      errors.push(`Project ${projectId || "unknown"} has invalid difficultyLevel ${getString(project.difficultyLevel) || "empty"}`);
    }

    if (getNumber(project.estimatedHours) === undefined) {
      errors.push(`Project ${projectId || "unknown"} is missing numeric estimatedHours`);
    }

    for (const skillId of skillIds) {
      if (!skills[skillId]) {
        errors.push(`Project ${projectId || "unknown"} references missing skill ${skillId}`);
      }
    }

    for (const careerPathId of careerPathIds) {
      if (!careerPaths[careerPathId]) {
        errors.push(`Project ${projectId || "unknown"} references missing career path ${careerPathId}`);
      }
    }
  }

  const quizQuestionTexts = new Set<string>();

  for (const quiz of collectionValues(quizzes)) {
    const quizId = getString(quiz.id);
    const skillIds = getStringArray(quiz.skillIds);
    const questions = asRecord(quiz.questions);

    validateEntityBase(quiz, "quizzes", errors, { requireSlug: false });

    if (skillIds.length === 0) {
      errors.push(`Quiz ${quizId || "unknown"} must have skillIds`);
    }

    if (hasDuplicate(skillIds)) {
      errors.push(`Quiz ${quizId || "unknown"} has duplicate skillIds`);
    }

    if (!VALID_LEVELS.has(getString(quiz.difficultyLevel))) {
      errors.push(`Quiz ${quizId || "unknown"} has invalid difficultyLevel ${getString(quiz.difficultyLevel) || "empty"}`);
    }

    for (const skillId of skillIds) {
      if (!skills[skillId]) {
        errors.push(`Quiz ${quizId || "unknown"} references missing skill ${skillId}`);
      }
    }

    if (!answerKeys[quizId]) {
      errors.push(`Quiz ${quizId || "unknown"} is missing an answer key`);
    }

    const questionValues = collectionValues(questions);

    if (questionValues.length < 3) {
      errors.push(`Quiz ${quizId || "unknown"} should contain at least 3 questions`);
    }

    for (const question of questionValues) {
      const questionId = getString(question.id);
      const questionText = getString(question.questionText).trim();
      const options = getArray(question.options);

      if (hasOwn(question, "correctOptionIndex") || hasOwn(question, "explanation") || hasOwn(question, "answer") || hasOwn(question, "correctAnswer")) {
        errors.push(`Quiz ${quizId || "unknown"} exposes answer data in public_content`);
      }

      if (!questionText) {
        errors.push(`Quiz ${quizId || "unknown"}/${questionId || "unknown"} is missing questionText`);
      }

      if (!Array.isArray(question.options) || options.length < 4) {
        errors.push(`Quiz ${quizId || "unknown"}/${questionId || "unknown"} must have at least 4 options`);
      }

      if (questionText) {
        const normalizedQuestion = questionText.toLowerCase();

        if (quizQuestionTexts.has(normalizedQuestion)) {
          errors.push(`Repeated quiz question detected: ${questionText}`);
        }

        quizQuestionTexts.add(normalizedQuestion);
      }
    }
  }

  for (const [quizId, key] of collectionEntries(answerKeys)) {
    if (!quizzes[quizId]) {
      errors.push(`Answer key ${quizId} has no matching public quiz`);
    }

    const keyQuestions = asRecord(key.questions);
    const publicQuestions = asRecord(asRecord(quizzes[quizId]).questions);

    for (const [questionId, answer] of collectionEntries(keyQuestions)) {
      const publicQuestion = asRecord(publicQuestions[questionId]);
      const options = getArray(publicQuestion.options);
      const correctOptionIndex = getNumber(answer.correctOptionIndex);

      if (!publicQuestions[questionId]) {
        errors.push(`Answer key ${quizId}/${questionId} has no matching public question`);
      }

      if (correctOptionIndex === undefined) {
        errors.push(`Answer key ${quizId}/${questionId} is missing numeric correctOptionIndex`);
      }

      if (correctOptionIndex !== undefined && options.length > 0 && (correctOptionIndex < 0 || correctOptionIndex >= options.length)) {
        errors.push(`Answer key ${quizId}/${questionId} correctOptionIndex is out of range`);
      }

      if (!getString(answer.explanation).trim()) {
        errors.push(`Answer key ${quizId}/${questionId} is missing explanation`);
      }
    }
  }

  for (const [careerPathId, skillMap] of collectionEntries(careerPathSkills)) {
    if (!careerPaths[careerPathId]) {
      errors.push(`career_path_skills references missing career path ${careerPathId}`);
    }

    for (const [skillId, relation] of collectionEntries(skillMap)) {
      if (!skills[skillId]) {
        errors.push(`career_path_skills ${careerPathId} references missing skill ${skillId}`);
      }

      if (!VALID_IMPORTANCE.has(getString(relation.importanceLevel))) {
        errors.push(`career_path_skills ${careerPathId}/${skillId} has invalid importanceLevel`);
      }

      if (!VALID_LEVELS.has(getString(relation.minimumProficiencyLevel))) {
        errors.push(`career_path_skills ${careerPathId}/${skillId} has invalid minimumProficiencyLevel`);
      }

      if (getNumber(relation.learningOrder) === undefined) {
        errors.push(`career_path_skills ${careerPathId}/${skillId} is missing numeric learningOrder`);
      }
    }
  }

  for (const [learningPathId, steps] of collectionEntries(learningPathSteps)) {
    if (!learningPaths[learningPathId]) {
      errors.push(`learning_path_steps references missing learning path ${learningPathId}`);
    }

    const seenSortOrders = new Set<number>();

    for (const step of collectionValues(steps)) {
      const stepId = getString(step.id);
      const stepType = getString(step.type);
      const sortOrder = getNumber(step.sortOrder);

      if (!VALID_STEP_TYPES.has(stepType)) {
        errors.push(`Learning step ${stepId || "unknown"} has invalid type ${stepType || "empty"}`);
      }

      if (getString(step.learningPathId) !== learningPathId) {
        errors.push(`Learning step ${stepId || "unknown"} learningPathId does not match parent ${learningPathId}`);
      }

      if (sortOrder === undefined) {
        errors.push(`Learning step ${stepId || "unknown"} is missing numeric sortOrder`);
      } else if (seenSortOrders.has(sortOrder)) {
        errors.push(`Learning path ${learningPathId} has duplicate step sortOrder ${sortOrder}`);
      } else {
        seenSortOrders.add(sortOrder);
      }

      if (stepType === "resource" && (!getString(step.resourceId) || !resources[getString(step.resourceId)])) {
        errors.push(`Learning step ${stepId || "unknown"} references invalid resourceId ${getString(step.resourceId) || "empty"}`);
      }

      if (stepType === "practice_task" && (!getString(step.practiceTaskId) || !practiceTasks[getString(step.practiceTaskId)])) {
        errors.push(`Learning step ${stepId || "unknown"} references invalid practiceTaskId ${getString(step.practiceTaskId) || "empty"}`);
      }

      if (stepType === "quiz" && (!getString(step.quizId) || !quizzes[getString(step.quizId)])) {
        errors.push(`Learning step ${stepId || "unknown"} references invalid quizId ${getString(step.quizId) || "empty"}`);
      }

      if (stepType === "project" && (!getString(step.projectId) || !projects[getString(step.projectId)])) {
        errors.push(`Learning step ${stepId || "unknown"} references invalid projectId ${getString(step.projectId) || "empty"}`);
      }
    }
  }

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
    if (objectCount(collection) < minimum) {
      errors.push(`Expected at least ${minimum} ${label}, found ${objectCount(collection)}`);
    }
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

  for (const skill of collectionValues(skills)) {
    addIndex(expectedIndexes.skills_by_category, getString(skill.categoryId), getString(skill.id));
  }

  for (const careerPath of collectionValues(careerPaths)) {
    addIndex(expectedIndexes.career_paths_by_category, getString(careerPath.categoryId), getString(careerPath.id));
  }

  for (const learningPath of collectionValues(learningPaths)) {
    addIndex(expectedIndexes.learning_paths_by_career_path, getString(learningPath.careerPathId), getString(learningPath.id));
  }

  for (const resource of collectionValues(resources)) {
    addIndex(expectedIndexes.resources_by_type, getString(resource.resourceType), getString(resource.id));
    addIndex(expectedIndexes.resources_by_level, getString(resource.difficultyLevel), getString(resource.id));

    for (const skillId of getStringArray(resource.skillIds)) {
      addIndex(expectedIndexes.resources_by_skill, skillId, getString(resource.id));
    }

    for (const careerPathId of getStringArray(resource.careerPathIds)) {
      addIndex(expectedIndexes.resources_by_career_path, careerPathId, getString(resource.id));
    }

    for (const academicCategoryId of getStringArray(resource.academicCategoryIds)) {
      addIndex(expectedIndexes.resources_by_academic_category, academicCategoryId, getString(resource.id));
    }
  }

  for (const project of collectionValues(projects)) {
    for (const skillId of getStringArray(project.skillIds)) {
      addIndex(expectedIndexes.projects_by_skill, skillId, getString(project.id));
    }

    for (const careerPathId of getStringArray(project.careerPathIds)) {
      addIndex(expectedIndexes.projects_by_career_path, careerPathId, getString(project.id));
    }
  }

  for (const quiz of collectionValues(quizzes)) {
    for (const skillId of getStringArray(quiz.skillIds)) {
      addIndex(expectedIndexes.quizzes_by_skill, skillId, getString(quiz.id));
    }
  }

  for (const task of collectionValues(practiceTasks)) {
    for (const skillId of getStringArray(task.skillIds)) {
      addIndex(expectedIndexes.practice_tasks_by_skill, skillId, getString(task.id));
    }
  }

  for (const [indexName, expected] of Object.entries(expectedIndexes)) {
    compareIndex(indexName, expected, indexes[indexName], errors);
  }

  const expectedStats: Record<string, number> = {
    resourcesCount: objectCount(resources),
    skillsCount: objectCount(skills),
    careerPathsCount: objectCount(careerPaths),
    academicCategoriesCount: objectCount(academicCategories),
    careerCategoriesCount: objectCount(careerCategories),
    skillCategoriesCount: objectCount(skillCategories),
  };

  for (const [field, expected] of Object.entries(expectedStats)) {
    if (stats[field] !== expected) {
      errors.push(`Stats ${field} (${String(stats[field])}) does not match actual count (${expected})`);
    }
  }

  const skillResourceCoverage = new Set<string>();

  for (const resource of collectionValues(resources)) {
    for (const skillId of getStringArray(resource.skillIds)) {
      skillResourceCoverage.add(skillId);
    }
  }

  for (const skillId of Object.keys(skills)) {
    if (!skillResourceCoverage.has(skillId)) {
      errors.push(`Skill ${skillId} has no resource coverage`);
    }
  }

  for (const careerPathId of Object.keys(careerPaths)) {
    if (!careerPathSkills[careerPathId]) {
      errors.push(`Career path ${careerPathId} has no career_path_skills relation`);
    }

    const hasLearningPath = collectionValues(learningPaths).some((learningPath) => {
      return getString(learningPath.careerPathId) === careerPathId;
    });

    if (!hasLearningPath) {
      errors.push(`Career path ${careerPathId} has no learning path`);
    }

    const hasProject = collectionValues(projects).some((project) => {
      return getStringArray(project.careerPathIds).includes(careerPathId);
    });

    if (!hasProject) {
      errors.push(`Career path ${careerPathId} has no portfolio project`);
    }

    const hasResource = collectionValues(resources).some((resource) => {
      return getStringArray(resource.careerPathIds).includes(careerPathId);
    });

    if (!hasResource) {
      errors.push(`Career path ${careerPathId} has no resource coverage`);
    }
  }

  return errors;
}