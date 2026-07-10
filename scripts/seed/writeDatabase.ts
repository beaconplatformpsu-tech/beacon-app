import { getFirebaseAdmin } from "./firebaseAdmin.js";

const admin = getFirebaseAdmin();
const db = admin.database();

export async function writeDatabase(payload: Record<string, any>) {
  const totalKeys = Object.keys(payload).length;
  console.log(`\n⏳ Executing atomic multi-path update with ${totalKeys} nodes...`);
  
  try {
    // We use a single massive update() call so it's atomic.
    // However, if the payload is insanely huge (> 16MB), this might fail,
    // but for our master data size (~1000 nodes), it's extremely safe.
    await db.ref().update(payload);
    console.log("✅ Atomic database write successful!");
  } catch (error: any) {
    console.error(`❌ FATAL: Database write failed. Your backup is safe.`);
    console.error(error.message);
    throw error;
  }
}
