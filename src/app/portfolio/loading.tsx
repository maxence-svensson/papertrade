import { LoadingRegion, Skeleton, SkeletonPanel } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Chargement du portefeuille…">
      <Skeleton className="h-12 border border-line" />
      <div className="grid gap-3 lg:grid-cols-2">
        <SkeletonPanel className="h-52" />
        <SkeletonPanel className="h-52" />
      </div>
      <SkeletonPanel className="h-48" />
    </LoadingRegion>
  );
}
