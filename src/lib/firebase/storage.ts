import { storage } from "@/lib/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage.
 * @param file The File object to upload.
 * @param path The path in storage where the file should be saved.
 * @returns A promise that resolves to the download URL of the uploaded file.
 */
export interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

export async function uploadFileToFirebase(file: File, path: string, options?: UploadOptions): Promise<string> {
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

  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (options?.onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options.onProgress(progress);
        }
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
