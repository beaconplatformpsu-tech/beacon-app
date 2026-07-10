import { resources } from "./masterData/resources";
import { skills } from "./masterData/skills";
import { careerPaths } from "./masterData/careerPaths";
import { learningPaths, learningPathSteps } from "./masterData/learningPaths";
import { practiceTasks, projects } from "./masterData/practiceAndProjects";
import { quizzes, quizAnswerKeys, announcements, platformSettings } from "./masterData/quizzesAndConfig";
import { skillCategories } from "./masterData/skillCategories";
import { careerCategories } from "./masterData/careerCategories";
import { academicCategories } from "./masterData/academicCategories";
import { careerPathSkills, generateIndexes, generateStats } from "./indexGenerators";
import { validateSeedPayload } from "./validateSeed";
import { getFirebaseAdmin } from "./firebaseAdmin";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const write = args.includes("--write");
const force = args.includes("--force");

function buildPayload() {
  const timestamp = new Date().toISOString();

  const indexes = generateIndexes();
  const stats = generateStats();

  return {
    "public_content/skill_categories": skillCategories,
    "public_content/career_categories": careerCategories,
    "public_content/academic_categories": academicCategories,
    "public_content/skills": skills,
    "public_content/career_paths": careerPaths,
    "public_content/resources": resources,
    "public_content/learning_paths": learningPaths,
    "public_content/practice_tasks": practiceTasks,
    "public_content/projects": projects,
    "public_content/quizzes": quizzes,
    "public_content/announcements": announcements,

    "relations/career_path_skills": careerPathSkills,
    "relations/learning_path_steps": learningPathSteps,

    indexes,

    stats,

    "platform_settings": platformSettings,

    "system/quiz_answer_keys": quizAnswerKeys,

    "system/seed_meta/professional_seed_v2": {
      seedName: "professional_seed_v2",
      version: "2.0.0",
      environment: "dev",
      seededAt: timestamp,
      resourcesCount: stats.resourcesCount,
      skillsCount: stats.skillsCount,
      careerPathsCount: stats.careerPathsCount,
      academicCategoriesCount: stats.academicCategoriesCount,
      careerCategoriesCount: stats.careerCategoriesCount,
      skillCategoriesCount: stats.skillCategoriesCount,
      generatedBy: "scripts/seed/index.ts",
    },

    "system/migration_meta/professional_seed_v2": {
      id: "professional_seed_v2",
      migrationName: "professional_seed_v2",
      status: "completed",
      appliedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      logs: ["Professional platform seed payload generated."],
    },
  };
}

async function run() {
  console.log("=========================================");
  console.log(" Beacon Professional Seed v2");
  console.log(` Mode: ${write ? "WRITE" : "DRY-RUN"}`);
  console.log(` Force reset: ${force}`);
  console.log("=========================================\n");

  const payload = buildPayload();

  console.log("⏳ Validating payload...");
  const errors = validateSeedPayload(payload);

  if (errors.length > 0) {
    console.error("❌ Validation failed:");
    errors.forEach((error) => console.error(` - ${error}`));
    process.exit(1);
  }

  console.log("✅ Validation passed.");

  const stats = payload.stats;

  console.log("\nSeed summary:");
  console.log(` - Skill categories: ${stats.skillCategoriesCount}`);
  console.log(` - Career categories: ${stats.careerCategoriesCount}`);
  console.log(` - Academic categories: ${stats.academicCategoriesCount}`);
  console.log(` - Skills: ${stats.skillsCount}`);
  console.log(` - Career paths: ${stats.careerPathsCount}`);
  console.log(` - Resources: ${stats.resourcesCount}`);
  console.log(` - Payload size: ${JSON.stringify(payload).length} bytes`);

  if (dryRun || !write) {
    console.log("\n✅ Dry run complete. No data was written.");
    return;
  }

  const admin = getFirebaseAdmin();
  const db = admin.database();

  if (force) {
    console.log("\n⚠️ Safe dev reset enabled. Clearing controlled seed paths only...");

    const rootsToClear = [
      "public_content",
      "indexes",
      "relations",
      "stats",
      "platform_settings",
      "system/quiz_answer_keys",
      "system/seed_meta",
      "system/migration_meta",
    ];

    for (const root of rootsToClear) {
      await db.ref(root).remove();
      console.log(` - Cleared /${root}`);
    }

    console.log("✅ Safe seed roots cleared.");
  }

  console.log("\n⏳ Writing seed payload...");
  await db.ref().update(payload);

  console.log("✅ Realtime Database seeded successfully.");
}

run().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});