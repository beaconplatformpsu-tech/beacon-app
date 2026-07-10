import { resources } from "./masterData/resources";
import { skills } from "./masterData/skills";
import { careerPaths } from "./masterData/careerPaths";
import { learningPaths, learningPathSteps } from "./masterData/learningPaths";
import { practiceTasks, projects } from "./masterData/practiceAndProjects";
import { quizzes } from "./masterData/quizzesAndConfig";
import { CareerPathSkillRelation, ID } from "../../src/types/database";

// Define the career path skills mapping dynamically
export const careerPathSkills: Record<ID, Record<ID, CareerPathSkillRelation>> = {};

function addSkillToPath(pathId: string, skillId: string, importance: "core" | "important" | "optional", level: "beginner" | "intermediate" | "advanced", order: number) {
  if (!careerPathSkills[pathId]) careerPathSkills[pathId] = {};
  careerPathSkills[pathId][skillId] = {
    importanceLevel: importance,
    minimumProficiencyLevel: level,
    learningOrder: order,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Frontend
addSkillToPath("path_frontend_dev", "skill_javascript", "core", "advanced", 1);
addSkillToPath("path_frontend_dev", "skill_react", "core", "intermediate", 2);
addSkillToPath("path_frontend_dev", "skill_git", "important", "intermediate", 3);
addSkillToPath("path_frontend_dev", "skill_figma", "optional", "beginner", 4);

// Backend
addSkillToPath("path_backend_dev", "skill_python", "core", "intermediate", 1);
addSkillToPath("path_backend_dev", "skill_sql", "core", "intermediate", 2);
addSkillToPath("path_backend_dev", "skill_git", "important", "intermediate", 3);
addSkillToPath("path_backend_dev", "skill_docker", "important", "beginner", 4);

// Data
addSkillToPath("path_data_scientist", "skill_python", "core", "advanced", 1);
addSkillToPath("path_data_scientist", "skill_pandas", "core", "advanced", 2);
addSkillToPath("path_data_scientist", "skill_sql", "core", "intermediate", 3);
addSkillToPath("path_data_scientist", "skill_machine_learning", "important", "intermediate", 4);
addSkillToPath("path_data_scientist", "skill_data_visualization", "important", "beginner", 5);


export function generateIndexes() {
  const indexes: any = {
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
    practice_tasks_by_skill: {}
  };

  const safeAdd = (indexMap: any, primary: string, secondary: string) => {
    if (!primary || !secondary) return;
    if (!indexMap[primary]) indexMap[primary] = {};
    indexMap[primary][secondary] = true;
  };

  Object.values(skills).forEach(s => {
    safeAdd(indexes.skills_by_category, s.categoryId, s.id);
  });

  Object.values(careerPaths).forEach(c => {
    if (c.categoryId) safeAdd(indexes.career_paths_by_category, c.categoryId, c.id);
  });

  Object.values(learningPaths).forEach(lp => {
    safeAdd(indexes.learning_paths_by_career_path, lp.careerPathId, lp.id);
  });

  Object.values(resources).forEach(r => {
    safeAdd(indexes.resources_by_type, r.resourceType, r.id);
    if (r.difficultyLevel) safeAdd(indexes.resources_by_level, r.difficultyLevel, r.id);
    r.skillIds?.forEach(s => safeAdd(indexes.resources_by_skill, s, r.id));
    r.careerPathIds?.forEach(c => safeAdd(indexes.resources_by_career_path, c, r.id));
    r.academicCategoryIds?.forEach(a => safeAdd(indexes.resources_by_academic_category, a, r.id));
  });

  Object.values(projects).forEach(p => {
    p.skillIds?.forEach(s => safeAdd(indexes.projects_by_skill, s, p.id));
    p.careerPathIds?.forEach(c => safeAdd(indexes.projects_by_career_path, c, p.id));
  });

  Object.values(quizzes).forEach(q => {
    q.skillIds?.forEach(s => safeAdd(indexes.quizzes_by_skill, s, q.id));
  });

  Object.values(practiceTasks).forEach(pt => {
    pt.skillIds?.forEach(s => safeAdd(indexes.practice_tasks_by_skill, s, pt.id));
  });

  return indexes;
}

export function generateStats() {
  return {
    usersCount: 0, // Not seeded
    resourcesCount: Object.keys(resources).length,
    skillsCount: Object.keys(skills).length,
    careerPathsCount: Object.keys(careerPaths).length,
    academicCategoriesCount: 10,
    careerCategoriesCount: 10,
    skillCategoriesCount: 10,
    supportMessagesCount: 0,
    updatedAt: new Date().toISOString()
  };
}
