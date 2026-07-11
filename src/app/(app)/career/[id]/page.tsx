"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Target, Briefcase, CheckCircle2, Zap, GraduationCap, ChevronRight, Check, BookOpen } from "lucide-react";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useCustomToast } from "@/hooks/use-custom-toast";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { usePublicCareerPaths, usePublicSkills, useCareerPathSkills, usePublicResources } from "@/lib/db/services/publicContentService";
import { useStudentSkills, useStudentProfile, updateStudentGoal } from "@/lib/db/services/studentDataService";
import { PROFICIENCY_WEIGHTS } from "@/features/career/utils/matchScore";

export default function CareerPathDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const toast = useCustomToast();
  const { session } = useCurrentUserRole();

  const [saving, setSaving] = useState(false);

  // Data fetching
  const { careerPaths, loading: loadingPaths } = usePublicCareerPaths();
  const { skillsMap, loading: loadingSkillsMap } = usePublicSkills();
  const { careerPathSkills, loading: loadingCpSkills } = useCareerPathSkills();
  const { resources, loading: loadingRes } = usePublicResources();
  const { skills: userSkills, loading: loadingUserSkills } = useStudentSkills(session?.uid);
  const { profile, loading: loadingProfile } = useStudentProfile(session?.uid);

  const loading = loadingPaths || loadingSkillsMap || loadingCpSkills || loadingRes || loadingUserSkills || loadingProfile;

  const path = useMemo(() => careerPaths.find((p) => p.id === id), [careerPaths, id]);

  const isCurrentGoal = profile?.preferredCareerPathId === id;

  // ── Skill Gap Helpers ────────────────────────────────────────
  const gapAnalysis = useMemo(() => {
    if (!path) return { acquired: [], missing: [] };
    const required = Object.values(careerPathSkills)
      .filter((cps) => cps.careerPathId === path.id)
      .map((cps) => {
        const globalSkill = skillsMap[cps.skillId] || {};
        const userSkill = userSkills.find((us) => us.name?.toLowerCase() === globalSkill.title?.toLowerCase() || us.skillId === cps.skillId);
        const reqWeight = (cps.minimumProficiencyLevel && PROFICIENCY_WEIGHTS[cps.minimumProficiencyLevel]) || 2;
        const userWeight = userSkill ? (PROFICIENCY_WEIGHTS[userSkill.proficiency] || 1) : 0;
        return {
          ...cps, ...globalSkill,
          userHasSkill: !!userSkill,
          userProficiency: userSkill?.proficiency || "None",
          isMet: userWeight >= reqWeight,
        };
      });
    return { acquired: required.filter((r) => r.isMet), missing: required.filter((r) => !r.isMet) };
  }, [careerPathSkills, path, skillsMap, userSkills]);

  const pathResources = useMemo(() => {
    if (!path) return [];
    return resources.filter((res) => res.careerPathIds?.includes(path.id));
  }, [resources, path]);

  const handleSelectGoal = async () => {
    if (!session?.uid || !path) return;
    setSaving(true);
    try {
      await updateStudentGoal(session.uid, path.id);
      toast.success("Goal Updated", `You have selected ${path.title} as your career goal.`);
      router.push("/dashboard");
    } catch (err) {
      toast.error("Update Failed", "Could not set your career goal.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!path) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Career Path Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The career path you are looking for does not exist or has been removed.</p>
        <Button asChild><Link href="/career">Return to Career Paths</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
        <Link href="/career"><ArrowLeft className="w-4 h-4" /> Back to Careers</Link>
      </Button>

      {/* HEADER */}
      <Card className="border-border/50 shadow-sm overflow-hidden bg-card/80 backdrop-blur-sm relative">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-border/50 bg-background">{path.industryDomain}</Badge>
                {path.beginnerFriendly && <Badge className="bg-emerald-500/20 text-emerald-600 border-none">Beginner Friendly</Badge>}
              </div>
              <h1 className="text-4xl font-display font-bold text-foreground">{path.title}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">{path.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Target className="w-4 h-4 text-primary" />
                  Demand: <span className="text-foreground capitalize">{path.demandLevel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Prep time: <span className="text-foreground">{path.averagePreparationTime}</span>
                </div>
              </div>
            </div>
            
            <div className="shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-border/50 w-full md:w-auto md:pl-8 flex flex-col items-center justify-center">
              {isCurrentGoal ? (
                <div className="bg-emerald-500/10 text-emerald-600 px-6 py-4 rounded-xl border border-emerald-500/20 text-center shadow-sm">
                  <Check className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Your Current Goal</p>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  className="shadow-glow w-full md:w-auto px-8 rounded-xl"
                  onClick={handleSelectGoal}
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Select as Career Goal"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SKILL REQUIREMENTS */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <Zap className="w-5 h-5" /> Missing Skills ({gapAnalysis.missing.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gapAnalysis.missing.length === 0 ? (
              <div className="text-center p-6 bg-background rounded-xl border border-border/50">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-medium text-emerald-600">You meet all requirements!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gapAnalysis.missing.map((sk, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-background border border-border hover:border-amber-500/30 transition-colors shadow-sm">
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        {sk.title}
                        {(sk.importanceLevel === "core") && <Badge variant="destructive" className="h-[18px] text-[9px] px-1 animate-pulse">CORE</Badge>}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">Requires: {sk.minimumProficiencyLevel}</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/30">
                      {sk.userHasSkill ? `Current: ${sk.userProficiency}` : "Missing"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="w-5 h-5" /> Acquired Skills ({gapAnalysis.acquired.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gapAnalysis.acquired.length === 0 ? (
              <div className="text-center p-6 bg-background rounded-xl border border-border/50">
                <p className="text-muted-foreground text-sm">No required skills acquired yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gapAnalysis.acquired.map((sk, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm">
                    <div>
                      <h4 className="font-medium text-sm">{sk.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Requires: {sk.minimumProficiencyLevel}</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      Level: {sk.userProficiency}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RESOURCES */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Recommended Resources</CardTitle>
          <CardDescription>Hand-picked materials to help you prepare for this career.</CardDescription>
        </CardHeader>
        <CardContent>
          {pathResources.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl">
              <BookOpen className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No specific resources linked to this career path yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pathResources.map((res) => (
                <a href={res.url} target="_blank" rel="noreferrer" key={res.id} className="group p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-glow hover:-translate-y-1 transition-all">
                  <Badge variant="secondary" className="mb-2 text-[10px] uppercase font-bold text-primary bg-primary/10 border-none">{res.resourceType}</Badge>
                  <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{res.title}</h4>
                  <div className="flex items-center text-xs text-primary font-semibold mt-3 gap-1">
                    Open Resource <ChevronRight className="w-3 h-3" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
