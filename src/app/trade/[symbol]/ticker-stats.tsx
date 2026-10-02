"use client";

import { LivePrice, PriceChange } from "@/components/live-price";
import { useTicker } from "@/components/prices-provider";
import type { Asset } from "@/lib/assets";
import { formatCompactUsd, formatPriceNumber } from "@/lib/format";

/** Bandeau de cotation : code, dernier prix, variation et statistiques 24 h, en direct. */
export function QuoteBar({ asset }: { asset: Asset }) {
  const ticker = useTicker(asset.symbol);

  const stats = [
    { label: "Bas 24 h", value: ticker ? formatPriceNumber(ticker.low) : "—" },
    { label: "Haut 24 h", value: ticker ? formatPriceNumber(ticker.high) : "—" },
    { label: "Volume 24 h", value: ticker ? formatCompactUsd(ticker.quoteVolume) : "—" },
  ];

  return (
    <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border border-line bg-panel px-3 py-2.5">
      <h1 className="flex items-baseline gap-3">
        <span className="text-base text-amber">{asset.base}/USDT</span>
        <span className="text-muted">{asset.name}</span>
      </h1>
      <p className="flex items-baseline gap-3">
        <LivePrice symbol={asset.symbol} className="text-2xl" />
        <PriceChange symbol={asset.symbol} />
      </p>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
        {stats.map((stat) => (
          <div key={stat.label} className="flex gap-2">
            <dt className="caps text-muted">{stat.label}</dt>
            <dd className="num">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
