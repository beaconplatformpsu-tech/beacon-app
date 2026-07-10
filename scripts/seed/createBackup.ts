import { getFirebaseAdmin } from "./firebaseAdmin.js";
import fs from "fs";
import path from "path";

const admin = getFirebaseAdmin();
const db = admin.database();

export async function createBackup(onlySection?: string): Promise<string> {
  console.log(`\n⏳ Creating database backup before writing...`);
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(process.cwd(), "generated");
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
    
    let dataToBackup: any = {};

    if (onlySection === "users") {
      const snapshot = await db.ref("users").once("value");
      dataToBackup.users = snapshot.val();
    } else {
      // Back up the new canonical paths only (no legacy paths)
      const pathsToBackup = [
        "public_content/resources",
        "public_content/skills",
        "public_content/career_paths",
        "public_content/skill_categories",
        "public_content/career_categories",
        "public_content/academic_categories",
        "public_content/announcements",
        "platform_settings",
        "stats",
        "system",
      ];
      for (const p of pathsToBackup) {
        const snap = await db.ref(p).once("value");
        if (snap.exists()) {
          // Store under a safe key (replace / with __)
          const safeKey = p.replace(/\//g, "__");
          dataToBackup[safeKey] = snap.val();
        }
      }
    }

    fs.writeFileSync(backupPath, JSON.stringify(dataToBackup, null, 2));
    console.log(`✅ Backup saved to ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error("❌ Failed to create backup:", error);
    throw error;
  }
}
