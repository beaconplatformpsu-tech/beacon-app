/**
 * Global shared types for the Beacon platform.
 * Most types are now strictly inferred from Zod schemas in validation.ts
 */

import {
  UserProfile,
  TaskType as Task,
  NoteType as Note,
  SkillType as BaseSkill,
  UserSkillType as UserSkill,
  CareerPathType as CareerPath,
  ResourceTypeData as CareerResource, // Using as CareerResource for backwards compat
  AcademicSupportResourceType as AcademicSupportResource,
  FeedbackType as SupportMessage, // Mapping Feedback to SupportMessage for UI
  RecommendationType as Recommendation,
} from "./validation";

// Re-export validated types
export type {
  UserProfile,
  Task,
  Note,
  UserSkill,
  CareerPath,
  CareerResource,
  AcademicSupportResource,
  SupportMessage,
  Recommendation
};

// ─────────────────────────────────────────────
// Legacy Types / UI Helpers not strictly validated by Zod yet
// ─────────────────────────────────────────────
export type AppRole = "admin" | "student";

export interface Skill extends BaseSkill {
  category?: string;
  categoryId?: string;
  progress?: number;
  proficiency?: string;
}

export type CSCategory =
  | "Languages"
  | "Frontend & UI"
  | "Backend & Databases"
  | "DevOps & Cloud"
  | "CS Fundamentals"
  | "AI & Machine Learning";

export type SkillProficiency = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface RadarDataPoint {
  category: string;
  score: number;
  fullMark: number;
}

export interface CareerOpportunity {
  id: string;
  title: string;
  company: string;
  description?: string;
  location?: string;
  type?: string;
  sourceUrl: string;
  applicationUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
  generatedByAI: boolean;
  disclaimer?: string;
  relatedCareerPathId?: string;
  relatedSkillIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  // UI Helpers (for AI responses)
  matchPercentage?: number;
  missingSkills?: string[];
}

export type NotificationType = "success" | "info" | "warning" | "error";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
