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

  const adminUser = await auth.getUserByEmail(config.SEED_ADMIN_EMAIL);
  const uid = adminUser.uid;

  check("Super admin auth user exists", Boolean(adminUser.uid));
  check("Super admin email is verified", adminUser.emailVerified === true);
  check("Custom claim role is super_admin", adminUser.customClaims?.role === "super_admin");

  const claimPermissions = adminUser.customClaims?.permissions || {};
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

  const rootSnap = await db.ref().get();
  const root = rootSnap.val() || {};

  check("/public_content exists", Boolean(root.public_content));
  check("/indexes exists", Boolean(root.indexes));
  check("/relations exists", Boolean(root.relations));
  check("/stats exists", Boolean(root.stats));
  check("/platform_settings exists", Boolean(root.platform_settings));
  check("/system/quiz_answer_keys exists", Boolean(root.system?.quiz_answer_keys));
  check(`/users/${uid} exists`, Boolean(root.users?.[uid]));
  check(`/user_admin_meta/${uid} exists`, Boolean(root.user_admin_meta?.[uid]));
  check("user_admin_meta role is super_admin", root.user_admin_meta?.[uid]?.role === "super_admin");

  const publicContent = root.public_content || {};
  const quizzes = publicContent.quizzes || {};
  const answerKeys = root.system?.quiz_answer_keys || {};

  check("Skills count >= 25", Object.keys(publicContent.skills || {}).length >= 25);
  check("Career paths count >= 10", Object.keys(publicContent.career_paths || {}).length >= 10);
  check("Resources count >= 30", Object.keys(publicContent.resources || {}).length >= 30);
  check("Learning paths count >= 6", Object.keys(publicContent.learning_paths || {}).length >= 6);
  check("Practice tasks count >= 18", Object.keys(publicContent.practice_tasks || {}).length >= 18);
  check("Projects count >= 12", Object.keys(publicContent.projects || {}).length >= 12);
  check("Quizzes count >= 10", Object.keys(quizzes).length >= 10);

  for (const [quizId, quiz] of Object.entries<any>(quizzes)) {
    check(`Quiz ${quizId} has answer key`, Boolean(answerKeys[quizId]));

    for (const question of Object.values<any>(quiz.questions || {})) {
      check(
        `Quiz ${quizId} does not expose answers`,
        question.correctOptionIndex === undefined && question.explanation === undefined
      );
    }
  }

  const serialized = JSON.stringify(root).toLowerCase();

  check("No legacy academic_support_resources", !serialized.includes("academic_support_resources"));
  check("No legacy user_skills", !serialized.includes("user_skills"));
  check("No task_auto_", !serialized.includes("task_auto_"));
  check("No proj_auto_", !serialized.includes("proj_auto_"));
  check("No quiz_auto_", !serialized.includes("quiz_auto_"));
  check("No generated filler", !serialized.includes("generated practice task") && !serialized.includes("generated project"));
  check("No example.com", !serialized.includes("example.com"));
  check("No signedUrl", !JSON.stringify(root).includes("signedUrl"));

  if (failed > 0) {
    console.error(`\n❌ Verification failed with ${failed} issue(s).`);
    process.exit(1);
  }

  console.log("\n✅ Verification passed. Beacon database is structurally ready.");
}

run().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exit(1);
});