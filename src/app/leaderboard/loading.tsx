import { LoadingRegion, SkeletonPanel } from "@/components/skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Chargement du classement…">
      <SkeletonPanel className="h-80" />
    </LoadingRegion>
  );
}
