"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n/LanguageProvider";

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function TaskFilters({ search, onSearchChange, sortBy, onSortChange }: TaskFiltersProps) {
  const t = useT();
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10 bg-card"
          placeholder={t.tasks.searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <select
          className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="dueDate">{t.tasks.sortBy} {t.tasks.dueDate}</option>
          <option value="priority">{t.tasks.sortBy} {t.tasks.priority}</option>
          <option value="progress">{t.tasks.sortBy} {t.tasks.progress}</option>
          <option value="status">{t.tasks.sortBy} {t.tasks.status}</option>
        </select>
      </div>
    </div>
  );
}
