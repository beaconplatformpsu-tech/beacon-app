"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ArrowUpRight,
  BookOpen,
  Code2,
  Compass,
  HeartHandshake,
  Lock,
  ShieldCheck,
  CalendarCheck2,
  LayoutDashboard,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────
   DATA MODEL
   Each item has a `tags` array for +40 score matches (per spec).
────────────────────────────────────────────────────────────────────────── */
type SearchItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  category: "Feature" | "Module" | "Page" | "Section";
  icon: React.ElementType;
};

type ScoredItem = SearchItem & { searchScore: number };

const ALL_ITEMS: SearchItem[] = [
  // ── Features ──────────────────────────────────────────────────────────
  {
    id: "tasks",
    title: "Academic Task Dashboard",
    description: "Centralize assignments, exams, and project deadlines with clear visibility of academic priorities.",
    tags: ["tasks", "assignments", "deadlines", "exams", "academic", "planner", "schedule"],
    href: "#features",
    category: "Feature",
    icon: CalendarCheck2,
  },
  {
    id: "skills",
    title: "Technical Skill Tracking",
    description: "Define learning goals and monitor progress across programming languages, frameworks, and dev tools.",
    tags: ["skills", "programming", "languages", "frameworks", "learning", "progress", "tech"],
    href: "#features",
    category: "Feature",
    icon: Code2,
  },
  {
    id: "career",
    title: "Career Preparation",
    description: "Structured guidance on career pathways, internships, and industry-aligned skill development.",
    tags: ["career", "internship", "job", "professional", "industry", "roadmap", "guidance"],
    href: "#features",
    category: "Feature",
    icon: Compass,
  },
  {
    id: "support",
    title: "Academic Support Corner",
    description: "Motivational reassurance, study organization, and workload management to sustain healthy habits.",
    tags: ["support", "motivation", "study", "wellbeing", "mental health", "workload", "habits"],
    href: "#features",
    category: "Feature",
    icon: HeartHandshake,
  },
  {
    id: "notes",
    title: "Secure Private Notes",
    description: "Record reflections, study plans, and personal learning notes in a private encrypted space.",
    tags: ["notes", "private", "encrypted", "journal", "reflections", "study plans", "secure"],
    href: "#features",
    category: "Feature",
    icon: Lock,
  },
  {
    id: "auth",
    title: "Authentication & Security",
    description: "Industry-grade authentication ensures protected access and trusted personal data storage.",
    tags: ["auth", "login", "security", "password", "sign in", "sign up", "access", "protected"],
    href: "#features",
    category: "Feature",
    icon: ShieldCheck,
  },

  // ── Modules ───────────────────────────────────────────────────────────
  {
    id: "mod-auth",
    title: "Authentication Module",
    description: "Secure sign-in, profile, and identity management.",
    tags: ["auth", "login", "profile", "identity", "module"],
    href: "#modules",
    category: "Module",
    icon: ShieldCheck,
  },
  {
    id: "mod-tasks",
    title: "Academic Tasks Module",
    description: "Assignments, exams, and deadline orchestration.",
    tags: ["tasks", "assignments", "exams", "deadline", "module"],
    href: "#modules",
    category: "Module",
    icon: CalendarCheck2,
  },
  {
    id: "mod-skills",
    title: "Skill Tracking Module",
    description: "Per-domain progress across languages and frameworks.",
    tags: ["skills", "tracking", "languages", "frameworks", "module"],
    href: "#modules",
    category: "Module",
    icon: Code2,
  },
  {
    id: "mod-career",
    title: "Career Path Module",
    description: "Internship guidance and professional roadmap.",
    tags: ["career", "internship", "roadmap", "professional", "module"],
    href: "#modules",
    category: "Module",
    icon: Compass,
  },
  {
    id: "mod-support",
    title: "Support Corner Module",
    description: "Reassurance, study guidance, and workload balance.",
    tags: ["support", "study", "balance", "wellbeing", "module"],
    href: "#modules",
    category: "Module",
    icon: HeartHandshake,
  },
  {
    id: "mod-notes",
    title: "Private Notes Module",
    description: "Encrypted personal reflections and study plans.",
    tags: ["notes", "private", "encrypted", "reflections", "module"],
    href: "#modules",
    category: "Module",
    icon: Lock,
  },

  // ── Pages ─────────────────────────────────────────────────────────────
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Your personal academic dashboard with stats, upcoming tasks, and AI insights.",
    tags: ["dashboard", "home", "overview", "stats", "ai", "insights"],
    href: "/dashboard",
    category: "Page",
    icon: LayoutDashboard,
  },
  {
    id: "tasks-page",
    title: "Tasks Page",
    description: "Manage all your academic tasks and deadlines in one place.",
    tags: ["tasks", "deadlines", "manage", "page"],
    href: "/tasks",
    category: "Page",
    icon: CalendarCheck2,
  },
  {
    id: "skills-page",
    title: "Skills Page",
    description: "Track your technical skill progress and learning goals.",
    tags: ["skills", "progress", "goals", "learning", "page"],
    href: "/skills",
    category: "Page",
    icon: Code2,
  },
  {
    id: "support-page",
    title: "Support Page",
    description: "Academic support resources, guidance, and motivational corner.",
    tags: ["support", "resources", "motivation", "guidance", "page"],
    href: "/support",
    category: "Page",
    icon: HeartHandshake,
  },

  // ── Sections ──────────────────────────────────────────────────────────
  {
    id: "about",
    title: "About Beacon",
    description: "Learn about the Beacon platform, its mission, and how it helps CS students.",
    tags: ["about", "mission", "platform", "beacon", "cs students"],
    href: "#about",
    category: "Section",
    icon: BookOpen,
  },
  {
    id: "contact",
    title: "Contact Us",
    description: "Get in touch with the Beacon team for questions, feedback, or partnerships.",
    tags: ["contact", "email", "feedback", "reach out", "message"],
    href: "#contact",
    category: "Section",
    icon: BookOpen,
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   WEIGHTED SEARCH ALGORITHM (per spec)
   +100  Exact title match
   +50   Partial title match (title includes term)
   +40   Match in tags array
   +10   Match in description
   Filter score = 0, sort descending by searchScore
────────────────────────────────────────────────────────────────────────── */
function computeScore(item: SearchItem, rawQuery: string): number {
  const terms = rawQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;

  let totalScore = 0;

  for (const term of terms) {
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();

    // +100 exact title match
    if (titleLower === term) {
      totalScore += 100;
    }
    // +50 partial title match
    else if (titleLower.includes(term)) {
      totalScore += 50;
    }

    // +40 for each matching tag
    for (const tag of item.tags) {
      if (tag.toLowerCase().includes(term)) {
        totalScore += 40;
        break; // only award once per term per item
      }
    }

    // +10 description match
    if (descLower.includes(term)) {
      totalScore += 10;
    }
  }

  return totalScore;
}

function runSearch(query: string): ScoredItem[] {
  if (!query.trim()) return [];
  return ALL_ITEMS
    .map((item) => ({ ...item, searchScore: computeScore(item, query) }))
    .filter((item) => item.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, 7);
}

/* ──────────────────────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────────────────────── */
const CATEGORY_STYLES: Record<string, string> = {
  Feature: "bg-primary/10 text-primary",
  Module: "bg-sky-500/10 text-sky-600",
  Page: "bg-emerald-500/10 text-emerald-600",
  Section: "bg-amber-500/10 text-amber-600",
};

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
────────────────────────────────────────────────────────────────────────── */
export function SiteSearch({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = runSearch(query);
  const isOpen = focused && query.trim().length > 0;

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Reset active index when results change */
  useEffect(() => { setActiveIndex(-1); }, [query]);

  const clear = useCallback(() => {
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, []);

  /* Keyboard navigation */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter" && activeIndex >= 0) {
      const item = results[activeIndex];
      if (item) {
        // Navigate - let the Link handle it via ref click
        const el = listRef.current?.querySelectorAll("a")[activeIndex] as HTMLAnchorElement | undefined;
        el?.click();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-lg mx-auto lg:mx-0 ${className}`}>

      {/* Search input */}
      <div
        className={`flex items-center gap-3 rounded-xl border bg-background/80 backdrop-blur px-4 py-3 shadow-sm transition-all duration-300 ${focused
            ? "border-primary/60 shadow-[0_0_0_3px_hsl(var(--primary)/0.10)]"
            : "border-border hover:border-border/70"
          }`}
      >
        <Search
          className={`h-4 w-4 shrink-0 transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search features, modules, pages…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/55 focus:outline-none"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search Beacon platform"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${results[activeIndex]?.id}` : undefined}
          role="combobox"
          aria-controls="search-results-listbox"
        />
        {query && (
          <button
            onClick={clear}
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
            aria-label="Clear search"
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div
          id="search-results-listbox"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-border bg-background/97 backdrop-blur-xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.20)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {results.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Search className="mx-auto h-8 w-8 mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No results for{" "}
                <span className="font-medium text-foreground">&quot;{query}&quot;</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">Try &quot;tasks&quot;, &quot;career&quot;, or &quot;skills&quot;</p>
            </div>
          ) : (
            <ul ref={listRef} className="divide-y divide-border/40">
              {results.map((item, idx) => {
                const Icon = item.icon;
                const isActive = idx === activeIndex;
                return (
                  <li key={item.id} id={`search-result-${item.id}`} role="option" aria-selected={isActive}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        setFocused(false);
                        setQuery("");
                      }}
                      className={`flex items-center gap-4 px-4 py-3.5 transition-colors group ${isActive ? "bg-secondary/80" : "hover:bg-secondary/50"
                        }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">{item.title}</span>
                          <span
                            className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_STYLES[item.category] ?? "bg-muted text-muted-foreground"
                              }`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                      <ArrowUpRight
                        className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground/30 group-hover:text-primary"
                          }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Keyboard hint bar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border/40 bg-muted/30">
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-border text-[9px] font-mono bg-background">↑↓</kbd>
              navigate
            </span>
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-border text-[9px] font-mono bg-background">↵</kbd>
              open
            </span>
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-border text-[9px] font-mono bg-background">Esc</kbd>
              close
            </span>
            <span className="ms-auto text-[10px] text-muted-foreground/40">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
