import React from "react";
import { Resource } from "../types";
import { ExternalLink, BookOpen, Clock, Video, Code, FileText, CheckSquare, Presentation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useState } from "react";
import { BookmarkService } from "../services/bookmarkService";
import { db } from "@/lib/firebase/config";
import { useT } from "@/i18n/LanguageProvider";

const TypeIcon = ({ type }: { type: Resource["resourceType"] }) => {
  switch (type) {
    case "Course":
      return <Video className="w-4 h-4" />;
    case "Documentation":
    case "Article":
      return <FileText className="w-4 h-4" />;
    case "Practice":
      return <Code className="w-4 h-4" />;
    case "Checklist":
    case "Roadmap":
      return <CheckSquare className="w-4 h-4" />;
    default:
      return <Presentation className="w-4 h-4" />;
  }
};

import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";

export const ResourceCard = ({ resource, isBookmarked = false }: { resource: Resource, isBookmarked?: boolean }) => {
  const { session } = useCurrentUserRole();
  const toast = useCustomToast();
  const t = useT();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToPlan = async () => {
    if (!session?.uid) return;
    setIsSaving(true);
    try {
      const isNowBookmarked = await BookmarkService.toggleBookmark(
        session.uid, 
        resource.id, 
        "resource", 
        resource.title
      );
      
      if (isNowBookmarked) {
        toast.success(t.resources.saved, t.resources.savedDesc.replace("{title}", resource.title));
      } else {
        toast.info("Bookmark Removed", `${resource.title} removed from bookmarks.`);
      }
    } catch (e) {
      toast.error(t.contact.error, "Failed to toggle bookmark.");
    } finally {
      setIsSaving(false);
    }
  };

  // Safe fallback UI components
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">

      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Badge variant={resource.isFree ? "default" : "secondary"} className="text-xs">
            {resource.isFree ? t.resources.free : t.resources.paid}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            <TypeIcon type={resource.resourceType} />
            <span className="ml-1 font-medium">{resource.resourceType}</span>
          </div>
        </div>
        <CardTitle className="text-base line-clamp-2">
          <Link href={`/resources/${resource.id}`} className="hover:text-primary transition-colors">
            {resource.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm font-medium text-foreground/80">
          {resource.provider}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {resource.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mt-auto">
          {resource.tags?.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {resource.tags && resource.tags.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-dashed">
              +{resource.tags.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 border-t pt-2">
          {resource.difficultyLevel && (
            <span>• {resource.difficultyLevel}</span>
          )}
          {resource.estimatedDuration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {resource.estimatedDuration}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2 flex flex-wrap">
        <Button asChild className="flex-1 min-w-[100px] gap-2" variant="outline" size="sm">
          <Link href={`/resources/${resource.id}`}>
            Details
          </Link>
        </Button>
        <Button asChild className="flex-1 min-w-[100px] gap-2" variant="outline" size="sm">
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            {t.resources.open} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
        
        {session?.uid && (
          <Button 
            onClick={handleSaveToPlan} 
            disabled={isSaving}
            className="flex-1 min-w-[100px] gap-2"
            variant={isBookmarked ? "secondary" : "default"}
            size="sm"
          >
            {isSaving ? <span className="animate-pulse">...</span> : isBookmarked ? <><BookmarkCheck className="w-3.5 h-3.5" /> Saved</> : <><Bookmark className="w-3.5 h-3.5" /> Save</>}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
