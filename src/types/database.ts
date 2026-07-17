export * from './collections/base';
export * from './collections/publicContent';
export * from './collections/relations';
export * from './collections/users';
export * from './collections/userPrivate';
export * from './collections/system';

import { ID, UID, ISOString } from './collections/base';
import { Resource, Skill, CareerPath, Category, LearningPath, LearningPathStep, PracticeTask, Quiz, Project, Announcement } from './collections/publicContent';
import { CareerPathSkillRelation } from './collections/relations';
import { StudentProfile, UserPreferences, UserOnboarding, UserAdminMeta } from './collections/users';
import { Task, Note, Bookmark, SkillProgress, SkillEvidence, CareerReadiness, LearningProgress, ProjectSubmission, CVProfile, CVAnalysis, Portfolio, Recommendation, WeeklyPlan, ActivityLogEntry, SupportMessage } from './collections/userPrivate';
import { PlatformSettings, Stats, SeedMeta, QuizAnswerKey, AdminLogEntry, AIUsageLog, MigrationMeta } from './collections/system';

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
    uid: string;
    name?: string;
    email: string;
    role: "student" | "admin";
    emailVerified: boolean;
    profileCompleted: boolean;
    createdAt: ISOString;
    updatedAt: ISOString;
  }>;
  user_private: Record<UID, {
    profile?: StudentProfile;
    tasks: Record<ID, Task>;
    notes: Record<ID, Note>;
    bookmarks: Record<ID, Bookmark>;
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
