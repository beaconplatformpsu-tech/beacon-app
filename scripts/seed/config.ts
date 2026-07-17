import { config as dotenvConfig } from "dotenv";
import path from "path";
import fs from "fs";

const envPath = path.resolve(process.cwd(), ".env.seeder");

if (fs.existsSync(envPath)) {
  dotenvConfig({ path: envPath });
}

export type SeederMode = "memory" | "firebase" | "bootstrap_admin" | "demo_users";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getFirebaseSeedConfig() {
  const FIREBASE_DATABASE_URL = requireEnv("FIREBASE_DATABASE_URL");
  const FIREBASE_SERVICE_ACCOUNT_PATH = requireEnv("FIREBASE_SERVICE_ACCOUNT_PATH");

  const serviceAccountPath = path.resolve(process.cwd(), FIREBASE_SERVICE_ACCOUNT_PATH);

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found at: ${serviceAccountPath}`);
  }

  return {
    FIREBASE_DATABASE_URL,
    FIREBASE_SERVICE_ACCOUNT_PATH,
  };
}

export function getBootstrapAdminConfig() {
  return {
    ...getFirebaseSeedConfig(),
    SEED_ADMIN_EMAIL: requireEnv("SEED_ADMIN_EMAIL"),
    SEED_ADMIN_PASSWORD: requireEnv("SEED_ADMIN_PASSWORD"),
    SEED_ADMIN_DISPLAY_NAME: process.env.SEED_ADMIN_DISPLAY_NAME || "Beacon Admin",
  };
}

export function getDemoUsersConfig() {
  return {
    ...getFirebaseSeedConfig(),
    SEED_STUDENT_EMAIL: requireEnv("SEED_STUDENT_EMAIL"),
    SEED_STUDENT_PASSWORD: requireEnv("SEED_STUDENT_PASSWORD"),
    SEED_STUDENT_DISPLAY_NAME: process.env.SEED_STUDENT_DISPLAY_NAME || "Demo Student",
  };
}