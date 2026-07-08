import { NoteInput } from "./schemas";

export interface Note extends NoteInput {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export type { NoteInput };
