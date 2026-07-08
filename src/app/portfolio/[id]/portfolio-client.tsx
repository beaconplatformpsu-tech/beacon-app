"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { get, ref } from "firebase/database";
import { db } from "@/lib/firebase/config";
import { Github, Linkedin, Mail, ExternalLink, Code, Briefcase, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/i18n/LanguageProvider";
import type { Task, UserSkill, UserProfile } from "@/lib/types";

// Lazy load the radar chart
const SkillRadarChart = dynamic(
  () => import("@/components/charts/SkillRadarChart").then((m) => m.SkillRadarChart),
  { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-xl" /> }
);

export default function PortfolioClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [error, setError] = useState(false);
  const t = useT();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        // Fetch User Profile
        const userSnap = await get(ref(db, `users/${id}`));
        if (!userSnap.exists()) {
          setError(true);
          setLoading(false);
          return;
        }
        setProfile(userSnap.val());

        // Fetch Skills
        const skillsSnap = await get(ref(db, `user_skills/${id}`));
        if (skillsSnap.exists()) {
          setSkills(Object.values(skillsSnap.val()));
        }

        // Fetch Tasks (Projects)
        const tasksSnap = await get(ref(db, `tasks/${id}`));
        if (tasksSnap.exists()) {
          const allTasks: Task[] = Object.values(tasksSnap.val());
          setTasks(allTasks.filter(t => t.status === "Completed"));
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold mb-2">{t.portfolio.notFoundTitle}</h1>
        <p className="text-muted-foreground mb-6">{t.portfolio.notFoundDesc}</p>
        <Link href="/" className="text-primary hover:underline">{t.portfolio.returnHome}</Link>
      </div>
    );
  }

  // Calculate radar data
  const CS_CATEGORIES = ["Languages", "Frontend & UI", "Backend & Databases", "DevOps & Cloud", "CS Fundamentals", "AI & Machine Learning"];
  const radarData = CS_CATEGORIES.map((cat) => {
    const catSkills = skills.filter((s) => s.category === cat);
    const score = catSkills.length ? catSkills.reduce((sum, s) => sum + s.progress, 0) / catSkills.length : 0;
    return { category: cat.split(" ")[0], score, fullMark: 100 };
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative bg-muted/30 border-b border-border pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
            <div className="h-32 w-32 rounded-full border-4 border-background shadow-xl overflow-hidden bg-white shrink-0 mx-auto md:mx-0">
              <Image 
                src={profile.photoURL || "/default-avatar.svg"} 
                alt={profile.displayName || "Student"} 
                width={128} 
                height={128} 
                className="h-full w-full object-cover" 
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
                  {profile.displayName || t.portfolio.defaultName}
                </h1>
                <p className="text-xl text-muted-foreground mt-2 flex items-center justify-center md:justify-start gap-2">
                  <GraduationCap className="h-5 w-5" /> {profile.major || t.portfolio.defaultMajor} &bull; {t.portfolio.classOf.replace("{year}", String(profile.graduationYear))}
                </p>
              </div>
              <p className="text-foreground/80 max-w-2xl leading-relaxed mx-auto md:mx-0">
                {profile.bio || t.portfolio.defaultBio}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                {profile.github && (
                  <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noreferrer">
                    <Badge variant="outline" className="px-3 py-1.5 hover:bg-primary/5 cursor-pointer gap-1.5 text-sm">
                      <Github className="h-4 w-4" /> GitHub
                    </Badge>
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer">
                    <Badge variant="outline" className="px-3 py-1.5 hover:bg-primary/5 cursor-pointer gap-1.5 text-sm text-blue-600 dark:text-blue-400 border-blue-500/30">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </Badge>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3">
        {/* Left Column: Skills */}
        <div className="md:col-span-1 space-y-8">
          <Card className="border-border shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" /> {t.portfolio.skillRadar}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] p-0 pt-4">
              <SkillRadarChart data={radarData} />
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t.portfolio.topSkills}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.sort((a, b) => b.progress - a.progress).slice(0, 8).map((sk, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{sk.name}</span>
                    <span className="text-muted-foreground">{sk.proficiency}</span>
                  </div>
                  <Progress value={sk.progress} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Projects */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2 border-b border-border pb-4">
            <Briefcase className="h-6 w-6 text-primary" /> {t.portfolio.projects}
          </h2>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">{t.portfolio.noProjects}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {tasks.map((task, idx) => (
                <Card key={idx} className="border-border shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{task.title}</CardTitle>
                      {task.priority === "High" && <Badge variant="default" className="text-[10px] px-1.5 h-5 shrink-0 bg-primary/20 text-primary hover:bg-primary/30">{t.portfolio.majorBadge}</Badge>}
                    </div>
                    <CardDescription className="text-xs font-medium text-muted-foreground">{task.courseName}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-foreground/80 line-clamp-3">
                      {task.description || t.portfolio.defaultProjectDesc.replace("{title}", task.title)}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4 text-xs text-muted-foreground flex items-center justify-between">
                    <span>{t.portfolio.hourLifecycle.replace("{hours}", String(task.estimatedHours))}</span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{t.portfolio.completedBadge}</Badge>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground bg-muted/20">
        <p>{t.portfolio.poweredBy}<Link href="/" className="font-semibold text-foreground hover:text-primary transition-colors">Beacon</Link></p>
      </footer>
    </div>
  );
}
