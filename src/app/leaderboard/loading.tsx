import { LoadingRegion, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Chargement du classement…">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="space-y-px overflow-hidden rounded-xl border border-border">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-14 rounded-none" />
        ))}
      </div>
    </LoadingRegion>
  );
}
