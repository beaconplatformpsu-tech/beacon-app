"use client";

import { useMemo } from "react";
import Link from "next/link";
import { 
  CheckSquare, BookOpen, Clock, TrendingUp, Sparkles, ChevronRight, 
  Target, LayoutDashboard, Plus, Search, AlertTriangle, GraduationCap
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
    { name: "Beginner", value: skills.filter(s => s.proficiency === "Beginner").length, color: "#94a3b8" },
    { name: "Intermediate", value: skills.filter(s => s.proficiency === "Intermediate").length, color: "#3b82f6" },
    { name: "Advanced", value: skills.filter(s => s.proficiency === "Advanced").length, color: "#8b5cf6" },
    { name: "Expert", value: skills.filter(s => s.proficiency === "Expert").length, color: "#ec4899" },
  ], [skills]);

  const latestRec = useMemo(() => recommendations[0], [recommendations]);

  const stats = useMemo(() => [
    { label: "Pending Tasks", value: loading ? "-" : pendingTasks.length, icon: CheckSquare, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Acquired Skills", value: loading ? "-" : skills.length, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Saved Notes", value: loading ? "-" : notes.length, icon: BookOpen, color: "text-sky-500", bg: "bg-sky-500/10" },
  ], [loading, pendingTasks.length, skills.length, notes.length]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" /> 
            {loading ? <Skeleton className="h-8 w-48" /> : (t.dashboard?.welcome?.replace("{name}", profile?.displayName || session?.displayName || "Student") || `Welcome back!`)}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Your academic command center. Track your progress, manage deadlines, and discover new resources.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/tasks"><Plus className="w-4 h-4" /> Add Task</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/notes"><Plus className="w-4 h-4" /> Add Note</Link>
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link href="/resources"><Search className="w-4 h-4" /> Explore Resources</Link>
          </Button>
        </div>
      </div>

      {/* NO CAREER PATH EMPTY STATE */}
      {!loading && !preferredCareerPath && (
        <Card className="bg-primary/5 border-primary/20 shadow-glow shadow-primary/10">
          <CardContent className="p-8 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-4 ring-primary/5">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Set Your Career Goal</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Select a target career path to receive personalized recommendations, skill gap analysis, and tailored learning resources.
            </p>
            <div className="flex gap-4">
              <Button asChild className="shadow-glow"><Link href="/career">Explore Career Paths</Link></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SELECTED CAREER PATH SUMMARY */}
      {!loading && preferredCareerPath && (
        <Card className="border-emerald-500/30 shadow-sm bg-gradient-to-r from-emerald-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" /> Current Career Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{preferredCareerPath.title}</h3>
                <p className="text-muted-foreground">{preferredCareerPath.industryDomain}</p>
              </div>
              <Button variant="outline" asChild size="sm" className="hidden sm:flex border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
                <Link href={`/career/${preferredCareerPath.id}`}>View Details <ChevronRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ACADEMIC HUD */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                {loading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ACTION CENTER */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full border shadow-sm">
            <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" /> Urgent Action Center
              </CardTitle>
              <Button variant="ghost" size="sm" asChild aria-label="View all urgent tasks">
                <Link href="/tasks">View All <ChevronRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <CheckSquare className="w-10 h-10 mb-2 opacity-50" />
                  <p>You&apos;re all caught up! No pending tasks.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {overdueTasks.map(task => (
                    <div key={task.id} className="p-4 px-6 flex items-center justify-between bg-destructive/5 hover:bg-destructive/10 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <h4 className="font-semibold text-destructive">{task.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{task.courseName} • Due {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "Unknown"}</p>
                      </div>
                      <Badge variant="destructive">Overdue</Badge>
                    </div>
                  ))}
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="p-4 px-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div>
                        <h4 className="font-medium text-foreground">{task.title}</h4>
                        <p className="text-xs text-muted-foreground">{task.courseName} • Due {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "Unknown"}</p>
                      </div>
                      <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "default" : "secondary"}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR: NEXT STEPS & SKILLS */}
        <div className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="border-b px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-emerald-500" /> Skill Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <Skeleton className="h-[200px] w-full rounded-xl" />
              ) : skills.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  Add skills to see your progress chart.
                </div>
              ) : (
                <div className="h-[250px]">
                  <ProficiencyChart data={proficiencyData} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-amber-500" /> Intelligent Next Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : latestRec ? (
                <div className="space-y-4 mt-2">
                  <p className="text-sm font-medium">{latestRec.explanation}</p>
                  
                  {latestRec.missingSkills && latestRec.missingSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {latestRec.missingSkills.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>
                      ))}
                    </div>
                  )}
                  
                  <Button asChild size="sm" className="w-full mt-2 shadow-glow">
                    <Link href="/recommendations">View Full Plan</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Keep working on your skills! I&apos;ll recommend resources when you need them.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
