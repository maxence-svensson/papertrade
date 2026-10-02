/** Bloc de remplacement pendant un chargement, aux dimensions du contenu attendu. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`bg-head motion-safe:animate-pulse ${className}`} />;
}

/** Conteneur annoncé comme « en cours de chargement » aux lecteurs d'écran. */
export function LoadingRegion({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div aria-busy="true" className="space-y-3">
      <p role="status" className="caps text-xs text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

/** Panneau vide aux proportions d'un vrai panneau. */
export function SkeletonPanel({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`border border-line bg-panel ${className}`}>
      <div className="h-8 border-b border-line bg-head" />
    </div>
  );
}
