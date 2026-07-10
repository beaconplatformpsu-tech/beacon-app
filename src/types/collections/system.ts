import { BaseEntity, ISOString, ID, UID } from "./base";

export interface PlatformSettings {
  public: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultUserRole: "student";
    platformVersion?: string;
    updatedAt?: ISOString;
  };
  private: {
    enabledIntegrations?: Record<string, boolean>;
    providerProjectIds?: Record<string, string>;
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
  feature: "ai_mentor" | "cv_analysis" | "recommendation" | "portfolio_generation";
  model?: string;
  tokensUsed?: number;
  status: "success" | "failed";
  promptHash?: string;
  promptSummary?: string;
  errorCode?: string;
  createdAt: ISOString;
}

export interface MigrationMeta extends BaseEntity {
  migrationName: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  appliedAt: ISOString;
  logs?: string[];
}
