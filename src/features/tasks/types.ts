export type { TaskInput } from "./schemas";
import type { TaskInput } from "./schemas";

export interface Task extends TaskInput {
  id: string;
  createdAt: string;
  updatedAt?: string;
}
