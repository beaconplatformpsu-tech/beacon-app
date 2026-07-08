"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Search, ExternalLink, Briefcase, GraduationCap, Zap, BookOpen,
  ChevronDown, ChevronRight, CheckCircle2, AlertCircle, ArrowRight,
  Target, Sparkles, Loader2, Building, FileText,
} from "lucide-react";
import { ref, onValue, get } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { computeMatchScore, PROFICIENCY_WEIGHTS } from "@/features/career/utils/matchScore";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/LanguageProvider";
import type { CareerPath, Skill, CareerResource, UserSkill, CareerOpportunity } from "@/lib/types";
import type { CareerPathSkillType } from "@/lib/validation";

// Extended type for backwards compatibility with untyped minimumProficiencyLevel
type ExtendedCareerPathSkill = CareerPathSkillType & { minimumProficiencyLevel?: string; importanceLevel?: string; name?: string };

// ── Lazy load markdown - only needed when AI recommendation is shown ──────
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

export default function CareerPathsPage() {
  const { session } = useCurrentUserRole();
  const [search, setSearch] = useState("");
  const [sortByMatch, setSortByMatch] = useState(true);
  const t = useT();

  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [skills, setSkills] = useState<Record<string, Skill>>({});
  const [careerPathSkills, setCareerPathSkills] = useState<Record<string, ExtendedCareerPathSkill>>({});
  const [resources, setResources] = useState<Record<string, CareerResource>>({});
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [cvAnalysis, setCvAnalysis] = useState<Record<string, unknown> | null>(null);
  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // CV Upload disabled during migration 
  };
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Real-world internships state
  const [internships, setInternships] = useState<Record<string, CareerOpportunity[]>>({});
  const [loadingInternships, setLoadingInternships] = useState<Record<string, boolean>>({});

  // ── Data Fetching: static content loaded once via get(), user skills via onValue ──
  useEffect(() => {
    if (!session?.uid) return;

    // Fetch static admin-defined content once (no real-time listener needed)
    Promise.all([
      get(ref(db, "career_paths")),
      get(ref(db, "skills")),
      get(ref(db, "career_path_skills")),
      get(ref(db, "career_resources")),
    ]).then(([pathsSnap, skillsSnap, cpSkillsSnap, resSnap]) => {
      setCareerPaths(
        pathsSnap.exists()
          ? Object.keys(pathsSnap.val()).map((k) => ({ id: k, ...pathsSnap.val()[k] }))
          : []
      );
      setSkills(skillsSnap.val() || {});
      setCareerPathSkills(cpSkillsSnap.val() || {});
      setResources(resSnap.val() || {});
    });

    // User skills use onValue because the user can add skills and want to see scores update live
    const uSkillsRef = ref(db, `user_skills/${session.uid}`);
    const unsubscribe = onValue(uSkillsRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.keys(data).map((k) => ({ id: k, ...(data[k] as object) } as UserSkill));
      setUserSkills(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [session?.uid]);

  // ── Match Score Calculation (memoized helper) ────────────────────────────
  const pathsWithScores = useMemo(() => {
    return careerPaths.map((path) => ({ 
      ...path, 
      matchScore: computeMatchScore(path.id, careerPathSkills, skills, userSkills) 
    }));
  }, [careerPaths, careerPathSkills, skills, userSkills]);

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
      .filter((cps) => cps.careerPathId === pathId)
      .map((cps) => {
        const globalSkill = skills[cps.skillId] || {};
        const userSkill = userSkills.find((us) => us.name?.toLowerCase() === globalSkill.name?.toLowerCase());
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
    Object.values(resources).filter((res) => res.careerPathId === pathId);

  // ── AI Generation ────────────────────────────────────────────────────────
  const generateAiRecommendation = async () => {
    if (userSkills.length === 0) {
      setAiError(t.career.aiErrorNoSkills);
      return;
    }
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      // Supabase edge functions are disabled during migration.
      // throw new Error("AI Mentor is currently disabled during migration.");
      
      // Temporary mock response
      setTimeout(() => {
        setAiRecommendation("AI Mentor is currently disabled during migration to Firebase. This feature will be restored once the Next.js API route is ready.");
        setIsGeneratingAi(false);
      }, 1000);
      return;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setAiError(errorMessage || "Network error. Please try again.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const findInternships = async (pathId: string, pathTitle: string) => {
    setLoadingInternships((prev) => ({ ...prev, [pathId]: true }));
    try {
      // Supabase edge functions are disabled.
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
            <Target className="h-8 w-8 text-primary" /> {t.career.title}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            {t.career.subtitle}
          </p>
        </div>
      </div>

      {/* ── AI Mentor Card ── */}
      {!loading && userSkills.length > 0 && (
        <Card className="border-indigo-500/30 shadow-glow shadow-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xl">
              <Sparkles className="h-5 w-5" /> {t.career.aiMentor}
            </CardTitle>
            <CardDescription className="text-base">
              {t.career.aiMentorDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!aiRecommendation && !isGeneratingAi && (
              <Button onClick={generateAiRecommendation} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-glow shadow-indigo-500/20 rounded-xl px-6">
                <Sparkles className="h-4 w-4 mr-2" /> {t.career.analyzeProfile}
              </Button>
            )}
            {isGeneratingAi && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-medium">
                  <Loader2 className="h-5 w-5 animate-spin" /> {t.career.analyzing}
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
              <h3 className="font-semibold text-amber-700 dark:text-amber-500 text-lg">{t.career.emptyPortfolio}</h3>
              <p className="text-amber-600/80 dark:text-amber-400/80 text-sm mt-1">
                {t.career.emptyPortfolioDesc}
              </p>
            </div>
            <Link href="/skills">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 shadow-glow shadow-amber-500/20">
                {t.career.trackSkillsBtn} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input aria-label={t.career.searchPlaceholder} className="pl-10 bg-background shadow-sm border-border/50" placeholder={t.career.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center space-x-2 bg-background px-4 py-2 rounded-lg border border-border/50 shadow-sm shrink-0">
          <Switch id="sort-match" checked={sortByMatch} onCheckedChange={setSortByMatch} />
          <Label htmlFor="sort-match" className="cursor-pointer font-medium">{t.career.sortHighestMatch}</Label>
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
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{path.demandLevel} {t.career.demand}</Badge>
                      <Badge variant="outline" className="text-muted-foreground border-border/50">{path.industryDomain}</Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 md:line-clamp-none">{path.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 font-medium">
                      <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md"><GraduationCap className="h-4 w-4" /> {path.requiredEducation}</div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:w-48 bg-muted/20 md:bg-transparent p-4 md:p-0 rounded-xl">
                    <div className="text-left md:text-right w-full">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t.career.readiness}</div>
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
                    <Button variant="ghost" size="icon" className="shrink-0 rounded-full bg-background border border-border/50 shadow-sm hidden md:flex">
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/50 bg-muted/5 p-6 md:p-8 space-y-10 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Acquired Skills */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                          <CheckCircle2 className="h-5 w-5" /> {t.career.readyAttributes} ({gapAnalysis.acquired.length})
                        </h3>
                        {gapAnalysis.acquired.length > 0 ? (
                          <div className="space-y-3">
                            {gapAnalysis.acquired.map((sk, idx: number) => (
                              <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center group hover:bg-emerald-500/10 transition-colors shadow-sm">
                                <div>
                                  <div className="font-semibold text-sm flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {sk.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">{t.career.requirementMet} {sk.minimumProficiencyLevel}</div>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/30 px-3 py-1 text-xs">{t.career.level} {sk.userProficiency}</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground italic bg-background border border-border/50 rounded-lg p-4 text-center">{t.career.noCoreReqs}</div>
                        )}
                      </div>

                      {/* Missing Skills */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-500">
                          <Zap className="h-5 w-5" /> {t.career.skillGaps} ({gapAnalysis.missing.length})
                        </h3>
                        {gapAnalysis.missing.length > 0 ? (
                          <div className="space-y-3">
                            {gapAnalysis.missing.map((sk, idx: number) => (
                              <div key={idx} className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:border-amber-500/30 transition-colors">
                                <div>
                                  <div className="font-semibold text-sm flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-500" /> {sk.name}
                                    {sk.importanceLevel === "Critical" && <Badge variant="destructive" className="h-5 text-[10px] px-1.5 font-bold animate-pulse">CRITICAL</Badge>}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                    {t.career.targetLevel} <span className="font-medium text-amber-600 dark:text-amber-400">{sk.minimumProficiencyLevel}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  {sk.userHasSkill && (
                                    <div className="flex-1 sm:w-24 bg-muted h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '50%' }}></div>
                                    </div>
                                  )}
                                  <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 px-3 py-1 shrink-0">
                                    {sk.userHasSkill ? `${t.career.current} ${sk.userProficiency}` : t.career.notTracked}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-emerald-600 dark:text-emerald-400 italic bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 text-center font-medium flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> {t.career.meetAllReqs}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4 pt-6 border-t border-border/30">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-indigo-500" /> {t.career.learningPaths}
                      </h3>
                      <p className="text-sm text-muted-foreground pb-2">{t.career.learningPathsDesc}</p>
                      {pathResources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {pathResources.map((res, idx: number) => (
                            <a href={res.url} target="_blank" rel="noreferrer" key={idx} className="group block bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-glow transition-all hover:-translate-y-1">
                              {res.coverUrl && (
                                <div className="h-32 w-full overflow-hidden relative border-b border-border/50">
                                  <Image src={res.coverUrl} alt={res.title} fill className="object-cover transition-transform group-hover:scale-105 duration-700" />
                                </div>
                              )}
                              <div className="p-4 space-y-2">
                                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none">{res.resourceType}</Badge>
                                <h4 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">{res.title}</h4>
                                <div className="flex items-center text-xs text-primary gap-1 pt-2 font-semibold">{t.career.accessResource} <ExternalLink className="h-3 w-3" /></div>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic bg-background border border-border/50 rounded-lg p-6 text-center">{t.career.noResources}</div>
                      )}
                    </div>

                    {/* Real-World Internships Matcher */}
                    <div className="space-y-4 pt-6 border-t border-border/30">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Building className="h-5 w-5 text-emerald-500" /> {t.career.internships}
                          </h3>
                          <p className="text-sm text-muted-foreground">{t.career.internshipsDesc}</p>
                        </div>
                        <Button
                          onClick={() => findInternships(path.id, path.title)}
                          disabled={loadingInternships[path.id]}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-glow"
                        >
                          {loadingInternships[path.id] ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                          {t.career.findOpenRoles}
                        </Button>
                      </div>

                      {internships[path.id] && (
                        <div className="grid gap-4 md:grid-cols-3 mt-4">
                          {internships[path.id].map((job, idx) => (
                            <Card key={idx} className={`border shadow-sm flex flex-col h-full bg-background transition-colors ${!job.isVerified ? 'border-dashed border-primary/50' : 'border-border hover:border-emerald-500/30'}`}>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-2">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    {job.title} 
                                    {Boolean(job.generatedByAI) && <Sparkles className="h-4 w-4 text-primary" />}
                                  </CardTitle>
                                  <Badge className={Number(job.matchPercentage) >= 80 ? 'bg-emerald-500 hover:bg-emerald-600' : Number(job.matchPercentage) < 50 ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary'}>
                                    {job.matchPercentage}% {t.career.match}
                                  </Badge>
                                </div>
                                <CardDescription className="text-sm font-semibold flex items-center gap-1.5 text-foreground/80">
                                  <Building className="h-3.5 w-3.5" /> {job.company}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="flex-1 text-sm text-muted-foreground flex flex-col gap-2">
                                <p className="line-clamp-3">{job.description || ""}</p>
                                
                                {job.missingSkills && job.missingSkills.length > 0 && (
                                  <div className="text-xs pt-2 border-t border-border/50">
                                    <span className="font-semibold text-amber-600 dark:text-amber-500">{t.career.missing} </span>
                                    {job.missingSkills.join(", ")}
                                  </div>
                                )}
                                
                                {!job.isVerified && job.disclaimer && (
                                  <div className="text-xs pt-2 text-primary font-medium italic">
                                    {job.disclaimer}
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter className="pt-0">
                                <a href={job.applicationUrl || job.sourceUrl} target="_blank" rel="noreferrer" className="w-full">
                                  {Boolean(job.isVerified) ? (
                                    <Button variant="outline" className="w-full gap-2 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-600">
                                      {t.career.applyNow} <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  ) : (
                                    <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/10 text-primary">
                                      Search Opportunities <Search className="h-3 w-3" />
                                    </Button>
                                  )}
                                </a>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CV Readiness Integration */}
                    <div className="space-y-4 pt-6 border-t border-border/30">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" /> CV Readiness for this Career
                      </h3>
                      {cvAnalysis && cvAnalysis.targetCareerPathId === path.id ? (
                        <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl border bg-background items-center shadow-sm">
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-3">You have analyzed your CV for this role.</p>
                            <div className="flex gap-4">
                              <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                                 <span className="text-[10px] uppercase font-bold tracking-wider text-primary block mb-1">ATS Score</span>
                                 <span className="font-display font-bold text-2xl">{String(cvAnalysis.atsScore)}/100</span>
                               </div>
                               <div className="bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
                                 <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 block mb-1">Match Score</span>
                                 <span className="font-display font-bold text-2xl text-emerald-600">{String(cvAnalysis.careerMatchScore)}/100</span>
                               </div>
                            </div>
                          </div>
                          <Button asChild variant="outline" className="shrink-0 w-full sm:w-auto shadow-sm hover:bg-muted">
                            <Link href="/cv">View Full Report</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="p-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-center sm:text-left">
                            <h4 className="font-semibold text-foreground">Is your CV ready?</h4>
                            <p className="text-sm text-muted-foreground mt-1">See how your current CV stacks up against the requirements for this role.</p>
                          </div>
                          <Button asChild size="sm" className="shrink-0 w-full sm:w-auto shadow-glow">
                            <Link href="/cv">Analyze CV Now</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {sortedAndFilteredPaths.length === 0 && (
            <div className="text-center py-24 border border-dashed border-border/60 rounded-3xl bg-card/30">
              <Briefcase className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground">{t.career.noRolesFound}</h3>
              <p className="text-muted-foreground mt-2">{t.career.noPathsMatched}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
