import { supabaseAdmin } from "./supabaseAdmin.js";

export async function uploadTemplate(
  templateId: string,
  textContent: string,
  extension: "md" | "pdf",
  dryRun: boolean = true
): Promise<string> {
  const bucket = "beacon-templates";
  const fileName = `${templateId}.${extension}`;

  if (dryRun) {
    console.log(`[DRY-RUN] Would upload template ${templateId} to ${bucket}/${fileName}`);
    return `https://mock.supabase.co/storage/v1/object/public/${bucket}/${fileName}`;
  }

  try {
    const contentType = extension === "md" ? "text/markdown" : "application/pdf";
    const buffer = Buffer.from(textContent, "utf-8");

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType,
        upsert: true
      });

    if (error) throw error;

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error(`❌ Error uploading template ${templateId}:`, error);
    return "";
  }
}
