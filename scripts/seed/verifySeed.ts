/**
 * verifySeed.ts
 * 
 * Post-seed verification script. Connects to Firebase RTDB and validates
 * that the new professional structure is correctly in place.
 * 
 * Usage: npx tsx scripts/seed/verifySeed.ts
 */

import { getFirebaseAdmin } from "./firebaseAdmin.js";
import { config } from "./config.js";
import fs from "fs";
import path from "path";

const admin = getFirebaseAdmin();
const auth = admin.auth();
const db = admin.database();

async function run() {
  console.log("=========================================");
  console.log(`🔎 Starting Beacon Post-Seed Verification`);
  console.log("=========================================\n");

  const report: string[] = [];
  report.push(`# Beacon Seed Verification Report`);
  report.push(`**Timestamp:** ${new Date().toISOString()}`);
  report.push(``);

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const logTest = (name: string, passed: boolean, message?: string) => {
    totalTests++;
    if (passed) {
      passedTests++;
      console.log(`✅ PASS: ${name}`);
      report.push(`- ✅ **PASS**: ${name}`);
    } else {
      failedTests++;
      console.error(`❌ FAIL: ${name} ${message ? `(${message})` : ""}`);
      report.push(`- ❌ **FAIL**: ${name} ${message ? `(${message})` : ""}`);
    }
  };

  try {
    // ==========================================
    // 1. Firebase Auth
    // ==========================================
    report.push(`## 1. Firebase Auth Checks`);
    console.log("\n--- Checking Firebase Auth ---");

    let adminUid: string | null = null;
    let studentUid: string | null = null;

    try {
      const adminRecord = await auth.getUserByEmail(config.SEED_ADMIN_EMAIL!);
      adminUid = adminRecord.uid;
      logTest("Admin Auth User Exists", true);
      logTest("Admin emailVerified is true", adminRecord.emailVerified === true);
      logTest("Admin custom claim role is admin", adminRecord.customClaims?.role === "admin");
    } catch {
      logTest("Admin Auth User Exists", false, "User not found");
    }

    try {
      const studentRecord = await auth.getUserByEmail(config.SEED_STUDENT_EMAIL!);
      studentUid = studentRecord.uid;
      logTest("Student Auth User Exists", true);
      logTest("Student emailVerified is true", studentRecord.emailVerified === true);
      logTest("Student custom claim role is student", studentRecord.customClaims?.role === "student");
    } catch {
      logTest("Student Auth User Exists", false, "User not found");
    }

    // ==========================================
    // 2. New Structure: public_content/*
    // ==========================================
    report.push(`\n## 2. public_content Structure`);
    console.log("\n--- Checking public_content paths ---");

    const checkMin = async (node: string, min: number) => {
      const data = (await db.ref(node).once("value")).val() || {};
      const count = Object.keys(data).length;
      logTest(`${node} has >= ${min} records (found: ${count})`, count >= min);
      return data;
    };

    const resources = await checkMin("public_content/resources", 20);
    const skills = await checkMin("public_content/skills", 20);
    const careerPaths = await checkMin("public_content/career_paths", 10);
    const skillCategories = await checkMin("public_content/skill_categories", 5);
    const careerCategories = await checkMin("public_content/career_categories", 5);
    const academicCategories = await checkMin("public_content/academic_categories", 8);

    // ==========================================
    // 3. Relations
    // ==========================================
    report.push(`\n## 3. Relations`);
    console.log("\n--- Checking relations ---");

    const careerPathSkills = (await db.ref("relations/career_path_skills").once("value")).val() || {};
    const relationCount = Object.values(careerPathSkills).reduce((acc: number, pathSkills: any) => {
      return acc + (typeof pathSkills === "object" ? Object.keys(pathSkills).length : 0);
    }, 0);
    logTest(`relations/career_path_skills has >= 30 entries (found: ${relationCount})`, relationCount >= 30);

    // ==========================================
    // 4. Indexes
    // ==========================================
    report.push(`\n## 4. Indexes`);
    console.log("\n--- Checking indexes ---");

    const requiredIndexes = [
      "indexes/resources_by_skill",
      "indexes/resources_by_type",
      "indexes/resources_by_level",
      "indexes/resources_by_career_path",
      "indexes/resources_by_academic_category",
      "indexes/skills_by_category",
      "indexes/career_paths_by_category",
    ];

    for (const idxPath of requiredIndexes) {
      const data = (await db.ref(idxPath).once("value")).val() || {};
      logTest(`${idxPath} exists and is populated`, Object.keys(data).length > 0);
    }

    // ==========================================
    // 5. NO Legacy Paths
    // ==========================================
    report.push(`\n## 5. Legacy Path Checks`);
    console.log("\n--- Checking for legacy paths ---");

    const legacyPaths = [
      "academic_support_resources",
      "career_resources",
      "resource_by_skill",
      "resource_by_career_path",
      "resource_by_type",
      "resource_by_academic_category",
    ];

    for (const legacyPath of legacyPaths) {
      const snap = await db.ref(legacyPath).once("value");
      logTest(`Legacy path /${legacyPath} does NOT exist`, !snap.exists(),
        snap.exists() ? "Found legacy data — run seed:reset:dev" : undefined);
    }

    // ==========================================
    // 6. Stats & System
    // ==========================================
    report.push(`\n## 6. Stats & System Meta`);
    console.log("\n--- Checking stats and system ---");

    const stats = (await db.ref("stats").once("value")).val();
    logTest("/stats node exists", !!stats);
    if (stats) {
      logTest("/stats/resourcesCount is a number > 0", typeof stats.resourcesCount === "number" && stats.resourcesCount > 0);
      logTest("/stats/skillsCount is a number > 0", typeof stats.skillsCount === "number" && stats.skillsCount > 0);
      logTest("/stats/updatedAt exists", !!stats.updatedAt);
    }

    const seedMeta = (await db.ref("system/seed_meta").once("value")).val();
    logTest("/system/seed_meta exists", !!seedMeta);
    if (seedMeta) {
      logTest("/system/seed_meta has seedName", !!seedMeta.seedName);
      logTest("/system/seed_meta has version", !!seedMeta.version);
    }

    const platformSettings = (await db.ref("platform_settings/public").once("value")).val();
    logTest("/platform_settings/public exists", !!platformSettings);

    // ==========================================
    // 7. Data Quality: Resources
    // ==========================================
    report.push(`\n## 7. Data Quality`);
    console.log("\n--- Checking data quality ---");

    const resourceList = Object.values(resources) as any[];
    let dummyIds = 0, missingTitles = 0, fakePlaceholders = 0, missingSourceType = 0;
    let externalMissingUrl = 0, internalWithUrl = 0;

    resourceList.forEach((r) => {
      if (r.id && r.id.startsWith("res_dummy")) dummyIds++;
      if (!r.title || r.title.includes("Advanced Academic Topic")) missingTitles++;
      const str = JSON.stringify(r);
      if (str.includes("example.com") || str.includes("admin@example.com")) fakePlaceholders++;
      if (!r.sourceType) missingSourceType++;
      if (r.sourceType === "external" && !r.url) externalMissingUrl++;
      if (r.sourceType === "internal" && r.url) internalWithUrl++;
    });

    logTest("No dummy resource IDs (res_dummy_*)", dummyIds === 0, `Found: ${dummyIds}`);
    logTest("No placeholder URLs/emails (example.com)", fakePlaceholders === 0, `Found: ${fakePlaceholders}`);
    logTest("No 'Advanced Academic Topic' titles", missingTitles === 0, `Found: ${missingTitles}`);
    logTest("All resources have sourceType", missingSourceType === 0, `Missing: ${missingSourceType}`);
    logTest("External resources all have URL", externalMissingUrl === 0, `Missing: ${externalMissingUrl}`);
    logTest("Internal resources have no URL", internalWithUrl === 0, `Found: ${internalWithUrl}`);

    // User Profile checks
    if (adminUid) {
      const adminDb = (await db.ref(`users/${adminUid}/profile`).once("value")).val();
      logTest(`Admin profile exists at users/${adminUid}/profile`, !!adminDb);
    }
    if (studentUid) {
      const studentDb = (await db.ref(`users/${studentUid}/profile`).once("value")).val();
      logTest(`Student profile exists at users/${studentUid}/profile`, !!studentDb);
    }

    // ==========================================
    // Summary
    // ==========================================
    report.push(`\n## Summary`);
    report.push(`- **Total Tests:** ${totalTests}`);
    report.push(`- **Passed:** ${passedTests}`);
    report.push(`- **Failed:** ${failedTests}`);

    const reportDir = path.join(process.cwd(), "generated");
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, "verification-report.md");
    fs.writeFileSync(reportPath, report.join("\n"));

    console.log("\n=========================================");
    console.log(`📄 Verification report saved to ${reportPath}`);
    console.log(`Passed: ${passedTests}/${totalTests} | Failed: ${failedTests}`);
    console.log("=========================================\n");

    if (failedTests > 0) {
      console.warn("⚠️ Some tests failed. Please review the report.");
      process.exit(1);
    } else {
      console.log("🎉 All tests passed successfully!");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Critical Verification Error:", error);
    process.exit(1);
  }
}

run();
