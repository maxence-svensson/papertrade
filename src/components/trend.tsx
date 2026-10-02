import { trendClass } from "@/lib/format";

/**
 * Valeur signée avec flèche (▲ ▼) et couleur : la hausse ou la baisse se lit
 * sans dépendre de la couleur seule.
 *
 * Le signe est lu sur la valeur arrondie comme à l'affichage (`digits`) :
 * une valeur affichée « 0,00 » n'a ni flèche ni couleur.
 * 2 décimales pour un montant, 4 pour un ratio affiché en pourcentage.
 */
export function Trend({
  value,
  digits = 2,
  children,
  className = "",
}: {
  value: number | string;
  digits?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const n = Number(Number(value).toFixed(digits));
  const arrow = n > 0 ? "▲" : n < 0 ? "▼" : null;

  return (
    <span className={`num inline-flex items-baseline gap-1 whitespace-nowrap ${trendClass(n)} ${className}`}>
      {arrow && (
        <span aria-hidden className="text-[0.7em]">
          {arrow}
        </span>
      )}
      {children}
    </span>
  );
}
