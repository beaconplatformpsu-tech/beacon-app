"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
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

  const error = touched && (!email ? t.auth.errors.emailRequired : !EMAIL_RE.test(email) ? t.auth.errors.emailInvalid : null);

  const firebaseErrorMsg = (err: unknown): string => {
    const code = (err as AuthError)?.code ?? "";
    const map: Record<string, string> = {
      "auth/user-not-found": "No account found with that email.",
      "auth/invalid-email": "Invalid email address.",
      "auth/network-request-failed": "Network error. Check your connection.",
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
      await sendPasswordResetEmail(auth, email.trim());
      toast.success("Password reset email sent.");
      setSent(true);
    } catch (err: unknown) {
      toast.error(firebaseErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full text-center">
        <h1 className="font-display text-2xl md:text-3xl text-foreground mb-4">
          Check your email
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
        </p>
        <Link 
          href="/auth/login"
          className="inline-flex rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow"
        >
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your registered email and we will send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate autoComplete="off">
        <div>
          <label htmlFor="email" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t.auth.email}</label>
          <div className="mt-2 relative">
            <span className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="email" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)}
              placeholder={t.auth.emailPh} autoComplete="email"
              className={`w-full rounded-md border bg-background pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 transition-colors ${error ? "border-red-500/70 focus:ring-red-500/40" : "border-border focus:ring-primary/40"}`}
            />
          </div>
          {error && (
            <p className="mt-1.5 text-xs font-medium text-red-500/90" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border mt-8">
          <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
          <button
            type="submit"
            disabled={loading || !email || !!error}
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2 whitespace-nowrap"><Loader2 className="h-4 w-4 animate-spin" /> {t.auth.pleaseWait}</span>
            ) : "Send Reset Link"}
          </button>
        </div>
      </form>
    </div>
  );
}
