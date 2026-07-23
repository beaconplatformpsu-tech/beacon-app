import { BaseEntity, ISOString, ID, UID, FileReference } from "./base";
import { CSStudyLevel } from "./users";

export interface StudentProfile {
  studyProgram?: string;
  academicStage?: CSStudyLevel;
  primaryGoal?: string;
  secondaryGoals?: string[];
  technicalInterestIds?: string[];
  targetSkillIds?: string[];
  bio?: string;
  education?: Record<string, any>;
  courses?: Record<string, any>;
  experience?: Record<string, any>;
  links?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  preferredLanguage?: "en" | "ar";
  completionPercentage?: number;
  onboardingVersion?: string;
  preferredCareerPathId?: string;
  completedAt?: ISOString;
  updatedAt?: ISOString;
  accountStatus?: "active" | "inactive" | "suspended";
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

export interface Bookmark {
  entityType: "resource" | "project" | "quiz" | "career_path" | "learning_path";
  entityId: ID;
  createdAt: ISOString;
}

export interface SkillProgress {
  skillId: ID;
  currentLevel: "beginner" | "intermediate" | "advanced" | "expert";
  targetLevel: "beginner" | "intermediate" | "advanced" | "expert";
  status: "not_started" | "learning" | "practicing" | "verified" | "portfolio_ready";
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
  coreTotal: number;
  coreCompleted: number;
  importantTotal: number;
  importantCompleted: number;
  optionalTotal: number;
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
