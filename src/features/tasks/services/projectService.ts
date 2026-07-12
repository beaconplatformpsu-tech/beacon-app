import { ref, update, get, query, limitToFirst } from "firebase/database";
import { db } from "@/lib/firebase/config";
import type { ProjectSubmission, Project } from "@/types/database";

export class ProjectService {
  /**
   * Fetch a single project by ID
   */
  static async getProjectById(id: string): Promise<Project | null> {
    const snapshot = await get(ref(db, `public_content/projects/${id}`));
    if (!snapshot.exists()) return null;
    return snapshot.val() as Project;
  }

  /**
   * Fetch all projects
   */
  static async getAllProjects(limit: number = 50): Promise<Project[]> {
    const snapshot = await get(query(ref(db, `public_content/projects`), limitToFirst(limit)));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  }

  /**
   * Submit or update project work.
   */
  static async submitProjectWork(
    uid: string,
    projectId: string,
    submission: Omit<ProjectSubmission, "id" | "projectId" | "createdAt" | "updatedAt">
  ) {
    if (!uid || !projectId) throw new Error("Missing credentials");

    const submissionData: ProjectSubmission = {
      id: projectId,
      projectId,
      ...submission,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await update(ref(db, `user_private/${uid}/project_submissions`), {
      [projectId]: submissionData
    });
    
    // Optionally log activity
    const activityId = `project_submit_${projectId}_${Date.now()}`;
    await update(ref(db, `user_private/${uid}/activity_log`), {
      [activityId]: {
        id: activityId,
        type: "project_submission",
        itemId: projectId,
        createdAt: new Date().toISOString()
      }
    });
  }
}
