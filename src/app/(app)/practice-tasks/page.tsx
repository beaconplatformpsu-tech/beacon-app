"use client";

import { useState, useEffect } from "react";
import { Code, BookOpen, Clock, ArrowRight, Loader2, PlayCircle } from "lucide-react";
import { useStudentPrivateData } from "@/lib/db/services/studentDataService";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { PracticeTaskService } from "@/features/tasks/services/practiceTaskService";
import type { PracticeTask } from "@/types/database";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function PracticeTasksPage() {
  const { session } = useCurrentUserRole();
  const { activityLog } = useStudentPrivateData(session?.uid);

  const [tasks, setTasks] = useState<PracticeTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PracticeTaskService.getAllPracticeTasks(100).then(data => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  const getCompletedTasksIds = () => {
    return activityLog
      .filter(log => log.actionType === "practice_task")
      .map(log => log.entityId);
  };

  const completedIds = getCompletedTasksIds();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading practice tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <Code className="w-8 h-8 text-primary" />
          Practice Tasks
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Apply your knowledge with hands-on practice tasks and coding exercises.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-24 bg-card border border-dashed rounded-xl">
          <Code className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Practice Tasks Found</h3>
          <p className="text-muted-foreground">There are currently no practice tasks available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => {
            const isCompleted = completedIds.includes(task.id);

            return (
              <Card key={task.id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-muted text-xs">
                      {task.difficultyLevel || "All Levels"}
                    </Badge>
                    {isCompleted && (
                      <Badge variant="default" className="text-[10px] bg-green-600">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    <Link href={`/practice-tasks/${task.id}`} className="hover:text-primary transition-colors">
                      {task.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex gap-4 mt-1">
                    {task.estimatedTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.estimatedTimeMinutes} mins
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-5 pt-0 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {task.description}
                  </p>
                </CardContent>
                
                <CardFooter className="p-5 pt-0 mt-auto">
                  <Button asChild className="w-full gap-2" variant={isCompleted ? "outline" : "default"}>
                    <Link href={`/practice-tasks/${task.id}`}>
                      {isCompleted ? "Review Task" : "Start Task"}
                      {isCompleted ? <ArrowRight className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
