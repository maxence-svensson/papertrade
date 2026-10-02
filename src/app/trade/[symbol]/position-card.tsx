"use client";

import { Leader, Panel } from "@/components/panel";
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

  return (
    <Panel title={`Position · ${asset.base}`}>
      <dl className="grid gap-x-8 md:grid-cols-2">
        <Leader label="Quantité">
          {formatQuantity(quantity)} {asset.base}
        </Leader>
        <Leader label="Prix de revient moyen">{formatPrice(cost / qty)}</Leader>
        <Leader label="Valeur actuelle">{value === null ? "—" : formatUsd(value)}</Leader>
        <Leader label="Plus-value latente">
          {pnl === null ? (
            "—"
          ) : (
            <Trend value={pnl}>
              {formatUsd(pnl)} ({formatPercent(pnl / cost)})
            </Trend>
          )}
        </Leader>
      </dl>
    </Panel>
  );
}
