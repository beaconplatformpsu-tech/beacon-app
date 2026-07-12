"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent, Suspense } from "react";
import { toast } from "sonner";
import { Lock, Mail, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { sendEmailVerification, type AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


function LoginContent() {
  const t = useT();
  const e = t.auth.errors;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, currentUser, isEmailVerified, loading: authLoading, role } = useAuth();
  const rawEmail = searchParams.get("email") ?? "";
  const isRegistered = searchParams.get("registered") === "1";
  const prefillEmail = (() => {
    try {
      const decoded = decodeURIComponent(rawEmail);
      return EMAIL_RE.test(decoded) ? decoded : "";
    } catch {
      return "";
    }
  })();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  useEffect(() => {
    if (authLoading) return;
    if (currentUser && isEmailVerified) {
      const isAdmin = role === "admin" || role === "super_admin";
      router.push(isAdmin ? "/admin" : "/dashboard");
    }
  }, [currentUser, isEmailVerified, authLoading, role, router]);

  const validateField = (key: "email" | "password", value: string): string | null => {
    if (key === "email") {
      if (!value.trim()) return e.emailRequired;
      if (!EMAIL_RE.test(value.trim()) || value.length > 255) return e.emailInvalid;
      return null;
    }
    if (key === "password") {
      if (!value) return e.passwordRequired;
      return null;
    }
    return null;
  };

  const errors = {
    email: validateField("email", email),
    password: validateField("password", password),
  };


  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setTouched({ email: true, password: true });

    if (errors.email || errors.password) {
      toast.error(e.fixErrors);
      return;
    }

    setLoading(true);
    setUnverifiedUser(null);

    const errMsg = await login(email.trim(), password);

    if (errMsg) {
      toast.error(errMsg);
      setLoading(false);
      return;
    }

    // Login succeeded — check if email verified
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      setUnverifiedUser(user);
      toast.error("Please verify your email before logging in.");
      setLoading(false);
      return;
    }

    // Verified — redirect based on role is handled by onAuthStateChanged
    // in the app layout; here we just push to dashboard as default
    toast.success(t.auth.welcomeToast);
    // Navigation handled by the useEffect above watching currentUser + isEmailVerified
  };

  // ── Resend verification ──────────────────────────────────────────────────
  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    setResending(true);
    try {
      await sendEmailVerification(unverifiedUser, {
        url: `${window.location.origin}/auth/login`,
      });
      toast.success("Verification email resent. Please check your inbox.");
    } catch {
      toast.error("Failed to resend verification email. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!unverifiedUser) return;
    try {
      await unverifiedUser.reload();
      if (unverifiedUser.emailVerified) {
        toast.success("Email verified successfully! You are now logged in.");
        // The onAuthStateChanged listener should pick this up, but we can force it
        window.location.href = "/dashboard";
      } else {
        toast.error("Email is still not verified. Please check your inbox.");
      }
    } catch (err) {
      toast.error("Error checking verification status.");
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">
          {t.auth.welcomeBack}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.auth.welcomeSub}
        </p>
      </div>

      {/* ── Registration success banner ─────────────────────────────────── */}
      {isRegistered && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Account created successfully. We sent a verification email. Please verify your email, then log in.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate autoComplete="off">
        <div className="space-y-4">
          <Field
            id="login-email"
            type="email"
            label={t.auth.email}
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={setEmail}
            onBlur={() => setTouched((s) => ({ ...s, email: true }))}
            placeholder={t.auth.emailPh}
            autoComplete="email"
            error={touched.email && errors.email ? errors.email : undefined}
          />

          <div>
            <Field
              id="login-password"
              type="password"
              label={t.auth.password}
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={setPassword}
              onBlur={() => setTouched((s) => ({ ...s, password: true }))}
              placeholder={t.auth.passwordPh}
              autoComplete="current-password"
              showLabel={t.auth.showPassword}
              hideLabel={t.auth.hidePassword}
              error={touched.password && errors.password ? errors.password : undefined}
            />

            <div className="mt-2 text-right rtl:text-left">
              <Link href="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
                {t.auth.forgotLink}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t border-border mt-8">
          <button
            type="submit"
            id="login-submit"
            disabled={loading || !!errors.email || !!errors.password}
            className="w-1/2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60"
          >
            {loading && !unverifiedUser ? (
              <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                <Loader2 className="h-4 w-4 animate-spin" /> {t.auth.pleaseWait}
              </span>
            ) : t.auth.signInBtn}
          </button>
        </div>

        {/* ── Unverified email banner ─────────────────────────────────────── */}
        {unverifiedUser && (
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Email not verified</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Check your inbox and click the link we sent, or resend it below.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCheckVerification}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm w-full"
              >
                I verified my email, check again
              </button>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="px-4 py-2 bg-transparent border border-amber-500 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-semibold hover:bg-amber-500/10 transition-colors disabled:opacity-50 w-full"
              >
                {resending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </span>
                ) : "Resend Verification Email"}
              </button>
            </div>
          </div>
        )}
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {t.auth.newHere}{" "}
        <Link href="/auth/register" className="font-medium text-primary hover:underline">{t.auth.createOne}</Link>
      </div>
    </div>
  );
}

// ─── Field sub-component ──────────────────────────────────────────────────────

function Field({
  id, label, icon, value, onChange, onBlur, placeholder, type = "text", autoComplete, showLabel, hideLabel, error, valid,
}: {
  id: string; label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; onBlur?: () => void; placeholder?: string; type?: string; autoComplete?: string;
  showLabel?: string; hideLabel?: string; error?: string; valid?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;
  const ring = error
    ? "border-red-500/70 focus:ring-red-500/40"
    : valid
      ? "border-emerald-500/60 focus:ring-emerald-500/40"
      : "border-border focus:ring-primary/40";

  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-2 relative">
        <span className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input
          id={id}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          onChange={(ev) => onChange(ev.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-md border bg-background pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 transition-colors ${ring}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground/80"
            aria-label={show ? hideLabel : showLabel}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-500/90" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Page export (Suspense wraps useSearchParams) ─────────────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
