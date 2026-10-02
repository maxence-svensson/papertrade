import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssetIcon } from "@/components/asset-icon";
import { ArrowRightIcon, CoinsIcon } from "@/components/icons";
import { LivePrice, PriceChange } from "@/components/live-price";
import { TradeHistory } from "@/components/trade-history";
import { assetFromSlug, assetSlug } from "@/lib/assets";
import { getCandles } from "@/lib/binance";
import { getPortfolio, getTrades } from "@/lib/data/portfolio";
import { INTERVALS, parseInterval } from "@/lib/market";
import { getSession } from "@/lib/session";

import { IntervalTabs } from "./interval-tabs";
import { OrderForm } from "./order-form";
import { PositionCard } from "./position-card";
import { PriceChart, type ChartMarker } from "./price-chart";
import { TickerStats } from "./ticker-stats";

export async function generateMetadata({ params }: PageProps<"/trade/[symbol]">): Promise<Metadata> {
  const asset = assetFromSlug((await params).symbol);
  return { title: asset ? `${asset.name} (${asset.base})` : "Actif introuvable" };
}

export default async function TradePage({ params, searchParams }: PageProps<"/trade/[symbol]">) {
  const asset = assetFromSlug((await params).symbol);
  if (!asset) notFound();

  // L'intervalle vit dans l'URL (?interval=4h) : la vue est partageable.
  const interval = parseInterval((await searchParams).interval);
  const intervalSeconds = INTERVALS.find((i) => i.value === interval)!.seconds;
  const session = await getSession();
  const path = `/trade/${assetSlug(asset)}`;

  const [candles, account, trades] = await Promise.all([
    getCandles(asset, interval),
    session ? getPortfolio(session.user.id) : null,
    session ? getTrades(session.user.id, { symbol: asset.symbol, limit: 100 }) : [],
  ]);

  const position = account?.holdings.find((h) => h.symbol === asset.symbol);

  // Chaque ordre est placé sur la bougie qui le contient.
  const firstCandle = candles[0]?.time ?? 0;
  const markers: ChartMarker[] = trades
    .map((t) => ({
      time: Math.floor(t.createdAt.getTime() / 1000 / intervalSeconds) * intervalSeconds,
      side: t.side,
    }))
    .filter((m) => m.time >= firstCandle)
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="flex items-center gap-4">
          <AssetIcon asset={asset} size={48} />
          <div>
            <h1 className="flex items-baseline gap-2 text-xl font-semibold tracking-tight">
              {asset.name}
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-muted">
                {asset.base} / USDT
              </span>
            </h1>
            <p className="flex items-baseline gap-3">
              <LivePrice symbol={asset.symbol} className="text-2xl font-semibold" />
              <PriceChange symbol={asset.symbol} className="text-sm font-medium" />
            </p>
          </div>
        </div>
        <TickerStats symbol={asset.symbol} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section aria-label="Graphique" className="min-w-0 rounded-xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <IntervalTabs path={path} current={interval} />
            <span className="hidden text-xs text-muted sm:inline">Source : Binance</span>
          </div>
          <PriceChart
            key={`${asset.symbol}-${interval}`}
            name={asset.name}
            symbol={asset.symbol}
            interval={interval}
            candles={candles}
            markers={markers}
          />
        </section>

        <aside
          aria-label="Passer un ordre"
          className="self-start rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-20"
        >
          {account ? (
            <OrderForm asset={asset} cash={account.cash} holdingQuantity={position?.quantity ?? null} />
          ) : (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <CoinsIcon aria-hidden size={26} />
              </span>
              <div className="space-y-1">
                <h2 className="font-semibold">Tradez {asset.base}</h2>
                <p className="text-sm text-muted">
                  Créez un compte invité en un clic et recevez 10 000 $ fictifs.
                </p>
              </div>
              <Link
                href={`/login?next=${encodeURIComponent(path)}`}
                className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition-opacity hover:opacity-90"
              >
                Commencer à trader
                <ArrowRightIcon aria-hidden size={18} weight="bold" />
              </Link>
            </div>
          )}
        </aside>
      </div>

      {position && <PositionCard asset={asset} quantity={position.quantity} costBasis={position.costBasis} />}

      {session && (
        <section aria-labelledby="ordres" className="space-y-3">
          <h2 id="ordres" className="font-semibold">
            Vos ordres sur {asset.base}
          </h2>
          <TradeHistory
            trades={trades.slice(0, 20)}
            showAsset={false}
            emptyMessage={`Aucun ordre sur ${asset.name} pour le moment.`}
          />
        </section>
      )}
    </div>
  );
}
