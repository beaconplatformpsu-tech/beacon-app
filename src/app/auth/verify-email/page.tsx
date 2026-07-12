"use client";

import { useState } from "react";
import { MailCheck, RefreshCw, Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const { currentUser, resendVerificationEmail, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const email = currentUser?.email ?? "";

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success("Verification email sent! Check your inbox.");
    } catch {
      toast.error("Failed to resend. Please wait a moment and try again.");
    } finally {
      setResending(false);
    }
  };

  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      await refreshUser();
      // Give Firebase a moment to propagate
      await new Promise((r) => setTimeout(r, 500));
      if (currentUser?.emailVerified) {
        toast.success("Email verified! Redirecting…");
        router.push("/dashboard");
      } else {
        toast.info("Not verified yet. Please click the link in your email.");
      }
    } catch {
      toast.error("Could not refresh. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push("/auth/login");
  };

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
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to{" "}
              <span className="font-semibold text-foreground break-all">{email}</span>.
              Click the link to activate your account.
            </p>
          </div>

          {/* Info box */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-left space-y-1">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Before you continue:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
              <li>Open your email inbox</li>
              <li>Click the verification link from Beacon</li>
              <li>Return here and click <strong>&quot;I verified my email&quot;</strong></li>
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
                <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</>
              ) : (
                <><RefreshCw className="h-4 w-4" /> I verified my email</>
              )}
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50"
            >
              {resending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
              ) : (
                "Resend verification email"
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
              Sign out and use a different account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
