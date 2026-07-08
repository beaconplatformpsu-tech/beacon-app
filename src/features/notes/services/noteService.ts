import { ref, push, update, remove, get, onValue } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { noteSchema } from "@/lib/validation";
import type { NoteType as Note } from "@/lib/validation";

export const noteService = {
  /**
   * Subscribe to live notes updates for a specific user
   */
  subscribeToNotes(uid: string, callback: (notes: Note[]) => void): () => void {
    const notesRef = ref(db, `notes/${uid}`);
    const unsubscribe = onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const validNotes: Note[] = [];
        
        Object.keys(data).forEach(key => {
          const raw = {
            id: key,
            ...data[key],
            category: data[key].category || "General",
            isPinned: data[key].isPinned || false,
          };
          
          const result = noteSchema.safeParse(raw);
          if (result.success) {
            validNotes.push(result.data);
          } else {
            console.warn(`Note ${key} failed validation:`, result.error);
            validNotes.push({
              id: key,
              title: "⚠️ Corrupted Note",
              content: "This note contains invalid data and could not be loaded properly.",
              isPinned: false,
              category: "Error",
            } as Note);
          }
        });
        
        // Sort pinned first, then by date desc
        validNotes.sort((a, b) => {
          if (a.isPinned === b.isPinned) {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          }
          return a.isPinned ? -1 : 1;
        });

        callback(validNotes);
      } else {
        callback([]);
      }
    });
    return unsubscribe;
  },

  /**
   * Create a new note
   */
  async createNote(uid: string, noteInput: Partial<Note>): Promise<string> {
    const newNoteRef = push(ref(db, `notes/${uid}`));
    await update(newNoteRef, {
      ...noteInput,
      createdAt: new Date().toISOString()
    });
    return newNoteRef.key as string;
  },

  /**
   * Update note content
   */
  async updateNote(uid: string, noteId: string, content: string): Promise<void> {
    await update(ref(db, `notes/${uid}/${noteId}`), { 
      content,
      updatedAt: new Date().toISOString() 
    });
  },

  /**
   * Toggle note pin status
   */
  async togglePin(uid: string, noteId: string, isPinned: boolean): Promise<void> {
    await update(ref(db, `notes/${uid}/${noteId}`), { isPinned });
  },

  /**
   * Delete a note
   */
  async deleteNote(uid: string, noteId: string): Promise<void> {
    await remove(ref(db, `notes/${uid}/${noteId}`));
  }
};
