"use client";

import { useEffect, useRef, useState } from "react";
import { Users, BookOpen, Code2, Award } from "lucide-react";

type StatItem = {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  color: string;
  bg: string;
};

const STATS: StatItem[] = [
  { icon: Users, value: 200, suffix: "+", label: "Active Students", color: "text-primary", bg: "bg-primary/10" },
  { icon: BookOpen, value: 1200, suffix: "+", label: "Tasks Managed", color: "text-sky-600", bg: "bg-sky-500/10" },
  { icon: Code2, value: 50, suffix: "+", label: "Skills Tracked", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  { icon: Award, value: 95, suffix: "%", label: "Satisfaction Rate", color: "text-amber-600", bg: "bg-amber-500/10" },
];

function useCountUp(target: number, started: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, started, duration]);
  return count;
}

function StatCard({ stat, started }: { stat: StatItem; started: boolean }) {
  const count = useCountUp(stat.value, started);
  const Icon = stat.icon;
  return (
    <div className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow text-center">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color} ring-1 ring-current/20 group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className={`text-3xl font-bold font-display tracking-tight ${stat.color}`}>
          {count.toLocaleString("en-US")}{stat.suffix}
        </p>
        <p className="mt-1 text-sm text-muted-foreground font-medium">{stat.label}</p>
      </div>
    </div>
  );
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-8 md:py-12 overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary">
            By the numbers
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-4xl text-balance">
            Trusted by CS students across the region
          </h2>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            Beacon is growing fast. Here is a snapshot of what our community has achieved together.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  );
}
