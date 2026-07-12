"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FolderGit2, ArrowLeft, Clock, Loader2, Link as LinkIcon, Github } from "lucide-react";
import { useStudentPrivateData } from "@/lib/db/services/studentDataService";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { ProjectService } from "@/features/tasks/services/projectService";
import { BookmarkService } from "@/features/resources/services/bookmarkService";
import type { Project, ProjectSubmission } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCustomToast } from "@/hooks/use-custom-toast";

export default function ProjectDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { session } = useCurrentUserRole();
  const { projectSubmissions, bookmarks } = useStudentPrivateData(session?.uid);
  const toast = useCustomToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const existingSubmission = projectSubmissions[id];

  useEffect(() => {
    if (id) {
      ProjectService.getProjectById(id).then(data => {
        setProject(data);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (existingSubmission) {
      setGithubUrl(existingSubmission.githubUrl || "");
      setLiveUrl(existingSubmission.liveUrl || "");
    }
  }, [existingSubmission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.uid || !project) return;
    
    setSubmitting(true);
    try {
      await ProjectService.submitProjectWork(session.uid, project.id, {
        githubUrl,
        liveUrl,
        status: "pending_review"
      });
      toast.success("Project Submitted", "Your work has been saved successfully.");
    } catch (error) {
      toast.error("Submission Failed", "Could not save your project.");
    } finally {
      setSubmitting(false);
    }
  };

  const isBookmarked = bookmarks.some(b => b.entityId === id);

  const handleToggleBookmark = async () => {
    if (!session?.uid || !project) return;
    await BookmarkService.toggleBookmark(session.uid, project.id, "project", project.title);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-24 bg-card border border-dashed rounded-xl max-w-3xl mx-auto mt-12">
        <FolderGit2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Project Not Found</h3>
        <p className="text-muted-foreground">This project may have been removed or does not exist.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/projects")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Button>

      <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {project.difficultyLevel && (
              <Badge variant="outline" className="border-primary/20 text-primary">
                {project.difficultyLevel}
              </Badge>
            )}
            {existingSubmission && (
              <Badge variant="default" className="bg-green-600">
                Submitted
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleBookmark}
            className={isBookmarked ? "text-primary bg-primary/10" : "text-muted-foreground"}
          >
            {isBookmarked ? "Bookmarked" : "Bookmark Project"}
          </Button>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
          {project.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b pb-6">
          {project.estimatedHours && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {project.estimatedHours} hours
            </span>
          )}
        </div>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <h3 className="text-xl font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>

          {project.requirements && project.requirements.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mt-8 mb-4">Requirements</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                {project.requirements.map((req: string, i: number) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm space-y-6 mt-8">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold font-display">Submit Your Work</h2>
          <p className="text-muted-foreground mt-1">Share the repository and live demo of your completed project.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="githubUrl" className="flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub Repository URL
              </Label>
              <Input 
                id="githubUrl" 
                placeholder="https://github.com/yourusername/project" 
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="liveUrl" className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Live Demo URL (Optional)
              </Label>
              <Input 
                id="liveUrl" 
                placeholder="https://your-project.vercel.app" 
                value={liveUrl}
                onChange={e => setLiveUrl(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full md:w-auto min-w-[200px]">
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {existingSubmission ? "Update Submission" : "Submit Project"}
          </Button>
        </form>
      </div>
    </div>
  );
}
