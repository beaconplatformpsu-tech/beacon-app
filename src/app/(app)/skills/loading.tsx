import { Skeleton } from "@/components/ui/skeleton";

export default function SkillsLoading() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-5 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="lg:col-span-1 h-64 rounded-2xl" />
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className={`h-28 rounded-xl ${i === 2 ? "col-span-2" : ""}`} />
          ))}
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-md" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl border border-border/50" />
        ))}
      </div>
    </div>
  );
}
