import { useId } from "react";

/**
 * Panneau du terminal : barre de titre en capitales, contenu dessous, séparés
 * par un filet. Remplace les cartes arrondies.
 */
export function Panel({
  title,
  aside,
  children,
  className = "",
  bodyClassName = "p-3",
  headingLevel: Heading = "h2",
}: {
  title: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** `p` quand le panneau contient lui-même le titre principal de la page. */
  headingLevel?: "h1" | "h2" | "h3" | "p";
}) {
  const id = useId();

  return (
    <section aria-labelledby={id} className={`min-w-0 border border-line bg-panel ${className}`}>
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line bg-head px-3 py-1.5">
        <Heading id={id} className="caps text-xs text-amber">
          {title}
        </Heading>
        {aside && <div className="text-xs text-muted">{aside}</div>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Ligne « libellé ........ valeur », à la manière d'un écran de terminal. */
export function Leader({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      {/* Les pointillés restent dans le <dt> : un <dl> n'accepte que des <dt> et des <dd>. */}
      <dt className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="caps shrink-0 text-xs text-muted">{label}</span>
        <span aria-hidden className="min-w-4 flex-1 border-b border-dotted border-line-strong/60" />
      </dt>
      <dd className="num text-right">{children}</dd>
    </div>
  );
}
