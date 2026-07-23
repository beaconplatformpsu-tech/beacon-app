"use client";

import { useMemo } from "react";
import Link from "next/link";
import { 
  CheckSquare, BookOpen, Clock, Target, Plus, Search, 
  GraduationCap, Zap, Activity, FileText, ChevronRight, 
  AlertCircle, Briefcase, Award, ArrowRight, User
} from "lucide-react";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useT, useLanguage } from "@/i18n/LanguageProvider";
import { format, isPast, isToday, addHours, isWithinInterval } from "date-fns";

import { useStudentPrivateData, useStudentProfile, useStudentSkills } from "@/lib/db/services/studentDataService";
import { usePublicCareerPaths, usePublicSkills } from "@/lib/db/services/publicContentService";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentPageContainer, StudentPageHeader, EmptyState, SectionCard, StatCard } from "@/components/shared/student";

export default function DashboardPage() {
  const { session, loading: sessionLoading } = useCurrentUserRole();
  const { dir } = useLanguage();
  const t = useT();
  const tDash = t.dashboard as any;

  // Data fetching
  const { profile, loading: loadingProfile } = useStudentProfile(session?.uid);
  const { skills, loading: loadingSkills } = useStudentSkills(session?.uid);
  const { 
    tasks, careerReadiness, learningProgress, projectSubmissions, 
    activityLog, weeklyPlans, quizAttempts, loading: loadingPrivateData 
  } = useStudentPrivateData(session?.uid);

  const { careerPaths, loading: loadingCareerPaths } = usePublicCareerPaths();
  const { skillsMap, loading: loadingPublicSkills } = usePublicSkills();

  const loading = loadingProfile || loadingSkills || loadingPrivateData || loadingCareerPaths || loadingPublicSkills || sessionLoading;

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
      .slice(0, 3),
  [pendingTasks]);

  const completedTasksThisWeek = useMemo(() => {
    const oneWeekAgo = addHours(new Date(), -24 * 7);
    return tasks.filter(t => t.status === "Completed" && t.updatedAt && new Date(t.updatedAt) > oneWeekAgo).length;
  }, [tasks]);

  // Determine Next Best Action
  const nextBestAction = useMemo(() => {
    const overdueTask = overdueTasks[0];
    if (overdueTask) {
      return { 
        title: dir === 'rtl' ? "مهمة متأخرة" : "Overdue Task", 
        desc: overdueTask.title, 
        link: "/tasks", 
        reason: dir === 'rtl' ? "هذه المهمة تجاوزت الموعد النهائي." : "This task is past its deadline.",
        icon: AlertCircle,
        color: "text-destructive",
        bg: "bg-destructive/10"
      };
    }

    const dueSoon = pendingTasks.find(t => t.dueDate && isWithinInterval(new Date(t.dueDate), { start: new Date(), end: addHours(new Date(), 48) }));
    if (dueSoon) {
      return { 
        title: dir === 'rtl' ? "موعد تسليم قريب" : "Upcoming Deadline", 
        desc: dueSoon.title, 
        link: "/tasks", 
        reason: dir === 'rtl' ? "تستحق خلال 48 ساعة." : "Due within 48 hours.",
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
      };
    }

    // Check profile completion
    if (!profile?.bio || !profile?.primaryGoal || !profile?.preferredCareerPathId) {
      return { 
        title: dir === 'rtl' ? "إكمال الملف الشخصي" : "Complete Profile", 
        desc: dir === 'rtl' ? "أضف أهدافك ومسارك" : "Add goals & career path", 
        link: "/profile", 
        reason: dir === 'rtl' ? "ملف شخصي كامل يساعدنا في تخصيص تجربتك." : "A complete profile helps us personalize your experience.",
        icon: User,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
      };
    }

    // Target skill no recent activity (Simplified heuristic)
    const targetSkillIds = profile?.targetSkillIds || [];
    if (targetSkillIds.length > 0) {
      const targetSkillId = targetSkillIds[0];
      const skillName = skillsMap[targetSkillId]?.title || "a skill";
      return {
        title: dir === 'rtl' ? "تطوير مهارة" : "Develop Skill",
        desc: `${dir === 'rtl' ? "تعلم" : "Learn"} ${skillName}`,
        link: "/skills",
        reason: dir === 'rtl' ? "لم تقم بنشاط في هذه المهارة مؤخراً." : "No recent activity for this target skill.",
        icon: Zap,
        color: "text-purple-500",
        bg: "bg-purple-500/10"
      }
    }

    // Fallback
    return { 
      title: dir === 'rtl' ? "اكتشف المهارات" : "Explore Skills", 
      desc: dir === 'rtl' ? "تعلم قدرات جديدة" : "Discover new abilities", 
      link: "/skills", 
      reason: dir === 'rtl' ? "لقد أنجزت كل شيء! حان وقت النمو." : "You're all caught up! Time to grow.",
      icon: Search,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    };
  }, [overdueTasks, pendingTasks, profile, skillsMap, dir]);

  // Support Message
  const supportMessage = useMemo(() => {
    if (overdueTasks.length > 0) {
      return dir === 'rtl' ? "قم بتصحيح المهام خطوة بخطوة. لا تستسلم." : "Debug the task one small step at a time.";
    }
    if (completedTasksThisWeek > 3) {
      return dir === 'rtl' ? "التزام رائع! كل خطوة تقربك للهدف." : "One clean commit is still progress. Great job this week!";
    }
    return dir === 'rtl' ? "الاستراحة القصيرة تساعد على العودة بتركيز أعلى." : "Take a short compile break, then return to the smallest next action.";
  }, [overdueTasks.length, completedTasksThisWeek, dir]);

  // CV Readiness
  const cvReadiness = useMemo(() => {
    let score = 0;
    if (profile?.bio) score += 20;
    if (profile?.academicStage) score += 20;
    if (profile?.links?.github || profile?.links?.linkedin) score += 20;
    if (skills.length > 0) score += 20;
    if (Object.keys(projectSubmissions).length > 0) score += 20;
    return score;
  }, [profile, skills, projectSubmissions]);

  if (loading) {
    return (
      <StudentPageContainer>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl md:col-span-2" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </StudentPageContainer>
    );
  }

  return (
    <StudentPageContainer>
      {/* 4. PERSONALIZED WELCOME */}
      <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground mb-2">
            {dir === 'rtl' ? "مرحباً، " : "Welcome, "}{profile?.displayName || "Explorer"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
            {profile?.academicStage && (
              <span className="flex items-center gap-1 bg-background px-3 py-1 rounded-full border">
                <GraduationCap className="w-4 h-4" /> {profile.academicStage}
              </span>
            )}
            {profile?.primaryGoal && (
              <span className="flex items-center gap-1 bg-background px-3 py-1 rounded-full border">
                <Target className="w-4 h-4" /> {profile.primaryGoal}
              </span>
            )}
          </div>
        </div>
        {/* 12. ACADEMIC AND WELLBEING COMPANION */}
        <div className="bg-background/80 backdrop-blur border rounded-2xl p-4 max-w-sm w-full md:w-auto shadow-sm">
          <p className="text-sm font-medium italic text-foreground flex gap-2">
            <span className="text-primary text-lg leading-none">&quot;</span>
            {supportMessage}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* LEFT COLUMN */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* 5. NEXT BEST ACTION */}
          <SectionCard 
            title={dir === 'rtl' ? "الخطوة التالية الموصى بها" : "Next Best Action"} 
            className="border-primary/30 shadow-md bg-gradient-to-r from-primary/5 to-transparent"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${nextBestAction.bg} ${nextBestAction.color}`}>
                  <nextBestAction.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{nextBestAction.title}</h3>
                  <p className="text-foreground font-medium">{nextBestAction.desc}</p>
                  <p className="text-sm text-muted-foreground mt-1">{nextBestAction.reason}</p>
                </div>
              </div>
              <Button asChild className="shrink-0 rounded-xl">
                <Link href={nextBestAction.link}>
                  {dir === 'rtl' ? "تنفيذ الإجراء" : "Take Action"} 
                  <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </SectionCard>

          {/* 6. ACADEMIC OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title={dir === 'rtl' ? "المهام الأكاديمية" : "Academic Overview"} className="border-primary/20">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-amber-500">{overdueTasks.length}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">{dir === 'rtl' ? "متأخرة" : "Overdue"}</p>
                </div>
                <div className="flex-1 bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-primary">{upcomingTasks.length}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">{dir === 'rtl' ? "قريباً" : "Soon"}</p>
                </div>
                <div className="flex-1 bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-emerald-500">{completedTasksThisWeek}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">{dir === 'rtl' ? "مكتملة هذا الأسبوع" : "Done This Wk"}</p>
                </div>
              </div>

              {pendingTasks.length === 0 ? (
                <EmptyState 
                  icon={<CheckSquare className="w-8 h-8 text-muted-foreground" />}
                  title={dir === 'rtl' ? "لا يوجد مهام" : "No active tasks"}
                  description={dir === 'rtl' ? "قائمتك فارغة تماماً." : "Your task list is clear."}
                />
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "None"}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{task.priority}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* 7. SKILLS & LEARNING */}
            <SectionCard title={dir === 'rtl' ? "المهارات والتعلم" : "Skills & Learning"} className="border-primary/20">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{dir === 'rtl' ? "المهارات المستهدفة:" : "Target Skills:"}</span>
                  <span className="font-bold">{profile?.targetSkillIds?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{dir === 'rtl' ? "مهارات قيد التعلم:" : "In Progress:"}</span>
                  <span className="font-bold">{skills.filter(s => s.progress && s.progress > 0 && s.progress < 100).length}</span>
                </div>
                
                {Object.keys(learningProgress).length > 0 ? (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                      {dir === 'rtl' ? "نشاط التعلم الأخير" : "Recent Learning"}
                    </p>
                    <p className="text-sm font-medium">Path active</p>
                  </div>
                ) : (
                  <EmptyState 
                    icon={<BookOpen className="w-8 h-8 text-muted-foreground" />}
                    title={dir === 'rtl' ? "لا يوجد مسار تعلم" : "No active learning"}
                    description={dir === 'rtl' ? "ابدأ بمسار لتعلم مهارة جديدة." : "Start a path to build your skills."}
                  />
                )}
              </div>
            </SectionCard>
          </div>
          
          {/* 13. RECENT ACTIVITY */}
          <SectionCard title={dir === 'rtl' ? "النشاط الأخير" : "Recent Activity"}>
            {activityLog.length === 0 ? (
              <EmptyState 
                icon={<Activity className="w-8 h-8 text-muted-foreground" />}
                title={dir === 'rtl' ? "لا يوجد نشاط" : "No recent activity"}
                description={dir === 'rtl' ? "سجل نشاطاتك سيظهر هنا." : "Your actions will appear here."}
              />
            ) : (
              <div className="space-y-3">
                {activityLog.slice(0, 3).map(log => (
                  <div key={log.id} className="flex items-center gap-3 text-sm border-b pb-3 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                    <span className="text-muted-foreground min-w-[80px]">{log.createdAt ? format(new Date(log.createdAt), "MMM d, HH:mm") : ""}</span>
                    <span className="font-medium">{log.actionType}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* 8. CAREER PREPARATION */}
          <SectionCard title={dir === 'rtl' ? "الإعداد المهني" : "Career Preparation"}>
            {!preferredCareerPath ? (
              <EmptyState 
                icon={<Target className="w-8 h-8 text-muted-foreground" />}
                title={dir === 'rtl' ? "لم يتم تحديد مسار" : "No Path Selected"}
                description={dir === 'rtl' ? "اختر مسارك المهني لتخصيص خطتك." : "Choose a career path to tailor your plan."}
                action={<Button asChild className="rounded-xl mt-4"><Link href="/career">{dir === 'rtl' ? "تصفح المسارات" : "Explore Paths"}</Link></Button>}
              />
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-1">{dir === 'rtl' ? "المسار المختار" : "Chosen Path"}</p>
                  <p className="font-bold text-lg">{preferredCareerPath.title}</p>
                </div>
                
                {careerReadiness[preferredCareerPath.id] ? (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{dir === 'rtl' ? "الجاهزية" : "Readiness"}</span>
                      <span className="font-bold">{careerReadiness[preferredCareerPath.id].score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${careerReadiness[preferredCareerPath.id].score}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-2 bg-muted/30 rounded-lg">
                    {dir === 'rtl' ? "لم يتم حساب الجاهزية بعد. أكمل تقييمات المهارات أولاً." : "Readiness not calculated yet. Complete skill assessments to begin."}
                  </div>
                )}
                
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link href={`/career/${preferredCareerPath.id}`}>
                    {dir === 'rtl' ? "عرض المسار المهني" : "View Career Path"}
                  </Link>
                </Button>
              </div>
            )}
          </SectionCard>

          {/* 9. PROJECT & ASSESSMENT STATUS */}
          <SectionCard title={dir === 'rtl' ? "المشاريع والتقييمات" : "Projects & Assessments"}>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{dir === 'rtl' ? "آخر مشروع" : "Latest Project"}</p>
                {Object.values(projectSubmissions).length > 0 ? (
                  <p className="font-medium text-sm">Project submitted and under review.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">{dir === 'rtl' ? "لا يوجد مشاريع" : "No projects started."}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{dir === 'rtl' ? "آخر تقييم" : "Latest Quiz"}</p>
                {Object.values(quizAttempts).length > 0 ? (
                  <p className="font-medium text-sm">Recent assessment completed.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">{dir === 'rtl' ? "لم يتم إنجاز تقييمات" : "No quizzes attempted."}</p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* 10. CV READINESS */}
          <SectionCard title={dir === 'rtl' ? "جاهزية السيرة الذاتية" : "Profile Readiness for CV"}>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{dir === 'rtl' ? "اكتمال الملف" : "Profile Completion"}</span>
                <span className="font-bold">{cvReadiness}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${cvReadiness}%` }} />
              </div>
            </div>
            <Button asChild variant="outline" className="w-full text-xs">
              <Link href="/profile">
                {dir === 'rtl' ? "تحديث الملف الشخصي" : "Update Profile"}
              </Link>
            </Button>
          </SectionCard>

          {/* 11. QUICK ACTIONS */}
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm" className="rounded-xl flex-1 min-w-[120px]">
              <Link href="/tasks"><Plus className="w-4 h-4 me-1" /> {tDash?.addTask || "Add Task"}</Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="rounded-xl flex-1 min-w-[120px]">
              <Link href="/skills"><Search className="w-4 h-4 me-1" /> {tDash?.exploreSkills || "Browse Skills"}</Link>
            </Button>
            <Button asChild variant="secondary" size="sm" className="rounded-xl flex-1 min-w-[120px]">
              <Link href="/resources"><BookOpen className="w-4 h-4 me-1" /> {dir === 'rtl' ? "تصفح المصادر" : "Browse Resources"}</Link>
            </Button>
          </div>

        </div>
      </div>
    </StudentPageContainer>
  );
}
