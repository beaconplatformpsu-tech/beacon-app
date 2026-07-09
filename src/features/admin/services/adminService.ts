import { ref, set, push, remove, update, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase/config";

export const adminService = {
  async createContent(adminUid: string, collection: string, payload: Record<string, unknown>) {
    if (!adminUid) throw new Error("Unauthorized");
    const collectionRef = ref(db, collection);
    const newRef = push(collectionRef);
    await set(newRef, {
      ...payload,
      id: newRef.key,
      createdAt: serverTimestamp(),
      updatedByAdmin: adminUid,
    });
    return newRef.key;
  },

  async updateContent(adminUid: string, collection: string, id: string, payload: Record<string, unknown>) {
    if (!adminUid) throw new Error("Unauthorized");
    const itemRef = ref(db, `${collection}/${id}`);
    await update(itemRef, {
      ...payload,
      updatedByAdmin: adminUid,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteContent(adminUid: string, collection: string, id: string) {
    if (!adminUid) throw new Error("Unauthorized");
    const itemRef = ref(db, `${collection}/${id}`);
    await remove(itemRef);
  },

  async toggleCareerPathSkill(adminUid: string, pathId: string, skillId: string, linked: boolean) {
    if (!adminUid) throw new Error("Unauthorized");
    const linkRef = ref(db, `relations/career_path_skills/${pathId}/${skillId}`);
    
    if (linked) {
      await set(linkRef, {
        careerPathId: pathId,
        skillId: skillId,
        minimumProficiencyLevel: "Beginner",
        weight: 1,
        updatedByAdmin: adminUid,
        createdAt: serverTimestamp()
      });
    } else {
      await remove(linkRef);
    }
  },

  async updatePlatformSettings(adminUid: string, payload: Record<string, unknown>) {
    if (!adminUid) throw new Error("Unauthorized");
    const settingsRef = ref(db, `platform_settings/public`);
    await update(settingsRef, {
      ...payload,
      updatedByAdmin: adminUid,
      updatedAt: serverTimestamp(),
    });
  },

  async updateUserRole(adminUid: string, targetUid: string, role: string) {
    if (!adminUid) throw new Error("Unauthorized");
    const userRef = ref(db, `user_admin_meta/${targetUid}`);
    await update(userRef, {
      role,
      updatedByAdmin: adminUid,
      updatedAt: serverTimestamp(),
    });
  },

  async updateAccountStatus(adminUid: string, targetUid: string, status: string) {
    if (!adminUid) throw new Error("Unauthorized");
    const userRef = ref(db, `user_admin_meta/${targetUid}`);
    await update(userRef, {
      accountStatus: status,
      updatedByAdmin: adminUid,
      updatedAt: serverTimestamp(),
    });
  }
};
