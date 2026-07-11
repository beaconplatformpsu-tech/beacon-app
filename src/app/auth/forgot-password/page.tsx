"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail, type AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";
import Link from "next/link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPasswordPage() {
  const t = useT();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const error =
    touched &&
    (!email
      ? t.auth.errors.emailRequired
      : !EMAIL_RE.test(email)
      ? t.auth.errors.emailInvalid
      : null);

  const firebaseErrorMsg = (err: unknown): string => {
    const code = (err as AuthError)?.code ?? "";
    const map: Record<string, string> = {
      // Security-neutral: never reveal whether an account exists
      "auth/user-not-found": t.auth.resetSentToast,
      "auth/invalid-email": t.auth.errors.emailInvalid,
      "auth/network-request-failed": t.auth.somethingWrong,
      "auth/too-many-requests": "Too many attempts. Please try again later.",
    };
    return map[code] ?? (err instanceof Error ? err.message : t.auth.somethingWrong);
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setTouched(true);

    if (!email || !EMAIL_RE.test(email)) {
      toast.error(t.auth.errors.fixErrors);
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/auth/reset-password`,
      });
      setSent(true);
    } catch (err: unknown) {
      const code = (err as AuthError)?.code ?? "";
      // Security-neutral: for user-not-found, still show the success state
      if (code === "auth/user-not-found") {
        setSent(true);
      } else {
        toast.error(firebaseErrorMsg(err));
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (sent) {
    return (
      <div className="w-full flex flex-col items-center text-center gap-6 py-4">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>

        {/* Heading */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">
            {t.auth.checkYourEmail}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            {t.auth.checkEmailSub}{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>

        {/* Back to login — centered, own row */}
        <div className="w-full flex justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t.auth.backToSignIn}
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">
          {t.auth.forgotTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.auth.forgotSub}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate autoComplete="off">
        {/* Email field */}
        <div>
          <label
            htmlFor="fp-email"
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            {t.auth.email}
          </label>
          <div className="mt-2 relative">
            <span className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="fp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={t.auth.emailPh}
              autoComplete="email"
              className={`w-full rounded-md border bg-background pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 transition-colors ${
                error
                  ? "border-red-500/70 focus:ring-red-500/40"
                  : "border-border focus:ring-primary/40"
              }`}
            />
          </div>
          {error && (
            <p className="mt-1.5 text-xs font-medium text-red-500/90" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Submit button — centered, own row */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            id="fp-submit"
            disabled={loading || !!error}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-10 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60 min-w-[180px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.auth.pleaseWait}
              </>
            ) : (
              t.auth.sendReset
            )}
          </button>
        </div>

        {/* Back to login — centered, own row */}
        <div className="flex justify-center pt-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t.auth.backToSignIn}
          </Link>
        </div>
      </form>
    </div>
  );
}
