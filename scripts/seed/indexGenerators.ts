import { resources } from "./masterData/resources";
import { skills } from "./masterData/skills";
import { careerPaths } from "./masterData/careerPaths";
import { learningPaths } from "./masterData/learningPaths";
import { practiceTasks, projects } from "./masterData/practiceAndProjects";
import { quizzes, announcements } from "./masterData/quizzesAndConfig";
import { skillCategories } from "./masterData/skillCategories";
import { careerCategories } from "./masterData/careerCategories";
import { academicCategories } from "./masterData/academicCategories";
import { CareerPathSkillRelation, ID } from "../../src/types/database";

type BooleanIndex = Record<ID, Record<ID, true>>;

export interface GeneratedIndexes {
  resources_by_skill: BooleanIndex;
  resources_by_type: BooleanIndex;
  resources_by_level: BooleanIndex;
  resources_by_career_path: BooleanIndex;
  resources_by_academic_category: BooleanIndex;
  skills_by_category: BooleanIndex;
  career_paths_by_category: BooleanIndex;
  learning_paths_by_career_path: BooleanIndex;
  projects_by_skill: BooleanIndex;
  projects_by_career_path: BooleanIndex;
  quizzes_by_skill: BooleanIndex;
  practice_tasks_by_skill: BooleanIndex;
}

const timestamp = new Date().toISOString();

export const careerPathSkills: Record<ID, Record<ID, CareerPathSkillRelation>> = {};

function addSkillToPath(
  pathId: ID,
  skillId: ID,
  importanceLevel: CareerPathSkillRelation["importanceLevel"],
  minimumProficiencyLevel: CareerPathSkillRelation["minimumProficiencyLevel"],
  learningOrder: number
) {
  if (!careerPathSkills[pathId]) {
    careerPathSkills[pathId] = {};
  }

  careerPathSkills[pathId][skillId] = {
    importanceLevel,
    minimumProficiencyLevel,
    learningOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Career Path → Required Skills
 *
 * These relations power:
 * - Skill gap analysis
 * - Career readiness score
 * - Recommended next skills
 * - Learning plan generation
 */

// Frontend Developer
addSkillToPath("path_frontend_dev", "skill_javascript", "core", "advanced", 1);
addSkillToPath("path_frontend_dev", "skill_react", "core", "intermediate", 2);
addSkillToPath("path_frontend_dev", "skill_typescript", "important", "intermediate", 3);
addSkillToPath("path_frontend_dev", "skill_nextjs", "important", "intermediate", 4);
addSkillToPath("path_frontend_dev", "skill_git", "important", "intermediate", 5);
addSkillToPath("path_frontend_dev", "skill_figma", "optional", "beginner", 6);

// Backend Developer
addSkillToPath("path_backend_dev", "skill_python", "core", "intermediate", 1);
addSkillToPath("path_backend_dev", "skill_sql", "core", "intermediate", 2);
addSkillToPath("path_backend_dev", "skill_git", "important", "intermediate", 3);
addSkillToPath("path_backend_dev", "skill_docker", "important", "beginner", 4);
addSkillToPath("path_backend_dev", "skill_web_security", "important", "beginner", 5);

// Full Stack Developer
addSkillToPath("path_fullstack_dev", "skill_javascript", "core", "advanced", 1);
addSkillToPath("path_fullstack_dev", "skill_react", "core", "intermediate", 2);
addSkillToPath("path_fullstack_dev", "skill_nextjs", "important", "intermediate", 3);
addSkillToPath("path_fullstack_dev", "skill_typescript", "important", "intermediate", 4);
addSkillToPath("path_fullstack_dev", "skill_sql", "core", "intermediate", 5);
addSkillToPath("path_fullstack_dev", "skill_git", "important", "intermediate", 6);
addSkillToPath("path_fullstack_dev", "skill_docker", "optional", "beginner", 7);
addSkillToPath("path_fullstack_dev", "skill_web_security", "important", "beginner", 8);

// Data Scientist
addSkillToPath("path_data_scientist", "skill_python", "core", "advanced", 1);
addSkillToPath("path_data_scientist", "skill_pandas", "core", "advanced", 2);
addSkillToPath("path_data_scientist", "skill_sql", "core", "intermediate", 3);
addSkillToPath("path_data_scientist", "skill_machine_learning", "important", "intermediate", 4);
addSkillToPath("path_data_scientist", "skill_data_visualization", "important", "beginner", 5);

// AI Engineer
addSkillToPath("path_ai_engineer", "skill_python", "core", "advanced", 1);
addSkillToPath("path_ai_engineer", "skill_machine_learning", "core", "advanced", 2);
addSkillToPath("path_ai_engineer", "skill_deep_learning", "important", "intermediate", 3);
addSkillToPath("path_ai_engineer", "skill_pandas", "important", "intermediate", 4);
addSkillToPath("path_ai_engineer", "skill_prompt_engineering", "optional", "beginner", 5);

// Cloud Architect
addSkillToPath("path_cloud_architect", "skill_aws", "core", "intermediate", 1);
addSkillToPath("path_cloud_architect", "skill_docker", "core", "intermediate", 2);
addSkillToPath("path_cloud_architect", "skill_ci_cd", "important", "intermediate", 3);
addSkillToPath("path_cloud_architect", "skill_git", "important", "intermediate", 4);
addSkillToPath("path_cloud_architect", "skill_network_security", "important", "beginner", 5);

// Cybersecurity Analyst
addSkillToPath("path_cybersec_analyst", "skill_network_security", "core", "intermediate", 1);
addSkillToPath("path_cybersec_analyst", "skill_web_security", "core", "intermediate", 2);
addSkillToPath("path_cybersec_analyst", "skill_git", "optional", "beginner", 3);
addSkillToPath("path_cybersec_analyst", "skill_docker", "optional", "beginner", 4);

// UI/UX Designer
addSkillToPath("path_ui_ux_designer", "skill_figma", "core", "intermediate", 1);
addSkillToPath("path_ui_ux_designer", "skill_wireframing", "core", "intermediate", 2);
addSkillToPath("path_ui_ux_designer", "skill_user_research", "important", "intermediate", 3);
addSkillToPath("path_ui_ux_designer", "skill_communication", "important", "beginner", 4);

// Product Manager
addSkillToPath("path_product_manager", "skill_product_strategy", "core", "intermediate", 1);
addSkillToPath("path_product_manager", "skill_project_management", "core", "intermediate", 2);
addSkillToPath("path_product_manager", "skill_agile", "important", "intermediate", 3);
addSkillToPath("path_product_manager", "skill_communication", "important", "intermediate", 4);
addSkillToPath("path_product_manager", "skill_user_research", "optional", "beginner", 5);

// Digital Marketing Specialist
addSkillToPath("path_digital_marketer", "skill_seo", "core", "intermediate", 1);
addSkillToPath("path_digital_marketer", "skill_content_marketing", "core", "intermediate", 2);
addSkillToPath("path_digital_marketer", "skill_communication", "important", "beginner", 3);

function createEmptyIndexes(): GeneratedIndexes {
  return {
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
}

function safeAdd(indexMap: BooleanIndex, primaryId: ID | undefined | null, secondaryId: ID | undefined | null) {
  if (!primaryId || !secondaryId) return;

  if (!indexMap[primaryId]) {
    indexMap[primaryId] = {};
  }

  indexMap[primaryId][secondaryId] = true;
}

function sortBooleanIndex(indexMap: BooleanIndex): BooleanIndex {
  const sorted: BooleanIndex = {};

  for (const primaryId of Object.keys(indexMap).sort()) {
    sorted[primaryId] = {};

    for (const secondaryId of Object.keys(indexMap[primaryId]).sort()) {
      sorted[primaryId][secondaryId] = true;
    }
  }

  return sorted;
}

function sortIndexes(indexes: GeneratedIndexes): GeneratedIndexes {
  return {
    resources_by_skill: sortBooleanIndex(indexes.resources_by_skill),
    resources_by_type: sortBooleanIndex(indexes.resources_by_type),
    resources_by_level: sortBooleanIndex(indexes.resources_by_level),
    resources_by_career_path: sortBooleanIndex(indexes.resources_by_career_path),
    resources_by_academic_category: sortBooleanIndex(indexes.resources_by_academic_category),
    skills_by_category: sortBooleanIndex(indexes.skills_by_category),
    career_paths_by_category: sortBooleanIndex(indexes.career_paths_by_category),
    learning_paths_by_career_path: sortBooleanIndex(indexes.learning_paths_by_career_path),
    projects_by_skill: sortBooleanIndex(indexes.projects_by_skill),
    projects_by_career_path: sortBooleanIndex(indexes.projects_by_career_path),
    quizzes_by_skill: sortBooleanIndex(indexes.quizzes_by_skill),
    practice_tasks_by_skill: sortBooleanIndex(indexes.practice_tasks_by_skill),
  };
}

export function generateIndexes(): GeneratedIndexes {
  const indexes = createEmptyIndexes();

  for (const skill of Object.values(skills)) {
    safeAdd(indexes.skills_by_category, skill.categoryId, skill.id);
  }

  for (const careerPath of Object.values(careerPaths)) {
    safeAdd(indexes.career_paths_by_category, careerPath.categoryId, careerPath.id);
  }

  for (const learningPath of Object.values(learningPaths)) {
    safeAdd(indexes.learning_paths_by_career_path, learningPath.careerPathId, learningPath.id);
  }

  for (const resource of Object.values(resources)) {
    safeAdd(indexes.resources_by_type, resource.resourceType, resource.id);
    safeAdd(indexes.resources_by_level, resource.difficultyLevel, resource.id);

    for (const skillId of resource.skillIds || []) {
      safeAdd(indexes.resources_by_skill, skillId, resource.id);
    }

    for (const careerPathId of resource.careerPathIds || []) {
      safeAdd(indexes.resources_by_career_path, careerPathId, resource.id);
    }

    for (const academicCategoryId of resource.academicCategoryIds || []) {
      safeAdd(indexes.resources_by_academic_category, academicCategoryId, resource.id);
    }
  }

  for (const project of Object.values(projects)) {
    for (const skillId of project.skillIds || []) {
      safeAdd(indexes.projects_by_skill, skillId, project.id);
    }

    for (const careerPathId of project.careerPathIds || []) {
      safeAdd(indexes.projects_by_career_path, careerPathId, project.id);
    }
  }

  for (const quiz of Object.values(quizzes)) {
    for (const skillId of quiz.skillIds || []) {
      safeAdd(indexes.quizzes_by_skill, skillId, quiz.id);
    }
  }

  for (const practiceTask of Object.values(practiceTasks)) {
    for (const skillId of practiceTask.skillIds || []) {
      safeAdd(indexes.practice_tasks_by_skill, skillId, practiceTask.id);
    }
  }

  return sortIndexes(indexes);
}

export function generateStats() {
  return {
    usersCount: 0,
    resourcesCount: Object.keys(resources).length,
    skillsCount: Object.keys(skills).length,
    careerPathsCount: Object.keys(careerPaths).length,
    learningPathsCount: Object.keys(learningPaths).length,
    practiceTasksCount: Object.keys(practiceTasks).length,
    projectsCount: Object.keys(projects).length,
    quizzesCount: Object.keys(quizzes).length,
    announcementsCount: Object.keys(announcements).length,
    academicCategoriesCount: Object.keys(academicCategories).length,
    careerCategoriesCount: Object.keys(careerCategories).length,
    skillCategoriesCount: Object.keys(skillCategories).length,
    supportMessagesCount: 0,
    updatedAt: new Date().toISOString(),
  };
}