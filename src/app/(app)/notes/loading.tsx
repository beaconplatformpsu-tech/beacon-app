import { Skeleton } from "@/components/ui/skeleton";

export default function NotesLoading() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar skeleton */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-card/50 border border-border/50 rounded-2xl p-4 h-full space-y-2">
          <Skeleton className="h-6 w-32 rounded-md mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
      {/* Main area skeleton */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex justify-between items-center gap-4 shrink-0">
          <div className="space-y-2">
            <Skeleton className="h-9 w-40 rounded-lg" />
            <Skeleton className="h-5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl border border-border/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
