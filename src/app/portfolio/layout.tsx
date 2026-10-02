import { requireUser } from "@/lib/session";

/**
 * Vérifie la session avant le squelette de chargement (`loading.tsx`) : sans
 * compte, la redirection est une vraie réponse HTTP 307 et non une
 * redirection après coup dans une page déjà envoyée.
 */
export default async function PortfolioLayout({ children }: LayoutProps<"/portfolio">) {
  await requireUser("/portfolio");
  return children;
}
