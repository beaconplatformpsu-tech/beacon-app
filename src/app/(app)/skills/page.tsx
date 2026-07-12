"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search, Plus, Code, Trophy, BrainCircuit } from "lucide-react";
import { ref, push, remove, update, set } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { createNotification } from "@/hooks/use-notifications";
import { useStudentSkills } from "@/lib/db/services/studentDataService";
import { SkillCard } from "./_components/SkillCard";
import { SkillDialog } from "./_components/SkillDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category, UserSkill } from "@/lib/types";
import { useT } from "@/i18n/LanguageProvider";


const SkillRadarChart = dynamic(
  () => import("@/components/charts/SkillRadarChart").then((m) => m.SkillRadarChart),
  { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-xl" /> }
);

const CS_CATEGORIES: string[] = [
  "Languages",
  "Frontend & UI",
  "Backend & Databases",
  "DevOps & Cloud",
  "CS Fundamentals",
  "AI & Machine Learning",
];

export default function SkillsPage() {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const { skills, loading } = useStudentSkills(session?.uid);
  const t = useT();
  const [search, setSearch] = useState("");
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);

  const radarData = useMemo(() =>
    CS_CATEGORIES.map((cat) => {
      const catSkills = skills.filter((s) => s.category === cat);
      const score = catSkills.length
        ? catSkills.reduce((sum, s) => sum + (s.progress || 0), 0) / catSkills.length
        : 0;
      return { category: cat.split(" ")[0], score, fullMark: 100 };
    }),
    [skills]
  );

  const filteredSkills = useMemo(
    () => skills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [skills, search]
  );

  const strongestDomain = useMemo(
    () => radarData.length ? radarData.reduce((prev, cur) => (prev.score > cur.score ? prev : cur)).category : "None",
    [radarData]
  );

  const handleAddSkill = async (skill: Partial<UserSkill>) => {
    if (!skill.name) {
      toast.warning(t.skills.missingFields, t.skills.missingFieldsDesc);
      return;
    }
    try {
      await push(ref(db, `user_private/${session?.uid}/user_skills`), {
        ...skill,
        progress: parseInt(skill.progress?.toString() || "0", 10),
        createdAt: new Date().toISOString(),
      });
      toast.success(t.skills.toastAdded, t.skills.toastAddedDesc);
    } catch {
      toast.error(t.skills.toastError, t.skills.toastAddFail);
    }
  };

  const handleUpdateProgress = async (skillId: string, currentProgress: number, amount: number) => {
    const newProgress = Math.min(100, Math.max(0, currentProgress + amount));
    const profMap = [[100, "Expert"], [75, "Advanced"], [25, "Intermediate"], [0, "Beginner"]] as const;
    const proficiency = profMap.find(([min]) => newProgress >= min)?.[1] ?? "Beginner";
    const skill = skills.find((s) => s.id === skillId);
    try {
      await update(ref(db, `user_private/${session?.uid}/user_skills/${skillId}`), {
        progress: Number(newProgress),
        proficiency,
        lastPracticed: new Date().toISOString(),
      });
      if (newProgress === 100 && currentProgress < 100 && skill && session?.uid) {
        toast.success(t.skills.toastMastery, `${t.skills.toastAddedDesc.replace('portfolio has been updated', 'mastered ' + skill.name)}`);
        await createNotification(session.uid, {
          title: t.skills.toastMastery,
          message: `${t.skills.toastAddedDesc} ${skill.name}`,
          type: "success",
        });
      }
    } catch {
      toast.error(t.skills.toastError, t.skills.toastUpdateFail);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await remove(ref(db, `user_private/${session?.uid}/user_skills/${skillId}`));
      toast.info(t.skills.toastRemoved, t.skills.toastRemovedDesc);
    } catch {
      toast.error(t.skills.toastError, t.skills.toastDeleteFail);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <Code className="h-8 w-8 text-primary" /> {t.skills.title}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            {t.skills.subtitle}
          </p>
        </div>
        <SkillDialog onSave={handleAddSkill}>
          <Button size="lg" className="shadow-glow whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl px-6">
            <Plus className="mr-2 h-5 w-5" /> {t.skills.addSkill}
          </Button>
        </SkillDialog>
      </div>


      {!loading && skills.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 shadow-glow border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 blur-3xl bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="pb-0 relative z-10">
              <CardTitle className="text-lg">{t.skills.skillRadar}</CardTitle>
              <CardDescription>{t.skills.visualBreakdown}</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] relative z-10 p-0 pt-4">
              <SkillRadarChart data={radarData} />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20 shadow-sm flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" /> {t.skills.masteredSkills}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">
                  {skills.filter((s) => s.proficiency === "Expert").length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20 shadow-sm flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-amber-500" /> {t.skills.totalTracked}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">{skills.length}</div>
              </CardContent>
            </Card>

            <Card className="col-span-2 bg-card/80 backdrop-blur-md border-border/50 shadow-glow flex flex-col justify-center relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-32 h-32 blur-3xl bg-emerald-500/10 rounded-full translate-x-1/4 translate-y-1/4" />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.skills.strongestDomain}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-emerald-500">{strongestDomain}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label={t.skills.searchPlaceholder}
            className="pl-10 bg-background shadow-sm border-border/50 w-full"
            placeholder={t.skills.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl border border-border/50" />
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border rounded-2xl bg-card/50 flex flex-col items-center justify-center">
          <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Code className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-xl font-medium text-foreground">{t.skills.portfolioEmpty}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            {search
              ? t.skills.noSearchMatch
              : t.skills.startTracking}
          </p>
          {!search && (
            <Button variant="outline" className="mt-6 border-primary/20 hover:bg-primary/5">
              <Plus className="h-4 w-4 mr-2" /> {t.skills.trackFirstSkill}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onUpdateProgress={handleUpdateProgress}
              onDelete={async (id) => { setSkillToDelete(id); }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!skillToDelete}
        onClose={() => setSkillToDelete(null)}
        onConfirm={() => {
          if (skillToDelete) {
            handleDeleteSkill(skillToDelete);
            setSkillToDelete(null);
          }
        }}
        title={t.tasks.deleteTitle}
        description={t.tasks.deleteDesc}
        confirmText={t.tasks.delete}
        cancelText={t.tasks.cancel}
      />
    </div>
  );
}

