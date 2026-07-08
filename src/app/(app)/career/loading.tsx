import { Skeleton } from "@/components/ui/skeleton";

export default function CareerLoading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="space-y-2">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <Skeleton className="h-5 w-full max-w-lg rounded-md" />
      </div>
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-md rounded-md" />
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl border border-border/50" />
        ))}
      </div>
    </div>
  );
}
