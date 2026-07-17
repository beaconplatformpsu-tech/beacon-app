import { ISOString, UID, ID } from "./base";

export type CSStudyLevel = "foundation" | "year_1" | "year_2" | "year_3" | "year_4" | "capstone" | "job_prep";

export interface StudentProfile {
  bio?: string;
  specialization?: string;
  technicalInterests?: string[];
  targetSkills?: string[];
  currentLevel?: CSStudyLevel; // Computer Science study stage
  learningGoals?: string[];
  education?: Record<string, any>; // can type further if needed
  courses?: Record<string, any>;
  experience?: Record<string, any>;
  links?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  preferredLanguage?: "en" | "ar";
  completionPercentage?: number;
  completedAt?: ISOString;
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
  role: "admin" | "student";
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
}
