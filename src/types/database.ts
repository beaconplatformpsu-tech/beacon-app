/**
 * Beacon Platform - Professional Firebase Realtime Database Architecture
 * 
 * This file contains the authoritative TypeScript interfaces for the entire
 * Realtime Database. It defines the exact JSON structure as stored in Firebase.
 */

// ─────────────────────────────────────────────
// Shared Utility Types
// ─────────────────────────────────────────────
export type ISOString = string; // e.g., "2026-07-10T12:00:00Z"
export type UID = string;
export type ID = string;

export interface BaseEntity {
  id: ID;
  createdAt?: ISOString;
  updatedAt?: ISOString;
}

export interface FileReference {
  url: string;
  storagePath: string;
  mimeType?: string;
  sizeBytes?: number;
  fileName: string;
  uploadedAt: ISOString;
}

// ─────────────────────────────────────────────
// Public Content Models (/public_content)
// ─────────────────────────────────────────────

export interface Category extends BaseEntity {
  slug: string;
  title: string;
  description?: string;
  sortOrder?: number;
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
  categoryId?: ID;
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
  provider?: string;
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
  title: string;
  description: string;
  resourceId?: ID;
  practiceTaskId?: ID;
  quizId?: ID;
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
  // Correct answers and explanations are stored securely in /system/quiz_answer_keys
}

export interface Quiz extends BaseEntity {
  title: string;
  description: string;
  skillId: ID;
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

// ─────────────────────────────────────────────
// Relations (/relations)
// ─────────────────────────────────────────────

export interface CareerPathSkillRelation {
  importanceLevel: "core" | "important" | "optional";
  minimumProficiencyLevel: "beginner" | "intermediate" | "advanced";
  learningOrder?: number;
  createdAt?: ISOString;
  updatedAt?: ISOString;
}

// ─────────────────────────────────────────────
// Users (/users/{uid})
// ─────────────────────────────────────────────

export interface UserProfile {
  uid: UID;
  email: string;
  displayName?: string;
  bio?: string;
  major?: string;
  academicLevel?: string;
  graduationYear?: number;
  preferredCareerPathId?: ID;
  github?: string;
  linkedin?: string;
  photoURL?: string;
  createdAt?: ISOString;
  updatedAt?: ISOString;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "en" | "ar";
  emailNotifications: boolean;
  updatedAt?: ISOString;
}

export interface UserOnboarding {
  hasCompletedProfile: boolean;
  hasSelectedCareerPath: boolean;
  completedSteps: string[];
  updatedAt?: ISOString;
}

export interface UserAdminMeta {
  role: "super_admin" | "content_admin" | "advisor" | "support_admin" | "student";
  permissions: {
    canManageContent: boolean;
    canManageUsers: boolean;
    canManageSupport: boolean;
    canViewStats: boolean;
    canViewPrivateStudentData: boolean;
    canRunSystemActions: boolean;
  };
  accountStatus: "active" | "suspended";
  emailVerified: boolean;
  createdAt?: ISOString;
  updatedAt?: ISOString;
}

// ─────────────────────────────────────────────
// User Private Entities (/user_private/{uid})
// ─────────────────────────────────────────────

export interface SkillProgress {
  skillId: ID;
  currentLevel: "beginner" | "intermediate" | "advanced" | "expert";
  targetLevel: "beginner" | "intermediate" | "advanced" | "expert";
  status: "pending" | "in_progress" | "completed";
  progress: number; // 0-100
  completedResourceIds?: ID[];
  passedQuizIds?: ID[];
  completedPracticeTaskIds?: ID[];
  evidenceIds?: ID[];
  lastPracticedAt?: ISOString;
  createdAt?: ISOString;
  updatedAt?: ISOString;
}

export interface SkillEvidence extends BaseEntity {
  skillId: ID;
  title: string;
  description: string;
  type: "github_project" | "certificate" | "quiz_result" | "practice_task" | "portfolio_project" | "manual_note";
  status: "pending_review" | "approved" | "rejected" | "self_reported";
  url?: string;
  fileRef?: FileReference;
  dateAcquired: ISOString;
  reviewedBy?: UID;
  reviewedAt?: ISOString;
}

export interface CareerReadiness {
  careerPathId: ID;
  score: number; // 0-100
  coreCompleted: number;
  importantCompleted: number;
  optionalCompleted: number;
  missingSkillIds: ID[];
  weakSkillIds: ID[];
  nextRecommendedSkillIds: ID[];
  calculatedAt: ISOString;
  updatedAt?: ISOString;
}

export interface LearningProgress {
  learningPathId: ID;
  completedStepIds: ID[];
  progressPercentage: number;
  updatedAt?: ISOString;
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  dueDate: ISOString;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  courseName: string;
  category?: string;
  estimatedHours?: number;
  progress: number;
}

export interface Note extends BaseEntity {
  title: string;
  content: string;
  isPinned: boolean;
  category: string;
}

export interface CVExperience {
  id: ID;
  company: string;
  role: string;
  startDate: ISOString;
  endDate?: ISOString;
  current: boolean;
  description: string;
}

export interface CVEducation {
  id: ID;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: ISOString;
  endDate?: ISOString;
}

export interface CVProfile {
  summary?: string;
  experiences: Record<ID, CVExperience>;
  education: Record<ID, CVEducation>;
  fileRef?: FileReference;
  updatedAt?: ISOString;
}

export interface CVAnalysis extends BaseEntity {
  targetCareerPathId: ID;
  atsScore: number;
  careerMatchScore: number;
  feedback: string;
  recommendations: string[];
}

export interface PortfolioProject {
  id: ID;
  title: string;
  description: string;
  url?: string;
  skillIds: ID[];
}

export interface Portfolio extends BaseEntity {
  title: string;
  isPublic: boolean;
  customUrl?: string;
  theme?: string;
  includedProjectIds: ID[];
  projects: Record<ID, PortfolioProject>;
  fileRef?: FileReference;
}

export interface Recommendation extends BaseEntity {
  missingSkills: ID[];
  recommendedResourceIds: ID[];
  nextSteps: string[];
  priorityScore: number;
  explanation: string;
  isDismissed: boolean;
}

export interface ProjectSubmission extends BaseEntity {
  projectId: ID;
  status: "pending_review" | "approved" | "rejected";
  githubUrl?: string;
  liveUrl?: string;
  feedback?: string;
  fileRef?: FileReference;
}

export interface WeeklyPlanItem {
  id: ID;
  title: string;
  resourceId?: ID;
  taskId?: ID;
  isCompleted: boolean;
}

export interface WeeklyPlan extends BaseEntity {
  startDate: ISOString;
  endDate: ISOString;
  goal: string;
  items: Record<ID, WeeklyPlanItem>;
  isCompleted: boolean;
}

export interface ActivityLogEntry extends BaseEntity {
  actionType: string;
  entityId?: ID;
  entityType?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface SupportMessage extends BaseEntity {
  uid: UID;
  subject: string;
  message: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  type: "bug" | "feature_request" | "general" | "content_issue";
}

// ─────────────────────────────────────────────
// System / Global (/platform_settings, /stats, /system)
// ─────────────────────────────────────────────

export interface PlatformSettings {
  public: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultUserRole: "student";
    platformVersion?: string;
    updatedAt?: ISOString;
  };
  private: {
    integrations?: Record<string, string>; // No API keys or secrets.
    updatedAt?: ISOString;
  };
}

export interface Stats {
  usersCount: number;
  resourcesCount: number;
  skillsCount: number;
  careerPathsCount: number;
  academicCategoriesCount: number;
  careerCategoriesCount: number;
  skillCategoriesCount: number;
  supportMessagesCount: number;
  updatedAt?: ISOString;
}

export interface SeedMeta {
  seedName: string;
  version: string;
  environment: string;
  seededAt: ISOString;
  resourcesCount: number;
  skillsCount: number;
  careerPathsCount: number;
  academicCategoriesCount: number;
  careerCategoriesCount: number;
  skillCategoriesCount: number;
  generatedBy: string;
}

export interface QuizAnswerKey {
  quizId: ID;
  questions: Record<string, {
    correctOptionIndex: number;
    explanation?: string;
  }>;
  updatedAt?: ISOString;
}

export interface AdminLogEntry extends BaseEntity {
  adminUid: UID;
  action: string;
  targetId?: ID;
  targetType?: string;
  details?: string;
}

export interface AIUsageLog extends BaseEntity {
  uid: UID;
  actionType: string;
  tokensUsed?: number;
  prompt?: string;
}

export interface MigrationMeta extends BaseEntity {
  migrationName: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  appliedAt: ISOString;
  logs?: string[];
}

// ─────────────────────────────────────────────
// Root Database Structure
// ─────────────────────────────────────────────
export interface DatabaseSchema {
  public_content: {
    resources: Record<ID, Resource>;
    skills: Record<ID, Skill>;
    career_paths: Record<ID, CareerPath>;
    skill_categories: Record<ID, Category>;
    career_categories: Record<ID, Category>;
    academic_categories: Record<ID, Category>;
    learning_paths: Record<ID, LearningPath>;
    practice_tasks: Record<ID, PracticeTask>;
    quizzes: Record<ID, Quiz>;
    projects: Record<ID, Project>;
    announcements: Record<ID, Announcement>;
  };
  indexes: {
    resources_by_skill: Record<ID, Record<ID, boolean>>;
    resources_by_type: Record<string, Record<ID, boolean>>;
    resources_by_level: Record<string, Record<ID, boolean>>;
    resources_by_career_path: Record<ID, Record<ID, boolean>>;
    resources_by_academic_category: Record<ID, Record<ID, boolean>>;
    skills_by_category: Record<ID, Record<ID, boolean>>;
    career_paths_by_category: Record<ID, Record<ID, boolean>>;
    learning_paths_by_career_path: Record<ID, Record<ID, boolean>>;
    projects_by_skill: Record<ID, Record<ID, boolean>>;
    projects_by_career_path: Record<ID, Record<ID, boolean>>;
    quizzes_by_skill: Record<ID, Record<ID, boolean>>;
    practice_tasks_by_skill: Record<ID, Record<ID, boolean>>;
  };
  relations: {
    career_path_skills: Record<ID, Record<ID, CareerPathSkillRelation>>;
    learning_path_steps: Record<ID, Record<ID, LearningPathStep>>;
  };
  users: Record<UID, {
    profile: UserProfile;
    preferences: UserPreferences;
    onboarding: UserOnboarding;
    createdAt: ISOString;
    updatedAt: ISOString;
  }>;
  user_private: Record<UID, {
    tasks: Record<ID, Task>;
    notes: Record<ID, Note>;
    bookmarks: Record<ID, boolean>;
    skill_progress: Record<ID, SkillProgress>;
    skill_evidence: Record<ID, SkillEvidence>;
    career_readiness: Record<ID, CareerReadiness>;
    learning_progress: Record<ID, LearningProgress>;
    project_submissions: Record<ID, ProjectSubmission>;
    cv_profile: CVProfile;
    cv_analysis: Record<ID, CVAnalysis>;
    portfolio: Portfolio;
    recommendations: Record<ID, Recommendation>;
    weekly_plans: Record<ID, WeeklyPlan>;
    activity_log: Record<ID, ActivityLogEntry>;
  }>;
  user_admin_meta: Record<UID, UserAdminMeta>;
  support_messages: Record<ID, SupportMessage>;
  platform_settings: PlatformSettings;
  stats: Stats;
  system: {
    seed_meta: Record<ID, SeedMeta>;
    migration_meta: Record<ID, MigrationMeta>;
    admin_logs: Record<ID, AdminLogEntry>;
    ai_usage_logs: Record<ID, AIUsageLog>;
    quiz_answer_keys: Record<ID, QuizAnswerKey>;
  };
}
