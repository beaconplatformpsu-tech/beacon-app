"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, type AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";
import Link from "next/link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginPage() {
  const t = useT();
  const e = t.auth.errors;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  // Redirect if already signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  const validateField = (key: "email" | "password", value: string): string | null => {
    const v = value.trim();
    if (key === "email") {
      if (!v) return e.emailRequired;
      if (!EMAIL_RE.test(v) || v.length > 255) return e.emailInvalid;
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

  const firebaseErrorMsg = (err: unknown): string => {
    const code = (err as AuthError)?.code ?? "";
    const map: Record<string, string> = {
      "auth/user-not-found": "No account found with that email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-email": "Invalid email address.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/invalid-credential": "Incorrect email or password.",
    };
    return map[code] ?? (err instanceof Error ? err.message : t.auth.somethingWrong);
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setTouched({ email: true, password: true });

    if (errors.email || errors.password) {
      toast.error(e.fixErrors);
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      if (!cred.user.emailVerified) {
        await signOut(auth);
        toast.error("Please verify your email before logging in. Check your inbox.");
        setLoading(false);
        return;
      }

      toast.success(t.auth.welcomeToast);
      // Navigation will be handled by the onAuthStateChanged effect
    } catch (err: unknown) {
      toast.error(firebaseErrorMsg(err));
      setLoading(false);
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

      <form onSubmit={onSubmit} className="space-y-4" noValidate autoComplete="off">
        <div className="space-y-4">
          <Field 
            id="email" type="email" label={t.auth.email} icon={<Mail className="h-4 w-4" />}
            value={email} onChange={setEmail} onBlur={() => setTouched(s => ({...s, email: true}))}
            placeholder={t.auth.emailPh} autoComplete="email" 
            error={touched.email && errors.email ? errors.email : undefined} 
          />

          <div>
            <Field 
              id="password" type="password" label={t.auth.password} icon={<Lock className="h-4 w-4" />}
              value={password} onChange={setPassword} onBlur={() => setTouched(s => ({...s, password: true}))}
              placeholder={t.auth.passwordPh} autoComplete="current-password"
              showLabel={t.auth.showPassword} hideLabel={t.auth.hidePassword}
              error={touched.password && errors.password ? errors.password : undefined} 
            />

            <div className="mt-2 text-right rtl:text-left">
              <Link href="/auth/reset-password" className="text-xs font-medium text-primary hover:underline">
                {t.auth.forgotLink}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t border-border mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2 whitespace-nowrap"><Loader2 className="h-4 w-4 animate-spin" /> {t.auth.pleaseWait}</span>
            ) : t.auth.signInBtn}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {t.auth.newHere}{" "}
        <Link href="/auth/register" className="font-medium text-primary hover:underline">{t.auth.createOne}</Link>
      </div>
    </div>
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
