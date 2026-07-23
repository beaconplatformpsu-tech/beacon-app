import { useState, useEffect } from "react";
import { ref, onValue, set, update } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { mapUserSkill } from "../mappers";
import type { UserProfile, UserSkill, Task, Note, Recommendation } from "@/lib/types";
import { Bookmark, LearningProgress, ProjectSubmission, ActivityLogEntry } from "@/types/database";
import { callEdgeFunction } from "@/lib/supabase/edgeFunctionsClient";
import { auth } from "@/lib/firebase/config";

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

    let publicData: any = null;
    let privateProfileData: any = null;

    const checkComplete = () => {
      if (publicData !== null && privateProfileData !== null) {
        if (publicData === false) { // user doesn't exist
          setProfile(null);
        } else {
          setProfile({
            uid,
            email: publicData.email || "",
            displayName: publicData.name || publicData.displayName || "",
            photoURL: publicData.photoURL || "",
            bio: privateProfileData.bio || "",
            studyProgram: privateProfileData.specialization || privateProfileData.major || privateProfileData.studyProgram || "",
            academicStage: privateProfileData.academicStage || privateProfileData.currentLevel || privateProfileData.academicLevel || "",
            primaryGoal: privateProfileData.primaryGoal || privateProfileData.mainGoal || "",
            secondaryGoals: privateProfileData.secondaryGoals || [],
            technicalInterestIds: privateProfileData.technicalInterestIds || [],
            targetSkillIds: privateProfileData.targetSkillIds || [],
            education: privateProfileData.education || {},
            courses: privateProfileData.courses || {},
            experience: privateProfileData.experience || {},
            preferredCareerPathId: privateProfileData.preferredCareerPathId || undefined,
            completionPercentage: privateProfileData.completionPercentage || 0,
            links: {
              github: privateProfileData.links?.github || privateProfileData.github || "",
              linkedin: privateProfileData.links?.linkedin || privateProfileData.linkedin || "",
              portfolio: privateProfileData.links?.portfolio || privateProfileData.portfolio || "",
            }
          });
        }
        setLoading(false);
      }
    };

    const unsubPublic = onValue(ref(db, `users/${uid}`), (snapshot) => {
      publicData = snapshot.exists() ? snapshot.val() : false;
      checkComplete();
    });

    const unsubPrivate = onValue(ref(db, `user_private/${uid}/profile`), (snapshot) => {
      privateProfileData = snapshot.exists() ? snapshot.val() : {};
      checkComplete();
    });

    return () => {
      unsubPublic();
      unsubPrivate();
    };
  }, [uid]);

  return { profile, loading };
}

export async function updateStudentProfile(uid: string, profileData: Partial<UserProfile>) {
  if (!uid) return;

  const privateDataUpdate: any = {};
  if (profileData.bio !== undefined) privateDataUpdate.bio = profileData.bio;
  if (profileData.studyProgram !== undefined) privateDataUpdate.studyProgram = profileData.studyProgram;
  if (profileData.academicStage !== undefined) privateDataUpdate.academicStage = profileData.academicStage;
  if (profileData.primaryGoal !== undefined) privateDataUpdate.primaryGoal = profileData.primaryGoal;
  if (profileData.secondaryGoals !== undefined) privateDataUpdate.secondaryGoals = profileData.secondaryGoals;
  if (profileData.technicalInterestIds !== undefined) privateDataUpdate.technicalInterestIds = profileData.technicalInterestIds;
  if (profileData.targetSkillIds !== undefined) privateDataUpdate.targetSkillIds = profileData.targetSkillIds;
  if (profileData.education !== undefined) privateDataUpdate.education = profileData.education;
  if (profileData.courses !== undefined) privateDataUpdate.courses = profileData.courses;
  if (profileData.experience !== undefined) privateDataUpdate.experience = profileData.experience;
  if (profileData.preferredCareerPathId !== undefined) privateDataUpdate.preferredCareerPathId = profileData.preferredCareerPathId;
  
  if (profileData.links) {
    // Deep merge links instead of replacing
    const currentSnap = await import("firebase/database").then(dbModule => dbModule.get(dbModule.ref(db, `user_private/${uid}/profile/links`)));
    const currentLinks = currentSnap.exists() ? currentSnap.val() : {};
    privateDataUpdate.links = { ...currentLinks };
    if (profileData.links.github !== undefined) privateDataUpdate.links.github = profileData.links.github;
    if (profileData.links.linkedin !== undefined) privateDataUpdate.links.linkedin = profileData.links.linkedin;
    if (profileData.links.portfolio !== undefined) privateDataUpdate.links.portfolio = profileData.links.portfolio;
  }
  
  privateDataUpdate.updatedAt = new Date().toISOString();

  // Recalculate completion percentage
  let fieldsCount = 0;
  let filledFieldsCount = 0;
  
  const checkFields = [
    privateDataUpdate.studyProgram,
    privateDataUpdate.academicStage,
    privateDataUpdate.primaryGoal,
    privateDataUpdate.technicalInterestIds?.length > 0,
    privateDataUpdate.bio,
    privateDataUpdate.preferredCareerPathId,
  ];

  checkFields.forEach(val => {
    fieldsCount++;
    if (val && (typeof val !== "string" || val.trim().length > 0)) {
      filledFieldsCount++;
    }
  });

  privateDataUpdate.completionPercentage = Math.round((filledFieldsCount / fieldsCount) * 100);

  // Update in user_private profile
  await update(ref(db, `user_private/${uid}/profile`), privateDataUpdate);
  
  // If they updated career path, make sure to update goal
  if (profileData.preferredCareerPathId) {
    await updateStudentGoal(uid, profileData.preferredCareerPathId);
  }
}

export async function updateStudentGoal(uid: string, careerPathId: string) {
  if (!uid) return;
  // Update in user_private profile
  await update(ref(db, `user_private/${uid}/profile`), {
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

// Student Preferences
export function useStudentPreferences(uid: string | undefined) {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    const unsub = onValue(ref(db, `user_private/${uid}/preferences`), async (snapshot) => {
      if (snapshot.exists()) {
        setPreferences(snapshot.val());
      } else {
        // Migration: check if preferredLanguage is in profile
        try {
          const { get } = await import("firebase/database");
          const profileSnap = await get(ref(db, `user_private/${uid}/profile/preferredLanguage`));
          const lang = profileSnap.exists() ? profileSnap.val() : "en";
          
          const defaultPrefs = {
            language: lang,
            theme: "system",
            emailNotifications: true,
            updatedAt: new Date().toISOString()
          };
          
          await update(ref(db, `user_private/${uid}/preferences`), defaultPrefs);
          // Delete from profile
          if (profileSnap.exists()) {
            await set(ref(db, `user_private/${uid}/profile/preferredLanguage`), null);
          }
          setPreferences(defaultPrefs);
        } catch (e) {
          console.error("Failed to migrate preferences", e);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  return { preferences, loading };
}

export async function updateStudentPreferences(uid: string, prefData: any) {
  if (!uid) return;
  prefData.updatedAt = new Date().toISOString();
  await update(ref(db, `user_private/${uid}/preferences`), prefData);
}

export async function updateStudentName(uid: string, name: string) {
  if (!uid || !name.trim()) return;
  
  await update(ref(db, `users/${uid}`), {
    name: name.trim(),
    updatedAt: new Date().toISOString()
  });

  if (auth.currentUser) {
    const { updateProfile } = await import("firebase/auth");
    await updateProfile(auth.currentUser, { displayName: name.trim() });
  }
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
  const [weeklyPlans, setWeeklyPlans] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<Record<string, any>>({});
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
      setWeeklyPlans([]);
      setQuizAttempts({});
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

        // Map Weekly Plans
        const rawWeeklyPlans = raw.weekly_plans || {};
        const mappedWeeklyPlans = Object.keys(rawWeeklyPlans).map(key => ({
          id: key,
          ...rawWeeklyPlans[key]
        }));
        setWeeklyPlans(mappedWeeklyPlans);

        // Map Quiz Attempts
        setQuizAttempts(raw.quiz_attempts || {});

      } else {
        setTasks([]);
        setNotes([]);
        setRecommendations([]);
        setCareerReadiness({});
        setBookmarks([]);
        setLearningProgress({});
        setProjectSubmissions({});
        setActivityLog([]);
        setWeeklyPlans([]);
        setQuizAttempts({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { 
    tasks, notes, recommendations, careerReadiness, bookmarks, 
    learningProgress, projectSubmissions, activityLog, weeklyPlans, quizAttempts, loading 
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
