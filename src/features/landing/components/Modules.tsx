import { ArrowUpRight } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";

export function Modules() {
  const t = useT();
  const modules = [
    { id: "01", name: t.modules.items.m1n, desc: t.modules.items.m1d },
    { id: "02", name: t.modules.items.m2n, desc: t.modules.items.m2d },
    { id: "03", name: t.modules.items.m3n, desc: t.modules.items.m3d },
    { id: "04", name: t.modules.items.m4n, desc: t.modules.items.m4d },
    { id: "05", name: t.modules.items.m5n, desc: t.modules.items.m5d },
    { id: "06", name: t.modules.items.m6n, desc: t.modules.items.m6d },
  ];

  return (
    <section id="modules" className="relative scroll-mt-16 py-8 md:py-12 overflow-hidden">
      <div className="pointer-events-none absolute top-20 right-1/3 h-72 w-72 rounded-full bg-beam blur-3xl opacity-50" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary">
              {t.modules.kicker}
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl text-balance">{t.modules.title}</h2>
          </div>
          <p className="text-muted-foreground md:max-w-md leading-relaxed">{t.modules.subtitle}</p>
        </div>

        <div className="mt-14 rounded-3xl border border-border bg-card/70 backdrop-blur-sm shadow-card overflow-hidden">
          <div className="divide-y divide-border">
            {modules.map((m) => (
              <div
                key={m.id}
                className="group relative grid grid-cols-12 items-center gap-6 py-6 px-5 md:px-8 cursor-default transition-colors hover:bg-secondary/50"
              >
                <div className="col-span-2 md:col-span-1 font-display text-2xl text-muted-foreground group-hover:text-primary transition-colors">
                  {m.id}
                </div>
                <div className="col-span-10 md:col-span-4 font-display text-2xl md:text-3xl tracking-tight">
                  {m.name}
                </div>
                <div className="col-span-12 md:col-span-6 text-muted-foreground md:text-end leading-relaxed">
                  {m.desc}
                </div>
                <div className="hidden md:flex col-span-1 justify-end">
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary rtl:-scale-x-100 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
