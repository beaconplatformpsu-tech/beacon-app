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
 *  - permissions  – from user_admin_meta (null for students)
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
import { normalizeAppRole, type AppRole } from "./roles";

// ─── Types ────────────────────────────────────────────────────────────────────

export type { AppRole } from "./roles";

export interface AuthPermissions {
  canManageContent: boolean;
  canManageUsers: boolean;
  canManageSupport: boolean;
  canViewStats: boolean;
  canViewPrivateStudentData: boolean;
  canRunSystemActions: boolean;
}

export interface AuthProfile {
  uid: string;
  email: string;
  displayName: string;
  role: AppRole;
  academicLevel?: string;
  department?: string;
  photoURL?: string;
}

export interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  role: AppRole;
  permissions: AuthPermissions | null;
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

// ─── Default permissions (student / no-role) ─────────────────────────────────

const DEFAULT_PERMISSIONS: AuthPermissions = {
  canManageContent: false,
  canManageUsers: false,
  canManageSupport: false,
  canViewStats: false,
  canViewPrivateStudentData: false,
  canRunSystemActions: false,
};

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolve the app role for a Firebase user.
 * Priority: custom claims → user_admin_meta → default "student".
 */
async function resolveRole(user: User): Promise<{ role: AppRole; permissions: AuthPermissions | null }> {
  try {
    const idTokenResult = await user.getIdTokenResult(/* forceRefresh */ false);
    const claimRole = idTokenResult.claims.role as string | undefined;
    const role = normalizeAppRole(claimRole);
    if (role === "admin") {
      const permClaim = idTokenResult.claims.permissions as AuthPermissions | undefined;
      return { role, permissions: permClaim ?? null };
    }
  } catch {
    // Custom claims unavailable — fall through to DB lookup
  }

  try {
    const metaSnap = await get(ref(db, `user_admin_meta/${user.uid}`));
    if (metaSnap.exists()) {
      const meta = metaSnap.val();
      const role = normalizeAppRole(meta?.role);
      return {
        role,
        permissions: role === "admin" ? (meta.permissions ?? null) : null,
      };
    }
  } catch {
    // DB read failed (e.g. no rule access) — default to student
  }

  return { role: "student", permissions: null };
}

/** Load a minimal profile snapshot from users/{uid}. */
async function loadProfile(user: User, role: AppRole): Promise<AuthProfile | null> {
  try {
    const snap = await get(ref(db, `users/${user.uid}`));
    if (snap.exists()) {
      const data = snap.val();
      // users/{uid} may be a flat object (seed style) or nested with profile key
      const flat = data.profile ?? data;
      return {
        uid: user.uid,
        email: user.email ?? flat.email ?? "",
        displayName: user.displayName ?? flat.displayName ?? flat.fullName ?? "User",
        role,
        academicLevel: flat.academicLevel ?? undefined,
        department: flat.department ?? undefined,
        photoURL: user.photoURL ?? flat.photoURL ?? undefined,
      };
    }
  } catch {
    // Missing or inaccessible profile — return minimal
  }

  // Fallback: build from Firebase Auth data only
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "User",
    role,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>("student");
  const [permissions, setPermissions] = useState<AuthPermissions | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Listen to auth state ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setRole("student");
        setPermissions(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      try {
        const { role: resolvedRole, permissions: resolvedPerms } = await resolveRole(user);
        setRole(resolvedRole);
        setPermissions(resolvedPerms);

        const resolvedProfile = await loadProfile(user, resolvedRole);
        setProfile(resolvedProfile);
      } catch {
        setRole("student");
        setPermissions(null);
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
      const code = (err as AuthError)?.code ?? "";
      const map: Record<string, string> = {
        "auth/user-not-found": "No account found with that email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/invalid-email": "Invalid email address.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Check your connection.",
        "auth/user-disabled": "This account has been disabled.",
      };
      return map[code] ?? (err instanceof Error ? err.message : "Something went wrong.");
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
    // Force re-evaluate by triggering a state update
    setCurrentUser({ ...currentUser } as User);
  }, [currentUser]);

  // ── Context value ────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified ?? false,
    role,
    permissions,
    profile,
    login,
    logout,
    resendVerificationEmail,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return ctx;
}
