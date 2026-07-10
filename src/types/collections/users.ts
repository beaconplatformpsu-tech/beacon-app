import { ISOString, UID, ID } from "./base";

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
}
