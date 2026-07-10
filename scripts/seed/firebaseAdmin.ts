import admin from "firebase-admin";
import { config } from "./config.js";
import path from "path";
import fs from "fs";

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const serviceAccountPath = path.resolve(process.cwd(), config.FIREBASE_SERVICE_ACCOUNT_PATH!);
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: config.FIREBASE_DATABASE_URL,
    });
  }
  return admin;
}
