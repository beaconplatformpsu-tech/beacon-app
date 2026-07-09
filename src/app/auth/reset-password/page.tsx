"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { verifyPasswordResetCode, confirmPasswordReset, type AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";

export default function ResetPasswordPage() {
  const t = useT();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const schema = z.string().min(8, t.auth.somethingWrong).max(72);

  useEffect(() => {
    // Firebase sends the reset link with ?mode=resetPassword&oobCode=XXXX
    const params = new URLSearchParams(window.location.search);
    const code = params.get("oobCode");

    if (!code) {
      setReady(false);
      return;
    }

    verifyPasswordResetCode(auth, code)
      .then(() => {
        setOobCode(code);
        setReady(true);
      })
      .catch(() => {
        toast.error("This password reset link is invalid or has expired.");
        setReady(false);
      });
  }, []);

  const firebaseErrorMsg = (err: unknown): string => {
    const code = (err as AuthError)?.code ?? "";
    const map: Record<string, string> = {
      "auth/expired-action-code": "This reset link has expired. Please request a new one.",
      "auth/invalid-action-code": "This reset link is invalid. Please request a new one.",
      "auth/weak-password": "Password is too weak. Use at least 8 characters.",
    };
    return map[code] ?? (err instanceof Error ? err.message : t.auth.somethingWrong);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const valid = schema.parse(password);
      if (valid !== confirm) {
        toast.error(t.auth.passwordsNoMatch);
        return;
      }
      if (!oobCode) {
        toast.error("Invalid or missing reset code.");
        return;
      }
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, valid);
      toast.success(t.auth.pwUpdatedToast);
      router.push("/auth/login");
    } catch (err: unknown) {
      const msg =
        err instanceof z.ZodError
          ? err.issues[0]?.message
          : firebaseErrorMsg(err);
      toast.error(msg ?? t.auth.somethingWrong);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">{t.auth.setNewPassword}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {ready ? t.auth.readyHint : t.auth.validating}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <PwField id="password" label={t.auth.newPassword} value={password} onChange={setPassword} autoComplete="new-password"
          showLabel={t.auth.showPassword} hideLabel={t.auth.hidePassword} />
        <PwField id="confirm" label={t.auth.confirmPassword} value={confirm} onChange={setConfirm} autoComplete="new-password"
          showLabel={t.auth.showPassword} hideLabel={t.auth.hidePassword} />

        <div className="flex justify-center pt-4 border-t border-border mt-8">
          <button
            type="submit"
            disabled={loading || !ready}
            className="w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <span className="flex items-center justify-center gap-2 whitespace-nowrap"><Loader2 className="h-4 w-4 animate-spin inline-block" /> {t.auth.saving}</span> : t.auth.updateBtn}
          </button>
        </div>
      </form>

      {!ready && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t.auth.noLinkHint}{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">{t.auth.signInPage}</Link>.
        </div>
      )}
    </div>
  );
}

function PwField({
  id, label, value, onChange, autoComplete, showLabel, hideLabel,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; autoComplete?: string;
  showLabel?: string; hideLabel?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-2 relative">
        <span className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Lock className="h-4 w-4" />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-md border border-border bg-background pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground/80"
          aria-label={show ? hideLabel : showLabel}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
