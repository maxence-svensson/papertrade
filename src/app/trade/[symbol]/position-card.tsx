"use client";

import { useTicker } from "@/components/prices-provider";
import { Trend } from "@/components/trend";
import type { Asset } from "@/lib/assets";
import { formatPercent, formatPrice, formatQuantity, formatUsd } from "@/lib/format";

export function PositionCard({
  asset,
  quantity,
  costBasis,
}: {
  asset: Asset;
  quantity: string;
  costBasis: string;
}) {
  const price = useTicker(asset.symbol)?.price;
  const qty = Number(quantity);
  const cost = Number(costBasis);
  const value = price === undefined ? null : qty * price;
  const pnl = value === null ? null : value - cost;

  const rows = [
    { label: "Quantité", value: `${formatQuantity(quantity)} ${asset.base}` },
    { label: "Prix de revient moyen", value: formatPrice(cost / qty) },
    { label: "Valeur actuelle", value: value === null ? "—" : formatUsd(value) },
  ];

  return (
    <section aria-labelledby="position" className="rounded-xl border border-border bg-surface p-5">
      <h2 id="position" className="mb-4 font-semibold">
        Votre position
      </h2>
      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-muted">{row.label}</dt>
            <dd className="num mt-1 font-medium">{row.value}</dd>
          </div>
        ))}
        <div>
          <dt className="text-muted">Plus-value latente</dt>
          <dd className="mt-1 font-medium">
            {pnl === null ? (
              "—"
            ) : (
              <Trend value={pnl}>
                {formatUsd(pnl)} ({formatPercent(pnl / cost)})
              </Trend>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
