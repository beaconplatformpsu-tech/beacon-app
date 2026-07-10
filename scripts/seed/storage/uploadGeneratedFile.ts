import { supabaseAdmin } from "./supabaseAdmin.js";
import fs from "fs";

export async function uploadGeneratedFile(
  localFilePath: string,
  destinationPath: string, // e.g. "seed-reports/2026-07-04.json"
  dryRun: boolean = true
): Promise<string> {
  const bucket = "beacon-generated-files";

  if (dryRun) {
    console.log(`[DRY-RUN] Would upload ${localFilePath} to ${bucket}/${destinationPath}`);
    return `https://mock.supabase.co/storage/v1/object/public/${bucket}/${destinationPath}`;
  }

  try {
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found: ${localFilePath}`);
    }

    const fileBuffer = fs.readFileSync(localFilePath);
    const contentType = destinationPath.endsWith(".json") ? "application/json" : "text/markdown";

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(destinationPath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) throw error;

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(destinationPath);

    return urlData.publicUrl;
  } catch (error) {
    console.error(`❌ Error uploading generated file ${destinationPath}:`, error);
    return "";
  }
}
