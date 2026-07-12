"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, loading, isEmailVerified } = useAuth();
  const router = useRouter();

  const isAdmin = role === "admin" || role === "super_admin";

  useEffect(() => {
    if (!loading && (!isAdmin || !isEmailVerified)) {
      router.push("/dashboard");
    }
  }, [role, loading, isAdmin, isEmailVerified, router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    // Failsafe shown briefly while router.push runs
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Unauthorized Access</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  if (!isEmailVerified) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold">Email Not Verified</h1>
        <p className="text-muted-foreground mt-2">Admin access requires a verified email address.</p>
      </div>
    );
  }

  return <>{children}</>;
}
