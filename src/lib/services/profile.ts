import { ref, get, set, update } from "firebase/database";
import { db } from "@/lib/firebase/config";
import type { StudentProfile, CSStudyLevel } from "@/types/collections/users";

export function mapLegacyLevel(level: string | undefined): CSStudyLevel | undefined {
  if (!level) return undefined;
  const l = level.toLowerCase();
  if (l === "freshman" || l === "first_year") return "year_1";
  if (l === "sophomore" || l === "second_year") return "year_2";
  if (l === "junior" || l === "third_year") return "year_3";
  if (l === "senior" || l === "fourth_year") return "year_4";
  if (l === "graduate_or_job_prep" || l === "graduate") return "job_prep";
  if (l === "foundation" || l === "year_1" || l === "year_2" || l === "year_3" || l === "year_4" || l === "capstone" || l === "job_prep") {
    return l as CSStudyLevel;
  }
  return undefined; // Unknown old value -> safe fallback
}

export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
  try {
    const snap = await get(ref(db, `user_private/${uid}/profile`));
    if (snap.exists()) {
      const profile = snap.val() as StudentProfile;
      if (profile.currentLevel) {
        profile.currentLevel = mapLegacyLevel(profile.currentLevel as string);
      }
      return profile;
    }
    return null;
  } catch (error) {
    console.error("Failed to get student profile:", error);
    return null;
  }
}

export async function saveStudentProfile(uid: string, profile: Partial<StudentProfile>): Promise<void> {
  const timestamp = new Date().toISOString();
  const updates: Record<string, any> = {
    updatedAt: timestamp,
  };
  
  // Flatten nested objects for Firebase update to prevent replacing entire nodes
  const flatten = (obj: any, prefix = "") => {
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          flatten(value, `${prefix}${key}/`);
        } else {
          updates[`${prefix}${key}`] = value;
        }
      }
    }
  };
  flatten(profile);

  // Recalculate completion based on what we're saving + what exists?
  // Usually calculateProfileCompletion(fullProfile) is better, but since it's just a subset we might need to get existing first.
  const existing = await getStudentProfile(uid) || {};
  const fullProfile = { ...existing, ...updates };
  
  updates.completionPercentage = calculateProfileCompletion(fullProfile);
  if (updates.completionPercentage === 100) {
    updates.completedAt = existing.completedAt || timestamp;
  }

  await update(ref(db, `user_private/${uid}/profile`), updates);
}

export function calculateProfileCompletion(profile: Partial<StudentProfile>): number {
  let completedFields = 0;
  let totalFields = 0;

  const check = (val: any) => {
    totalFields++;
    if (val && (Array.isArray(val) ? val.length > 0 : true)) {
      completedFields++;
    }
  };

  check(profile.bio);
  check(profile.specialization);
  check(profile.currentLevel);
  // links
  totalFields++;
  if (profile.links?.github || profile.links?.linkedin || profile.links?.portfolio) {
    completedFields++;
  }

  if (totalFields === 0) return 0;
  return Math.round((completedFields / totalFields) * 100);
}

export async function markProfileCompleted(uid: string): Promise<void> {
  const timestamp = new Date().toISOString();
  await update(ref(db, `users/${uid}`), {
    profileCompleted: true,
    updatedAt: timestamp,
  });
}
