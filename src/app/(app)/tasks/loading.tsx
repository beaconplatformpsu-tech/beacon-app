import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown by Next.js automatically while the tasks page bundle is loading.
 */
export default function TasksLoading() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56 rounded-lg" />
          <Skeleton className="h-5 w-80 rounded-md" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-md" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[280px] w-full rounded-2xl border border-border/50" />
        ))}
      </div>
    </div>
  );
}
