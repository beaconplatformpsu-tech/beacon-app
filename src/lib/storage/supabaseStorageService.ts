import { callEdgeFunction } from "@/lib/supabase/edgeFunctionsClient";

export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

export async function uploadFileToSupabase(
  file: File, 
  bucket: string, 
  options?: UploadOptions
): Promise<string> {
  if (options?.maxSizeMB) {
    const maxSizeBytes = options.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`File is too large. Maximum size is ${options.maxSizeMB}MB.`);
    }
  }

  if (options?.allowedTypes && options.allowedTypes.length > 0) {
    if (!options.allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`);
    }
  }

  const ext = file.name.split('.').pop();
  const sanitizedFileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  // 1. Get Signed Upload URL from Edge Function (which verifies Firebase Auth)
  const { signedUrl, path } = await callEdgeFunction("create-signed-upload-url", {
    bucket,
    fileName: sanitizedFileName,
    contentType: file.type
  });

  // 2. Upload file directly to Supabase Storage using PUT
  const uploadResponse = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type
    },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file to storage: ${uploadResponse.statusText}`);
  }

  // 3. Construct public URL
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
