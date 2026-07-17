export type AppRole = "student" | "admin";

export function normalizeAppRole(role: string | undefined | null): AppRole {
  if (role === "admin") return "admin";
  return "student";
}
