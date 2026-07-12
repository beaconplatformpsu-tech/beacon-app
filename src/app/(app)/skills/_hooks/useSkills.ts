"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase/config";
import type { UserSkill } from "@/lib/types";

/**
 * Subscribes to the current user's skills in Firebase Realtime DB.
 * Returns a live-updating list of skills sorted by progress, and a loading flag.
 */
export function useSkills(userId: string | undefined) {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const skillsRef = ref(db, `user_private/${userId}/skill_progress`);
    const unsubscribe = onValue(skillsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const skillsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          category: data[key].category || "Languages",
        })) as UserSkill[];

        // Sort by progress descending
        skillsList.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        setSkills(skillsList);
      } else {
        setSkills([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { skills, loading };
}

