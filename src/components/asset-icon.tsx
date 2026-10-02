import Image from "next/image";

import type { Asset } from "@/lib/assets";

/**
 * Logo de l'actif (jeu d'icônes « cryptocurrency-icons », licence CC0).
 * Décoratif : le nom de l'actif est toujours affiché à côté.
 */
export function AssetIcon({ asset, size = 32 }: { asset: Asset; size?: number }) {
  return (
    <Image
      src={`/crypto/${asset.base.toLowerCase()}.svg`}
      alt=""
      width={size}
      height={size}
      // Léger contour : certains logos (XRP, Cardano) sont sombres sur fond sombre.
      className="shrink-0 rounded-full ring-1 ring-white/15"
    />
  );
}
