import { Sparkles } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";

export function About() {
  const t = useT();
  return (
    <section id="about" className="relative scroll-mt-16 py-8 md:py-12 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-beam blur-3xl opacity-50" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="relative rounded-3xl border border-border bg-card/70 backdrop-blur-sm p-8 md:p-14 shadow-card overflow-hidden">
          <div className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary">
                {t.about.kicker}
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl text-balance leading-[1.1]">
                {t.about.title}
              </h2>
              <div className="mt-8 hidden md:flex items-center gap-3 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{t.about.tag}</span>
              </div>
            </div>
            <div className="md:col-span-7 space-y-6 text-muted-foreground leading-relaxed text-[15px]">
              <p>{t.about.p1}</p>
              <p>
                <span className="text-foreground font-medium">Beacon</span> {t.about.p2a}
              </p>
              <blockquote className="mt-8 rounded-2xl border-l-2 border-primary bg-secondary/40 pl-6 pr-4 py-5 font-display text-2xl md:text-3xl text-foreground italic leading-snug">
                {t.about.quote}
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
