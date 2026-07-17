import { getFirebaseAdmin } from "./firebaseAdmin";
import { getBootstrapAdminConfig } from "./config";
import { updateUsersCount } from "./statsHelper";

async function bootstrapAdmin() {
  const config = getBootstrapAdminConfig();

  const adminApp = getFirebaseAdmin();
  const auth = adminApp.auth();
  const db = adminApp.database();

  const adminEmail = config.SEED_ADMIN_EMAIL;
  const adminPassword = config.SEED_ADMIN_PASSWORD;
  const adminDisplayName = config.SEED_ADMIN_DISPLAY_NAME;

  console.log("⏳ Bootstrapping Beacon admin...");

  let uid: string;

  try {
    const userRecord = await auth.getUserByEmail(adminEmail);
    uid = userRecord.uid;

    await auth.updateUser(uid, {
      password: adminPassword,
      displayName: adminDisplayName,
      emailVerified: true,
      disabled: false,
    });

    console.log(`✅ Updated existing admin auth user: ${adminEmail}`);
  } catch (error: any) {
    if (error.code !== "auth/user-not-found") {
      console.error("❌ Failed to lookup admin user:", error);
      process.exit(1);
    }

    const userRecord = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: adminDisplayName,
      emailVerified: true,
      disabled: false,
    });

    uid = userRecord.uid;
    console.log(`✅ Created admin auth user: ${adminEmail}`);
  }

  const timestamp = new Date().toISOString();

  const permissions = {
    canManageContent: true,
    canManageUsers: true,
    canManageSupport: true,
    canViewStats: true,
    canViewPrivateStudentData: true,
    canRunSystemActions: true,
  };

  await auth.setCustomUserClaims(uid, {
    role: "admin",
    permissions,
  });

  await db.ref(`users/${uid}`).set({
    profile: {
      uid,
      email: adminEmail,
      displayName: adminDisplayName,
      bio: "",
      major: "",
      academicLevel: "",
      graduationYear: null,
      preferredCareerPathId: null,
      github: "",
      linkedin: "",
      photoURL: "",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    preferences: {
      theme: "system",
      language: "en",
      emailNotifications: true,
      updatedAt: timestamp,
    },
    onboarding: {
      hasCompletedProfile: true,
      hasSelectedCareerPath: false,
      completedSteps: ["profile"],
      updatedAt: timestamp,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await db.ref(`user_admin_meta/${uid}`).set({
    role: "admin",
    permissions,
    accountStatus: "active",
    emailVerified: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  console.log("✅ Admin custom claims set.");
  console.log(`✅ /users/${uid} created.`);
  console.log(`✅ /user_admin_meta/${uid} created.`);

  await updateUsersCount(db);

  console.log("✅ Bootstrap complete.");
  process.exit(0);
}

bootstrapAdmin().catch((error) => {
  console.error("❌ Bootstrap failed:", error);
  process.exit(1);
});