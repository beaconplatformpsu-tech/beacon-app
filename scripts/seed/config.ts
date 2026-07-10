import { config as dotenvConfig } from "dotenv";
import path from "path";
import fs from "fs";

// Load .env.seeder
const envPath = path.resolve(process.cwd(), ".env.seeder");

if (!fs.existsSync(envPath)) {
  console.error("❌ ERROR: .env.seeder file not found!");
  console.error("Please copy .env.seeder.example to .env.seeder and configure it.");
  process.exit(1);
}

dotenvConfig({ path: envPath });

export const config = {
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
  SEED_ADMIN_DISPLAY_NAME: process.env.SEED_ADMIN_DISPLAY_NAME,
  
  SEED_STUDENT_EMAIL: process.env.SEED_STUDENT_EMAIL,
  SEED_STUDENT_PASSWORD: process.env.SEED_STUDENT_PASSWORD,
  SEED_STUDENT_DISPLAY_NAME: process.env.SEED_STUDENT_DISPLAY_NAME,
};

// Validation
const missingVars = Object.entries(config)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("❌ ERROR: Missing required environment variables in .env.seeder:");
  missingVars.forEach((v) => console.error(`   - ${v}`));
  process.exit(1);
}

// Verify service account exists
if (config.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const saPath = path.resolve(process.cwd(), config.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (!fs.existsSync(saPath)) {
    console.error(`❌ ERROR: Service account file not found at: ${saPath}`);
    process.exit(1);
  }
}
