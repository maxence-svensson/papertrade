import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Leader, Panel } from "@/components/panel";
import { TradeHistory } from "@/components/trade-history";
import { button } from "@/components/ui";
import { assetFromSlug, assetSlug } from "@/lib/assets";
import { getCandles } from "@/lib/binance";
import { getPortfolio, getTrades } from "@/lib/data/portfolio";
import { INTERVALS, parseInterval } from "@/lib/market";
import { getSession } from "@/lib/session";

import { IntervalTabs } from "./interval-tabs";
import { OrderForm } from "./order-form";
import { PositionCard } from "./position-card";
import { PriceChart, type ChartMarker } from "./price-chart";
import { QuoteBar } from "./ticker-stats";

export async function generateMetadata({ params }: PageProps<"/trade/[symbol]">): Promise<Metadata> {
  const asset = assetFromSlug((await params).symbol);
  return { title: asset ? `${asset.name} (${asset.base})` : "Actif introuvable" };
}

export default async function TradePage({ params, searchParams }: PageProps<"/trade/[symbol]">) {
  // Déjà vérifié dans le layout ; garde le typage de `asset`.
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
    <div className="space-y-3">
      <QuoteBar asset={asset} />

      <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
        <Panel title={`Graphique · ${asset.base}/USDT`} aside={<IntervalTabs path={path} current={interval} />}>
          <PriceChart
            key={`${asset.symbol}-${interval}`}
            name={asset.name}
            symbol={asset.symbol}
            interval={interval}
            candles={candles}
            markers={markers}
          />
        </Panel>

        <Panel title="Ticket d'ordre" className="self-start lg:sticky lg:top-24" bodyClassName="p-4">
          {account ? (
            <OrderForm asset={asset} cash={account.cash} holdingQuantity={position?.quantity ?? null} />
          ) : (
            <div className="space-y-4">
              <p className="leading-relaxed text-muted">
                Ouvrez un compte invité pour passer des ordres sur {asset.base} : un clic, sans e-mail.
              </p>
              <dl>
                <Leader label="Capital offert">10 000,00 $</Leader>
              </dl>
              <Link href={`/login?next=${encodeURIComponent(path)}`} className={`${button.primary} w-full`}>
                Commencer à trader
              </Link>
            </div>
          )}
        </Panel>
      </div>

      {position && <PositionCard asset={asset} quantity={position.quantity} costBasis={position.costBasis} />}

      {session && (
        <Panel title={`Ordres · ${asset.base}`} bodyClassName="">
          <TradeHistory
            trades={trades.slice(0, 20)}
            showAsset={false}
            emptyMessage={`Aucun ordre sur ${asset.base} pour le moment.`}
          />
        </Panel>
      )}
    </div>
  );
}
