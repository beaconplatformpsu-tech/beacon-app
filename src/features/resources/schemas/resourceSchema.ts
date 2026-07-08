import { z } from "zod";

export const resourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  longDescription: z.string().optional(),
  url: z.string().url(),
  provider: z.string(),
  sourceDomain: z.string().optional(),
  resourceType: z.enum([
    "Documentation", "Course", "Video", "Book", "Practice", "Project",
    "Article", "Tool", "Dataset", "Template", "Roadmap", "Interview Prep",
    "Research", "Checklist"
  ]),
  audienceLevel: z.string().optional(),
  language: z.string().default("en"),
  isFree: z.boolean().default(true),
  estimatedDuration: z.string().optional(),
  coverUrl: z.string().url().optional(),
  coverSource: z.string().optional(),
  skillIds: z.array(z.string()).default([]),
  careerPathIds: z.array(z.string()).default([]),
  academicCategoryIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  qualityScore: z.number().min(0).max(100).default(0),
  verifiedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().default("system"),
  isActive: z.boolean().default(true)
});

export const resourceListSchema = z.array(resourceSchema);
