"use client";

import { Trophy, Trash2, ArrowUpRight, Code, Briefcase, Server, Cloud, BrainCircuit, Library } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Skill } from "@/lib/types";
import { useT } from "@/i18n/LanguageProvider";

export function getCategoryConfig(category: string) {
  switch (category) {
    case "Languages":          return { icon: Code,        color: "text-blue-500",    bg: "bg-blue-500/10" };
    case "Frontend & UI":      return { icon: Briefcase,   color: "text-pink-500",    bg: "bg-pink-500/10" };
    case "Backend & Databases":return { icon: Server,      color: "text-emerald-500", bg: "bg-emerald-500/10" };
    case "DevOps & Cloud":     return { icon: Cloud,       color: "text-sky-500",     bg: "bg-sky-500/10" };
    case "CS Fundamentals":    return { icon: Library,     color: "text-amber-500",   bg: "bg-amber-500/10" };
    case "AI & Machine Learning": return { icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-500/10" };
    default:                   return { icon: Code,        color: "text-primary",     bg: "bg-primary/10" };
  }
}

export function getProficiencyColor(proficiency: string) {
  switch (proficiency) {
    case "Expert":       return "text-emerald-500";
    case "Advanced":     return "text-primary";
    case "Intermediate": return "text-amber-500";
    default:             return "text-muted-foreground";
  }
}

interface SkillCardProps {
  skill: any;
  onUpdateProgress: (skillId: string, current: number, amount: number) => Promise<void>;
  onDelete: (skillId: string) => Promise<void>;
}

export function SkillCard({ skill, onUpdateProgress, onDelete }: SkillCardProps) {
  const config = getCategoryConfig(skill.category);
  const Icon = config.icon;
  const isExpert = skill.proficiency === "Expert";
  const t = useT();

  return (
    <Card
      className={`transition-all hover:-translate-y-1 overflow-hidden relative ${
        isExpert
          ? "border-emerald-500/30 shadow-glow shadow-emerald-500/10"
          : "hover:shadow-glow hover:border-primary/30 border-border/50 bg-card/80 backdrop-blur-sm"
      }`}
    >
      {isExpert && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
      )}

      <CardHeader className="pb-2 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`${config.bg} ${config.color} p-2 rounded-xl ring-1 ring-inset ring-current/20`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{skill.name}</CardTitle>
              <CardDescription className="text-xs">{t.skills.domains[skill.category as keyof typeof t.skills.domains] || skill.category}</CardDescription>
            </div>
          </div>
          <Button
            aria-label={t.actions.delete}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(skill.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="mt-4 mb-2 flex justify-between items-end text-sm">
          <span className={`font-semibold flex items-center gap-1.5 ${getProficiencyColor(skill.proficiency)}`}>
            {isExpert && <Trophy className="h-3.5 w-3.5" />} {t.skills.proficiencies[skill.proficiency as keyof typeof t.skills.proficiencies] || skill.proficiency}
          </span>
          <span className="font-mono text-muted-foreground">{skill.progress}%</span>
        </div>
        <Progress value={skill.progress} className={`h-2 ${isExpert ? "bg-emerald-500/20" : ""}`} />

        <div className="mt-6 flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-medium">{t.skills.practiceSession}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 bg-background hover:bg-accent"
              onClick={() => onUpdateProgress(skill.id, skill.progress, 5)}
              disabled={isExpert}
            >
              +5% <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 bg-background hover:bg-accent"
              onClick={() => onUpdateProgress(skill.id, skill.progress, 15)}
              disabled={isExpert}
            >
              +15% <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

