"use client";

import { useState, useEffect } from "react";
import { BookMarked, FolderHeart, ExternalLink, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { useStudentPrivateData } from "@/lib/db/services/studentDataService";
import { useCurrentUserRole } from "@/hooks/use-current-user-role";
import { ResourceService } from "@/features/resources/services/resourceService";
import { BookmarkService } from "@/features/resources/services/bookmarkService";
import type { Resource } from "@/features/resources/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useT } from "@/i18n/LanguageProvider";

export default function BookmarksPage() {
  const { session } = useCurrentUserRole();
  const { bookmarks, loading: bookmarksLoading } = useStudentPrivateData(session?.uid);
  const t = useT();
  
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    if (!bookmarksLoading && bookmarks.length > 0) {
      setLoadingResources(true);
      const resourceIds = bookmarks.filter(b => b.entityType === "resource").map(b => b.entityId);
      
      // Fetch resources one by one or in parallel
      Promise.all(resourceIds.map(id => ResourceService.getResourceById(id)))
        .then(results => {
          const validResources = results.filter((r): r is Resource => r !== null);
          setBookmarkedResources(validResources);
        })
        .finally(() => setLoadingResources(false));
    } else if (!bookmarksLoading && bookmarks.length === 0) {
      setBookmarkedResources([]);
    }
  }, [bookmarks, bookmarksLoading]);

  const handleRemoveBookmark = async (id: string, title: string) => {
    if (!session?.uid) return;
    await BookmarkService.toggleBookmark(session.uid, id, "resource", title);
    // UI will update optimistically because the bookmarks array from useStudentPrivateData will sync
  };

  if (bookmarksLoading || loadingResources) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <BookMarked className="w-8 h-8 text-primary" />
          My Bookmarks
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Quickly access your saved resources and projects for continuous learning.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-24 bg-card border border-dashed rounded-xl mt-8">
          <FolderHeart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            You haven&apos;t saved any resources or projects yet. Browse the library and click the bookmark icon to save items here.
          </p>
          <Button asChild>
            <Link href="/resources">
              Browse Resources <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            Saved Resources
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedResources.map(resource => (
              <Card key={resource.id} className="flex flex-col h-full hover:border-primary/50 transition-colors">
                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-muted text-xs">
                      {resource.resourceType}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    <Link href={`/resources/${resource.id}`} className="hover:text-primary transition-colors">
                      {resource.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-1">{resource.provider}</CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {resource.description}
                  </p>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex gap-2">
                  <Button asChild variant="default" size="sm" className="flex-1 text-xs">
                    <Link href={`/resources/${resource.id}`}>
                      Details
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      Open <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveBookmark(resource.id, resource.title)}
                    title="Remove Bookmark"
                  >
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {bookmarks.some(b => b.entityType === "project") && (
            <div className="mt-12 space-y-6">
              <h2 className="text-xl font-semibold">Saved Projects</h2>
              <div className="p-8 border border-dashed rounded-xl text-center">
                <p className="text-muted-foreground">Projects implementation coming soon.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
