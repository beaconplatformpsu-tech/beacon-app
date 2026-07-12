"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Code, ArrowLeft, Clock, CheckCircle2, Loader2, PlayCircle, Star } from "lucide-react";
import { useStudentPrivateData } from "@/lib/db/services/studentDataService";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { PracticeTaskService } from "@/features/tasks/services/practiceTaskService";
import type { PracticeTask } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useT } from "@/i18n/LanguageProvider";

export default function PracticeTaskDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { session } = useCurrentUserRole();
  const { activityLog } = useStudentPrivateData(session?.uid);
  const toast = useCustomToast();
  const t = useT();

  const [task, setTask] = useState<PracticeTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (id) {
      PracticeTaskService.getPracticeTaskById(id).then(data => {
        setTask(data);
        setLoading(false);
      });
    }
  }, [id]);

  const isCompleted = activityLog.some(log => log.actionType === "practice_task" && log.entityId === id);

  const handleCompleteTask = async () => {
    if (!session?.uid || !task || isCompleted) return;
    
    setCompleting(true);
    try {
      const skillId = task.skillIds && task.skillIds.length > 0 ? task.skillIds[0] : undefined;
      await PracticeTaskService.completePracticeTask(session.uid, task.id, task.title, skillId);
      toast.success("Task Completed!", "You've earned progress points.");
    } catch (error) {
      toast.error("Update Failed", "Could not save your progress.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading practice task...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-24 bg-card border border-dashed rounded-xl max-w-3xl mx-auto mt-12">
        <Code className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Practice Task Not Found</h3>
        <p className="text-muted-foreground">This task may have been removed or does not exist.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/practice-tasks")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" /> Back to Tasks
      </Button>

      <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm space-y-6 relative overflow-hidden">
        {isCompleted && (
          <div className="absolute top-0 right-0 p-8 pt-10 bg-green-500/10 rounded-bl-[100px] border-l border-b border-green-500/20">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {task.difficultyLevel && (
            <Badge variant="outline" className="border-primary/20 text-primary">
              {task.difficultyLevel}
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="default" className="bg-green-600">
              Completed
            </Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight pr-16">
          {task.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b pb-6">
          {task.estimatedTimeMinutes && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {task.estimatedTimeMinutes} mins
            </span>
          )}
          {task.skillIds && task.skillIds.length > 0 && (
            <span className="flex items-center gap-1.5 text-primary/80">
              <Star className="w-4 h-4" /> Builds Skill Progress
            </span>
          )}
        </div>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <h3 className="text-xl font-semibold mb-2">Instructions</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-8">
          <Button 
            size="lg"
            className="flex-1 gap-2"
            onClick={handleCompleteTask}
            disabled={isCompleted || completing}
            variant={isCompleted ? "outline" : "default"}
          >
            {completing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCompleted ? (
              <><CheckCircle2 className="w-4 h-4 text-green-500" /> Practice Completed</>
            ) : (
              <><PlayCircle className="w-4 h-4" /> Mark as Completed</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
