import { storage } from "@/lib/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage.
 * @param file The File object to upload.
 * @param path The path in storage where the file should be saved.
 * @returns A promise that resolves to the download URL of the uploaded file.
 */
export async function uploadFileToFirebase(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      null, // Add progress monitoring here if needed
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
