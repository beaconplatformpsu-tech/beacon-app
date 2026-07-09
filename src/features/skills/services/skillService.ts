import { ref, get, onValue } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { userSkillSchema } from "@/lib/validation";
import type { UserSkillType as UserSkill } from "@/lib/validation";

export const skillService = {
  /**
   * Fetch a single user's skills safely once
   */
  async getUserSkills(uid: string): Promise<UserSkill[]> {
    const snapshot = await get(ref(db, `user_private/${uid}/user_skills`));
    if (!snapshot.exists()) return [];
    
    return this.parseUserSkills(snapshot.val());
  },

  /**
   * Subscribe to live skill updates safely
   */
  subscribeToUserSkills(uid: string, callback: (skills: UserSkill[]) => void): () => void {
    const skillsRef = ref(db, `user_private/${uid}/user_skills`);
    const unsubscribe = onValue(skillsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      callback(this.parseUserSkills(snapshot.val()));
    });
    return unsubscribe;
  },

  /**
   * Helper to map raw DB data to valid UserSkills, filtering corrupt records
   */
  parseUserSkills(data: Record<string, unknown> | null): UserSkill[] {
    if (!data) return [];
    const validSkills: UserSkill[] = [];
    Object.keys(data).forEach(key => {
      const raw = {
        id: key,
        ...(data[key] as Record<string, unknown>)
      };
      
      const result = userSkillSchema.safeParse(raw);
      if (result.success) {
        validSkills.push(result.data);
      } else {
        console.warn(`UserSkill ${key} failed validation, mapping to fallback:`, result.error);
        validSkills.push({
          id: key,
          skillId: (data[key] as Record<string, unknown>)?.skillId as string || "unknown",
          name: "⚠️ Corrupted Skill Data",
          proficiency: "Beginner",
          progress: 0,
          category: "Languages"
        } as UserSkill);
      }
    });
    return validSkills;
  }
};
