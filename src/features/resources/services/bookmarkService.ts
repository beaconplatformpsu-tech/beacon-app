import { ref, update, remove, get } from "firebase/database";
import { db } from "@/lib/firebase/config";

export class BookmarkService {
  /**
   * Toggle a bookmark for a resource or project.
   */
  static async toggleBookmark(uid: string, entityId: string, entityType: "resource" | "project" | "quiz" | "career_path" | "learning_path", itemTitle: string) {
    if (!uid || !entityId) return false;

    const bookmarkRef = ref(db, `user_private/${uid}/bookmarks/${entityId}`);
    const snapshot = await get(bookmarkRef);

    if (snapshot.exists()) {
      // Remove bookmark
      await remove(bookmarkRef);
      return false; // Not bookmarked anymore
    } else {
      // Add bookmark
      await update(ref(db, `user_private/${uid}/bookmarks`), {
        [entityId]: {
          entityId,
          entityType,
          createdAt: new Date().toISOString()
        }
      });
      return true; // Bookmarked
    }
  }
}
