import { getFirebaseAdmin } from "./firebaseAdmin";
import { getDemoUsersConfig } from "./config";
import { updateUsersCount } from "./statsHelper";



function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code?: unknown }).code);
  }

  return undefined;
}

function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export async function seedDemoUsers(dryRun: boolean): Promise<void> {
  console.log("=========================================");
  console.log(` Starting Demo Users Seeder (${dryRun ? "DRY-RUN" : "WRITE"} mode)`);
  console.log("=========================================\n");

  if (dryRun) {
    console.log("✅ Dry-run complete. No Firebase credentials are required and no data was written.");
    console.log("Demo user that would be created:");
    console.log(" - role: student");
    console.log(" - preferredCareerPathId: path_fullstack_dev");
    console.log(" - starter skill progress: skill_react");
    return;
  }

  const config = getDemoUsersConfig();

  const adminApp = getFirebaseAdmin();
  const auth = adminApp.auth();
  const db = adminApp.database();

  const timestamp = new Date().toISOString();
  const dueDate = addDaysIso(7);

  const demoStudentEmail = config.SEED_STUDENT_EMAIL;
  const demoStudentPassword = config.SEED_STUDENT_PASSWORD;
  const demoStudentName = config.SEED_STUDENT_DISPLAY_NAME || "Demo Student";

  let uid: string;

  try {
    const userRecord = await auth.getUserByEmail(demoStudentEmail);
    uid = userRecord.uid;

    console.log(`✅ Found existing demo student: ${demoStudentEmail}`);
    console.log(`UID: ${uid}`);
    console.log("Updating Auth user...");

    await auth.updateUser(uid, {
      password: demoStudentPassword,
      displayName: demoStudentName,
      emailVerified: true,
      disabled: false,
    });
  } catch (error: unknown) {
    const errorCode = getErrorCode(error);

    if (errorCode !== "auth/user-not-found") {
      throw error;
    }

    console.log(`✅ Creating new demo student: ${demoStudentEmail}`);

    const userRecord = await auth.createUser({
      email: demoStudentEmail,
      password: demoStudentPassword,
      displayName: demoStudentName,
      emailVerified: true,
      disabled: false,
    });

    uid = userRecord.uid;
    console.log(`UID: ${uid}`);
  }

  await auth.setCustomUserClaims(uid, {
    role: "student",
  });

  const updates: Record<string, unknown> = {};

  updates[`users/${uid}`] = {
    profile: {
      uid,
      email: demoStudentEmail,
      displayName: demoStudentName,
      bio: "Demo student account for testing Beacon learning flows.",
      major: "Computer Science",
      academicLevel: "Undergraduate",
      graduationYear: null,
      preferredCareerPathId: "path_fullstack_dev",
      github: "",
      linkedin: "",
      photoURL: "",
      accountStatus: "active",
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



  updates[`user_private/${uid}/tasks/seed_task_react_components`] = {
    id: "seed_task_react_components",
    title: "Complete React Components Practice",
    description: "Practice building reusable components and passing data through props.",
    dueDate,
    priority: "medium",
    status: "pending",
    courseName: "Frontend Development",
    category: "Practice",
    estimatedHours: 2,
    progress: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  updates[`user_private/${uid}/notes/seed_note_weekly_focus`] = {
    id: "seed_note_weekly_focus",
    title: "Weekly Learning Focus",
    content: "Focus on React components, JavaScript array methods, and Git workflow this week.",
    isPinned: true,
    category: "Planning",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  updates[`user_private/${uid}/skill_progress/skill_javascript`] = {
    skillId: "skill_javascript",
    currentLevel: "beginner",
    targetLevel: "intermediate",
    status: "learning",
    progress: 30,
    completedResourceIds: ["res_mdn_js"],
    passedQuizIds: [],
    completedPracticeTaskIds: [],
    evidenceIds: [],
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

  updates[`user_private/${uid}/learning_progress/lp_fullstack_portfolio_path`] = {
    learningPathId: "lp_fullstack_portfolio_path",
    status: "in_progress",
    progressPercentage: 10,
    completedStepIds: [],
    currentStepId: "step_fullstack_01",
    startedAt: timestamp,
    updatedAt: timestamp,
  };

  updates[`user_private/${uid}/career_readiness/path_fullstack_dev`] = {
    careerPathId: "path_fullstack_dev",
    score: 18,
    level: "beginner",
    completedCoreSkills: 0,
    totalCoreSkills: 5,
    missingCoreSkillIds: ["skill_react", "skill_nextjs", "skill_typescript", "skill_sql", "skill_web_security"],
    recommendedNextSkillIds: ["skill_javascript", "skill_react", "skill_git"],
    calculatedAt: timestamp,
    updatedAt: timestamp,
  };

  updates[`user_private/${uid}/bookmarks/bookmark_res_react_docs`] = {
    id: "bookmark_res_react_docs",
    entityType: "resource",
    entityId: "res_react_docs",
    createdAt: timestamp,
  };

  updates[`user_private/${uid}/recommendations/rec_start_react_path`] = {
    id: "rec_start_react_path",
    title: "Start with React fundamentals",
    description: "Complete the React components practice task before starting the full stack project.",
    type: "learning",
    priorityScore: 90,
    isDismissed: false,
    relatedSkillId: "skill_react",
    relatedLearningPathId: "lp_fullstack_portfolio_path",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  updates[`user_private/${uid}/cv_profile`] = {
    summary: "Aspiring software engineer focused on frontend and full stack development.",
    targetCareerPathId: "path_fullstack_dev",
    skills: ["JavaScript", "React", "Git"],
    projects: [],
    experiences: {},
    education: {},
    updatedAt: timestamp,
  };

  updates[`user_private/${uid}/activity_log/activity_demo_seeded`] = {
    id: "activity_demo_seeded",
    actionType: "demo_seeded",
    entityType: "user",
    entityId: uid,
    createdAt: timestamp,
  };

  await db.ref().update(updates);

  console.log("\n✅ Demo student Auth user created/updated.");
  console.log("✅ Custom claims set: role=student.");
  console.log("✅ Demo student profile written.");
  console.log("✅ Demo private starter data written.");

  await updateUsersCount(db);

  console.log("\nDone.");
  process.exit(0);
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

seedDemoUsers(dryRun).catch((error) => {
  console.error("❌ Demo users seed failed:", error);
  process.exit(1);
});