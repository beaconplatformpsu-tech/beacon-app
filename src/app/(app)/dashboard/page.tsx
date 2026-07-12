"use client";

import { useMemo } from "react";
import Link from "next/link";
import { 
  CheckSquare, BookOpen, Clock, TrendingUp, Sparkles, ChevronRight, 
  Target, LayoutDashboard, Plus, Search, AlertTriangle, GraduationCap, Award, Crown, Zap, Flame
} from "lucide-react";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useT } from "@/i18n/LanguageProvider";
import dynamic from "next/dynamic";
import { format, isPast, isToday } from "date-fns";

// New DB Services
import { useStudentPrivateData, useStudentSkills, useStudentProfile } from "@/lib/db/services/studentDataService";
import { usePublicCareerPaths } from "@/lib/db/services/publicContentService";

// UI Components
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProficiencyChart = dynamic(() => import("@/components/charts/ProficiencyChart"), { 
  ssr: false, 
  loading: () => <Skeleton className="h-full w-full rounded-xl" /> 
});

export default function DashboardPage() {
  const { session } = useCurrentUserRole();
  const t = useT();
  const tDash = t.dashboard as any;

  // Data fetching
  const { profile, loading: loadingProfile } = useStudentProfile(session?.uid);
  const { skills, loading: loadingSkills } = useStudentSkills(session?.uid);
  const { tasks, notes, recommendations, careerReadiness, loading: loadingPrivateData } = useStudentPrivateData(session?.uid);
  const { careerPaths, loading: loadingCareerPaths } = usePublicCareerPaths();

  const loading = loadingProfile || loadingSkills || loadingPrivateData || loadingCareerPaths;

  // Derived Data
  const preferredCareerPath = useMemo(() => {
    if (!profile?.preferredCareerPathId) return null;
    return careerPaths.find(p => p.id === profile.preferredCareerPathId) || null;
  }, [profile, careerPaths]);

  const pendingTasks = useMemo(() => tasks.filter(t => t.status !== "Completed"), [tasks]);
  
  const overdueTasks = useMemo(() => 
    pendingTasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))),
  [pendingTasks]);
  
  const upcomingTasks = useMemo(() => 
    pendingTasks
      .filter(t => t.dueDate && !isPast(new Date(t.dueDate)))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4),
  [pendingTasks]);

  const proficiencyData = useMemo(() => [
    { name: tDash?.beginner || "Beginner", value: skills.filter(s => s.proficiency === "Beginner").length, color: "#94a3b8" },
    { name: tDash?.intermediate || "Intermediate", value: skills.filter(s => s.proficiency === "Intermediate").length, color: "#3b82f6" },
    { name: tDash?.advanced || "Advanced", value: skills.filter(s => s.proficiency === "Advanced").length, color: "#8b5cf6" },
    { name: tDash?.expert || "Expert", value: skills.filter(s => s.proficiency === "Expert").length, color: "#ec4899" },
  ], [skills, tDash]);

  const latestRec = useMemo(() => recommendations[0], [recommendations]);

  const completedTasksCount = tasks.length - pendingTasks.length;
  
  // Gamification Logic
  const totalXP = useMemo(() => (skills.length * 100) + (completedTasksCount * 50), [skills.length, completedTasksCount]);
  const level = useMemo(() => Math.floor(totalXP / 500) + 1, [totalXP]);
  const xpProgress = totalXP % 500;
  const progressPercent = (xpProgress / 500) * 100;

  const stats = useMemo(() => [
    { label: tDash?.pendingTasks || "Active Quests", value: loading ? "-" : pendingTasks.length, icon: Flame, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: tDash?.acquiredSkills || "Skills Mastered", value: loading ? "-" : skills.length, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: tDash?.savedNotes || "Knowledge Found", value: loading ? "-" : notes.length, icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  ], [loading, pendingTasks.length, skills.length, notes.length, tDash]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      {/* HERO LEVEL BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-indigo-600 p-8 text-white shadow-2xl shadow-primary/20 mb-8 border border-white/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner">
              <Crown className="h-12 w-12 text-yellow-300 drop-shadow-md" />
              <div className="absolute -bottom-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-950 border-2 border-white shadow-lg">
                Lvl {level}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">
                {loading ? <Skeleton className="h-8 w-48 bg-white/20" /> : (tDash?.welcome?.replace("{name}", profile?.displayName || session?.displayName || "Explorer") || `Welcome back, Explorer!`)}
              </h1>
              <p className="mt-2 text-white/80 max-w-lg">
                {tDash?.commandCenter || "Ready for your next quest? Keep learning and climbing the ranks!"}
              </p>
            </div>
          </div>
          
          <div className="flex-1 w-full md:max-w-xs bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-white/90">Level Progress</span>
              <span className="text-yellow-300 font-bold">{xpProgress} / 500 XP</span>
            </div>
            <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-sm"></div>
              </div>
            </div>
            <p className="text-xs text-white/60 mt-2 text-right">
              {500 - xpProgress} XP to Level {level + 1}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button asChild variant="outline" size="sm" className="gap-2 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border hover:bg-primary/10 hover:border-primary/30 transition-all hover:scale-105">
          <Link href="/tasks"><Plus className="w-4 h-4" /> {tDash?.addTask || "New Quest"}</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-border hover:bg-primary/10 hover:border-primary/30 transition-all hover:scale-105">
          <Link href="/notes"><Plus className="w-4 h-4" /> {tDash?.addNote || "Save Knowledge"}</Link>
        </Button>
        <Button asChild size="sm" className="gap-2 rounded-xl shadow-glow hover:scale-105 transition-all">
          <Link href="/resources"><Search className="w-4 h-4" /> {tDash?.exploreResources || "Discover Resources"}</Link>
        </Button>
      </div>

      {/* NO CAREER PATH EMPTY STATE */}
      {!loading && !preferredCareerPath && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-8 text-center mb-8 shadow-xl shadow-indigo-500/5 group hover:border-indigo-500/40 transition-colors">
          <div className="h-20 w-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all duration-500">
            <Target className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{tDash?.setCareerGoal || "Choose Your Class & Destiny"}</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            {tDash?.setCareerGoalDesc || "Select a target career path to unlock personalized skill trees, customized quests, and tailored learning resources."}
          </p>
          <Button asChild className="rounded-xl shadow-glow shadow-indigo-500/30"><Link href="/career">{tDash?.exploreCareerPaths || "Explore Career Paths"}</Link></Button>
        </div>
      )}

      {/* SELECTED CAREER PATH SUMMARY */}
      {!loading && preferredCareerPath && (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 shadow-xl shadow-emerald-500/5 bg-gradient-to-r from-emerald-500/10 via-background to-background p-6 mb-8 hover:border-emerald-500/50 transition-colors">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> Chosen Destiny
              </p>
              <h3 className="text-2xl font-bold text-foreground">{preferredCareerPath.title}</h3>
              <p className="text-muted-foreground">{preferredCareerPath.industryDomain}</p>
            </div>
            <Button variant="outline" asChild size="sm" className="hidden sm:flex rounded-xl border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
              <Link href={`/career/${preferredCareerPath.id}`}>View Map <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      )}

      {/* ACADEMIC HUD */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className={`relative overflow-hidden rounded-3xl border bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${stat.border}`}>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                {loading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-3xl font-black">{stat.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ACTION CENTER */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden h-full">
            <div className="border-b border-border/50 px-6 py-4 flex flex-row items-center justify-between bg-black/5 dark:bg-white/5">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Flame className="w-5 h-5 text-amber-500" /> Active Quests
              </h2>
              <Button variant="ghost" size="sm" asChild aria-label="View all urgent tasks" className="rounded-xl">
                <Link href="/tasks">View All <ChevronRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <CheckSquare className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium text-foreground">You&apos;re all caught up!</p>
                  <p className="text-sm">Enjoy your downtime, or pick up a new skill.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {overdueTasks.map(task => (
                    <div key={task.id} className="p-4 px-6 flex items-center justify-between bg-destructive/10 hover:bg-destructive/20 transition-colors cursor-pointer group">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 h-3 w-3 rounded-full bg-destructive animate-pulse" />
                        <div>
                          <h4 className="font-bold text-destructive group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{task.title}</h4>
                          <p className="text-xs text-destructive/70 font-medium">{task.courseName} • Critical: Due {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "Unknown"}</p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="rounded-full animate-bounce shadow-glow shadow-destructive/50">Urgent</Badge>
                    </div>
                  ))}
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="p-4 px-6 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 h-3 w-3 rounded-full ${task.priority === "High" ? "bg-amber-500" : task.priority === "Medium" ? "bg-sky-500" : "bg-emerald-500"}`} />
                        <div>
                          <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{task.title}</h4>
                          <p className="text-xs text-muted-foreground font-medium">{task.courseName} • Time Left: Due {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "Unknown"}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="rounded-full bg-background">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* SIDEBAR: NEXT STEPS & SKILLS */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="border-b border-border/50 px-6 py-4 bg-emerald-500/5">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Target className="w-5 h-5 text-emerald-500" /> Skill Mastery
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <Skeleton className="h-[200px] w-full rounded-2xl" />
              ) : skills.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-sm text-center">
                  <Zap className="w-8 h-8 mb-2 opacity-50" />
                  <p>Equip skills to unlock<br/>your mastery chart.</p>
                </div>
              ) : (
                <div className="h-[250px]">
                  <ProficiencyChart data={proficiencyData} />
                </div>
              )}
            </div>
          </div>

          <div className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-amber-500/5 shadow-xl shadow-amber-500/5 overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
            <div className="border-b border-amber-500/20 px-6 py-4 relative z-10">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Sparkles className="w-5 h-5 text-amber-500" /> Intelligent Next Step
              </h2>
            </div>
            <div className="p-6 relative z-10">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </div>
              ) : latestRec ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium leading-relaxed">{latestRec.explanation}</p>
                  
                  {latestRec.missingSkills && latestRec.missingSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {latestRec.missingSkills.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-[10px] rounded-full border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Button asChild size="sm" className="w-full mt-4 rounded-xl shadow-glow shadow-amber-500/30 hover:scale-105 transition-transform bg-amber-500 hover:bg-amber-600 text-white">
                    <Link href="/recommendations">Accept Mission</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6">
                  Keep grinding! I&apos;ll reveal new missions and resources when you&apos;re ready.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
