import { CalendarCheck2, Code2, Compass, HeartHandshake, Lock, ShieldCheck } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";

export function Features() {
  const t = useT();
  const items = [
    { icon: CalendarCheck2, title: t.features.items.tasksTitle, body: t.features.items.tasksBody },
    { icon: Code2, title: t.features.items.skillTitle, body: t.features.items.skillBody },
    { icon: Compass, title: t.features.items.careerTitle, body: t.features.items.careerBody },
    { icon: HeartHandshake, title: t.features.items.supportTitle, body: t.features.items.supportBody },
    { icon: Lock, title: t.features.items.notesTitle, body: t.features.items.notesBody },
    { icon: ShieldCheck, title: t.features.items.authTitle, body: t.features.items.authBody },
  ];

  return (
    <section id="features" className="relative scroll-mt-16 py-8 md:py-12 overflow-hidden">
      <div className="pointer-events-none absolute top-10 -left-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-beam blur-3xl opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary">
            {t.features.kicker}
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl text-balance">{t.features.title}</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">{t.features.subtitle}</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md p-7 shadow-glow transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-card"
            >
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-display text-2xl tracking-tight">{title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
