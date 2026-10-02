import Link from "next/link";

import { Panel } from "@/components/panel";
import { button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-10">
      <Panel headingLevel="p" title="Erreur 404" bodyClassName="space-y-4 p-4">
        <h1 className="text-2xl">Écran introuvable</h1>
        <p className="text-muted">
          Cet actif ou cette page n&apos;existe pas. Tapez un code (BTC, ETH…) dans la barre de commande,
          ou revenez aux marchés.
        </p>
        <Link href="/markets" className={button.primary}>
          Marchés
        </Link>
      </Panel>
    </div>
  );
}
