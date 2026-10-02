import Link from "next/link";

import { assetSlug, getAsset } from "@/lib/assets";
import type { TradeRow } from "@/lib/data/portfolio";
import { formatDateTime, formatPrice, formatQuantity, formatUsd } from "@/lib/format";

import { AssetIcon } from "./asset-icon";
import { CaretDownIcon, CaretUpIcon } from "./icons";
import { Trend } from "./trend";

export function TradeHistory({
  trades,
  showAsset = true,
  emptyMessage = "Aucun ordre pour le moment.",
}: {
  trades: TradeRow[];
  showAsset?: boolean;
  emptyMessage?: string;
}) {
  if (trades.length === 0) {
    return <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[600px] text-sm">
        <thead className="text-left text-xs text-muted">
          <tr className="border-b border-border">
            <th scope="col" className="px-4 py-2.5 font-medium">Date</th>
            {showAsset && <th scope="col" className="px-4 py-2.5 font-medium">Actif</th>}
            <th scope="col" className="px-4 py-2.5 font-medium">Sens</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Quantité</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Prix</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Total</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Plus-value</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const asset = getAsset(t.symbol);
            const isBuy = t.side === "buy";
            return (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="num px-4 py-3 whitespace-nowrap text-muted">{formatDateTime(t.createdAt)}</td>
                {showAsset && (
                  <td className="px-4 py-3">
                    {asset ? (
                      <Link
                        href={`/trade/${assetSlug(asset)}`}
                        className="inline-flex items-center gap-2 rounded-md font-medium hover:text-primary"
                      >
                        <AssetIcon asset={asset} size={20} />
                        {asset.base}
                      </Link>
                    ) : (
                      t.symbol
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                      isBuy ? "bg-up/10 text-up" : "bg-down/10 text-down"
                    }`}
                  >
                    {isBuy ? (
                      <CaretUpIcon aria-hidden size={12} weight="fill" />
                    ) : (
                      <CaretDownIcon aria-hidden size={12} weight="fill" />
                    )}
                    {isBuy ? "Achat" : "Vente"}
                  </span>
                </td>
                <td className="num px-4 py-3 text-right">{formatQuantity(t.quantity)}</td>
                <td className="num px-4 py-3 text-right">{formatPrice(t.price)}</td>
                <td className="num px-4 py-3 text-right">{formatUsd(t.total)}</td>
                <td className="px-4 py-3 text-right">
                  {t.realizedPnl ? (
                    <Trend value={t.realizedPnl}>{formatUsd(t.realizedPnl)}</Trend>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
