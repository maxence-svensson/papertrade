"use client";

import { useTicker } from "@/components/prices-provider";
import { formatCompactUsd, formatPrice } from "@/lib/format";

/** Statistiques 24 h de l'actif, en direct. */
export function TickerStats({ symbol }: { symbol: string }) {
  const ticker = useTicker(symbol);

  const stats = [
    { label: "Plus haut 24 h", value: ticker ? formatPrice(ticker.high) : "—" },
    { label: "Plus bas 24 h", value: ticker ? formatPrice(ticker.low) : "—" },
    { label: "Volume 24 h", value: ticker ? formatCompactUsd(ticker.quoteVolume) : "—" },
  ];

  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-2">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="text-xs text-muted">{stat.label}</dt>
          <dd className="num text-sm font-medium">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
