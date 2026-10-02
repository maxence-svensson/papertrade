import { LoadingRegion, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Chargement du graphique…">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-7 w-52" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-[360px] sm:h-[460px]" />
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <Skeleton className="h-12" />
          <Skeleton className="h-5" />
          <Skeleton className="h-12" />
          <Skeleton className="h-20" />
          <Skeleton className="h-12" />
        </div>
      </div>
    </LoadingRegion>
  );
}
