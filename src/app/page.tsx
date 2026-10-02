import Link from "next/link";

import { LiveBadge } from "@/components/live-badge";
import { LivePrice, PriceChange } from "@/components/live-price";
import { Leader, Panel } from "@/components/panel";
import { button } from "@/components/ui";
import { ASSETS, assetSlug } from "@/lib/assets";
import { getSession } from "@/lib/session";

const STEPS = [
  "Ouvrez un compte invité : un clic, 10 000 $ fictifs, aucune adresse e-mail.",
  "Choisissez un actif : tapez son code (BTC, ETH…) dans la barre de commande, ou F1.",
  "Passez un ordre au marché : il est exécuté au prix relu côté serveur, jamais celui du navigateur.",
  "Suivez votre portefeuille (F2) et comparez-vous aux autres joueurs (F3).",
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
      <Panel title="PaperTrade · simulateur de trading crypto" headingLevel="p" bodyClassName="space-y-6 p-4 sm:p-6">
        <div className="space-y-3">
          <h1 className="text-2xl leading-tight text-balance">
            10 000 $ fictifs. <span className="text-amber">Des prix bien réels.</span>
          </h1>
          <p className="max-w-[60ch] leading-relaxed text-muted">
            PaperTrade exécute vos ordres au cours de Binance, à la seconde près. Portefeuille,
            plus-values et classement sont calculés comme sur une vraie plateforme : seul
            l&apos;argent est faux.
          </p>
        </div>

        <dl className="max-w-xl">
          <Leader label="Capital de départ">10 000,00 $</Leader>
          <Leader label="Actifs négociables">10 · cotés en USDT</Leader>
          <Leader label="Source des prix">Binance · temps réel</Leader>
          <Leader label="Exécution">Prix relu côté serveur</Leader>
          <Leader label="Argent réel">Aucun</Leader>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Link href={session ? "/markets" : "/login"} className={button.primary}>
            {session ? "Ouvrir les marchés" : "Commencer"}
          </Link>
          <Link href="/leaderboard" className={button.secondary}>
            Classement
          </Link>
        </div>
      </Panel>

      <Panel title="Cotations" aside={<LiveBadge />} bodyClassName="">
        <table className="w-full text-sm">
          <caption className="sr-only">Cours en direct des 10 cryptomonnaies, en USDT</caption>
          <thead className="caps text-xs text-muted">
            <tr className="border-b border-line">
              <th scope="col" className="px-3 py-2 text-left font-normal">Actif</th>
              <th scope="col" className="px-3 py-2 text-right font-normal">Dernier</th>
              <th scope="col" className="px-3 py-2 text-right font-normal">Var. 24 h</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((asset) => (
              <tr key={asset.symbol} className="border-b border-line transition-colors last:border-0 hover:bg-hover">
                <td className="px-3 py-1.5">
                  <Link href={`/trade/${assetSlug(asset)}`} className="text-amber hover:underline">
                    {asset.base}
                  </Link>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <LivePrice symbol={asset.symbol} currency={false} />
                </td>
                <td className="px-3 py-1.5 text-right">
                  <PriceChange symbol={asset.symbol} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Mode d'emploi" className="lg:col-span-2" bodyClassName="p-4">
        <ol className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 leading-relaxed">
              <span aria-hidden className="num text-amber">
                {String(index + 1).padStart(2, "0")}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
