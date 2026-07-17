import admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

const isDev = process.env.NODE_ENV !== "production";
const envFile = isDev ? ".env.local" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not found in ' + envFile);
  }
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  });
}

const db = admin.database();

async function migrateAdminMeta() {
  console.log("Starting user_admin_meta migration...");
  const metaRef = db.ref('user_admin_meta');
  const snap = await metaRef.once('value');
  const metadata = snap.val() || {};

  const uids = Object.keys(metadata);
  console.log(`Found ${uids.length} records in user_admin_meta`);

  let migratedCount = 0;
  let errorCount = 0;

  for (const uid of uids) {
    try {
      const meta = metadata[uid];
      const role = meta.role === "super_admin" || meta.role === "admin" ? "admin" : "student";
      const accountStatus = meta.accountStatus || "active";

      const updates: Record<string, any> = {};
      
      // Update role in users/{uid}
      updates[`users/${uid}/role`] = role;
      
      // Update accountStatus in user_private/{uid}/profile
      updates[`user_private/${uid}/profile/accountStatus`] = accountStatus;
      
      await db.ref().update(updates);
      console.log(`✅ Migrated user ${uid}: role=${role}, status=${accountStatus}`);
      migratedCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate user ${uid}:`, error);
      errorCount++;
    }
  }

  console.log(`Migration complete. Migrated: ${migratedCount}, Errors: ${errorCount}`);
  
  if (errorCount === 0 && migratedCount > 0) {
    console.log("Deleting user_admin_meta collection...");
    await metaRef.remove();
    console.log("✅ user_admin_meta deleted successfully.");
  } else if (migratedCount === 0) {
    console.log("No records to migrate.");
    await metaRef.remove();
  } else {
    console.warn("⚠️ There were errors during migration. Not deleting user_admin_meta.");
  }
  
  process.exit(0);
}

migrateAdminMeta().catch(console.error);
