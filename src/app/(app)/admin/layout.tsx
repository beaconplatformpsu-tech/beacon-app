"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, loading, isEmailVerified } = useAuth();
  const { dir } = useLanguage();
  const router = useRouter();

  const isAdmin = role === "admin";

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
      <div className="flex flex-col h-[calc(100vh-10rem)] items-center justify-center text-center px-4">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">
          {dir === "rtl" ? "وصول غير مصرح به" : "Unauthorized Access"}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {dir === "rtl"
            ? "ليس لديك صلاحية لعرض هذه الصفحة."
            : "You do not have permission to view this page."}
        </p>
      </div>
    );
  }

  if (!isEmailVerified) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] items-center justify-center text-center px-4">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold">
          {dir === "rtl" ? "البريد الإلكتروني غير مُفعَّل" : "Email Not Verified"}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {dir === "rtl"
            ? "يتطلب وصول المسؤول عنواناً بريدياً مُفعَّلاً."
            : "Admin access requires a verified email address."}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
