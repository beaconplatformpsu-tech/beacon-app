const team = [
  { name: "Ghada Salem", id: "443770004" },
  { name: "Ameera Fahad", id: "443770019" },
  { name: "Noura Ali", id: "443770322" },
];

export function Team() {
  return (
    <section id="team" className="relative py-24 md:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <span className="text-xs uppercase tracking-[0.25em] text-accent">The team</span>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Built by students, for students.</h2>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Final year project - Engineering Department of Computer and Information,
          College of Engineering in Wadi Addawasir, Prince Sattam Bin Abdulaziz University.
        </p>

        <div className="mt-12 grid sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden shadow-card">
          {team.map(t => (
            <div key={t.id} className="bg-card p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/30 font-display text-xl text-accent">
                {t.name.split(" ").map(p => p[0]).join("")}
              </div>
              <div className="mt-5 font-display text-2xl">{t.name}</div>
              <div className="text-sm text-muted-foreground mt-1">ID · {t.id}</div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Supervised by <span className="text-foreground">Dr. Tahmeena Fatima</span>
        </p>
      </div>
    </section>
  );
}
