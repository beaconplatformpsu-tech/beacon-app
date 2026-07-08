import { z } from "zod";

// ─────────────────────────────────────────────
// Shared Fields
// ─────────────────────────────────────────────
const httpsUrl = z.string().url().refine(val => val.startsWith("https://"), {
  message: "URL must be a valid HTTPS URL"
});

const timestamp = z.string().datetime({ message: "Must be a valid ISO 8601 timestamp string" });

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────
export const userProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "student"]),
  emailVerified: z.boolean(),
  createdAt: timestamp.optional(),
  accountStatus: z.enum(["active", "suspended"]).optional(),
  displayName: z.string().max(100).optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

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
  content: z.string().min(1).max(10000), // generous limit for notes
  isPinned: z.boolean().default(false),
  category: z.string().default("General"),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});

export type NoteType = z.infer<typeof noteSchema>;

// ─────────────────────────────────────────────
// Skills
// ─────────────────────────────────────────────
export const skillProficiencySchema = z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]);

export const skillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  categoryId: z.string().optional(),
  createdAt: timestamp.optional(),
});

export type SkillType = z.infer<typeof skillSchema>;

export const userSkillSchema = z.object({
  id: z.string().min(1),
  skillId: z.string().min(1),
  name: z.string().max(100), // Denormalized for fast reads
  proficiency: skillProficiencySchema,
  progress: z.number().min(0).max(100),
  evidenceLink: httpsUrl.optional(),
  lastPracticed: timestamp.optional(),
  createdAt: timestamp.optional(),
});

export type UserSkillType = z.infer<typeof userSkillSchema>;

// ─────────────────────────────────────────────
// Career Paths
// ─────────────────────────────────────────────
export const careerPathSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(150),
  description: z.string().max(2000).optional(),
  categoryId: z.string().optional(),
  industryDomain: z.string().optional(),
  demandLevel: z.enum(["High", "Medium", "Low"]).optional(),
  requiredEducation: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
  createdAt: timestamp.optional(),
});

export type CareerPathType = z.infer<typeof careerPathSchema>;

export const careerPathSkillSchema = z.object({
  careerPathId: z.string().min(1),
  skillId: z.string().min(1),
  priority: z.enum(["Core", "Secondary", "Optional"]).default("Core"),
});

export type CareerPathSkillType = z.infer<typeof careerPathSkillSchema>;

// ─────────────────────────────────────────────
// Resources
// ─────────────────────────────────────────────
export const resourceTypeSchema = z.enum([
  "Documentation", "Course", "Video", "Book", "Practice", 
  "Project", "Article", "Tool", "Dataset", "Template", 
  "Roadmap", "Interview Prep", "Research", "Checklist"
]);

export const audienceLevelSchema = z.enum([
  "Beginner", "Intermediate", "Advanced", "All Levels"
]);

export const resourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  url: httpsUrl,
  resourceType: resourceTypeSchema,
  audienceLevel: audienceLevelSchema.optional(),
  isFree: z.boolean().optional(),
  provider: z.string().max(100).optional(),
  coverUrl: httpsUrl.optional(),
  skillId: z.string().optional(),
  careerPathId: z.string().optional(),
  categoryId: z.string().optional(),
  createdAt: timestamp.optional(),
  updatedAt: timestamp.optional(),
});

export type ResourceTypeData = z.infer<typeof resourceSchema>;

export const academicSupportResourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  url: httpsUrl,
  categoryId: z.string().min(1),
  format: z.string().max(50).optional(), // PDF, Link, Tool
  institution: z.string().max(100).optional(),
  createdAt: timestamp.optional(),
});

export type AcademicSupportResourceType = z.infer<typeof academicSupportResourceSchema>;

// ─────────────────────────────────────────────
// Feedback / Support
// ─────────────────────────────────────────────
export const feedbackSchema = z.object({
  id: z.string().min(1),
  uid: z.string().min(1),
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(3000),
  status: z.enum(["Open", "In Progress", "Resolved", "Closed"]).default("Open"),
  type: z.enum(["Bug", "Feature Request", "General", "Content Issue"]).optional(),
  createdAt: timestamp.optional(),
});

export type FeedbackType = z.infer<typeof feedbackSchema>;

// ─────────────────────────────────────────────
// Recommendations
// ─────────────────────────────────────────────
export const recommendationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(255).optional(), // Legacy support
  targetType: z.enum(["Resource", "CareerPath", "Skill", "Task"]).optional(), // Legacy support
  targetId: z.string().min(1).optional(), // Legacy support
  
  // New Engine Fields
  missingSkills: z.array(z.string()),
  recommendedResources: z.array(resourceSchema),
  nextSteps: z.array(z.string()),
  priorityScore: z.number().min(0).max(100).default(50),
  explanation: z.string().max(2000),
  
  isDismissed: z.boolean().default(false),
  createdAt: timestamp.optional(),
});

export type RecommendationType = z.infer<typeof recommendationSchema>;
