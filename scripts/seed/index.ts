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

async function run() {
  console.log("=========================================");
  console.log(`🚀 Beacon Professional Seed v2`);
  console.log(`Mode:  ${write ? "WRITE" : "DRY-RUN"}`);
  console.log(`Force: ${force}`);
  console.log("=========================================\n");

  const timestamp = new Date().toISOString();

  // Construct payload
  let payload: Record<string, any> = {};

  // 1. Public Content
  payload["public_content/skill_categories"] = skillCategories;
  payload["public_content/career_categories"] = careerCategories;
  payload["public_content/academic_categories"] = academicCategories;
  payload["public_content/skills"] = skills;
  payload["public_content/career_paths"] = careerPaths;
  payload["public_content/resources"] = resources;
  payload["public_content/learning_paths"] = learningPaths;
  payload["public_content/practice_tasks"] = practiceTasks;
  payload["public_content/projects"] = projects;
  payload["public_content/quizzes"] = quizzes;
  payload["public_content/announcements"] = announcements;

  // 2. Relations
  payload["relations/career_path_skills"] = careerPathSkills;
  payload["relations/learning_path_steps"] = learningPathSteps;

  // 3. Indexes
  const indexes = generateIndexes();
  payload["indexes"] = indexes;

  // 5. Stats
  const stats = generateStats();
  payload["stats"] = stats;

  // 4. System
  payload["system/quiz_answer_keys"] = quizAnswerKeys;
  payload["system/seed_meta/professional_seed_v2"] = {
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
    generatedBy: "seed_script"
  };

  // 6. Platform Settings
  payload["platform_settings"] = platformSettings;

  // Validate the entire payload
  console.log("⏳ Validating payload strictly against Database Contract v1...");
  const errors = validateSeedPayload(payload);
  if (errors.length > 0) {
    console.error("❌ Validation Failed with the following errors:");
    errors.forEach(e => console.error(` - ${e}`));
    process.exit(1);
  }
  console.log("✅ Payload strictly validated successfully!");

  if (dryRun || !write) {
    console.log("✅ Dry run complete. No data was written.");
    console.log(`Payload size: ${JSON.stringify(payload).length} bytes`);
    console.log(`Entities generated:`);
    console.log(` - Skills: ${stats.skillsCount}`);
    console.log(` - Career Paths: ${stats.careerPathsCount}`);
    console.log(` - Resources: ${stats.resourcesCount}`);
    process.exit(0);
  }

  // Write Mode
  console.log("⏳ Connecting to Firebase Realtime Database...");
  
  if (force) {
    console.log("⚠️ FORCE flag detected. Clearing seed roots before writing...");
    const admin = getFirebaseAdmin();
    const db = admin.database();
    // Only clear controlled roots
    const rootsToClear = ["public_content", "indexes", "relations", "stats", "system/quiz_answer_keys", "system/seed_meta"];
    for (const root of rootsToClear) {
      await db.ref(root).remove();
      console.log(` - Cleared /${root}`);
    }
  }

  console.log("⏳ Writing new data...");
  try {
    const admin = getFirebaseAdmin();
    await admin.database().ref().update(payload);
    console.log("✅ Database successfully updated!");
  } catch (err) {
    console.error("❌ Failed to update database:", err);
    process.exit(1);
  }

  process.exit(0);
}

run();
