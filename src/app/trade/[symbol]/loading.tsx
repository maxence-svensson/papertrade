import { LoadingRegion, Skeleton, SkeletonPanel } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Chargement du graphique…">
      <Skeleton className="h-14 border border-line" />
      <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
        <SkeletonPanel className="h-[420px] sm:h-[500px]" />
        <SkeletonPanel className="h-[460px]" />
      </div>
    </LoadingRegion>
  );
}
