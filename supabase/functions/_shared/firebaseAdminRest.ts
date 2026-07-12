import { SignJWT, importPKCS8 } from "npm:jose@^5.9.6";

let cachedToken: string | null = null;
let tokenExpiry = 0;

/**
 * Generates an OAuth2 Access Token for Firebase REST API using Service Account credentials.
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  const privateKeyPem = Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
  const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");

  if (!privateKeyPem || !clientEmail) {
    throw new Error("Missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL in environment variables.");
  }

  const privateKey = await importPKCS8(privateKeyPem, "RS256");

  const jwt = await new SignJWT({
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email"
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    throw new Error(`Failed to get Google OAuth token: ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in - 60) * 1000; // cache until 1 min before expiry
  return cachedToken!;
}

export async function firebaseDbGet(path: string) {
  const dbUrl = Deno.env.get("FIREBASE_DATABASE_URL");
  const token = await getAccessToken();
  
  // Handle paths that already contain query strings like "users?shallow=true"
  const [basePath, queryString] = path.split("?");
  const url = queryString 
    ? `${dbUrl}/${basePath}.json?${queryString}`
    : `${dbUrl}/${basePath}.json`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Firebase GET failed: ${await res.text()}`);
  return res.json();
}

export async function firebaseDbPut(path: string, data: any) {
  const dbUrl = Deno.env.get("FIREBASE_DATABASE_URL");
  const token = await getAccessToken();
  const res = await fetch(`${dbUrl}/${path}.json`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase PUT failed: ${await res.text()}`);
  return res.json();
}

export async function firebaseDbPatch(path: string, data: any) {
  const dbUrl = Deno.env.get("FIREBASE_DATABASE_URL");
  const token = await getAccessToken();
  const res = await fetch(`${dbUrl}/${path}.json`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase PATCH failed: ${await res.text()}`);
  return res.json();
}

export async function firebaseDbPost(path: string, data: any) {
  const dbUrl = Deno.env.get("FIREBASE_DATABASE_URL");
  const token = await getAccessToken();
  const res = await fetch(`${dbUrl}/${path}.json`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase POST failed: ${await res.text()}`);
  return res.json();
}
