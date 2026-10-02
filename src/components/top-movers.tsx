"use client";

import Link from "next/link";

import { ASSETS, assetSlug } from "@/lib/assets";
import { formatPercent, formatPrice } from "@/lib/format";
import { changePercent } from "@/lib/market";

import { AssetIcon } from "./asset-icon";
import { TrendDownIcon, TrendUpIcon } from "./icons";
import { useTickers } from "./prices-provider";
import { Trend } from "./trend";

/** Meilleure et moins bonne performance des dernières 24 h. */
export function TopMovers() {
  const tickers = useTickers();
  const ranked = ASSETS.filter((a) => tickers[a.symbol])
    .map((asset) => ({ asset, ticker: tickers[asset.symbol], change: changePercent(tickers[asset.symbol]) }))
    .sort((a, b) => b.change - a.change);

  if (ranked.length < 2) return null;

  const cards = [
    { label: "Meilleure performance 24 h", icon: TrendUpIcon, item: ranked[0] },
    { label: "Moins bonne performance 24 h", icon: TrendDownIcon, item: ranked.at(-1)! },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map(({ label, icon: Icon, item }) => (
        <Link
          key={label}
          href={`/trade/${assetSlug(item.asset)}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
        >
          <AssetIcon asset={item.asset} size={36} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Icon aria-hidden size={14} />
              {label}
            </p>
            <p className="font-medium">{item.asset.name}</p>
          </div>
          <div className="text-right">
            <p className="num font-medium">{formatPrice(item.ticker.price)}</p>
            <Trend value={item.change} className="text-sm">
              {formatPercent(item.change / 100)}
            </Trend>
          </div>
        </Link>
      ))}
    </div>
  );
}
