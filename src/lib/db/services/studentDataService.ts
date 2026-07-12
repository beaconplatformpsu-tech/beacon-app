import { useState, useEffect } from "react";
import { ref, onValue, set, update } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { mapUserSkill } from "../mappers";
import type { UserProfile, UserSkill, Task, Note, Recommendation } from "@/lib/types";
import { Bookmark, LearningProgress, ProjectSubmission, ActivityLogEntry } from "@/types/database";
import { callEdgeFunction } from "@/lib/supabase/edgeFunctionsClient";

// User Profile
export function useStudentProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const dbRef = ref(db, `users/${uid}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.val();
        setProfile({
          uid,
          email: raw.email || "",
          displayName: raw.displayName || "",
          bio: raw.bio || "",
          major: raw.major || "",
          academicLevel: raw.academicLevel || "",
          graduationYear: raw.graduationYear || new Date().getFullYear() + 4,
          preferredCareerPathId: raw.preferredCareerPathId || undefined,
          github: raw.github || "",
          linkedin: raw.linkedin || "",
          photoURL: raw.photoURL || "",
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { profile, loading };
}

export async function updateStudentGoal(uid: string, careerPathId: string) {
  if (!uid) return;
  // Update in users table
  await update(ref(db, `users/${uid}`), {
    preferredCareerPathId: careerPathId,
    updatedAt: new Date().toISOString(),
  });
  
  // Create an initial career readiness record if it doesn't exist
  await update(ref(db, `user_private/${uid}/career_readiness/${careerPathId}`), {
    careerPathId,
    score: 0,
    coreTotal: 0,
    coreCompleted: 0,
    importantTotal: 0,
    importantCompleted: 0,
    optionalTotal: 0,
    optionalCompleted: 0,
    calculatedAt: new Date().toISOString(),
  });
}

// User Skills (Progress)
export function useStudentSkills(uid: string | undefined) {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setSkills([]);
      setLoading(false);
      return;
    }

    const dbRef = ref(db, `user_private/${uid}/skill_progress`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        const mapped = Object.keys(rawData).map((key) => mapUserSkill(key, rawData[key]));
        setSkills(mapped);
      } else {
        setSkills([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { skills, loading };
}

// Student Private Data Wrapper
export function useStudentPrivateData(uid: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [careerReadiness, setCareerReadiness] = useState<Record<string, any>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [learningProgress, setLearningProgress] = useState<Record<string, LearningProgress>>({});
  const [projectSubmissions, setProjectSubmissions] = useState<Record<string, ProjectSubmission>>({});
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      setNotes([]);
      setRecommendations([]);
      setCareerReadiness({});
      setBookmarks([]);
      setLearningProgress({});
      setProjectSubmissions({});
      setActivityLog([]);
      setLoading(false);
      return;
    }

    const dbRef = ref(db, `user_private/${uid}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.val();

        // Map Tasks
        const rawTasks = raw.tasks || {};
        const mappedTasks = Object.keys(rawTasks).map(key => ({
          id: key,
          ...rawTasks[key]
        }));
        setTasks(mappedTasks);

        // Map Notes
        const rawNotes = raw.notes || {};
        const mappedNotes = Object.keys(rawNotes).map(key => ({
          id: key,
          ...rawNotes[key]
        }));
        setNotes(mappedNotes);

        // Map Recommendations
        const rawRecs = raw.recommendations || {};
        const mappedRecs = Object.keys(rawRecs).map(key => ({
          id: key,
          ...rawRecs[key]
        }));
        setRecommendations(mappedRecs);

        // Map Bookmarks
        const rawBookmarks = raw.bookmarks || {};
        const mappedBookmarks = Object.keys(rawBookmarks).map(key => ({
          id: key,
          ...rawBookmarks[key]
        }));
        setBookmarks(mappedBookmarks);

        // Map Readiness & Progress Dicts
        setCareerReadiness(raw.career_readiness || {});
        setLearningProgress(raw.learning_progress || {});
        setProjectSubmissions(raw.project_submissions || {});

        // Map Activity Log
        const rawActivity = raw.activity_log || {};
        const mappedActivity = Object.keys(rawActivity).map(key => ({
          id: key,
          ...rawActivity[key]
        })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActivityLog(mappedActivity);

      } else {
        setTasks([]);
        setNotes([]);
        setRecommendations([]);
        setCareerReadiness({});
        setBookmarks([]);
        setLearningProgress({});
        setProjectSubmissions({});
        setActivityLog([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { 
    tasks, notes, recommendations, careerReadiness, bookmarks, 
    learningProgress, projectSubmissions, activityLog, loading 
  };
}

// ----------------------------------------------------------------------------
// Secure Backend Function Integrations (Phase 5)
// ----------------------------------------------------------------------------

/**
 * Calls the secure Firebase Cloud Function to grade a quiz without exposing answers.
 */
export async function submitQuiz(quizId: string, answers: Record<string, number>) {
  const result = await callEdgeFunction("grade-quiz", { quizId, answers });
  return result;
}

/**
 * Calls the secure Supabase Edge Function to generate recommendations using the server-side Gemini key.
 */
export async function generateRecommendationsSecure() {
  const result = await callEdgeFunction("generate-recommendations", {});
  return result;
}

/**
 * Calls the secure Supabase Edge Function to analyze a CV using the server-side Gemini key.
 */
export async function analyzeCVSecure(cvText: string) {
  const result = await callEdgeFunction("analyze-cv", { cvText });
  return result;
}
