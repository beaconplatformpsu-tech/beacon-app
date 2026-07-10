import { supabaseAdmin } from "./supabaseAdmin.js";
import { generateBeaconCover } from "./generateBeaconCover.js";
import fs from "fs";

export async function uploadCover(
  resourceId: string,
  title: string,
  resourceType: string,
  dryRun: boolean = true
): Promise<string> {
  const fileName = `${resourceId}.webp`;
  const bucket = "beacon-resource-covers";

  if (dryRun) {
    console.log(`[DRY-RUN] Would generate and upload cover for ${resourceId} to ${bucket}/${fileName}`);
    return `https://mock.supabase.co/storage/v1/object/public/${bucket}/${fileName}`;
  }

  try {
    const webpBuffer = await generateBeaconCover(title, resourceType);

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, webpBuffer, {
        contentType: "image/webp",
        upsert: true
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`❌ Error uploading cover for ${resourceId}:`, error);
    // Return a safe fallback rather than crashing
    return "";
  }
}
