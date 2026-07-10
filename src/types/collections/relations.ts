import { ISOString } from "./base";

export interface CareerPathSkillRelation {
  importanceLevel: "core" | "important" | "optional";
  minimumProficiencyLevel: "beginner" | "intermediate" | "advanced";
  learningOrder?: number;
  createdAt?: ISOString;
  updatedAt?: ISOString;
}
