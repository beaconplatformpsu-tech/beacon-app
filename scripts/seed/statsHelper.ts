import admin from "firebase-admin";

export async function updateUsersCount(db: admin.database.Database): Promise<void> {
  const usersSnap = await db.ref("users").once("value");
  const usersCount = usersSnap.numChildren();
  const timestamp = new Date().toISOString();

  await db.ref("stats").update({
    usersCount,
    updatedAt: timestamp,
  });

  console.log(`✅ Updated /stats/usersCount to ${usersCount}`);
}
