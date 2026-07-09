import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "@/lib/firebase/config";

export type AppRole = "admin" | "student";

/**
 * Returns the currently signed-in Firebase user, their app role (read from
 * Realtime DB at /users/{uid}/role), and a loading flag.
 *
 * Role is written to the DB on sign-up (default: "student").
 * Admins can be promoted by setting /users/{uid}/role = "admin" in the
 * Firebase Console.
 */
export function useCurrentUserRole() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const roleSnap = await get(ref(db, `user_admin_meta/${firebaseUser.uid}/role`));
        const storedRole = roleSnap.exists() ? (roleSnap.val() as AppRole) : "student";
        setRole(storedRole);
      } catch {
        setRole("student");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Keep a compatible shape: expose `session` as a boolean-like object so
  // existing header/nav code that checks `if (session)` continues to work.
  const session = user;

  return { session, role, loading, user };
}