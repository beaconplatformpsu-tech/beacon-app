import { ref, get, update } from "firebase/database";
import { db } from "@/lib/firebase/config";
import type { LearningProgress, LearningPathStep, ActivityLogEntry } from "@/types/database";

export class LearningService {
  /**
   * Mark a learning path step as completed.
   */
  static async markStepCompleted(
    uid: string,
    learningPathId: string,
    stepId: string,
    allSteps: LearningPathStep[]
  ) {
    if (!uid || !learningPathId || !stepId) return;

    const progressRef = ref(db, `user_private/${uid}/learning_progress/${learningPathId}`);
    const snapshot = await get(progressRef);
    const progressData = snapshot.exists() ? snapshot.val() : {};

    const completedStepIds = progressData.completedStepIds || [];
    if (!completedStepIds.includes(stepId)) {
      completedStepIds.push(stepId);
      
      const totalStepsInPath = allSteps.length;
      const updates: Record<string, any> = {};

      updates[`user_private/${uid}/learning_progress/${learningPathId}`] = {
        learningPathId,
        completedStepIds,
        progressPercentage: Math.min(100, Math.round((completedStepIds.length / totalStepsInPath) * 100)),
        status: completedStepIds.length >= totalStepsInPath ? "completed" : "in_progress",
        updatedAt: new Date().toISOString()
      };

      const activityId = `lp_step_${learningPathId}_${stepId}_${Date.now()}`;
      updates[`user_private/${uid}/activity_log/${activityId}`] = {
        id: activityId,
        actionType: "learning_step_completed",
        entityId: stepId,
        metadata: { learningPathId },
        createdAt: new Date().toISOString()
      } as ActivityLogEntry;

      await update(ref(db), updates);
    }
  }
}
