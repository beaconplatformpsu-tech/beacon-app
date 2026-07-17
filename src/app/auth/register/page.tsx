"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, type FormEvent } from "react";
import { toast } from "sonner";
import { Lock, Mail, User, Check, X as XIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, onAuthStateChanged, signOut, type AuthError } from "firebase/auth";
import { ref, update } from "firebase/database";
import { auth, db } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";
import Link from "next/link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}\s'.-]+$/u;

export default function RegisterPage() {
  const t = useT();
  const e = t.auth.errors;
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  const pwChecks = useMemo(() => {
    const p = form.password;
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      digit: /\d/.test(p),
      symbol: /[^A-Za-z0-9]/.test(p),
    };
  }, [form.password]);

  const pwScore = Object.values(pwChecks).filter(Boolean).length;

  const validateField = (key: string, value: string): string | null => {
    const v = value.trim();
    switch (key) {
      case "name":
        if (!v) return e.nameRequired;
        if (v.length < 2) return e.nameMin;
        if (v.length > 120) return e.nameMax;
        if (!NAME_RE.test(v)) return e.nameInvalid;
        return null;
      case "email":
        if (!v) return e.emailRequired;
        if (!EMAIL_RE.test(v) || v.length > 255) return e.emailInvalid;
        return null;
      case "password":
        if (!value) return e.passwordRequired;
        if (!pwChecks.length) return e.passwordMin;
        if (!pwChecks.upper) return e.passwordUpper;
        if (!pwChecks.lower) return e.passwordLower;
        if (!pwChecks.digit) return e.passwordDigit;
        if (!pwChecks.symbol) return e.passwordSymbol;
        return null;
      case "confirmPassword":
        if (!value) return e.confirmRequired;
        if (value !== form.password) return t.auth.passwordsNoMatch;
        return null;
      default:
        return null;
    }
  };

  const errors: Record<string, string> = {};
  (Object.keys(form) as Array<keyof typeof form>).forEach((k) => {
    const err = validateField(k, form[k]);
    if (err) errors[k] = err;
  });

  const showError = (k: keyof typeof form) => touched[k] && errors[k];

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k: keyof typeof form) => setTouched((t0) => ({ ...t0, [k]: true }));

  const firebaseErrorMsg = (err: unknown): string => {
    const code = (err as AuthError)?.code ?? "";
    const map: Record<string, string> = {
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password is too weak.",
      "auth/invalid-email": "Invalid email address.",
      "auth/network-request-failed": "Network error. Check your connection.",
    };
    return map[code] ?? (err instanceof Error ? err.message : t.auth.somethingWrong);
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const next: Record<string, boolean> = { ...touched };
    (Object.keys(form) as Array<keyof typeof form>).forEach((k) => { next[k] = true; });
    setTouched(next);

    if (Object.keys(errors).length > 0) {
      toast.error(e.fixErrors);
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      await updateProfile(user, { displayName: form.name.trim() });

      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/login`,
      });

      const timestamp = new Date().toISOString();
      await update(ref(db), {
        [`users/${user.uid}`]: {
          displayName: form.name.trim(),
          email: form.email.trim(),
          emailVerified: false,
          role: "student",
          createdAt: timestamp,
          updatedAt: timestamp,
        }
      });

      await signOut(auth);

      toast.success("Account created! Please verify your email before signing in.");
      const params = new URLSearchParams();
      params.set("email", form.email.trim());
      params.set("registered", "1");
      router.push(`/auth/login?${params.toString()}`);
    } catch (err: unknown) {
      toast.error(firebaseErrorMsg(err));
      setLoading(false);
    }
  };

  const strengthLabels = [t.auth.strength.weak, t.auth.strength.weak, t.auth.strength.fair, t.auth.strength.good, t.auth.strength.strong, t.auth.strength.strong];
  const strengthColors = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-500"];

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl md:text-3xl text-foreground">
          {t.auth.createTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.auth.createSub}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate autoComplete="off">
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col gap-4 xl:flex-row xl:flex-wrap">
            <div className="w-full xl:flex-1 xl:min-w-[220px]">
              <Field id="name" label={t.auth.fullName} icon={<User className="h-4 w-4" />}
                value={form.name} onChange={(v) => setField("name", v)} onBlur={() => blur("name")}
                placeholder={t.auth.fullNamePh} autoComplete="name" error={showError("name") ? errors.name : undefined} />
            </div>

            <div className="w-full xl:flex-1 xl:min-w-[220px]">
              <Field id="email" type="email" label={t.auth.email} icon={<Mail className="h-4 w-4" />}
                value={form.email} onChange={(v) => setField("email", v)} onBlur={() => blur("email")}
                placeholder={t.auth.emailPh} autoComplete="email" error={showError("email") ? errors.email : undefined} />
            </div>

            <div className="w-full xl:flex-1 xl:min-w-[220px]">
              <Field id="password" type="password" label={t.auth.password} icon={<Lock className="h-4 w-4" />}
                value={form.password} onChange={(v) => setField("password", v)} onBlur={() => blur("password")}
                placeholder={t.auth.passwordPh}
                autoComplete="new-password"
                showLabel={t.auth.showPassword} hideLabel={t.auth.hidePassword}
                error={showError("password") ? errors.password : undefined} />

              {form.password.length > 0 && (
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
                  <ul className="flex flex-col gap-1.5 text-[11px] mt-2">
                    <PwRule ok={pwChecks.length} label={e.passwordMin} />
                    <PwRule ok={pwChecks.upper} label={e.passwordUpper} />
                    <PwRule ok={pwChecks.lower} label={e.passwordLower} />
                    <PwRule ok={pwChecks.digit} label={e.passwordDigit} />
                    <PwRule ok={pwChecks.symbol} label={e.passwordSymbol} />
                  </ul>
                </div>
              )}
            </div>

            <div className="w-full xl:flex-1 xl:min-w-[220px]">
              <Field id="confirmPassword" type="password" label={t.auth.confirmPassword} icon={<Lock className="h-4 w-4" />}
                value={form.confirmPassword}
                onChange={(v) => setField("confirmPassword", v)}
                onBlur={() => blur("confirmPassword")}
                placeholder={t.auth.passwordPh} autoComplete="new-password"
                showLabel={t.auth.showPassword} hideLabel={t.auth.hidePassword}
                error={showError("confirmPassword") ? errors.confirmPassword : undefined}
                valid={touched.confirmPassword && !errors.confirmPassword && form.confirmPassword.length > 0} />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t border-border mt-8">
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0 || !form.name || !form.email || !form.password || !form.confirmPassword}
            className="inline-flex w-fit max-w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition shadow-glow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-100 sm:px-5"
          >
            {loading ? <span className="flex items-center justify-center gap-2 whitespace-nowrap"><Loader2 className="h-4 w-4 animate-spin" /> {t.auth.pleaseWait}</span> : <span className="whitespace-nowrap">Create Account</span>} <Check className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {t.auth.haveAccount}{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">{t.auth.signInWord}</Link>
      </div>
    </div>
  );
}

function PwRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-start gap-1.5 ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
      {ok ? <Check className="h-3 w-3 shrink-0 mt-0.5" /> : <XIcon className="h-3 w-3 shrink-0 opacity-60 mt-0.5" />}
      <span className="leading-snug">{label}</span>
    </li>
  );
}

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

function SelectField({
  id, label, icon, value, onChange, onBlur, placeholder, options, error,
}: {
  id: string; label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; onBlur?: () => void; placeholder: string;
  options: { value: string; label: string }[]; error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-2 relative">
        <span className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <select
          id={id}
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full appearance-none rounded-md border bg-background pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 transition-colors ${error ? "border-red-500/70 focus:ring-red-500/40" : "border-border focus:ring-primary/40"}`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="pointer-events-none absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-500/90" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
