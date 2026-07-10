import { z } from "zod";

// ─────────────────────────────────────────────
// Shared Field Types
// ─────────────────────────────────────────────
const httpsUrl = z.string().url().refine(val => val.startsWith("https://"), {
  message: "URL must be a valid HTTPS URL"
});

const timestamp = z.string().datetime({ message: "Must be a valid ISO 8601 timestamp string" });

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────
export const importanceLevelSchema = z.enum(["core", "important", "optional"]);
export type ImportanceLevel = z.infer<typeof importanceLevelSchema>;

export const minimumProficiencyLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type MinimumProficiencyLevel = z.infer<typeof minimumProficiencyLevelSchema>;

export const difficultyLevelSchema = z.enum(["Beginner", "Intermediate", "Advanced", "All Levels"]);
export type DifficultyLevel = z.infer<typeof difficultyLevelSchema>;

export const skillProficiencySchema = z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]);
export type SkillProficiency = z.infer<typeof skillProficiencySchema>;

export const resourceTypeSchema = z.enum([
  "Documentation", "Course", "Guide", "Practice",
  "Article", "Tool", "Roadmap", "Template", "Checklist"
]);
export type ResourceType = z.infer<typeof resourceTypeSchema>;

export const sourceTypeSchema = z.enum(["internal", "external"]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

// ─────────────────────────────────────────────
// Category (skill_categories / career_categories / academic_categories)
// ─────────────────────────────────────────────
export const categorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1).max(150),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().default(true),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type CategoryType = z.infer<typeof categorySchema>;

// ─────────────────────────────────────────────
// Skills
// ─────────────────────────────────────────────
export const skillSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1).max(100),
  name: z.string().min(1).max(100), // kept for backwards compatibility
  description: z.string().max(1000).optional(),
  categoryId: z.string().min(1),
  difficultyLevel: difficultyLevelSchema.optional(),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().default(true),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type SkillType = z.infer<typeof skillSchema>;

export const userSkillSchema = z.object({
  id: z.string().min(1),
  skillId: z.string().min(1),
  name: z.string().max(100),
  proficiency: skillProficiencySchema,
  progress: z.number().min(0).max(100),
  evidenceLink: httpsUrl.optional(),
  category: z.string().optional(),
  lastPracticed: timestamp.optional(),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type UserSkillType = z.infer<typeof userSkillSchema>;

// ─────────────────────────────────────────────
// Career Paths
// ─────────────────────────────────────────────
export const careerPathSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1).max(150),
  description: z.string().max(2000).optional(),
  longDescription: z.string().max(5000).optional(),
  categoryId: z.string().optional(),
  industryDomain: z.string().optional(),
  demandLevel: z.enum(["Very High", "High", "Medium", "Low"]).optional(),
  requiredEducation: z.string().max(255).optional(),
  averagePreparationTime: z.string().optional(),
  beginnerFriendly: z.boolean().optional(),
  isActive: z.boolean().default(true),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type CareerPathType = z.infer<typeof careerPathSchema>;

// Career Path ↔ Skill relation (stored under /relations/career_path_skills/{pathId}/{skillId})
export const careerPathSkillSchema = z.object({
  importanceLevel: importanceLevelSchema,
  minimumProficiencyLevel: minimumProficiencyLevelSchema,
  learningOrder: z.number().int().optional(),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type CareerPathSkillType = z.infer<typeof careerPathSkillSchema>;

// Extended type used in frontend (includes the path/skill IDs that are the RTDB keys)
export const extendedCareerPathSkillSchema = careerPathSkillSchema.extend({
  careerPathId: z.string().min(1),
  skillId: z.string().min(1),
});
export type ExtendedCareerPathSkill = z.infer<typeof extendedCareerPathSkillSchema>;

// ─────────────────────────────────────────────
// Resources
// ─────────────────────────────────────────────
export const resourceSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  longDescription: z.string().max(10000).optional(),
  provider: z.string().max(100).optional(),
  url: httpsUrl.optional(),
  sourceType: sourceTypeSchema,
  resourceType: resourceTypeSchema,
  language: z.enum(["en", "ar"]).default("en"),
  difficultyLevel: difficultyLevelSchema.optional(),
  estimatedDuration: z.string().optional(),
  isFree: z.boolean().default(true),
  isActive: z.boolean().default(true),
  qualityScore: z.number().min(0).max(100).default(100),
  skillIds: z.array(z.string()).optional(),
  careerPathIds: z.array(z.string()).optional(),
  academicCategoryIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type ResourceTypeData = z.infer<typeof resourceSchema>;

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────
export const userProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().max(100).optional(),
  name: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  major: z.string().max(255).optional(),
  academicLevel: z.string().max(100).optional(),
  graduationYear: z.number().int().optional(),
  preferredCareerPathId: z.string().optional(),
  github: httpsUrl.optional(),
  linkedin: httpsUrl.optional(),
  photoURL: httpsUrl.optional(),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

export const userAdminMetaSchema = z.object({
  role: z.enum(["admin", "student"]),
  accountStatus: z.enum(["active", "suspended"]).default("active"),
  emailVerified: z.boolean().default(false),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type UserAdminMeta = z.infer<typeof userAdminMetaSchema>;

// ─────────────────────────────────────────────
// Tasks
// ─────────────────────────────────────────────
export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  dueDate: timestamp,
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Pending", "In Progress", "Completed"]),
  courseName: z.string().min(1).max(255),
  category: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  progress: z.number().min(0).max(100),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type TaskType = z.infer<typeof taskSchema>;

// ─────────────────────────────────────────────
// Notes
// ─────────────────────────────────────────────
export const noteSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(10000),
  isPinned: z.boolean().default(false),
  category: z.string().default("General"),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type NoteType = z.infer<typeof noteSchema>;

// ─────────────────────────────────────────────
// Feedback / Support Messages
// ─────────────────────────────────────────────
export const feedbackSchema = z.object({
  id: z.string().min(1),
  uid: z.string().min(1),
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(3000),
  status: z.enum(["Open", "In Progress", "Resolved", "Closed"]).default("Open"),
  type: z.enum(["Bug", "Feature Request", "General", "Content Issue"]).optional(),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type FeedbackType = z.infer<typeof feedbackSchema>;

// ─────────────────────────────────────────────
// Recommendations
// ─────────────────────────────────────────────
export const recommendationSchema = z.object({
  id: z.string().min(1),
  missingSkills: z.array(z.string()),
  recommendedResources: z.array(resourceSchema),
  nextSteps: z.array(z.string()),
  priorityScore: z.number().min(0).max(100).default(50),
  explanation: z.string().max(2000),
  isDismissed: z.boolean().default(false),
  createdAt: timestamp.optional(),
});
export type RecommendationType = z.infer<typeof recommendationSchema>;

// ─────────────────────────────────────────────
// Platform Settings
// ─────────────────────────────────────────────
export const platformSettingsPublicSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  allowRegistration: z.boolean().default(true),
  defaultUserRole: z.enum(["student", "admin"]).default("student"),
  platformVersion: z.string().optional(),
  enableAiMentor: z.boolean().optional(),
  enableInternships: z.boolean().optional(),
  enablePortfolioGen: z.boolean().optional(),
  updatedAt: timestamp.optional(),
});
export type PlatformSettingsPublic = z.infer<typeof platformSettingsPublicSchema>;

// ─────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────
export const statsSchema = z.object({
  usersCount: z.number().int().min(0),
  resourcesCount: z.number().int().min(0),
  skillsCount: z.number().int().min(0),
  careerPathsCount: z.number().int().min(0),
  academicCategoriesCount: z.number().int().min(0),
  careerCategoriesCount: z.number().int().min(0),
  skillCategoriesCount: z.number().int().min(0),
  supportMessagesCount: z.number().int().min(0),
  updatedAt: timestamp.optional(),
});
export type Stats = z.infer<typeof statsSchema>;

// ─────────────────────────────────────────────
// System Seed Meta
// ─────────────────────────────────────────────
export const seedMetaSchema = z.object({
  seedName: z.string(),
  version: z.string(),
  environment: z.string(),
  seededAt: timestamp,
  resourcesCount: z.number().int(),
  skillsCount: z.number().int(),
  careerPathsCount: z.number().int(),
  academicCategoriesCount: z.number().int(),
  careerCategoriesCount: z.number().int(),
  skillCategoriesCount: z.number().int(),
  generatedBy: z.string(),
});
export type SeedMeta = z.infer<typeof seedMetaSchema>;

// Announcement
export const announcementSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["system", "feature", "maintenance", "news"]).default("system"),
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(2000),
  isActive: z.boolean().default(true),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});
export type AnnouncementType = z.infer<typeof announcementSchema>;
