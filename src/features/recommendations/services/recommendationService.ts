import { ref, get, onValue } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { recommendationSchema } from "@/lib/validation";
import type { RecommendationType as Recommendation } from "@/lib/validation";

export const recommendationService = {
  /**
   * Subscribe to live recommendations updates safely
   */
  subscribeToRecommendations(uid: string, callback: (recommendations: Recommendation[]) => void): () => void {
    const recsRef = ref(db, `user_private/${uid}/recommendations`);
    const unsubscribe = onValue(recsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const data = snapshot.val();
      const validRecs: Recommendation[] = [];
      
      Object.keys(data).forEach(key => {
        const raw = {
          id: key,
          ...data[key]
        };
        
        const result = recommendationSchema.safeParse(raw);
        if (result.success) {
          validRecs.push(result.data);
        } else {
          console.warn(`Recommendation ${key} failed validation:`, result.error);
        }
      });
      
      // Sort newest first
      validRecs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      
      callback(validRecs);
    });
    return unsubscribe;
  }
};
