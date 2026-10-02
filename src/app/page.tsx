import Link from "next/link";

import { AssetIcon } from "@/components/asset-icon";
import { ArrowRightIcon, BroadcastIcon, ShieldCheckIcon, TrophyIcon, WalletIcon } from "@/components/icons";
import { LiveBadge } from "@/components/live-badge";
import { LivePrice, PriceChange } from "@/components/live-price";
import { ASSETS, assetSlug } from "@/lib/assets";
import { getSession } from "@/lib/session";

const PREVIEW = ASSETS.slice(0, 5);

const STATS = [
  { value: "10", label: "cryptomonnaies" },
  { value: "10 000 $", label: "de capital fictif" },
  { value: "0 €", label: "en jeu" },
];

const FEATURES = [
  {
    icon: BroadcastIcon,
    title: "Prix réels, en direct",
    text: "Les cours arrivent en temps réel depuis Binance, avec un graphique en chandeliers par actif.",
  },
  {
    icon: WalletIcon,
    title: "10 000 $ fictifs",
    text: "Achetez, vendez et suivez votre prix de revient et vos plus-values, sans risquer un centime.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Exécution fiable",
    text: "Chaque ordre est exécuté au prix relu côté serveur, dans une transaction verrouillée.",
  },
  {
    icon: TrophyIcon,
    title: "Classement",
    text: "Comparez votre performance à celle des autres joueurs, valorisée aux prix actuels.",
  },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="space-y-16 py-4 sm:py-8">
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-6">
          <p className="text-sm font-medium text-primary">Simulateur de trading crypto</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Apprenez à trader sans risquer votre argent.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Démarrez avec 10 000 $ fictifs et négociez Bitcoin, Ethereum et 8 autres cryptomonnaies
            au prix réel du marché.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={session ? "/markets" : "/login"}
              className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              {session ? "Voir les marchés" : "Commencer gratuitement"}
              <ArrowRightIcon aria-hidden size={18} weight="bold" />
            </Link>
            <Link
              href="/leaderboard"
              className="flex h-11 items-center rounded-lg border border-border-strong px-5 font-medium transition-colors hover:bg-surface"
            >
              Voir le classement
            </Link>
          </div>
          <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="text-sm text-muted">{stat.label}</dt>
                <dd className="num text-xl font-semibold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <section aria-labelledby="apercu" className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 id="apercu" className="font-semibold">
              Aperçu du marché
            </h2>
            <LiveBadge />
          </div>
          <ul>
            {PREVIEW.map((asset) => (
              <li key={asset.symbol} className="border-b border-border last:border-0">
                <Link
                  href={`/trade/${assetSlug(asset)}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/60"
                >
                  <AssetIcon asset={asset} />
                  <span className="flex-1">
                    <span className="block font-medium">{asset.name}</span>
                    <span className="text-xs text-muted">{asset.base} / USDT</span>
                  </span>
                  <span className="text-right">
                    <LivePrice symbol={asset.symbol} className="block font-medium" />
                    <PriceChange symbol={asset.symbol} className="text-sm" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/markets"
            className="flex items-center justify-center gap-1.5 rounded-b-xl border-t border-border py-3 text-sm font-medium text-primary transition-colors hover:bg-surface-2/60"
          >
            Voir les 10 marchés
            <ArrowRightIcon aria-hidden size={16} />
          </Link>
        </section>
      </section>

      <section aria-labelledby="fonctionnalites" className="space-y-6">
        <h2 id="fonctionnalites" className="text-2xl font-semibold tracking-tight">
          Un vrai terminal de trading, sans le risque
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="space-y-3 rounded-xl border border-border bg-surface p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon aria-hidden size={22} />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
