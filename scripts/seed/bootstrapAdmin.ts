import { getFirebaseAdmin } from "./firebaseAdmin";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.seeder") });

async function bootstrapAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminDisplayName = process.env.SEED_ADMIN_DISPLAY_NAME || "Super Admin";

  if (!adminEmail || !adminPassword) {
    console.error("❌ Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in .env.seeder");
    process.exit(1);
  }

  const adminApp = getFirebaseAdmin();
  const auth = adminApp.auth();
  const db = adminApp.database();

  console.log("⏳ Bootstrapping Super Admin...");

  let uid: string;

  try {
    const userRecord = await auth.getUserByEmail(adminEmail);
    uid = userRecord.uid;
    console.log(`✅ Found existing user with email ${adminEmail} (UID: ${uid}). Updating...`);
    await auth.updateUser(uid, {
      password: adminPassword,
      displayName: adminDisplayName,
      emailVerified: true
    });
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`✅ Creating new user with email ${adminEmail}...`);
      const userRecord = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: adminDisplayName,
        emailVerified: true
      });
      uid = userRecord.uid;
    } else {
      console.error("❌ Error fetching/creating user:", error);
      process.exit(1);
    }
  }

  const timestamp = new Date().toISOString();

  // 1. Set Custom Claims
  const permissions = {
    canManageContent: true,
    canManageUsers: true,
    canManageSupport: true,
    canViewStats: true,
    canViewPrivateStudentData: true,
    canRunSystemActions: true
  };

  await auth.setCustomUserClaims(uid, {
    role: "super_admin",
    permissions
  });
  console.log("✅ Set Custom User Claims.");

  // 2. Write to users/{uid}
  await db.ref(`users/${uid}`).update({
    profile: {
      uid,
      email: adminEmail,
      displayName: adminDisplayName,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    preferences: {
      theme: "system",
      language: "en",
      emailNotifications: true,
      updatedAt: timestamp
    },
    onboarding: {
      hasCompletedProfile: true,
      hasSelectedCareerPath: false,
      completedSteps: ["profile"],
      updatedAt: timestamp
    },
    createdAt: timestamp,
    updatedAt: timestamp
  });
  console.log(`✅ Wrote to /users/${uid}`);

  // 3. Write to user_admin_meta/{uid}
  await db.ref(`user_admin_meta/${uid}`).set({
    role: "super_admin",
    permissions,
    accountStatus: "active",
    emailVerified: true,
    createdAt: timestamp,
    updatedAt: timestamp
  });
  console.log(`✅ Wrote to /user_admin_meta/${uid}`);

  console.log("\n🎉 Super Admin bootstrap complete!");
  process.exit(0);
}

bootstrapAdmin().catch(console.error);
