import { ref, push, update, remove, get, onValue } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { taskSchema } from "@/lib/validation";
import type { TaskType as Task } from "@/lib/validation";

export const taskService = {
  /**
   * Fetch all tasks for a specific user
   */
  async getTasks(uid: string): Promise<Task[]> {
    const snapshot = await get(ref(db, `tasks/${uid}`));
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  },

  /**
   * Subscribe to live tasks updates for a specific user
   */
  subscribeToTasks(uid: string, callback: (tasks: Task[]) => void): () => void {
    const tasksRef = ref(db, `tasks/${uid}`);
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const validTasks: Task[] = [];
        Object.keys(data).forEach(key => {
          const raw = {
            id: key,
            ...data[key],
            category: data[key].category || "Uncategorized",
            estimatedHours: data[key].estimatedHours || 0,
            progress: data[key].progress || 0,
          };
          
          const result = taskSchema.safeParse(raw);
          if (result.success) {
            validTasks.push(result.data);
          } else {
            console.warn(`Task ${key} failed validation, mapping to safe fallback:`, result.error);
            // Safe fallback for corrupted data so UI doesn't crash but user can see it's broken
            validTasks.push({
              id: key,
              title: "⚠️ Corrupted Task Data",
              courseName: "Unknown",
              dueDate: new Date().toISOString(),
              priority: "Low",
              status: "Pending",
              progress: 0,
            } as Task);
          }
        });
        callback(validTasks);
      } else {
        callback([]);
      }
    });
    return unsubscribe;
  },

  /**
   * Create a new task
   */
  async createTask(uid: string, taskInput: Partial<Task>): Promise<string> {
    const newTaskRef = push(ref(db, `tasks/${uid}`));
    await update(newTaskRef, {
      ...taskInput,
      createdAt: new Date().toISOString()
    });
    return newTaskRef.key as string;
  },

  /**
   * Update task progress (and auto-update status)
   */
  async updateProgress(uid: string, taskId: string, progress: number): Promise<void> {
    const status = progress === 100 ? "Completed" : progress > 0 ? "In Progress" : "Pending";
    await update(ref(db, `tasks/${uid}/${taskId}`), { 
      progress, 
      status,
      updatedAt: new Date().toISOString() 
    });
  },

  /**
   * Delete a task
   */
  async deleteTask(uid: string, taskId: string): Promise<void> {
    await remove(ref(db, `tasks/${uid}/${taskId}`));
  }
};
