import { getFirebaseAdmin } from "./firebaseAdmin";
import { config } from "./config";

export async function seedDemoUsers(dryRun: boolean): Promise<void> {
  console.log("=========================================");
  console.log(`🔥 Starting Demo Users Seeder (${dryRun ? "DRY-RUN" : "WRITE"} mode)`);
  console.log("=========================================\n");

  if (dryRun) {
    console.log("⚠️ Running in DRY-RUN mode. No changes will be made to Firebase.");
    return;
  }

  const adminApp = getFirebaseAdmin();
  const auth = adminApp.auth();
  const db = adminApp.database();
  const timestamp = new Date().toISOString();

  const demoStudentEmail = config.SEED_STUDENT_EMAIL;
  const demoStudentPassword = config.SEED_STUDENT_PASSWORD;
  const demoStudentName = config.SEED_STUDENT_DISPLAY_NAME || "Demo Student";

  if (!demoStudentEmail || !demoStudentPassword) {
    console.error("❌ Missing SEED_STUDENT_EMAIL or SEED_STUDENT_PASSWORD");
    process.exit(1);
  }

  let uid: string;
  try {
    const userRecord = await auth.getUserByEmail(demoStudentEmail);
    uid = userRecord.uid;
    console.log(`✅ Found demo student (UID: ${uid}). Updating...`);
    await auth.updateUser(uid, {
      password: demoStudentPassword,
      displayName: demoStudentName,
      emailVerified: true
    });
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`✅ Creating new demo student...`);
      const userRecord = await auth.createUser({
        email: demoStudentEmail,
        password: demoStudentPassword,
        displayName: demoStudentName,
        emailVerified: true
      });
      uid = userRecord.uid;
    } else {
      throw error;
    }
  }

  await auth.setCustomUserClaims(uid, {
    role: "student",
    permissions: {
      canManageContent: false,
      canManageUsers: false,
      canManageSupport: false,
      canViewStats: false,
      canViewPrivateStudentData: false,
      canRunSystemActions: false
    }
  });

  const updates: Record<string, any> = {};

  // 1. Profile
  updates[`users/${uid}/profile`] = {
    uid,
    email: demoStudentEmail,
    displayName: demoStudentName,
    major: "Computer Science",
    academicLevel: "Undergraduate",
    preferredCareerPathId: "path_fullstack_dev",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  updates[`users/${uid}/preferences`] = {
    theme: "system",
    language: "en",
    emailNotifications: true,
    updatedAt: timestamp
  };

  updates[`users/${uid}/onboarding`] = {
    hasCompletedProfile: true,
    hasSelectedCareerPath: true,
    completedSteps: ["profile", "career_path"],
    updatedAt: timestamp
  };

  // 2. Admin Meta
  updates[`user_admin_meta/${uid}`] = {
    role: "student",
    permissions: {
      canManageContent: false,
      canManageUsers: false,
      canManageSupport: false,
      canViewStats: false,
      canViewPrivateStudentData: false,
      canRunSystemActions: false
    },
    accountStatus: "active",
    emailVerified: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // 3. Tasks
  updates[`user_private/${uid}/tasks/seed_task_1`] = {
    id: "seed_task_1",
    title: "Complete Data Structures Practice",
    description: "Seeded task for quick start.",
    dueDate: timestamp,
    priority: "high",
    status: "pending",
    courseName: "General CS",
    category: "Algorithms & Data Structures",
    estimatedHours: 2,
    progress: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // 4. Notes
  updates[`user_private/${uid}/notes/seed_note_1`] = {
    id: "seed_note_1",
    title: "Study Plan for This Week",
    content: "Need to focus on databases.",
    isPinned: true,
    category: "Planning",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // 5. Skill Progress
  updates[`user_private/${uid}/skill_progress/skill_react`] = {
    skillId: "skill_react",
    currentLevel: "beginner",
    targetLevel: "intermediate",
    status: "learning",
    progress: 25,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // 6. CV Profile
  updates[`user_private/${uid}/cv_profile`] = {
    summary: "Aspiring software engineer.",
    experiences: {},
    education: {},
    updatedAt: timestamp,
  };

  await db.ref().update(updates);
  console.log("✅ Wrote demo student data to Realtime DB!");
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

seedDemoUsers(dryRun).catch(console.error);
