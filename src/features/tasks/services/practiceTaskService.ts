import { db } from "@/lib/firebase/config";
import { ref, get, query, limitToFirst, update } from "firebase/database";
import type { PracticeTask, ActivityLogEntry } from "@/types/database";

export class PracticeTaskService {
  /**
   * Fetch a single practice task by ID
   */
  static async getPracticeTaskById(id: string): Promise<PracticeTask | null> {
    const snapshot = await get(ref(db, `public_content/practice_tasks/${id}`));
    if (!snapshot.exists()) return null;
    return snapshot.val() as PracticeTask;
  }

  /**
   * Fetch all practice tasks
   */
  static async getAllPracticeTasks(limit: number = 50): Promise<PracticeTask[]> {
    const snapshot = await get(query(ref(db, `public_content/practice_tasks`), limitToFirst(limit)));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  }

  /**
   * Complete a practice task
   */
  static async completePracticeTask(uid: string, taskId: string, taskTitle: string, skillId?: string) {
    if (!uid || !taskId) return;

    const updates: Record<string, any> = {};

    // Optionally give skill progress if a skill is attached
    if (skillId) {
      const progressRef = ref(db, `user_private/${uid}/skill_progress/${skillId}`);
      const snapshot = await get(progressRef);
      const currentLevel = snapshot.exists() ? snapshot.val().level : 0;
      
      updates[`user_private/${uid}/skill_progress/${skillId}`] = {
        skillId,
        level: Math.min(100, currentLevel + 5), // Arbitrary +5 for completing a task
        updatedAt: new Date().toISOString()
      };
    }

    // Log the activity
    const activityId = `practice_task_${taskId}_${Date.now()}`;
    updates[`user_private/${uid}/activity_log/${activityId}`] = {
      id: activityId,
      actionType: "practice_task",
      entityId: taskId,
      metadata: { taskTitle },
      createdAt: new Date().toISOString()
    } as ActivityLogEntry;

    await update(ref(db), updates);
  }
}
