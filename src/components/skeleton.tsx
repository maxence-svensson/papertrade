/** Bloc de remplacement pendant un chargement, aux dimensions du contenu attendu. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`rounded-md bg-surface-2 motion-safe:animate-pulse ${className}`} />;
}

/** Conteneur annoncé comme « en cours de chargement » aux lecteurs d'écran. */
export function LoadingRegion({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div aria-busy="true" className="space-y-6">
      <span role="status" className="sr-only">
        {label}
      </span>
      {children}
    </div>
  );
}
