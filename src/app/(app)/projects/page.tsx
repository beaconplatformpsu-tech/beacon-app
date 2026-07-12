"use client";

import { useState, useEffect } from "react";
import { FolderGit2, Clock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useStudentPrivateData } from "@/lib/db/services/studentDataService";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { ProjectService } from "@/features/tasks/services/projectService";
import type { Project } from "@/types/database";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useT } from "@/i18n/LanguageProvider";

export default function ProjectsPage() {
  const { session } = useCurrentUserRole();
  const { projectSubmissions } = useStudentPrivateData(session?.uid);
  const t = useT();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProjectService.getAllProjects(100).then(data => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <FolderGit2 className="w-8 h-8 text-primary" />
          Projects
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Build portfolio-ready projects to demonstrate your skills and knowledge to future employers.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 bg-card border border-dashed rounded-xl">
          <FolderGit2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
          <p className="text-muted-foreground">There are currently no projects available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const submission = projectSubmissions[project.id];
            const isSubmitted = !!submission;

            return (
              <Card key={project.id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-muted text-xs">
                      {project.difficultyLevel || "All Levels"}
                    </Badge>
                    {isSubmitted && (
                      <Badge variant="default" className="text-[10px] bg-green-600">
                        Submitted
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    <Link href={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                      {project.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex gap-4 mt-1">
                    {project.estimatedHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {project.estimatedHours} hours
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-5 pt-0 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                </CardContent>
                
                <CardFooter className="p-5 pt-0 mt-auto">
                  <Button asChild className="w-full gap-2" variant={isSubmitted ? "secondary" : "default"}>
                    <Link href={`/projects/${project.id}`}>
                      {isSubmitted ? "Update Submission" : "View Project Details"}
                      <ArrowRight className="w-4 h-4" />
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
