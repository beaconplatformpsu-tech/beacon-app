import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  dueDate: z.string(),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Pending", "In Progress", "Completed"]),
  courseName: z.string().min(1, "Course name is required"),
  category: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  progress: z.number().min(0).max(100)
});

export type TaskInput = z.infer<typeof taskSchema>;
