import { auth } from "@/lib/firebase/config";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SUPABASE_URL) {
  console.warn("NEXT_PUBLIC_SUPABASE_URL is missing. Edge functions won't work.");
}

export async function callEdgeFunction(functionName: string, body: any) {
  if (!auth.currentUser) {
    throw new Error("User must be logged in to call secure functions.");
  }

  // Retrieve the Firebase ID token for secure, server-side verification
  const token = await auth.currentUser.getIdToken();

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`Edge function failed with non-JSON response: ${text}`);
  }

  if (!response.ok) {
    throw new Error(json.error || "An error occurred calling the secure function.");
  }

  return json;
}
