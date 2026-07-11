import { getFirebaseAdmin } from "./firebaseAdmin";
import { getBootstrapAdminConfig } from "./config";

async function run() {
  const config = getBootstrapAdminConfig();

  const admin = getFirebaseAdmin();
  const auth = admin.auth();
  const db = admin.database();

  let failed = 0;

  function check(name: string, condition: boolean, details = "") {
    if (condition) {
      console.log(`✅ ${name}`);
    } else {
      failed++;
      console.error(`❌ ${name}${details ? ` — ${details}` : ""}`);
    }
  }

  console.log("=========================================");
  console.log(" Beacon Seed Verification");
  console.log("=========================================\n");

  // ─── Super Admin Auth checks ──────────────────────────────────────────────
  // Wrapped in try/catch so a missing admin user is reported as a failed check
  // rather than crashing the entire script. This lets the database checks below
  // still run even when seed:bootstrap:admin hasn't been executed yet.

  let uid: string | null = null;

  try {
    const adminUser = await auth.getUserByEmail(config.SEED_ADMIN_EMAIL);
    uid = adminUser.uid;

    check("Super admin auth user exists", true);
    check("Super admin email is verified", adminUser.emailVerified === true);
    check("Custom claim role is super_admin", adminUser.customClaims?.role === "super_admin");

    const claimPermissions = (adminUser.customClaims?.permissions as Record<string, boolean>) || {};
    const requiredPermissions = [
      "canManageContent",
      "canManageUsers",
      "canManageSupport",
      "canViewStats",
      "canViewPrivateStudentData",
      "canRunSystemActions",
    ];

    for (const permission of requiredPermissions) {
      check(`Custom claim permission ${permission}`, claimPermissions[permission] === true);
    }
  } catch (authError: unknown) {
    const isNotFound =
      authError instanceof Error &&
      "errorInfo" in authError &&
      (authError as { errorInfo: { code: string } }).errorInfo?.code === "auth/user-not-found";

    if (isNotFound) {
      failed++;
      console.error(
        `❌ Super admin auth user exists — not found for ${config.SEED_ADMIN_EMAIL}. Run: npm run seed:bootstrap:admin`
      );
    } else {
      // Unexpected auth error — rethrow so the outer catch can report it.
      throw authError;
    }
  }

  // ─── Database structure checks ────────────────────────────────────────────

  const rootSnap = await db.ref().get();
  const root = (rootSnap.val() || {}) as Record<string, unknown>;

  function rootChild(path: string): unknown {
    return path.split("/").reduce<unknown>((cur, key) => {
      if (cur && typeof cur === "object" && !Array.isArray(cur)) {
        return (cur as Record<string, unknown>)[key];
      }
      return undefined;
    }, root);
  }

  check("/public_content exists", Boolean(root.public_content));
  check("/indexes exists", Boolean(root.indexes));
  check("/relations exists", Boolean(root.relations));
  check("/stats exists", Boolean(root.stats));
  check("/platform_settings exists", Boolean(root.platform_settings));
  check("/system/quiz_answer_keys exists", Boolean(rootChild("system/quiz_answer_keys")));

  if (uid) {
    check(`/users/${uid} exists`, Boolean(rootChild(`users/${uid}`)));
    check(`/user_admin_meta/${uid} exists`, Boolean(rootChild(`user_admin_meta/${uid}`)));
    check(
      "user_admin_meta role is super_admin",
      (rootChild(`user_admin_meta/${uid}`) as Record<string, unknown>)?.role === "super_admin"
    );
  } else {
    // Admin user not found — skip uid-dependent checks but count them as failures.
    failed++;
    console.error("❌ /users/{uid} — skipped (admin user not created yet)");
    failed++;
    console.error("❌ /user_admin_meta/{uid} — skipped (admin user not created yet)");
    failed++;
    console.error("❌ user_admin_meta role is super_admin — skipped (admin user not created yet)");
  }

  // ─── Content counts & Stats Match ──────────────────────────────────────────

  const publicContent = (root.public_content as Record<string, unknown>) || {};
  const stats = (root.stats as Record<string, unknown>) || {};

  function countKeys(collection: unknown): number {
    if (collection && typeof collection === "object" && !Array.isArray(collection)) {
      return Object.keys(collection as object).length;
    }
    return 0;
  }

  const actualUsers = countKeys(root.users);
  const actualResources = countKeys(publicContent.resources);
  const actualSkills = countKeys(publicContent.skills);
  const actualCareerPaths = countKeys(publicContent.career_paths);
  const actualLearningPaths = countKeys(publicContent.learning_paths);
  const actualPracticeTasks = countKeys(publicContent.practice_tasks);
  const actualProjects = countKeys(publicContent.projects);
  const actualQuizzes = countKeys(publicContent.quizzes);
  const actualAnnouncements = countKeys(publicContent.announcements);

  check("Skills count >= 25", actualSkills >= 25);
  check("Career paths count >= 10", actualCareerPaths >= 10);
  check("Resources count >= 30", actualResources >= 30);
  check("Learning paths count >= 6", actualLearningPaths >= 6);
  check("Practice tasks count >= 18", actualPracticeTasks >= 18);
  check("Projects count >= 12", actualProjects >= 12);

  check("stats.usersCount matches actual /users count", stats.usersCount === actualUsers, `Stats: ${stats.usersCount}, Actual: ${actualUsers}`);
  check("stats.resourcesCount matches actual count", stats.resourcesCount === actualResources);
  check("stats.skillsCount matches actual count", stats.skillsCount === actualSkills);
  check("stats.careerPathsCount matches actual count", stats.careerPathsCount === actualCareerPaths);
  check("stats.learningPathsCount matches actual count", stats.learningPathsCount === actualLearningPaths);
  check("stats.practiceTasksCount matches actual count", stats.practiceTasksCount === actualPracticeTasks);
  check("stats.projectsCount matches actual count", stats.projectsCount === actualProjects);
  check("stats.quizzesCount matches actual count", stats.quizzesCount === actualQuizzes);
  check("stats.announcementsCount matches actual count", stats.announcementsCount === actualAnnouncements);

  // ─── Referential Integrity Checks ──────────────────────────────────────────

  const careerPathSkills = (rootChild("relations/career_path_skills") as Record<string, unknown>) || {};
  const learningPathSteps = (rootChild("relations/learning_path_steps") as Record<string, unknown>) || {};

  // Check: every career path has a career_path_skills relation, learning path, and project
  const learningPathsObj = (publicContent.learning_paths as Record<string, any>) || {};
  const projectsObj = (publicContent.projects as Record<string, any>) || {};
  
  for (const careerPathId of Object.keys(publicContent.career_paths as Record<string, any> || {})) {
    check(`Career path ${careerPathId} has career_path_skills relation`, Boolean(careerPathSkills[careerPathId]));
    
    const hasLearningPath = Object.values(learningPathsObj).some(lp => lp.careerPathId === careerPathId);
    check(`Career path ${careerPathId} has at least one learning path`, hasLearningPath);

    const hasProject = Object.values(projectsObj).some(p => p.careerPathIds?.includes(careerPathId));
    check(`Career path ${careerPathId} has at least one project`, hasProject);
  }

  // Check: every learning path step references a valid item
  for (const [lpId, stepsMap] of Object.entries(learningPathSteps)) {
    for (const [stepId, stepRaw] of Object.entries(stepsMap as Record<string, any>)) {
      if (stepRaw.type === "milestone") continue;
      
      let itemExists = false;
      let refId: string | undefined;
      
      if (stepRaw.type === "resource") refId = stepRaw.resourceId;
      else if (stepRaw.type === "practice_task") refId = stepRaw.practiceTaskId;
      else if (stepRaw.type === "quiz") refId = stepRaw.quizId;
      else if (stepRaw.type === "project") refId = stepRaw.projectId;
      else if (stepRaw.type === "assessment") refId = stepRaw.quizId;

      if (stepRaw.type === "resource" && refId && (publicContent.resources as Record<string, any>)?.[refId]) itemExists = true;
      else if (stepRaw.type === "practice_task" && refId && (publicContent.practice_tasks as Record<string, any>)?.[refId]) itemExists = true;
      else if (stepRaw.type === "quiz" && refId && (publicContent.quizzes as Record<string, any>)?.[refId]) itemExists = true;
      else if (stepRaw.type === "project" && refId && (publicContent.projects as Record<string, any>)?.[refId]) itemExists = true;
      else if (stepRaw.type === "assessment" && refId && (publicContent.quizzes as Record<string, any>)?.[refId]) itemExists = true;
      
      check(`Learning path step ${lpId}/${stepId} references existing ${stepRaw.type} (${refId})`, itemExists);
    }
  }

  // Check: every skill has at least one resource
  const resourcesObj = (publicContent.resources as Record<string, any>) || {};
  for (const skillId of Object.keys(publicContent.skills as Record<string, any> || {})) {
    const hasResource = Object.values(resourcesObj).some(r => r.skillIds?.includes(skillId));
    check(`Skill ${skillId} has at least one resource`, hasResource);
  }

  // ─── Quiz answer key and answer exposure checks ───────────────────────────

  const quizzes = (publicContent.quizzes as Record<string, unknown>) || {};
  const answerKeys = (rootChild("system/quiz_answer_keys") as Record<string, unknown>) || {};

  check("Quizzes count >= 10", countKeys(quizzes) >= 10);

  for (const [quizId, quizRaw] of Object.entries(quizzes)) {
    const quiz = quizRaw as Record<string, unknown>;

    check(`Quiz ${quizId} has answer key`, Boolean(answerKeys[quizId]));

    const questions = (quiz.questions as Record<string, unknown>) || {};

    for (const [questionId, questionRaw] of Object.entries(questions)) {
      const question = questionRaw as Record<string, unknown>;
      const isClean =
        question.correctOptionIndex === undefined &&
        question.explanation === undefined &&
        question.answer === undefined &&
        question.correctAnswer === undefined;

      check(`Quiz ${quizId}/${questionId} does not expose answers`, isClean);
    }
  }

  // Check: every answer key question matches an existing public quiz question
  for (const [quizId, keyRaw] of Object.entries(answerKeys)) {
    const keyData = keyRaw as { answers?: Record<string, any> };
    const answers = keyData.answers || {};
    const publicQuestions = (quizzes[quizId] as Record<string, any>)?.questions || {};
    
    for (const questionId of Object.keys(answers)) {
      check(`Answer key ${quizId}/${questionId} matches public quiz question`, Boolean(publicQuestions[questionId]));
    }
  }

  // ─── Legacy / filler content checks ──────────────────────────────────────

  const serialized = JSON.stringify(root).toLowerCase();

  check("No legacy academic_support_resources", !serialized.includes("academic_support_resources"));
  check("No legacy user_skills", !serialized.includes("user_skills"));
  check("No task_auto_", !serialized.includes("task_auto_"));
  check("No proj_auto_", !serialized.includes("proj_auto_"));
  check("No quiz_auto_", !serialized.includes("quiz_auto_"));
  check(
    "No generated filler",
    !serialized.includes("generated practice task") && !serialized.includes("generated project") &&
    !serialized.includes("dummy") && !serialized.includes("placeholder")
  );
  check("No path_fullstack_developer (typo)", !serialized.includes("path_fullstack_developer"));
  check("No example.com", !serialized.includes("example.com"));
  check("No signedUrl in DB", !JSON.stringify(root).includes("signedUrl"));

  // ─── Final result ─────────────────────────────────────────────────────────

  if (failed > 0) {
    console.error(`\n❌ Verification completed with ${failed} issue(s).`);
    if (!uid) {
      console.error("\n💡 To fix the admin checks, run:  npm run seed:bootstrap:admin");
    }
    process.exit(1);
  }

  console.log("\n✅ All checks passed. Beacon database is ready.");
  process.exit(0);
}

run().catch((error: unknown) => {
  console.error("❌ Verification script error:", error);
  process.exit(1);
});