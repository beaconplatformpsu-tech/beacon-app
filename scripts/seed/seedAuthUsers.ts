import { getFirebaseAdmin } from "./firebaseAdmin.js";
import { config } from "./config.js";

const admin = getFirebaseAdmin();
const auth = admin.auth();

type Role = "admin" | "student";

interface SeedUserParams {
  email: string;
  password?: string;
  displayName: string;
  role: Role;
}

async function getOrCreateUserByEmail(
  params: SeedUserParams,
  dryRun: boolean
) {
  const { email, password, displayName, role } = params;

  let userRecord;
  let action: "CREATED" | "UPDATED" | "DRY-RUN-CREATE" | "DRY-RUN-UPDATE";

  try {
    userRecord = await auth.getUserByEmail(email);
    action = dryRun ? "DRY-RUN-UPDATE" : "UPDATED";

    if (!dryRun) {
      userRecord = await auth.updateUser(userRecord.uid, {
        displayName,
        emailVerified: true,
        disabled: false,
      });
      await auth.setCustomUserClaims(userRecord.uid, { role });
    }
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      action = dryRun ? "DRY-RUN-CREATE" : "CREATED";

      if (!dryRun) {
        if (!password) {
          throw new Error(`Password required to create new user: ${email}`);
        }
        userRecord = await auth.createUser({
          email,
          password,
          displayName,
          emailVerified: true,
          disabled: false,
        });
        await auth.setCustomUserClaims(userRecord.uid, { role });
      }
    } else {
      throw error;
    }
  }

  return {
    action,
    uid: userRecord?.uid || "<DRY-RUN-UID>",
    email,
    displayName,
    emailVerified: dryRun ? "<WILL-BE-TRUE>" : userRecord?.emailVerified,
    role,
  };
}

export async function seedAuthUsers(dryRun: boolean): Promise<{ adminUid: string, studentUid: string }> {
  console.log("=========================================");
  console.log(`🔥 Starting Auth Seeder (${dryRun ? "DRY-RUN" : "WRITE"} mode)`);
  console.log("=========================================\n");

  if (dryRun) {
    console.log("⚠️  Running in DRY-RUN mode. No changes will be made to Firebase.");
  }

  const usersToSeed: SeedUserParams[] = [
    {
      email: config.SEED_ADMIN_EMAIL!,
      password: config.SEED_ADMIN_PASSWORD,
      displayName: config.SEED_ADMIN_DISPLAY_NAME!,
      role: "admin",
    },
    {
      email: config.SEED_STUDENT_EMAIL!,
      password: config.SEED_STUDENT_PASSWORD,
      displayName: config.SEED_STUDENT_DISPLAY_NAME!,
      role: "student",
    },
  ];

  const results = [];

  for (const userData of usersToSeed) {
    try {
      console.log(`Processing: ${userData.email} (${userData.role})`);
      const result = await getOrCreateUserByEmail(userData, dryRun);
      results.push(result);
    } catch (error: any) {
      console.error(`❌ Failed to process ${userData.email}: ${error.message}`);
    }
  }

  console.log("\n=========================================");
  console.log("📊 Seeder Summary");
  console.log("=========================================");
  console.table(results);
  
  let adminUid = "";
  let studentUid = "";

  results.forEach(r => {
    if (r.role === "admin") adminUid = r.uid;
    if (r.role === "student") studentUid = r.uid;
  });

  return { adminUid, studentUid };
}
