/**
 * Convenience re-export of the centralized auth hook.
 * Import from here instead of directly from AuthContext.
 *
 * @example
 * const { currentUser, role, isEmailVerified, logout } = useAuth();
 */
export { useAuth } from "@/lib/auth/AuthContext";
export type { AppRole, AuthPermissions, AuthProfile, AuthContextValue } from "@/lib/auth/AuthContext";
