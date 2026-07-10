import { parseCliArgs } from "./cli.js";
import { createBackup } from "./createBackup.js";
import { validateSeedPayload } from "./validateSeed.js";
import { generateSeedReport } from "./generateSeedReport.js";
import { writeDatabase } from "./writeDatabase.js";
import { seedAuthUsers } from "./seedAuthUsers.js";
import { seedUserProfiles } from "./seedUserProfiles.js";
import fs from "fs";
import path from "path";

// Master Data Imports
import { getSkillCategories } from "./masterData/skillCategories.js";
import { getSkills } from "./masterData/skills.js";
import { getCareerCategories } from "./masterData/careerCategories.js";
import { getCareerPaths } from "./masterData/careerPaths.js";
import { getCareerPathSkills } from "./masterData/careerPathSkills.js";
import { getAcademicCategories } from "./masterData/academicCategories.js";
import { getPlatformSettings } from "./masterData/platformSettings.js";
import { getSupportMessages } from "./masterData/supportMessages.js";
import { getResources } from "./masterData/resources.js";
import { getAnnouncements } from "./masterData/announcements.js";

async function run() {
  const startTime = Date.now();
  const options = parseCliArgs();

  console.log("=========================================");
  console.log(`🚀 Beacon Seeding Orchestrator`);
  console.log(`Mode:  ${options.write ? "WRITE (DANGER)" : "DRY-RUN (SAFE)"}`);
  console.log(`Scope: ${options.only}`);
  console.log("=========================================\n");

  let payload: Record<string, any> = {};
  const timestamp = new Date().toISOString();

  let usersCount = 0;

  try {
    // 1. Auth & Profiles (Skip if only=public or only=resources)
    if (["all", "users"].includes(options.only)) {
      console.log("⏳ Building Auth and User Profile payloads...");
      const authUids = await seedAuthUsers(options.dryRun);
      
      if (!options.dryRun) {
        // Build the profile nodes based on UIDs
        const profileUpdates = await seedUserProfiles(authUids.adminUid, authUids.studentUid);
        payload = { ...payload, ...profileUpdates };
        usersCount = Object.keys(profileUpdates).filter(k => k.startsWith("users/") && k.endsWith("/profile")).length;
      }
    }

    // 2. Master Data (Skip if only=users or only=resources)
    if (["all", "public"].includes(options.only)) {
      console.log("⏳ Building Public Master Data payloads...");
      const skillCategories = getSkillCategories(timestamp);
      const skills = getSkills(timestamp);
      const careerCategories = getCareerCategories(timestamp);
      const careerPaths = getCareerPaths(timestamp);
      const careerPathSkills = getCareerPathSkills(timestamp);
      const academicCategories = getAcademicCategories(timestamp);
      const platformSettings = getPlatformSettings(timestamp);
      const supportMessages = getSupportMessages(timestamp);
      const announcements = getAnnouncements(timestamp);

      payload = {
        ...payload,
        ...skillCategories,
        ...skills,
        ...careerCategories,
        ...careerPaths,
        ...careerPathSkills,
        ...academicCategories,
        ...platformSettings,
        ...supportMessages,
        ...announcements
      };

      // Build indexes dynamically in memory
      console.log("⏳ Building Additional Indexes in memory...");
      Object.values(skills).forEach((skill: any) => {
        if (skill.categoryId && skill.id) payload[`indexes/skills_by_category/${skill.categoryId}/${skill.id}`] = true;
      });
      Object.values(careerPaths).forEach((cp: any) => {
        if (cp.categoryId && cp.id) payload[`indexes/career_paths_by_category/${cp.categoryId}/${cp.id}`] = true;
      });
    }

    // 3. Resources (Skip if only=users or only=public)
    if (["all", "resources"].includes(options.only)) {
      console.log("⏳ Building Resources payload...");
      const resourceUpdates = getResources(timestamp);
      
      // Merge into payload
      payload = { ...payload, ...resourceUpdates };
      
      // Build indexes dynamically in memory here
      console.log("⏳ Building Resource Indexes in memory...");
      Object.values(resourceUpdates).forEach((resource: any) => {
        if (!resource.id || !resource.resourceType) return;
        const resId = resource.id;
        
        payload[`indexes/resources_by_type/${resource.resourceType}/${resId}`] = true;
        
        if (resource.skillIds) resource.skillIds.forEach((s: string) => payload[`indexes/resources_by_skill/${s}/${resId}`] = true);
        if (resource.careerPathIds) resource.careerPathIds.forEach((c: string) => {
          payload[`indexes/resources_by_career_path/${c}/${resId}`] = true;
        });
        if (resource.academicCategoryIds) resource.academicCategoryIds.forEach((a: string) => {
          payload[`indexes/resources_by_academic_category/${a}/${resId}`] = true;
        });
        if (resource.difficultyLevel) {
          payload[`indexes/resources_by_level/${resource.difficultyLevel}/${resId}`] = true;
        }
      });
    }

    // 3.5 Generate Stats & System Meta
    console.log("⏳ Building Stats & System Meta...");
    let resourcesCount = 0;
    let skillsCount = 0;
    let careerPathsCount = 0;
    let academicCategoriesCount = 0;
    let careerCategoriesCount = 0;
    let skillCategoriesCount = 0;
    let supportMessagesCount = 0;

    for (const key of Object.keys(payload)) {
      if (key.startsWith("public_content/resources/")) resourcesCount++;
      if (key.startsWith("public_content/skills/")) skillsCount++;
      if (key.startsWith("public_content/career_paths/")) careerPathsCount++;
      if (key.startsWith("public_content/academic_categories/")) academicCategoriesCount++;
      if (key.startsWith("public_content/career_categories/")) careerCategoriesCount++;
      if (key.startsWith("public_content/skill_categories/")) skillCategoriesCount++;
      if (key.startsWith("support_messages/")) supportMessagesCount++;
    }

    payload["stats/usersCount"] = usersCount;
    payload["stats/resourcesCount"] = resourcesCount;
    payload["stats/skillsCount"] = skillsCount;
    payload["stats/careerPathsCount"] = careerPathsCount;
    payload["stats/academicCategoriesCount"] = academicCategoriesCount;
    payload["stats/careerCategoriesCount"] = careerCategoriesCount;
    payload["stats/skillCategoriesCount"] = skillCategoriesCount;
    payload["stats/supportMessagesCount"] = supportMessagesCount;
    payload["stats/updatedAt"] = timestamp;

    payload["system/seed_meta"] = {
      seedName: "beacon_prod_seed",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      seededAt: timestamp,
      resourcesCount,
      skillsCount,
      careerPathsCount,
      academicCategoriesCount,
      careerCategoriesCount,
      skillCategoriesCount,
      generatedBy: "orchestrator"
    };

    payload["system/migration_meta"] = {
      previousLegacyCollectionsRemoved: true,
      migratedAt: timestamp,
      notes: "Migrated to fully namespaced public_content and user_private paths."
    };

    payload["system/admin_logs"] = {
      initial_log: {
        action: "Seed Executed",
        timestamp
      }
    };

    // 4. Validate
    const isValid = validateSeedPayload(payload);
    if (!isValid && !options.force) {
      console.error("❌ Validation failed. Halting. Use --force to override.");
      process.exit(1);
    }

    // 5. Output Preview
    const previewDir = path.join(process.cwd(), "generated");
    if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir);
    fs.writeFileSync(path.join(previewDir, "full-seed.preview.json"), JSON.stringify(payload, null, 2));
    
    // 6. Write to Database
    if (options.write) {
      await createBackup(options.only === "users" ? "users" : undefined);
      await writeDatabase(payload);
    }

    // 7. Generate Report
    const execTime = Date.now() - startTime;
    generateSeedReport(options, payload, execTime);

    console.log("\n✅ Orchestrator finished successfully.");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Orchestrator failed due to an unexpected error:");
    console.error(error);
    process.exit(1);
  }
}

run();
