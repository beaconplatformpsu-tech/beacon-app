"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  GraduationCap,
  Building2,
  Check,
  X as XIcon,
  AlertCircle,
  FileText,
  Github,
  Linkedin,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronDown
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  signOut,
  fetchSignInMethodsForEmail,
  type AuthError,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/shared/LanguageToggle";

import logo from "@/assets/beacon-logo.jpg";



type Mode = "signin" | "signup" | "forgot";

const ACADEMIC_LEVEL_KEYS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"] as const;
const DEPARTMENT_KEYS = [
  "Computer Science",
  "Computer Engineering",
  "Information Technology",
  "Software Engineering",
  "Information Systems",
  "Other",
] as const;

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  academicLevel: string;
  department: string;
  bio: string;
  github: string;
  linkedin: string;
};

type FieldKey = keyof FormState;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}\s'.-]+$/u;

export default function AuthPage() {
  const t = useT();
  const e = t.auth.errors;
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
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
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    name: false, email: false, password: false, confirmPassword: false, academicLevel: false, department: false, bio: false, github: false, linkedin: false,
  });

  const isSigningUp = useRef(false);

  // Redirect if already signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isSigningUp.current) router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  // Reset touched state on mode switch
  useEffect(() => {
    setTouched({ name: false, email: false, password: false, confirmPassword: false, academicLevel: false, department: false, bio: false, github: false, linkedin: false });
    setSignupStep(1);
  }, [mode]);

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

  const validateField = (key: FieldKey, value: string): string | null => {
    const v = value.trim();
    switch (key) {
      case "name":
        if (mode !== "signup") return null;
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
        if (mode === "forgot") return null;
        if (!value) return e.passwordRequired;
        if (mode === "signin") return null;
        if (!pwChecks.length) return e.passwordMin;
        if (!pwChecks.upper) return e.passwordUpper;
        if (!pwChecks.lower) return e.passwordLower;
        if (!pwChecks.digit) return e.passwordDigit;
        if (!pwChecks.symbol) return e.passwordSymbol;
        return null;
      case "confirmPassword":
        if (mode !== "signup") return null;
        if (!value) return e.confirmRequired;
        if (value !== form.password) return t.auth.passwordsNoMatch;
        return null;
      case "academicLevel":
        if (mode !== "signup") return null;
        return v ? null : e.levelRequired;
      case "department":
        if (mode !== "signup") return null;
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

  const errors: Partial<Record<FieldKey, string>> = {};
  (Object.keys(form) as FieldKey[]).forEach((k) => {
    const err = validateField(k, form[k]);
    if (err) errors[k] = err;
  });

  const showError = (k: FieldKey) => touched[k] && errors[k];

  const setField = (k: FieldKey, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k: FieldKey) => setTouched((t0) => ({ ...t0, [k]: true }));

  // Map Firebase error codes to human-readable messages
  const firebaseErrorMsg = (err: unknown): string => {
    const code = (err as AuthError)?.code ?? "";
    const map: Record<string, string> = {
      "auth/user-not-found": "No account found with that email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/weak-password": "Password is too weak.",
      "auth/invalid-email": "Invalid email address.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/invalid-credential": "Incorrect email or password.",
    };
    return map[code] ?? (err instanceof Error ? err.message : t.auth.somethingWrong);
  };

  const handleNextStep = async () => {
    const step1Keys: FieldKey[] = ["name", "email", "password", "confirmPassword"];
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

    setLoading(true);
    try {
      isSigningUp.current = true;
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      // Set display name
      await updateProfile(user, { displayName: form.name.trim() });

      // Send email verification
      await sendEmailVerification(user, {
        url: `${window.location.origin}/`,
      });

      toast.success(t.auth.createdToast);
      setSignupStep(2);
    } catch (err: unknown) {
      isSigningUp.current = false;
      toast.error(firebaseErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const next: Record<FieldKey, boolean> = { ...touched };
    (Object.keys(form) as FieldKey[]).forEach((k) => { next[k] = true; });
    setTouched(next);

    if (Object.keys(errors).length > 0) {
      toast.error(e.fixErrors);
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const cred = await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
        
        if (!cred.user.emailVerified) {
          await signOut(auth);
          toast.error("Please verify your email before logging in. Check your inbox.");
          setLoading(false);
          return;
        }

        toast.success(t.auth.welcomeToast);

      } else if (mode === "signup") {
        const user = auth.currentUser;
        if (!user) throw new Error("No user found. Please try again.");

        // Persist profile + role in Realtime DB
        await set(ref(db, `users/${user.uid}`), {
          displayName: form.name.trim(),
          email: form.email.trim(),
          role: "student",
          academicLevel: form.academicLevel,
          department: form.department,
          bio: form.bio.trim(),
          github: form.github.trim(),
          linkedin: form.linkedin.trim(),
          createdAt: new Date().toISOString(),
        });

        await signOut(auth);
        isSigningUp.current = false;

        toast.success("Registration complete! Please check your email to verify your account before signing in.");
        setSignupStep(1);
        setMode("signin");
        setForm(f => ({ ...f, password: "", confirmPassword: "" }));

      } else {
        // Forgot password
        const email = form.email.trim();
        const methods = await fetchSignInMethodsForEmail(auth, email);
        
        if (methods.length === 0) {
          toast.error("No account found with that email.");
          setLoading(false);
          return;
        }

        await sendPasswordResetEmail(auth, email, {
          url: `${window.location.origin}/auth/reset-password`,
        });
        toast.success(t.auth.resetSentToast);
        setMode("signin");
      }
    } catch (err: unknown) {
      toast.error(firebaseErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const strengthLabels = [t.auth.strength.weak, t.auth.strength.weak, t.auth.strength.fair, t.auth.strength.good, t.auth.strength.strong, t.auth.strength.strong];
  const strengthColors = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-500"];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[60vh] w-[120vw] -translate-x-1/2">
        <div className="absolute left-1/2 top-0 h-full w-[50vw] bg-beam animate-beam blur-3xl" />
      </div>

      <div className={`relative mx-auto flex min-h-screen flex-col px-6 py-10 justify-center transition-all duration-500 w-full ${mode === "signup" ? "max-w-3xl" : "max-w-md"}`}>
        {mode === "signup" ? (
          <div className="flex justify-end mb-3 mr-auto ml-auto w-full">
            <LanguageToggle />
          </div>
        ) : (
          <div className="flex justify-end mb-3">
            <LanguageToggle />
          </div>
        )}

        <div className={`rounded-2xl border border-border bg-card p-6 md:p-8 transition-all duration-500 mx-auto w-full`}>
          <div className="mb-6 flex flex-col items-center gap-3">
            <Image src={logo} alt="Beacon" className="h-14 w-14 rounded-md object-cover" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl md:text-3xl text-foreground">
              {mode === "signin" && t.auth.welcomeBack}
              {mode === "signup" && t.auth.createTitle}
              {mode === "forgot" && t.auth.forgotTitle}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin" && t.auth.welcomeSub}
              {mode === "signup" && signupStep === 1 && t.auth.createSub}
              {mode === "signup" && signupStep === 2 && "Let's personalize your profile (Optional)"}
              {mode === "forgot" && t.auth.forgotSub}
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate autoComplete="off">

            {/* SIGN IN & FORGOT PASSWORD LAYOUT */}
            {mode !== "signup" && (
              <div className="space-y-4">
                <Field id="email" type="email" label={t.auth.email} icon={<Mail className="h-4 w-4" />}
                  value={form.email} onChange={(v) => setField("email", v)} onBlur={() => blur("email")}
                  placeholder={t.auth.emailPh} autoComplete="off" error={showError("email") ? errors.email : undefined} />

                {mode === "signin" && (
                  <div>
                    <Field id="password" type="password" label={t.auth.password} icon={<Lock className="h-4 w-4" />}
                      value={form.password} onChange={(v) => setField("password", v)} onBlur={() => blur("password")}
                      placeholder={t.auth.passwordPh}
                      autoComplete="off"
                      showLabel={t.auth.showPassword} hideLabel={t.auth.hidePassword}
                      error={showError("password") ? errors.password : undefined} />

                    <div className="mt-2 text-right rtl:text-left">
                      <button type="button" onClick={() => setMode("forgot")} className="text-xs font-medium text-primary hover:underline">
                        {t.auth.forgotLink}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SIGN UP LAYOUT - STEP 1 */}
            {mode === "signup" && signupStep === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field id="name" label={t.auth.fullName} icon={<User className="h-4 w-4" />}
                    value={form.name} onChange={(v) => setField("name", v)} onBlur={() => blur("name")}
                    placeholder={t.auth.fullNamePh} autoComplete="off" error={showError("name") ? errors.name : undefined} />

                  <Field id="email" type="email" label={t.auth.email} icon={<Mail className="h-4 w-4" />}
                    value={form.email} onChange={(v) => setField("email", v)} onBlur={() => blur("email")}
                    placeholder={t.auth.emailPh} autoComplete="off" error={showError("email") ? errors.email : undefined} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Field id="password" type="password" label={t.auth.password} icon={<Lock className="h-4 w-4" />}
                      value={form.password} onChange={(v) => setField("password", v)} onBlur={() => blur("password")}
                      placeholder={t.auth.passwordPh}
                      autoComplete="off"
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
                      placeholder={t.auth.passwordPh} autoComplete="off"
                      showLabel={t.auth.showPassword} hideLabel={t.auth.hidePassword}
                      error={showError("confirmPassword") ? errors.confirmPassword : undefined}
                      valid={touched.confirmPassword && !errors.confirmPassword && form.confirmPassword.length > 0} />
                  </div>
                </div>
              </div>
            )}

            {/* SIGN UP LAYOUT - STEP 2 */}
            {mode === "signup" && signupStep === 2 && (
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
              {mode === "signup" && signupStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-1/2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : mode === "signup" && signupStep === 2 ? (
                <div className="flex items-center justify-center gap-4 w-full">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="rounded-md bg-muted px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/80 transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {loading ? <span className="flex items-center justify-center gap-2 whitespace-nowrap"><Loader2 className="h-4 w-4 animate-spin" /> {t.auth.pleaseWait}</span> : <span className="whitespace-nowrap">Complete Registration</span>} <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 whitespace-nowrap"><Loader2 className="h-4 w-4 animate-spin" /> {t.auth.pleaseWait}</span>
                  ) : (mode === "signin" ? t.auth.signInBtn : t.auth.sendReset)}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" && (
              <>{t.auth.newHere}{" "}
                <button onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">{t.auth.createOne}</button>
              </>
            )}
            {mode === "signup" && (
              <>{t.auth.haveAccount}{" "}
                <button onClick={() => setMode("signin")} className="font-medium text-primary hover:underline">{t.auth.signInWord}</button>
              </>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("signin")} className="font-medium text-primary hover:underline">{t.auth.backToSignIn}</button>
            )}
          </div>
        </div>
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
        ) : valid ? (
          <Check className="h-4 w-4 absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
        ) : null}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function SelectField({
  id, label, icon, value, onChange, onBlur, options, placeholder, error,
}: {
  id: string; label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; onBlur?: () => void;
  options: { value: string; label: string }[]; placeholder?: string; error?: string;
}) {
  const ring = error ? "border-red-500/70 focus:ring-red-500/40" : "border-border focus:ring-primary/40";
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
          className={`w-full appearance-none rounded-md border bg-background pl-10 pr-8 rtl:pl-8 rtl:pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 transition-colors ${ring}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-primary">
          <ChevronDown className="h-5 w-5" />
        </span>
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
