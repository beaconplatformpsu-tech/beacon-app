import { createRemoteJWKSet, jwtVerify } from "npm:jose@^5.9.6";

// Firebase uses these public keys to sign ID tokens
const FIREBASE_JWKS_URL = "https://www.googleapis.com/robot/v1/metadata/jwk/securetoken@system.gserviceaccount.com";
const JWKS = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));

/**
 * Parses and verifies a Firebase Auth ID Token securely using Google's public JWKs.
 * Returns the decoded payload which includes uid, email, and any custom claims.
 * @param req The incoming Request object.
 * @param options Optional configuration for verification.
 */
export async function verifyFirebaseAuth(req: Request, options?: { requireEmailVerified?: boolean }) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const token = authHeader.split("Bearer ")[1];
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");

  if (!projectId) {
    console.error("FIREBASE_PROJECT_ID is not set in Edge Function secrets.");
    return { error: "Server configuration error", status: 500 };
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    
    // Enforce email_verified if requested
    if (options?.requireEmailVerified && !payload.email_verified) {
      return { error: "Email address must be verified to perform this action.", status: 403 };
    }

    // payload contains uid, email, email_verified, and any custom claims (like admin/super_admin)
    return { payload, status: 200 };
  } catch (error: any) {
    console.error("JWT Verification failed:", error.message);
    return { error: "Invalid or expired Firebase ID token", status: 401 };
  }
}
