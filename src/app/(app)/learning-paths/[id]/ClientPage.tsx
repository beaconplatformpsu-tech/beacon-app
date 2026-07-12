"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStudentPrivateData, useStudentProfile } from "@/lib/db/services/studentDataService";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { LearningPathService } from "@/features/career/services/learningPathService";
import { LearningService } from "@/features/career/services/learningService";
import type { LearningPath, LearningPathStep } from "@/types/database";
import { ArrowLeft, CheckCircle2, Circle, Route, Clock, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCustomToast } from "@/hooks/use-custom-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LearningPathDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { session } = useCurrentUserRole();
  const { learningProgress } = useStudentPrivateData(session?.uid);
  const toast = useCustomToast();

  const [path, setPath] = useState<LearningPath | null>(null);
  const [steps, setSteps] = useState<LearningPathStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      Promise.all([
        LearningPathService.getLearningPathById(id),
        LearningPathService.getLearningPathSteps(id)
      ]).then(([pathData, stepsData]) => {
        setPath(pathData);
        setSteps(stepsData);
        setLoading(false);
      });
    }
  }, [id]);

  const progress = learningProgress[id];
  const progressPercentage = progress?.progressPercentage || 0;
  const completedStepIds = progress?.completedStepIds || [];

  const handleMarkStep = async (stepId: string) => {
    if (!session?.uid || !path) return;
    
    // Prevent un-marking for now or toggling while loading
    if (completedStepIds.includes(stepId) || updatingStep === stepId) return;

    setUpdatingStep(stepId);
    try {
      await LearningService.markStepCompleted(session.uid, path.id, stepId, steps);
      toast.success("Step Completed", "Great job! Keep going.");
    } catch (error) {
      toast.error("Update Failed", "Could not save your progress.");
    } finally {
      setUpdatingStep(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading path...</p>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="text-center py-24 bg-card border border-dashed rounded-xl max-w-3xl mx-auto mt-12">
        <Route className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Learning Path Not Found</h3>
        <p className="text-muted-foreground">This path may have been removed or does not exist.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/learning-paths")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Paths
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" /> Back to Paths
      </Button>

      <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {path.difficultyLevel && (
            <Badge variant="outline" className="bg-muted">
              {path.difficultyLevel}
            </Badge>
          )}
          {progressPercentage >= 100 && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              Completed
            </Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
          {path.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b pb-6">
          {path.estimatedDuration && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {path.estimatedDuration}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Route className="w-4 h-4" /> {steps.length} Steps
          </span>
        </div>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {path.description}
          </p>
        </div>

        <div className="pt-6">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span>Your Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2.5" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-display px-2">Path Steps</h2>
        
        {steps.length === 0 ? (
          <div className="p-8 text-center bg-card border rounded-xl text-muted-foreground">
            No steps have been added to this path yet.
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = completedStepIds.includes(step.id);
              const isUpdating = updatingStep === step.id;
              
              // A step is locked if the previous step exists and is not completed
              let isLocked = false;
              if (index > 0) {
                const prevStep = steps[index - 1];
                isLocked = !completedStepIds.includes(prevStep.id);
              }

              const stepUrl = step.type === "resource" ? `/resources/${step.resourceId}` 
                : step.type === "practice_task" ? `/practice-tasks/${step.practiceTaskId}`
                : step.type === "project" ? `/projects/${step.projectId}`
                : `/quizzes/${step.quizId}`;

              return (
                <div 
                  key={step.id} 
                  className={cn(
                    "relative flex flex-col md:flex-row gap-4 p-5 rounded-xl border bg-card transition-all",
                    isCompleted ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10" : 
                    isLocked ? "opacity-75" : "hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  <div className="flex-shrink-0 mt-1 flex items-start gap-3">
                    <button 
                      onClick={() => handleMarkStep(step.id)}
                      disabled={isCompleted || isLocked || isUpdating}
                      className={cn(
                        "rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        isCompleted ? "text-green-500 cursor-default" : 
                        isLocked ? "text-muted-foreground/30 cursor-not-allowed" : 
                        "text-muted-foreground hover:text-primary"
                      )}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <div className="font-bold text-lg text-muted-foreground w-6">
                      {index + 1}.
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <h3 className={cn(
                      "text-lg font-semibold",
                      isCompleted ? "text-foreground" : "text-foreground/90"
                    )}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center md:items-start pt-2 md:pt-0">
                    <Button 
                      variant={isCompleted ? "outline" : "default"} 
                      className="w-full md:w-auto"
                      disabled={isLocked && !isCompleted}
                      asChild
                    >
                      <Link href={stepUrl}>
                        {isCompleted ? "Review Material" : "Start Step"}
                        <PlayCircle className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
