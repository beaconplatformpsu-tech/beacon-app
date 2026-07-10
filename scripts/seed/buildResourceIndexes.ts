/**
 * buildResourceIndexes.ts
 * 
 * Standalone script to rebuild all resource indexes in Firebase RTDB.
 * Reads from public_content/resources (single source of truth).
 * Writes to indexes/ (namespaced).
 * NEVER creates legacy mirrors (academic_support_resources, career_resources, etc.)
 * 
 * Usage:
 *   npx tsx scripts/seed/buildResourceIndexes.ts          # DRY-RUN (default)
 *   npx tsx scripts/seed/buildResourceIndexes.ts --write  # Write to Firebase
 */

import { getFirebaseAdmin } from "./firebaseAdmin.js";

const admin = getFirebaseAdmin();
const db = admin.database();

async function run() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--write");

  console.log("=========================================");
  console.log(`🔥 Starting Resource Index Builder (${dryRun ? "DRY-RUN" : "WRITE"} mode)`);
  console.log("=========================================\n");

  if (dryRun) {
    console.log("⚠️  DRY-RUN mode — no changes will be written to Firebase.");
    console.log("👉 Use --write to apply changes.\n");
  }

  try {
    console.log("⏳ Fetching all resources from public_content/resources...");
    const snapshot = await db.ref("public_content/resources").once("value");

    if (!snapshot.exists()) {
      console.error("❌ ERROR: No resources found in public_content/resources. Run the seed first.");
      process.exit(1);
    }

    const resources: Record<string, any> = snapshot.val();
    const updates: Record<string, any> = {};
    console.log(`✅ Found ${Object.keys(resources).length} resources. Building indexes...`);

    // Clear old legacy paths on write
    if (!dryRun) {
      console.log("🧹 Clearing old indexes before rebuilding...");
      await db.ref().update({
        // Old pre-migration index paths
        "resource_by_skill": null,
        "resource_by_career_path": null,
        "resource_by_academic_category": null,
        "resource_by_type": null,
        // Legacy mirrors — must never come back
        "career_resources": null,
        "academic_support_resources": null,
        // Old flat index paths (if any)
        "indexes/resource_by_skill": null,
        "indexes/resource_by_career_path": null,
        "indexes/resource_by_type": null,
      });
    }

    Object.values(resources).forEach((resource) => {
      const resId = resource.id;
      if (!resId) return;

      // 1. Index by resourceType
      if (resource.resourceType) {
        updates[`indexes/resources_by_type/${resource.resourceType}/${resId}`] = true;
      }

      // 2. Index by difficultyLevel
      if (resource.difficultyLevel) {
        updates[`indexes/resources_by_level/${resource.difficultyLevel}/${resId}`] = true;
      }

      // 3. Index by skillId
      if (Array.isArray(resource.skillIds)) {
        resource.skillIds.forEach((skillId: string) => {
          updates[`indexes/resources_by_skill/${skillId}/${resId}`] = true;
        });
      }

      // 4. Index by careerPathId
      if (Array.isArray(resource.careerPathIds)) {
        resource.careerPathIds.forEach((pathId: string) => {
          updates[`indexes/resources_by_career_path/${pathId}/${resId}`] = true;
        });
      }

      // 5. Index by academicCategoryId
      if (Array.isArray(resource.academicCategoryIds)) {
        resource.academicCategoryIds.forEach((catId: string) => {
          updates[`indexes/resources_by_academic_category/${catId}/${resId}`] = true;
        });
      }
    });

    // Also rebuild skills_by_category and career_paths_by_category
    console.log("⏳ Also rebuilding skills_by_category and career_paths_by_category...");
    const skillsSnap = await db.ref("public_content/skills").once("value");
    if (skillsSnap.exists()) {
      Object.values(skillsSnap.val()).forEach((skill: any) => {
        if (skill.categoryId && skill.id) {
          updates[`indexes/skills_by_category/${skill.categoryId}/${skill.id}`] = true;
        }
      });
    }

    const pathsSnap = await db.ref("public_content/career_paths").once("value");
    if (pathsSnap.exists()) {
      Object.values(pathsSnap.val()).forEach((path: any) => {
        if (path.categoryId && path.id) {
          updates[`indexes/career_paths_by_category/${path.categoryId}/${path.id}`] = true;
        }
      });
    }

    if (dryRun) {
      console.log("\n📊 DRY-RUN: Index Payload Summary");
      console.log(`Total index nodes: ${Object.keys(updates).length}`);

      const summary: Record<string, number> = {};
      Object.keys(updates).forEach(key => {
        const parts = key.split('/');
        const indexName = `${parts[0]}/${parts[1]}`;
        summary[indexName] = (summary[indexName] || 0) + 1;
      });

      console.table(summary);
    } else {
      console.log(`\n⏳ Writing ${Object.keys(updates).length} index nodes to Firebase...`);
      await db.ref().update(updates);
      console.log("✅ All indexes rebuilt successfully under /indexes/");
    }

  } catch (error: any) {
    console.error(`❌ ERROR: ${error.message}`);
    process.exit(1);
  }

  process.exit(0);
}

run().catch((error) => {
  console.error("Critical Index Builder Error:", error);
  process.exit(1);
});
