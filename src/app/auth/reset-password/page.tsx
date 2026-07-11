"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, type FormEvent, Suspense } from "react";
import { toast } from "sonner";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";
import Link from "next/link";

function ResetPasswordContent() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touchedPw, setTouchedPw] = useState(false);
  const [touchedConf, setTouchedConf] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const pwChecks = useMemo(() => {
    const p = password;
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      digit: /\d/.test(p),
      symbol: /[^A-Za-z0-9]/.test(p),
    };
  }, [password]);

  const pwScore = Object.values(pwChecks).filter(Boolean).length;
  const strengthLabels = ["Weak", "Weak", "Fair", "Good", "Strong", "Strong"];
  const strengthColors = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-500"];

  const pwError =
    touchedPw && (!password
      ? "Password is required"
      : !pwChecks.length ? "At least 8 characters"
      : !pwChecks.upper ? "Must contain an uppercase letter"
      : !pwChecks.lower ? "Must contain a lowercase letter"
      : !pwChecks.digit ? "Must contain a number"
      : !pwChecks.symbol ? "Must contain a special character"
      : null);

  const confError =
    touchedConf && (!confirm
      ? "Please confirm your password"
      : confirm !== password ? "Passwords do not match"
      : null);

  // Verify the oobCode on mount
  useEffect(() => {
    if (!oobCode || mode !== "resetPassword") {
      setVerifying(false);
      setCodeValid(false);
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then(() => { setCodeValid(true); })
      .catch(() => { setCodeValid(false); })
      .finally(() => setVerifying(false));
  }, [oobCode, mode]);

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setTouchedPw(true);
    setTouchedConf(true);

    if (!password || pwError || confError || password !== confirm) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    if (!oobCode) return;

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password updated! You can now sign in.");
      setDone(true);
    } catch (err: unknown) {
      const code = (err as any)?.code ?? "";
      const msg =
        code === "auth/expired-action-code" ? "This link has expired. Please request a new one." :
        code === "auth/invalid-action-code" ? "This link is invalid. Please request a new one." :
        code === "auth/weak-password" ? "Password is too weak." :
        "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Verifying state ──
  if (verifying) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.auth.validating}</p>
      </div>
    );
  }

  // ── Invalid or missing link ──
  if (!codeValid) {
    return (
      <div className="w-full flex flex-col items-center text-center gap-6 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
          <svg className="h-8 w-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-2xl text-foreground">Link Expired or Invalid</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            This password reset link has expired or already been used. Request a fresh link.
          </p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow"
        >
          Request a New Link
        </Link>
      </div>
    );
  }

  // ── Success state ──
  if (done) {
    return (
      <div className="w-full flex flex-col items-center text-center gap-6 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-foreground">Password Updated!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your password has been changed. You can now sign in.</p>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          Back to Sign In
        </Link>
      </div>
    );
  }

  // ── Main form ──
  const ring = (err: string | false | null | undefined) =>
    err ? "border-red-500/70 focus:ring-red-500/40" : "border-border focus:ring-primary/40";

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">{t.auth.setNewPassword}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.auth.readyHint}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {/* New password */}
        <div>
          <label htmlFor="np-pw" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t.auth.newPassword}
          </label>
          <div className="mt-2 relative">
            <span className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="np-pw"
              type={showPw ? "text" : "password"}
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouchedPw(true)}
              placeholder="••••••••"
              aria-invalid={!!pwError}
              aria-describedby={pwError ? "np-pw-error" : undefined}
              className={`w-full rounded-md border bg-background pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 transition-colors ${ring(pwError)}`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground/80"
              aria-label={showPw ? t.auth.hidePassword : t.auth.showPassword}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {pwError && (
            <p id="np-pw-error" className="mt-1.5 text-xs font-medium text-red-500/90" role="alert">{pwError}</p>
          )}
          {/* Strength meter */}
          {password.length > 0 && (
            <div className="mt-2 space-y-2 bg-muted/30 p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < pwScore ? strengthColors[pwScore] : "bg-muted"}`} />
                  ))}
                </div>
                <span className="text-xs font-medium text-muted-foreground min-w-[3.5rem] text-right rtl:text-left">
                  {strengthLabels[pwScore]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="np-conf" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Confirm Password
          </label>
          <div className="mt-2 relative">
            <span className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="np-conf"
              type={showConf ? "text" : "password"}
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => setTouchedConf(true)}
              placeholder="••••••••"
              aria-invalid={!!confError}
              aria-describedby={confError ? "np-conf-error" : undefined}
              className={`w-full rounded-md border bg-background pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 transition-colors ${ring(confError)} ${!confError && confirm.length > 0 ? "border-emerald-500/60 focus:ring-emerald-500/40" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConf((s) => !s)}
              className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground/80"
              aria-label={showConf ? t.auth.hidePassword : t.auth.showPassword}
            >
              {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confError && (
            <p id="np-conf-error" className="mt-1.5 text-xs font-medium text-red-500/90" role="alert">{confError}</p>
          )}
        </div>

        <div className="flex justify-center pt-4 border-t border-border mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60 min-w-[180px]"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t.auth.saving}</>
            ) : t.auth.updateBtn}
          </button>
        </div>

        <div className="flex justify-center pt-1">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Request a new link
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex flex-col items-center justify-center gap-4 py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
