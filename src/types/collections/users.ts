import { ISOString, UID, ID } from "./base";

export type CSStudyLevel = "foundation" | "year_1" | "year_2" | "year_3" | "year_4" | "graduate";

export type AppRole = "student" | "admin";

export interface PublicUser {
  uid: string;
  name: string;
  email: string;
  role: AppRole;
  emailVerified: boolean;
  profileCompleted: boolean;
  createdAt: ISOString;
  updatedAt: ISOString;
}
