import { notFound } from "next/navigation";

import { assetFromSlug } from "@/lib/assets";

/**
 * Valide l'actif avant le squelette de chargement (`loading.tsx`) : un actif
 * inconnu renvoie un vrai statut 404, pas une page d'erreur servie en 200.
 */
export default async function TradeLayout({ children, params }: LayoutProps<"/trade/[symbol]">) {
  if (!assetFromSlug((await params).symbol)) notFound();
  return children;
}
