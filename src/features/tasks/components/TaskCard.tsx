"use client";

import { Check, Clock, Trash2, Calendar, CheckSquare, BookOpen, Code2, GraduationCap, FileText, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import type { Task } from "../types";
import { useT } from "@/i18n/LanguageProvider";

// ─── Utility helpers (collocated - no global leakage needed) ───────────────

export function getCategoryConfig(category: string) {
  switch (category) {
    case "Algorithms & Data Structures":
      return { icon: Code2, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" };
    case "Course Project":
      return { icon: Lightbulb, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    case "Exam Preparation":
      return { icon: GraduationCap, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
    case "Homework/Assignment":
      return { icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    case "Research/Reading":
      return { icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    default:
      return { icon: CheckSquare, color: "text-muted-foreground", bg: "bg-muted", border: "border-border" };
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "High": return "bg-red-500/10 text-red-500 border-red-500/20";
    case "Medium": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "Low": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    default: return "bg-muted text-muted-foreground";
  }
}

// ─── Component ────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onUpdateProgress: (taskId: string, newProgress: number) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskCard({ task, onUpdateProgress, onDelete }: TaskCardProps) {
  const t = useT();
  const catConfig = getCategoryConfig(task.category || "");
  const CatIcon = catConfig.icon;
  const isDone = task.progress === 100;

  return (
    <Card
      className={`flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden ${isDone ? "opacity-75" : "shadow-sm border-border/50"
        }`}
    >
      {/* Decorative background gradient */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 ${catConfig.bg.replace("/10", "")}`}
      />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={`${catConfig.bg} ${catConfig.color} ${catConfig.border} font-medium border`}
              >
                <CatIcon className="w-3 h-3 mr-1.5" /> {t.tasks.categories[task.category as keyof typeof t.tasks.categories] || task.category}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {t.tasks.priorities[task.priority as keyof typeof t.tasks.priorities] || task.priority}
              </Badge>
            </div>
            <CardTitle
              className={`text-xl leading-tight mt-2 ${isDone ? "line-through text-muted-foreground" : ""}`}
            >
              {task.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-sm font-medium text-foreground/70">
              <span className="truncate">{task.courseName}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" /> {task.estimatedHours}{t.tasks.hrs}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-end relative z-10 mt-auto pt-4 border-t border-border/40 bg-muted/10">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Calendar className="h-4 w-4" />
              <span
                className={
                  new Date(task.dueDate) < new Date() && !isDone
                    ? "text-destructive font-semibold"
                    : ""
                }
              >
                {t.tasks.due} {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
            <span className={`text-sm font-bold ${isDone ? "text-emerald-500" : "text-primary"}`}>
              {task.progress}%
            </span>
          </div>

          <div className="space-y-3">
            <Slider
              aria-label={t.tasks.slideProgress}
              defaultValue={[task.progress]}
              max={100}
              step={5}
              onValueCommit={(val) => onUpdateProgress(task.id, val[0])}
              className={isDone ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            />
            <Progress
              value={task.progress}
              className={`h-1.5 ${isDone ? "bg-emerald-500/20" : ""}`}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isDone ? (
              <div className="text-emerald-500 text-sm font-medium flex items-center bg-emerald-500/10 px-3 py-1.5 rounded-full w-full justify-center">
                <Check className="h-4 w-4 mr-2" /> {t.tasks.completed}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center w-full">
                {t.tasks.slideProgress}
              </p>
            )}
            <Button
              aria-label={t.actions.delete}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

