"use client";

import { useState, useEffect, useMemo } from "react";
import { Route, BookOpen, Layers, Target, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useStudentPrivateData, useStudentProfile } from "@/lib/db/services/studentDataService";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { LearningPathService } from "@/features/career/services/learningPathService";
import type { LearningPath } from "@/types/database";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useT } from "@/i18n/LanguageProvider";

export default function LearningPathsPage() {
  const { session } = useCurrentUserRole();
  const { profile } = useStudentProfile(session?.uid);
  const { learningProgress } = useStudentPrivateData(session?.uid);
  const t = useT();

  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    LearningPathService.getAllLearningPaths(100).then(data => {
      setPaths(data);
      setLoading(false);
    });
  }, []);

  // Compute recommended paths vs others
  const recommendedPaths = useMemo(() => {
    if (!profile?.preferredCareerPathId) return [];
    return paths.filter(p => p.careerPathId === profile.preferredCareerPathId);
  }, [paths, profile]);

  const otherPaths = useMemo(() => {
    if (!profile?.preferredCareerPathId) return paths;
    return paths.filter(p => p.careerPathId !== profile.preferredCareerPathId);
  }, [paths, profile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading learning paths...</p>
      </div>
    );
  }

  const renderPathCard = (path: LearningPath) => {
    const progress = learningProgress[path.id];
    const isStarted = !!progress;
    const progressPercentage = progress?.progressPercentage || 0;

    return (
      <Card key={path.id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
        <CardHeader className="p-5 pb-3">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="bg-muted text-xs">
              {path.difficultyLevel || "All Levels"}
            </Badge>
            {isStarted && (
              <Badge variant={progressPercentage >= 100 ? "default" : "secondary"} className="text-[10px]">
                {progressPercentage >= 100 ? "Completed" : "In Progress"}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg line-clamp-2">
            <Link href={`/learning-paths/${path.id}`} className="hover:text-primary transition-colors">
              {path.title}
            </Link>
          </CardTitle>
          {path.estimatedDuration && (
            <CardDescription className="flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> {path.estimatedDuration}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="p-5 pt-0 flex-1 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {path.description}
          </p>
          
          {isStarted && (
            <div className="mt-auto space-y-2 pt-2 border-t">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-medium text-foreground">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-1.5" />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-5 pt-0 mt-auto">
          <Button asChild className="w-full gap-2" variant={isStarted ? "default" : "outline"}>
            <Link href={`/learning-paths/${path.id}`}>
              {isStarted ? (progressPercentage >= 100 ? "Review Path" : "Continue Path") : "Start Path"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <Route className="w-8 h-8 text-primary" />
          Learning Paths
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Structured, step-by-step journeys designed to help you master specific skills and achieve your career goals.
        </p>
      </div>

      {paths.length === 0 ? (
        <div className="text-center py-24 bg-card border border-dashed rounded-xl">
          <Layers className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Learning Paths Found</h3>
          <p className="text-muted-foreground">There are currently no learning paths available.</p>
        </div>
      ) : (
        <>
          {recommendedPaths.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Recommended for Your Career Goal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedPaths.map(renderPathCard)}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              {recommendedPaths.length > 0 ? "Other Available Paths" : "All Learning Paths"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPaths.map(renderPathCard)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
