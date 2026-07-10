import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { getFirebaseSeedConfig } from "./config";

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const config = getFirebaseSeedConfig();
    const serviceAccountPath = path.resolve(process.cwd(), config.FIREBASE_SERVICE_ACCOUNT_PATH);
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: config.FIREBASE_DATABASE_URL,
    });
  }

  return admin;
}