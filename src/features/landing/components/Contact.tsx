import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Mail, MessageSquare, Send, User } from "lucide-react";
import { ref, push } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export function Contact() {
  const t = useT();
  const toast = useCustomToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  
  const parsed = schema.safeParse(form);
  const realtimeErrors: Partial<Record<keyof typeof form, string>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as keyof typeof form;
      if (!realtimeErrors[k]) realtimeErrors[k] = issue.message;
    }
  }
  const hasErrors = !parsed.success;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!parsed.success) {
      toast.error("Validation Error", "Please check your inputs and try again.");
      return;
    }
    setSubmitting(true);
    try {
      await push(ref(db, "support_messages"), {
        ...parsed.data,
        type: "contact",
        createdAt: new Date().toISOString(),
      });
      toast.success(t.contact.success, "We will get back to you shortly.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error(t.contact.error, "Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-16 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">

          {/* ── Info Column ── */}
          <div className="lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t.contact.kicker}
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl text-balance">
              {t.contact.title}
            </h2>
            <p className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed">
              {t.contact.subtitle}
            </p>

            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-semibold text-foreground">{t.contact.email}</div>
                  <div className="text-muted-foreground">beaconplatformpsu@gmail.com</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-semibold text-foreground">{t.contact.response}</div>
                  <div className="text-muted-foreground">{t.contact.responseValue}</div>
                </div>
              </li>
            </ul>
          </div>

          {/* ── Form Column ── */}
          <div className="lg:col-span-7">
            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-glow"
              noValidate
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  id="contact-name"
                  label={t.contact.name}
                  icon={<User className="h-4 w-4" />}
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder={t.contact.namePh}
                  error={form.name.length > 0 ? realtimeErrors.name : undefined}
                  autoComplete="name"
                />
                <Field
                  id="contact-email"
                  label={t.contact.emailLabel}
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  placeholder={t.contact.emailPh}
                  error={form.email.length > 0 ? realtimeErrors.email : undefined}
                  autoComplete="email"
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2"
                >
                  {t.contact.message}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder={t.contact.messagePh}
                  className={`w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                    form.message.length > 0 && realtimeErrors.message
                      ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
                      : "border-border hover:border-border/80"
                  }`}
                />
                {form.message.length > 0 && realtimeErrors.message && (
                  <p className="mt-1.5 text-xs font-medium text-destructive">{realtimeErrors.message}</p>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  type="submit"
                  disabled={hasErrors || submitting}
                  isLoading={submitting}
                  loadingText="Sending…"
                  className="rounded-lg px-7 py-3 h-auto text-sm font-semibold shadow-glow"
                >
                  {t.actions.sendMessage}
                  <Send className="h-4 w-4 rtl:-scale-x-100" />
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ── Reusable Field Component ── */
function Field({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
            error
              ? "border-destructive focus:ring-destructive/30 focus:border-destructive"
              : "border-border hover:border-border/80"
          }`}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
