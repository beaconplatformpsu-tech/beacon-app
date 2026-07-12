"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ResourceService } from "@/features/resources/services/resourceService";
import { BookmarkService } from "@/features/resources/services/bookmarkService";
import { useStudentPrivateData } from "@/lib/db/services/studentDataService";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import type { Resource } from "@/features/resources/types";
import { ArrowLeft, BookOpen, Clock, ExternalLink, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useT } from "@/i18n/LanguageProvider";

export default function ResourceDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { session } = useCurrentUserRole();
  const { bookmarks } = useStudentPrivateData(session?.uid);
  const toast = useCustomToast();
  const t = useT();

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      ResourceService.getResourceById(id).then(data => {
        setResource(data);
        setLoading(false);
      });
    }
  }, [id]);

  const isBookmarked = bookmarks.some(b => b.entityId === id);

  const handleToggleBookmark = async () => {
    if (!session?.uid || !resource) return;
    setIsSaving(true);
    try {
      const nowBookmarked = await BookmarkService.toggleBookmark(
        session.uid,
        resource.id,
        "resource",
        resource.title
      );
      if (nowBookmarked) {
        toast.success(t.resources.saved, `${resource.title} saved to bookmarks.`);
      } else {
        toast.info("Bookmark Removed", `${resource.title} removed from bookmarks.`);
      }
    } catch (error) {
      toast.error(t.contact.error, "Failed to update bookmark.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading resource...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-24 bg-card border border-dashed rounded-xl max-w-3xl mx-auto mt-12">
        <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Resource Not Found</h3>
        <p className="text-muted-foreground">This resource may have been removed or does not exist.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/resources")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" className="gap-2 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={resource.isFree ? "default" : "secondary"}>
            {resource.isFree ? t.resources.free : t.resources.paid}
          </Badge>
          <Badge variant="outline" className="bg-muted">
            {resource.resourceType}
          </Badge>
          {resource.difficultyLevel && (
            <Badge variant="outline" className="border-primary/20 text-primary">
              {resource.difficultyLevel}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
          {resource.title}
        </h1>
        
        {resource.provider && (
          <p className="text-lg text-muted-foreground font-medium">
            Provided by {resource.provider}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b pb-6">
          {resource.estimatedDuration && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {resource.estimatedDuration}
            </span>
          )}
        </div>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <h3 className="text-xl font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {resource.description}
          </p>
        </div>

        {resource.tags && resource.tags.length > 0 && (
          <div className="pt-4">
            <h4 className="text-sm font-semibold mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-8">
          <Button asChild size="lg" className="flex-1 gap-2 shadow-glow">
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              Open Resource <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
          
          {session?.uid && (
            <Button 
              size="lg"
              variant={isBookmarked ? "secondary" : "outline"}
              className="flex-1 gap-2"
              onClick={handleToggleBookmark}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isBookmarked ? (
                <><BookmarkCheck className="w-4 h-4 text-primary" /> Saved to Bookmarks</>
              ) : (
                <><Bookmark className="w-4 h-4" /> Bookmark</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
