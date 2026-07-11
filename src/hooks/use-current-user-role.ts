/**
 * Backward-compatible wrapper around the centralized AuthContext.
 *
 * Existing components that import { useCurrentUserRole } continue to work.
 * New code should prefer useAuth() from @/hooks/use-auth.
 */
import { useAuth } from "@/lib/auth/AuthContext";
import type { User } from "firebase/auth";

export type AppRole = "admin" | "super_admin" | "student";

export function useCurrentUserRole(): {
  session: User | null;
  user: User | null;
  role: AppRole | null;
  loading: boolean;
} {
  const { currentUser, role, loading } = useAuth();

  return {
    session: currentUser,
    user: currentUser,
    role: currentUser ? role : null,
    loading,
  };
}