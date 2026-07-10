import { getFirebaseAdmin } from "./firebaseAdmin";
import { getDemoUsersConfig } from "./config";

export async function seedDemoUsers(dryRun: boolean): Promise<void> {
  const config = getDemoUsersConfig();

  console.log("=========================================");
  console.log(` Starting Demo Users Seeder (${dryRun ? "DRY-RUN" : "WRITE"} mode)`);
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

  let uid: string;

  try {
    const userRecord = await auth.getUserByEmail(demoStudentEmail);
    uid = userRecord.uid;

    console.log(`✅ Found demo student (UID: ${uid}). Updating...`);

    await auth.updateUser(uid, {
      password: demoStudentPassword,
      displayName: demoStudentName,
      emailVerified: true,
      disabled: false,
    });
  } catch (error: any) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }

    console.log("✅ Creating new demo student...");

    const userRecord = await auth.createUser({
      email: demoStudentEmail,
      password: demoStudentPassword,
      displayName: demoStudentName,
      emailVerified: true,
      disabled: false,
    });

    uid = userRecord.uid;
  }

  const studentPermissions = {
    canManageContent: false,
    canManageUsers: false,
    canManageSupport: false,
    canViewStats: false,
    canViewPrivateStudentData: false,
    canRunSystemActions: false,
  };

  await auth.setCustomUserClaims(uid, {
    role: "student",
    permissions: studentPermissions,
  });

  const updates: Record<string, unknown> = {};

  updates[`users/${uid}`] = {
    profile: {
      uid,
      email: demoStudentEmail,
      displayName: demoStudentName,
      major: "Computer Science",
      academicLevel: "Undergraduate",
      preferredCareerPathId: "path_fullstack_dev",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    preferences: {
      theme: "system",
      language: "en",
      emailNotifications: true,
      updatedAt: timestamp,
    },
    onboarding: {
      hasCompletedProfile: true,
      hasSelectedCareerPath: true,
      completedSteps: ["profile", "career_path"],
      updatedAt: timestamp,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  updates[`user_admin_meta/${uid}`] = {
    role: "student",
    permissions: studentPermissions,
    accountStatus: "active",
    emailVerified: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  updates[`user_private/${uid}/tasks/seed_task_1`] = {
    id: "seed_task_1",
    title: "Complete React Components Practice",
    description: "Practice building reusable components and passing data through props.",
    dueDate: timestamp,
    priority: "medium",
    status: "pending",
    courseName: "Frontend Development",
    category: "Practice",
    estimatedHours: 2,
    progress: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  updates[`user_private/${uid}/notes/seed_note_1`] = {
    id: "seed_note_1",
    title: "Weekly Learning Focus",
    content: "Focus on React components, JavaScript array methods, and Git workflow this week.",
    isPinned: true,
    category: "Planning",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  updates[`user_private/${uid}/skill_progress/skill_react`] = {
    skillId: "skill_react",
    currentLevel: "beginner",
    targetLevel: "intermediate",
    status: "learning",
    progress: 25,
    completedResourceIds: [],
    passedQuizIds: [],
    completedPracticeTaskIds: [],
    evidenceIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  updates[`user_private/${uid}/cv_profile`] = {
    summary: "Aspiring software engineer focused on frontend and full stack development.",
    experiences: {},
    education: {},
    updatedAt: timestamp,
  };

  await db.ref().update(updates);

  console.log("✅ Demo student Auth user created/updated.");
  console.log("✅ Demo student profile and private starter data written.");
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

seedDemoUsers(dryRun).catch((error) => {
  console.error("❌ Demo users seed failed:", error);
  process.exit(1);
});