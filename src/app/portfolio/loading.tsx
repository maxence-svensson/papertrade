import { LoadingRegion, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Chargement du portefeuille…">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
    </LoadingRegion>
  );
}
