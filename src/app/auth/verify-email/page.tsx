"use client";

import { useEffect, useState } from "react";
import { MailCheck, RefreshCw, Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useT } from "@/i18n/LanguageProvider";

export default function VerifyEmailPage() {
  const { currentUser, resendVerificationEmail, refreshUser, logout, loading, role } = useAuth();
  const router = useRouter();
  const toast = useCustomToast();
  const t = useT();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const email = currentUser?.email ?? "";

  // Guard: if no user is logged in at all, send to login
  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace("/auth/login");
    }
  }, [loading, currentUser, router]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success(t.auth.verificationSent || "Verification email sent!", t.auth.checkInbox || "Check your inbox.");
    } catch {
      toast.error(t.auth.somethingWrong, t.auth.tryAgainLater || "Please wait a moment and try again.");
    } finally {
      setResending(false);
    }
  };

  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      await refreshUser();
      // Small delay to let Firebase propagate the verification state
      await new Promise((r) => setTimeout(r, 800));
      // Re-read the freshest value from auth
      const fresh = (await import("@/lib/firebase/config")).auth.currentUser;
      if (fresh?.emailVerified) {
        toast.success(t.auth.emailVerifiedToast || "Email verified! Redirecting…");
        router.push(role === "admin" ? "/admin" : "/dashboard");
      } else {
        toast.info(t.auth.notVerifiedYet || "Not verified yet. Please click the link in your email.");
      }
    } catch {
      toast.error(t.auth.somethingWrong, t.auth.tryAgainLater || "Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/auth/login");
  };

  // Show nothing while checking auth state to avoid flash
  if (loading || !currentUser) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[60vh] w-[120vw] -translate-x-1/2">
        <div className="absolute left-1/2 top-0 h-full w-[50vw] bg-beam animate-beam blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center">
              <MailCheck className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {t.auth.verifyEmailTitle || "Verify your email"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.auth.verifyEmailSub || "We sent a verification link to"}{" "}
              <span className="font-semibold text-foreground break-all">{email}</span>.{" "}
              {t.auth.clickLinkToActivate || "Click the link to activate your account."}
            </p>
          </div>

          {/* Info box */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-start space-y-1">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {t.auth.beforeContinue || "Before you continue:"}
            </p>
            <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
              <li>{t.auth.openInbox || "Open your email inbox"}</li>
              <li>{t.auth.clickVerificationLink || "Click the verification link from Beacon"}</li>
              <li>{t.auth.returnAndCheck || `Return here and click "I verified my email"`}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCheckAgain}
              disabled={checking}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60"
            >
              {checking ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t.auth.checking || "Checking…"}</>
              ) : (
                <><RefreshCw className="h-4 w-4" /> {t.auth.iVerifiedEmail || "I verified my email"}</>
              )}
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50"
            >
              {resending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t.auth.sending || "Sending…"}</>
              ) : (
                t.auth.resendVerification || "Resend verification email"
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-border pt-4">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <LogOut className="h-4 w-4" />
              {t.auth.signOutDifferentAccount || "Sign out and use a different account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
