import { db } from "@/lib/firebase/config";
import { ref, get, child, query, orderByChild, equalTo, limitToFirst } from "firebase/database";
import { Resource, resourceSchema } from "../types";

export class ResourceService {
  /**
   * Fetch a single resource by its global ID.
   */
  static async getResourceById(id: string): Promise<Resource | null> {
    const snapshot = await get(ref(db, `public_content/resources/${id}`));
    if (!snapshot.exists()) return null;
    
    const parsed = resourceSchema.safeParse(snapshot.val());
    if (parsed.success) return parsed.data;
    
    console.error("Resource schema validation failed", parsed.error);
    return null;
  }

  /**
   * Fetch all resources for the main library page
   */
  static async getAllResources(limit: number = 50): Promise<Resource[]> {
    const snapshot = await get(query(ref(db, `public_content/resources`), limitToFirst(limit)));
    if (!snapshot.exists()) return [];

    const resources: Resource[] = [];
    const data = snapshot.val();
    
    Object.keys(data).forEach(key => {
      const parsed = resourceSchema.safeParse(data[key]);
      if (parsed.success) {
        resources.push(parsed.data);
      }
    });

    return resources;
  }

  /**
   * Fetch resources directly linked to a specific type via normalized index.
   */
  static async getResourcesByType(resourceType: string): Promise<Resource[]> {
    const indexSnapshot = await get(ref(db, `indexes/resources_by_type/${resourceType}`));
    if (!indexSnapshot.exists()) return [];
    const resourceIds = Object.keys(indexSnapshot.val());
    return await this.fetchMany(resourceIds);
  }

  /**
   * Fetch resources directly linked to a specific level via normalized index.
   */
  static async getResourcesByLevel(level: string): Promise<Resource[]> {
    const indexSnapshot = await get(ref(db, `indexes/resources_by_level/${level}`));
    if (!indexSnapshot.exists()) return [];
    const resourceIds = Object.keys(indexSnapshot.val());
    return await this.fetchMany(resourceIds);
  }

  /**
   * Fetch resources directly linked to a specific skill via the normalized index.
   */
  static async getResourcesBySkill(skillId: string): Promise<Resource[]> {
    const indexSnapshot = await get(ref(db, `indexes/resources_by_skill/${skillId}`));
    if (!indexSnapshot.exists()) return [];

    const resourceIds = Object.keys(indexSnapshot.val());
    return await this.fetchMany(resourceIds);
  }

  /**
   * Fetch resources for a career path, automatically falling back to legacy paths if needed.
   */
  static async getResourcesByCareerPath(careerPathId: string): Promise<Resource[]> {
    const indexSnapshot = await get(ref(db, `indexes/resources_by_career_path/${careerPathId}`));
    if (!indexSnapshot.exists()) return [];
    
    const resourceIds = Object.keys(indexSnapshot.val());
    return await this.fetchMany(resourceIds);
  }

  /**
   * Fetch resources for an academic category, automatically falling back to legacy paths.
   */
  static async getResourcesByAcademicCategory(categoryId: string): Promise<Resource[]> {
    const indexSnapshot = await get(ref(db, `indexes/resources_by_academic_category/${categoryId}`));
    if (!indexSnapshot.exists()) return [];
    
    const resourceIds = Object.keys(indexSnapshot.val());
    return await this.fetchMany(resourceIds);
  }

  private static async fetchMany(ids: string[]): Promise<Resource[]> {
    // Limit to 50 to avoid expensive unbounded fetch loops. 
    // Future: implement cursor-based pagination if > 50 is needed.
    const limitedIds = ids.slice(0, 50);
    const promises = limitedIds.map(id => get(ref(db, `public_content/resources/${id}`)));
    const results = await Promise.all(promises);
    
    const resources: Resource[] = [];
    results.forEach(snapshot => {
      if (snapshot.exists()) {
        const parsed = resourceSchema.safeParse(snapshot.val());
        if (parsed.success) {
          resources.push(parsed.data);
        }
      }
    });
    
    return resources;
  }
}
