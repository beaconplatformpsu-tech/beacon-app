import { BaseEntity, ID } from "./base";

export interface Category extends BaseEntity {
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Skill extends BaseEntity {
  slug: string;
  title: string;
  description?: string;
  categoryId: ID;
  difficultyLevel?: "beginner" | "intermediate" | "advanced" | "expert" | "all_levels";
  tags?: string[];
  sortOrder?: number;
  isActive: boolean;
}

export interface CareerPath extends BaseEntity {
  slug: string;
  title: string;
  description?: string;
  longDescription?: string;
  categoryId: ID;
  industryDomain?: string;
  demandLevel?: "very_high" | "high" | "medium" | "low";
  requiredEducation?: string;
  averagePreparationTime?: string;
  beginnerFriendly?: boolean;
  isActive: boolean;
}

export interface Resource extends BaseEntity {
  slug: string;
  title: string;
  description?: string;
  longDescription?: string;
  provider: string;
  url?: string;
  sourceType: "internal" | "external";
  resourceType: "documentation" | "course" | "guide" | "practice" | "article" | "tool" | "roadmap" | "template" | "checklist";
  language: "en" | "ar";
  difficultyLevel?: "beginner" | "intermediate" | "advanced" | "all_levels";
  estimatedDuration?: string;
  isFree: boolean;
  isActive: boolean;
  qualityScore: number;
  skillIds: ID[];
  careerPathIds: ID[];
  academicCategoryIds: ID[];
  tags: string[];
}

export interface LearningPath extends BaseEntity {
  title: string;
  description: string;
  careerPathId: ID;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  estimatedDuration: string;
  isActive: boolean;
}

export interface LearningPathStep extends BaseEntity {
  learningPathId: ID;
  type: "resource" | "practice_task" | "quiz" | "project" | "milestone";
  title: string;
  description: string;
  resourceId?: ID;
  practiceTaskId?: ID;
  quizId?: ID;
  projectId?: ID;
  minimumScore?: number;
  sortOrder: number;
  isRequired: boolean;
}

export interface PracticeTask extends BaseEntity {
  title: string;
  description: string;
  instructions: string;
  skillIds: ID[];
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  estimatedTimeMinutes: number;
}

export interface QuizQuestion {
  id: ID;
  questionText: string;
  options: string[];
}

export interface Quiz extends BaseEntity {
  title: string;
  description: string;
  skillIds: ID[];
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  questions: Record<string, QuizQuestion>;
}

export interface Project extends BaseEntity {
  title: string;
  description: string;
  requirements: string[];
  skillIds: ID[];
  careerPathIds: ID[];
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
}

export interface Announcement extends BaseEntity {
  type: "system" | "feature" | "maintenance" | "news";
  title: string;
  content: string;
  isActive: boolean;
}
