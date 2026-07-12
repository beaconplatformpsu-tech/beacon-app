import { db } from "@/lib/firebase/config";
import { ref, get, query, limitToFirst } from "firebase/database";
import type { LearningPath, LearningPathStep } from "@/types/database";

export class LearningPathService {
  /**
   * Fetch a single learning path by ID
   */
  static async getLearningPathById(id: string): Promise<LearningPath | null> {
    const snapshot = await get(ref(db, `public_content/learning_paths/${id}`));
    if (!snapshot.exists()) return null;
    return snapshot.val() as LearningPath;
  }

  /**
   * Fetch all learning paths
   */
  static async getAllLearningPaths(limit: number = 50): Promise<LearningPath[]> {
    const snapshot = await get(query(ref(db, `public_content/learning_paths`), limitToFirst(limit)));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  }

  /**
   * Fetch steps for a learning path from relations
   */
  static async getLearningPathSteps(learningPathId: string): Promise<LearningPathStep[]> {
    const snapshot = await get(ref(db, `relations/learning_path_steps/${learningPathId}`));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data)
      .map(key => data[key] as LearningPathStep)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Fetch learning paths by career path using the index
   */
  static async getLearningPathsByCareerPath(careerPathId: string): Promise<LearningPath[]> {
    const indexSnapshot = await get(ref(db, `indexes/learning_paths_by_career_path/${careerPathId}`));
    if (!indexSnapshot.exists()) return [];

    const pathIds = Object.keys(indexSnapshot.val());
    const limitedIds = pathIds.slice(0, 50);
    
    const promises = limitedIds.map(id => get(ref(db, `public_content/learning_paths/${id}`)));
    const results = await Promise.all(promises);
    
    const paths: LearningPath[] = [];
    results.forEach(snap => {
      if (snap.exists()) {
        paths.push(snap.val() as LearningPath);
      }
    });

    return paths;
  }
}
