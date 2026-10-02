import { trendClass } from "@/lib/format";

import { CaretDownIcon, CaretUpIcon } from "./icons";

/**
 * Valeur signée avec flèche et couleur : la hausse ou la baisse se lit
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
  const Icon = n > 0 ? CaretUpIcon : n < 0 ? CaretDownIcon : null;

  return (
    <span className={`num inline-flex items-center gap-0.5 whitespace-nowrap ${trendClass(n)} ${className}`}>
      {Icon && <Icon aria-hidden size="0.9em" weight="fill" />}
      {children}
    </span>
  );
}
