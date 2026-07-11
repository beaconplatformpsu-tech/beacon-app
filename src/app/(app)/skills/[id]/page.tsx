"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Code, Trophy, AlertCircle, PlayCircle, ExternalLink } from "lucide-react";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

import { usePublicSkills, usePublicResources } from "@/lib/db/services/publicContentService";
import { useStudentSkills } from "@/lib/db/services/studentDataService";

export default function SkillDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { session } = useCurrentUserRole();

  const { skills: publicSkills, loading: loadingPublicSkills } = usePublicSkills();
  const { resources, loading: loadingResources } = usePublicResources();
  const { skills: userSkills, loading: loadingUserSkills } = useStudentSkills(session?.uid);

  const loading = loadingPublicSkills || loadingResources || loadingUserSkills;

  const skill = useMemo(() => publicSkills.find((s) => s.id === id), [publicSkills, id]);
  
  const userSkill = useMemo(() => {
    if (!skill) return null;
    return userSkills.find((us) => us.skillId === skill.id || us.name.toLowerCase() === skill.title.toLowerCase());
  }, [skill, userSkills]);

  const skillResources = useMemo(() => {
    if (!skill) return [];
    return resources.filter((res) => res.skillIds?.includes(skill.id));
  }, [resources, skill]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Skill Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The skill you are looking for does not exist or has been removed.</p>
        <Button asChild><Link href="/skills">Return to Skills</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
        <Link href="/skills"><ArrowLeft className="w-4 h-4" /> Back to My Skills</Link>
      </Button>

      {/* HEADER */}
      <Card className="border-border/50 shadow-sm overflow-hidden bg-card/80 backdrop-blur-sm relative">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-border/50 bg-background">{skill.categoryId || "General"}</Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none capitalize">{skill.difficultyLevel?.replace("_", " ")}</Badge>
              </div>
              <h1 className="text-4xl font-display font-bold text-foreground flex items-center gap-3">
                <Code className="h-8 w-8 text-primary" /> {skill.title}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">{skill.description}</p>
              
              {skill.tags && skill.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {skill.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs bg-muted/30">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* User Progress Box */}
            <div className="shrink-0 w-full md:w-64 bg-card rounded-xl p-6 border border-border shadow-sm flex flex-col justify-center items-center text-center">
              <Trophy className={`w-8 h-8 mb-2 ${userSkill?.proficiency === 'Expert' ? 'text-emerald-500' : 'text-primary'}`} />
              <div className="text-sm text-muted-foreground font-medium mb-1">Your Proficiency</div>
              <div className="text-2xl font-bold mb-4">{userSkill ? userSkill.proficiency : "Not Tracked"}</div>
              
              {userSkill ? (
                <div className="w-full">
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span>Progress</span>
                    <span>{userSkill.progress}%</span>
                  </div>
                  <Progress value={userSkill.progress} className="h-2" />
                </div>
              ) : (
                <Button asChild size="sm" className="w-full">
                  <Link href="/skills">Add to Portfolio</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RESOURCES */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Learning Resources
          </CardTitle>
          <CardDescription>Recommended materials to master {skill.title}.</CardDescription>
        </CardHeader>
        <CardContent>
          {skillResources.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl">
              <PlayCircle className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No specific resources linked to this skill yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {skillResources.map((res) => (
                <a href={res.url} target="_blank" rel="noreferrer" key={res.id} className="group p-4 bg-background rounded-xl border border-border shadow-sm hover:border-primary/30 transition-all flex justify-between items-center">
                  <div>
                    <Badge variant="secondary" className="mb-2 text-[10px] uppercase font-bold text-primary bg-primary/10 border-none">{res.resourceType}</Badge>
                    <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{res.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{res.provider} • {res.difficultyLevel?.replace("_", " ")}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 ml-4" />
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
