"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, type FormEvent } from "react";
import { toast } from "sonner";
import { Lock, Mail, User, GraduationCap, Building2, Check, X as XIcon, FileText, Github, Linkedin, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, onAuthStateChanged, signOut, type AuthError } from "firebase/auth";
import { ref, set, update } from "firebase/database";
import { auth, db } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";
import Link from "next/link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}\s'.-]+$/u;

const ACADEMIC_LEVEL_KEYS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"] as const;
const DEPARTMENT_KEYS = [
  "Computer Science",
  "Computer Engineering",
  "Information Technology",
  "Software Engineering",
  "Information Systems",
  "Other",
] as const;

export default function RegisterPage() {
  const t = useT();
  const e = t.auth.errors;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    academicLevel: "",
    department: "",
    bio: "",
    github: "",
    linkedin: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirect if already signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If user is logged in and not verifying email, redirect
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
        if (v.trim().split(/\s+/).length < 3) return (e as any).nameWords || "Full name must contain at least 3 words";
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
      case "academicLevel":
        return v ? null : e.levelRequired;
      case "department":
        return v ? null : e.departmentRequired;
      case "github":
        if (v && !v.includes("github.com")) return "Must be a valid GitHub URL";
        return null;
      case "linkedin":
        if (v && !v.includes("linkedin.com")) return "Must be a valid LinkedIn URL";
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

  const handleNextStep = () => {
    const step1Keys = ["name", "email", "password", "confirmPassword"] as const;
    const nextTouched = { ...touched };
    let hasError = false;

    step1Keys.forEach((k) => {
      nextTouched[k] = true;
      if (validateField(k, form[k])) hasError = true;
    });

    setTouched(nextTouched);

    if (hasError) {
      toast.error(e.fixErrors);
      return;
    }

    setStep(2);
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
          academicLevel: form.academicLevel,
          department: form.department,
          bio: form.bio.trim(),
          github: form.github.trim(),
          linkedin: form.linkedin.trim(),
          createdAt: timestamp,
          updatedAt: timestamp,
        }
      });

      await signOut(auth);

      const encodedEmail = encodeURIComponent(form.email.trim());
      toast.success("Account created! Please verify your email before signing in.");
      router.push(`/auth/login?email=${encodedEmail}&registered=1`);
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
          {step === 1 ? t.auth.createSub : "Let's personalize your profile (Optional)"}
        </p>
        {/* Step progress indicator */}
        <div className="flex items-center justify-center gap-3 mt-5">
          <div className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 1 ? "bg-primary text-primary-foreground shadow-glow" : "bg-primary/20 text-primary"}`}>1</div>
            <span className={`text-xs font-medium hidden sm:block ${step === 1 ? "text-foreground" : "text-muted-foreground"}`}>Account</span>
          </div>
          <div className={`h-px w-8 transition-colors ${step === 2 ? "bg-primary" : "bg-border"}`} />
          <div className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 2 ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>2</div>
            <span className={`text-xs font-medium hidden sm:block ${step === 2 ? "text-foreground" : "text-muted-foreground"}`}>Profile</span>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate autoComplete="off">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="name" label={t.auth.fullName} icon={<User className="h-4 w-4" />}
                value={form.name} onChange={(v) => setField("name", v)} onBlur={() => blur("name")}
                placeholder={t.auth.fullNamePh} autoComplete="name" error={showError("name") ? errors.name : undefined} />

              <Field id="email" type="email" label={t.auth.email} icon={<Mail className="h-4 w-4" />}
                value={form.email} onChange={(v) => setField("email", v)} onBlur={() => blur("email")}
                placeholder={t.auth.emailPh} autoComplete="email" error={showError("email") ? errors.email : undefined} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
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

              <div>
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
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField id="academicLevel" label={t.auth.academicLevel} icon={<GraduationCap className="h-4 w-4" />}
                value={form.academicLevel}
                onChange={(v) => { setField("academicLevel", v); blur("academicLevel"); }}
                onBlur={() => blur("academicLevel")}
                placeholder={t.auth.academicLevelPh}
                options={ACADEMIC_LEVEL_KEYS.map((l) => ({ value: l, label: t.auth.levels[l] }))}
                error={showError("academicLevel") ? errors.academicLevel : undefined} />

              <SelectField id="department" label={t.auth.department} icon={<Building2 className="h-4 w-4" />}
                value={form.department}
                onChange={(v) => { setField("department", v); blur("department"); }}
                onBlur={() => blur("department")}
                placeholder={t.auth.departmentPh}
                options={DEPARTMENT_KEYS.map((d) => ({ value: d, label: t.auth.departments[d] }))}
                error={showError("department") ? errors.department : undefined} />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bio" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Short Bio (Optional)</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 rtl:left-auto rtl:right-3 top-3 text-muted-foreground"><FileText className="h-4 w-4" /></span>
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  placeholder="Tell us a bit about your professional interests..."
                  className="w-full min-h-[100px] rounded-md border border-border bg-background pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="github" label="GitHub Profile" icon={<Github className="h-4 w-4" />}
                value={form.github} onChange={(v) => setField("github", v)} onBlur={() => blur("github")}
                placeholder="https://github.com/username" error={showError("github") ? errors.github : undefined} />

              <Field id="linkedin" label="LinkedIn Profile" icon={<Linkedin className="h-4 w-4" />}
                value={form.linkedin} onChange={(v) => setField("linkedin", v)} onBlur={() => blur("linkedin")}
                placeholder="https://linkedin.com/in/username" error={showError("linkedin") ? errors.linkedin : undefined} />
            </div>
          </div>
        )}

        <div className="flex justify-center pt-4 border-t border-border mt-8">
          {step === 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!form.name || !form.email || !form.password || !form.confirmPassword || !!errors.name || !!errors.email || !!errors.password || !!errors.confirmPassword}
              className="w-1/2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60 flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center justify-center gap-4 w-full">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-md bg-muted px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/80 transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={loading || !form.academicLevel || !form.department || !!errors.academicLevel || !!errors.department || !!errors.github || !!errors.linkedin}
                className="flex-1 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? <span className="flex items-center justify-center gap-2 whitespace-nowrap"><Loader2 className="h-4 w-4 animate-spin" /> {t.auth.pleaseWait}</span> : <span className="whitespace-nowrap">Complete Registration</span>} <Check className="h-4 w-4" />
              </button>
            </div>
          )}
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
