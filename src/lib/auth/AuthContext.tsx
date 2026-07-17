"use client";

/**
 * Centralized Firebase Auth context for the Beacon platform.
 *
 * Provides:
 *  - currentUser  – raw Firebase User | null
 *  - loading      – true until Firebase restores auth state
 *  - isAuthenticated
 *  - isEmailVerified  – from Firebase Auth (source of truth)
 *  - role         – "student" | "admin"
 *  - profile      – basic profile snapshot from users/{uid}
 *  - login / logout / resendVerificationEmail / refreshUser
 *
 * SECURITY NOTE:
 *   Firebase Database Rules are the real access-control layer.
 *   UI role checks here are UX only — they never bypass RTDB rules.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  reload,
  type User,
  type AuthError,
} from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "@/lib/firebase/config";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Only two roles exist in this platform: student and admin. */
export type AppRole = "student" | "admin";

export interface AuthProfile {
  uid: string;
  email: string;
  /** Resolved from users/{uid}.name then users/{uid}.displayName then Firebase Auth displayName */
  displayName: string;
  role: AppRole;
  profileCompleted: boolean;
  photoURL?: string;
}

export interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  role: AppRole;
  profile: AuthProfile | null;

  /** Sign in and return any error message, or null on success. */
  login: (email: string, password: string) => Promise<string | null>;

  /** Sign out and clear state. */
  logout: () => Promise<void>;

  /** Resend verification email to the currentUser. */
  resendVerificationEmail: () => Promise<void>;

  /** Force-reload the Firebase user to pick up fresh emailVerified state. */
  refreshUser: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolve the app role for a Firebase user.
 * Only two roles are supported: "admin" and "student".
 * Priority: Firebase custom claims → users/{uid}/role → default "student".
 */
async function resolveRole(user: User): Promise<AppRole> {
  // 1. Try Firebase custom claims (set by Admin SDK on backend)
  try {
    const idTokenResult = await user.getIdTokenResult(/* forceRefresh */ false);
    const claimRole = idTokenResult.claims.role as string | undefined;
    if (claimRole === "admin") {
      return "admin";
    }
  } catch {
    // Custom claims unavailable — fall through to DB lookup
  }

  // 2. Try users/{uid}/role
  try {
    const metaSnap = await get(ref(db, `users/${user.uid}/role`));
    if (metaSnap.exists() && metaSnap.val() === "admin") {
      return "admin";
    }
  } catch {
    // DB read failed (e.g. no rule access) — default to student
  }

  return "student";
}

/** Load a minimal profile snapshot from users/{uid}. */
async function loadProfile(user: User, role: AppRole): Promise<AuthProfile | null> {
  try {
    const snap = await get(ref(db, `users/${user.uid}`));
    if (snap.exists()) {
      const data = snap.val();
      return {
        uid: user.uid,
        email: user.email ?? data.email ?? "",
        // Prefer the RTDB `name` field (spec), fall back to displayName or Firebase Auth
        displayName: data.name ?? data.displayName ?? user.displayName ?? "User",
        role,
        profileCompleted: data.profileCompleted === true,
        photoURL: user.photoURL ?? data.photoURL ?? undefined,
      };
    }
  } catch {
    // Missing or inaccessible profile — return minimal fallback
  }

  // Fallback: build from Firebase Auth data only
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "User",
    role,
    profileCompleted: false,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>("student");
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Listen to auth state ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setRole("student");
        setProfile(null);
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      try {
        const resolvedRole = await resolveRole(user);
        setRole(resolvedRole);

        const resolvedProfile = await loadProfile(user, resolvedRole);
        setProfile(resolvedProfile);
      } catch {
        setRole("student");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return null;
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err) {
        return (err as AuthError).code;
      }
      return err instanceof Error ? err.message : "Something went wrong.";
    }
  }, []);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
    // State is cleared by onAuthStateChanged listener above
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (!currentUser) throw new Error("No user logged in.");
    await sendEmailVerification(currentUser, {
      url: `${window.location.origin}/auth/login`,
    });
  }, [currentUser]);

  const refreshUser = useCallback(async () => {
    if (!currentUser) return;
    await reload(currentUser);
    // onAuthStateChanged will fire again with the updated user
    setCurrentUser(auth.currentUser);
  }, [currentUser]);

  // ── Context value ────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified ?? false,
    role,
    profile,
    login,
    logout,
    resendVerificationEmail,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
