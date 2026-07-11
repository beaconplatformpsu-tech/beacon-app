"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search, ExternalLink, Briefcase, GraduationCap, Zap, BookOpen,
  ChevronDown, ChevronRight, CheckCircle2, AlertCircle, ArrowRight,
  Target, Sparkles, Loader2, Building, FileText,
} from "lucide-react";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { computeMatchScore, PROFICIENCY_WEIGHTS } from "@/features/career/utils/matchScore";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/LanguageProvider";

// DB Services
import { usePublicCareerPaths, usePublicSkills, useCareerPathSkills, usePublicResources } from "@/lib/db/services/publicContentService";
import { useStudentSkills } from "@/lib/db/services/studentDataService";

// Lazy load markdown
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

export default function CareerPathsPage() {
  const { session } = useCurrentUserRole();
  const t = useT();

  const [search, setSearch] = useState("");
  const [sortByMatch, setSortByMatch] = useState(true);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  // Data fetching
  const { careerPaths, loading: loadingPaths } = usePublicCareerPaths();
  const { skillsMap, loading: loadingSkillsMap } = usePublicSkills();
  const { careerPathSkills, loading: loadingCpSkills } = useCareerPathSkills();
  const { resources, loading: loadingRes } = usePublicResources();
  const { skills: userSkills, loading: loadingUserSkills } = useStudentSkills(session?.uid);

  const loading = loadingPaths || loadingSkillsMap || loadingCpSkills || loadingRes || loadingUserSkills;

  const [cvAnalysis, setCvAnalysis] = useState<Record<string, unknown> | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Real-world internships state
  const [internships, setInternships] = useState<Record<string, any[]>>({});
  const [loadingInternships, setLoadingInternships] = useState<Record<string, boolean>>({});

  // ── Match Score Calculation (memoized helper) ────────────────────────────
  const pathsWithScores = useMemo(() => {
    if (loading) return [];
    return careerPaths.map((path) => ({ 
      ...path, 
      matchScore: computeMatchScore(path.id, careerPathSkills, skillsMap, userSkills) 
    }));
  }, [careerPaths, careerPathSkills, skillsMap, userSkills, loading]);

  const sortedAndFilteredPaths = useMemo(() => {
    const filtered = pathsWithScores.filter(
      (p) =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.industryDomain?.toLowerCase().includes(search.toLowerCase())
    );
    return sortByMatch
      ? [...filtered].sort((a, b) => b.matchScore - a.matchScore)
      : [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }, [pathsWithScores, search, sortByMatch]);

  // ── Skill Gap + Resources Helpers ────────────────────────────────────────
  const getSkillsGapAnalysis = (pathId: string) => {
    const required = Object.values(careerPathSkills)
      .filter((cps) => cps.careerPathId === pathId && (cps.importanceLevel === "core" || cps.importanceLevel === "important"))
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
  };

  const getResourcesForPath = (pathId: string) =>
    resources.filter((res) => res.careerPathIds?.includes(pathId));

  // ── AI Generation ────────────────────────────────────────────────────────
  const generateAiRecommendation = async () => {
    if (userSkills.length === 0) {
      setAiError(t.career?.aiErrorNoSkills || "Add some skills to your profile first.");
      return;
    }
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      setTimeout(() => {
        setAiRecommendation("AI Mentor is currently disabled during migration. This feature will be restored once the Next.js API route is ready.");
        setIsGeneratingAi(false);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setAiError(errorMessage || "Network error. Please try again.");
      setIsGeneratingAi(false);
    }
  };

  const findInternships = async (pathId: string, pathTitle: string) => {
    setLoadingInternships((prev) => ({ ...prev, [pathId]: true }));
    try {
      throw new Error("AI Internship generation is disabled during migration.");
    } catch (error) {
      console.error("Internship generation error", error);
    } finally {
      setLoadingInternships((prev) => ({ ...prev, [pathId]: false }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" /> {t.career?.title || "Career Paths"}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            {t.career?.subtitle || "Discover tech careers that match your skills."}
          </p>
        </div>
      </div>

      {/* ── AI Mentor Card ── */}
      {!loading && userSkills.length > 0 && (
        <Card className="border-indigo-500/30 shadow-glow shadow-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xl">
              <Sparkles className="h-5 w-5" /> {t.career?.aiMentor || "AI Career Mentor"}
            </CardTitle>
            <CardDescription className="text-base">
              {t.career?.aiMentorDesc || "Get personalized career recommendations based on your current skill profile."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!aiRecommendation && !isGeneratingAi && (
              <Button onClick={generateAiRecommendation} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-glow shadow-indigo-500/20 rounded-xl px-6">
                <Sparkles className="h-4 w-4 mr-2" /> {t.career?.analyzeProfile || "Analyze Profile"}
              </Button>
            )}
            {isGeneratingAi && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-medium">
                  <Loader2 className="h-5 w-5 animate-spin" /> {t.career?.analyzing || "Analyzing..."}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-indigo-500/10" />
                  <Skeleton className="h-4 w-5/6 bg-indigo-500/10" />
                  <Skeleton className="h-4 w-4/6 bg-indigo-500/10" />
                </div>
              </div>
            )}
            {aiError && (
              <div className="text-red-600 dark:text-red-400 text-sm font-medium p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" /> {aiError}
              </div>
            )}
            {aiRecommendation && (
              <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400 prose-a:text-indigo-500 prose-strong:text-indigo-700 dark:prose-strong:text-indigo-300 bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-indigo-500/20 shadow-sm mt-2">
                <ReactMarkdown>{aiRecommendation}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && userSkills.length === 0 && (
        <Card className="bg-amber-500/10 border-amber-500/20 shadow-none">
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-700 dark:text-amber-500 text-lg">{t.career?.emptyPortfolio || "Your skill portfolio is empty"}</h3>
              <p className="text-amber-600/80 dark:text-amber-400/80 text-sm mt-1">
                {t.career?.emptyPortfolioDesc || "Add skills to get an accurate match score."}
              </p>
            </div>
            <Link href="/skills">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 shadow-glow shadow-amber-500/20">
                {t.career?.trackSkillsBtn || "Track Skills"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input aria-label={t.career?.searchPlaceholder || "Search..."} className="pl-10 bg-background shadow-sm border-border/50" placeholder={t.career?.searchPlaceholder || "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2 bg-background px-4 py-2 rounded-lg border border-border/50 shadow-sm shrink-0">
          <Switch id="sort-match" checked={sortByMatch} onCheckedChange={setSortByMatch} />
          <Label htmlFor="sort-match" className="cursor-pointer font-medium">{t.career?.sortHighestMatch || "Sort by match"}</Label>
        </div>
      </div>

      {/* ── Career Path Cards ── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl border border-border/50" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedAndFilteredPaths.map((path) => {
            const isExpanded = expandedPath === path.id;
            const gapAnalysis = getSkillsGapAnalysis(path.id);
            const pathResources = getResourcesForPath(path.id);

            let scoreColor = "text-primary";
            let scoreBg = "bg-primary";
            let borderGlow = "hover:border-primary/40 hover:shadow-glow";
            if (path.matchScore >= 80) { scoreColor = "text-emerald-500"; scoreBg = "bg-emerald-500"; borderGlow = "hover:border-emerald-500/40 hover:shadow-glow shadow-emerald-500/10"; }
            else if (path.matchScore < 40) { scoreColor = "text-amber-500"; scoreBg = "bg-amber-500"; borderGlow = "hover:border-amber-500/40"; }

            return (
              <Card key={path.id} className={`overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-300 ${borderGlow} ${isExpanded ? "ring-1 ring-primary/20 shadow-glow" : ""}`}>
                <div className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6" onClick={() => setExpandedPath(isExpanded ? null : path.id)}>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-foreground">{path.title}</h2>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{path.demandLevel} {t.career?.demand || "Demand"}</Badge>
                      <Badge variant="outline" className="text-muted-foreground border-border/50">{path.industryDomain}</Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 md:line-clamp-none">{path.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 font-medium">
                      <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md"><GraduationCap className="h-4 w-4" /> {path.requiredEducation}</div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:w-48 bg-muted/20 md:bg-transparent p-4 md:p-0 rounded-xl">
                    <div className="text-left md:text-right w-full">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t.career?.readiness || "Readiness"}</div>
                      <div className={`text-4xl font-display font-bold ${scoreColor}`}>{path.matchScore}%</div>
                      <div className="relative h-2.5 mt-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${path.matchScore >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                              path.matchScore < 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                                'bg-gradient-to-r from-primary/70 to-primary'
                            }`}
                          style={{ width: `${path.matchScore}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="hidden md:flex">
                        <Link href={`/career/${path.id}`} onClick={(e) => e.stopPropagation()}>Details</Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="shrink-0 rounded-full bg-background border border-border/50 shadow-sm hidden md:flex">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/50 bg-muted/5 p-6 md:p-8 space-y-10 animate-in slide-in-from-top-2 fade-in duration-300">
                    
                    <div className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm border border-border">
                      <div>
                        <h4 className="font-bold">Explore Full Path Details</h4>
                        <p className="text-sm text-muted-foreground">See a deep dive into required skills, practice tasks, and more.</p>
                      </div>
                      <Button asChild>
                        <Link href={`/career/${path.id}`}>View Full Details <ArrowRight className="w-4 h-4 ml-2" /></Link>
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Acquired Skills */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                          <CheckCircle2 className="h-5 w-5" /> {t.career?.readyAttributes || "Acquired Core Skills"} ({gapAnalysis.acquired.length})
                        </h3>
                        {gapAnalysis.acquired.length > 0 ? (
                          <div className="space-y-3">
                            {gapAnalysis.acquired.map((sk, idx: number) => (
                              <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center group hover:bg-emerald-500/10 transition-colors shadow-sm">
                                <div>
                                  <div className="font-semibold text-sm flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {sk.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">{t.career?.requirementMet || "Req met:"} {sk.minimumProficiencyLevel}</div>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/30 px-3 py-1 text-xs">{t.career?.level || "Level:"} {sk.userProficiency}</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground italic bg-background border border-border/50 rounded-lg p-4 text-center">{t.career?.noCoreReqs || "No core requirements met yet."}</div>
                        )}
                      </div>

                      {/* Missing Skills */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-500">
                          <Zap className="h-5 w-5" /> {t.career?.skillGaps || "Missing Core Skills"} ({gapAnalysis.missing.length})
                        </h3>
                        {gapAnalysis.missing.length > 0 ? (
                          <div className="space-y-3">
                            {gapAnalysis.missing.map((sk, idx: number) => (
                              <div key={idx} className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:border-amber-500/30 transition-colors">
                                <div>
                                  <div className="font-semibold text-sm flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-500" /> {sk.title}
                                    {(sk.importanceLevel === "core") && <Badge variant="destructive" className="h-5 text-[10px] px-1.5 font-bold animate-pulse">CRITICAL</Badge>}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                    {t.career?.targetLevel || "Target level:"} <span className="font-medium text-amber-600 dark:text-amber-400">{sk.minimumProficiencyLevel}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  {sk.userHasSkill && (
                                    <div className="flex-1 sm:w-24 bg-muted h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '50%' }}></div>
                                    </div>
                                  )}
                                  <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 px-3 py-1 shrink-0">
                                    {sk.userHasSkill ? `${t.career?.current || "Current"} ${sk.userProficiency}` : (t.career?.notTracked || "Not Tracked")}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-emerald-600 dark:text-emerald-400 italic bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 text-center font-medium flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> {t.career?.meetAllReqs || "You meet all requirements!"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {sortedAndFilteredPaths.length === 0 && (
            <div className="text-center py-24 border border-dashed border-border/60 rounded-3xl bg-card/30">
              <Briefcase className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground">{t.career?.noRolesFound || "No paths found"}</h3>
              <p className="text-muted-foreground mt-2">{t.career?.noPathsMatched || "Try adjusting your search criteria."}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
