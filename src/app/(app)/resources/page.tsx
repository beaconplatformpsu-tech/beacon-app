"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, BookOpen, Loader2 } from "lucide-react";
import { ResourceService } from "@/features/resources/services/resourceService";
import { ResourceCard } from "@/features/resources/components/ResourceCard";
import type { Resource } from "@/features/resources/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/i18n/LanguageProvider";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();
  
  // Filters
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [onlyFree, setOnlyFree] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (selectedType !== "all") {
      ResourceService.getResourcesByType(selectedType).then(data => {
        setResources(data);
        setLoading(false);
      });
    } else {
      ResourceService.getAllResources(100).then(data => {
        setResources(data);
        setLoading(false);
      });
    }
  }, [selectedType]);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      if (search && !res.title.toLowerCase().includes(search.toLowerCase()) && !res.provider?.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedType !== "all" && res.resourceType !== selectedType) return false;
      if (selectedLevel !== "all" && res.difficultyLevel !== selectedLevel) return false;
      if (onlyFree && !res.isFree) return false;
      return true;
    });
  }, [resources, search, selectedType, selectedLevel, onlyFree]);

  // We can't generate uniqueTypes from just the subset of loaded resources if it's limited to 100 or filtered by type.
  // Hardcoding the types array based on standard library types is safer and avoids massive DB reads just for dropdown options.
  const uniqueTypes = [
    { label: "Documentation", value: "documentation" },
    { label: "Course", value: "course" },
    { label: "Article", value: "article" },
    { label: "Tool", value: "tool" },
    { label: "Practice", value: "practice" },
    { label: "Guide", value: "guide" },
    { label: "Roadmap", value: "roadmap" },
    { label: "Template", value: "template" },
    { label: "Checklist", value: "checklist" },
  ];
  
  const uniqueLevels = [
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
    { label: "Expert", value: "expert" },
    { label: "All Levels", value: "all_levels" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            {t.resources.title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {t.resources.description}
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-4 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">{t.resources.filterResources}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              aria-label={t.resources.searchPlaceholder}
              placeholder={t.resources.searchPlaceholder}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder={t.resources.resourceType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.resources.allTypes}</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger>
              <SelectValue placeholder={t.resources.audienceLevel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.resources.allLevels}</SelectItem>
              {uniqueLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 border rounded-md px-3 h-10">
            <Switch id="free-mode" checked={onlyFree} onCheckedChange={setOnlyFree} />
            <Label htmlFor="free-mode" className="cursor-pointer font-normal text-sm">{t.resources.freeOnly}</Label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-24 bg-card border border-dashed rounded-xl">
          <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t.resources.noResources}</h3>
          <p className="text-muted-foreground">{t.resources.noResourcesDesc}</p>
          <Button variant="outline" className="mt-4" onClick={() => {
            setSearch("");
            setSelectedType("all");
            setSelectedLevel("all");
            setOnlyFree(false);
          }}>
            {t.resources.clearFilters}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
