"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { ShieldAlert } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useCurrentUserRole();
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    if (!loading && role !== "admin") {
      router.push("/dashboard");
    }
  }, [role, loading, router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (role !== "admin") {
    // Failsafe in case router.push is slow
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
