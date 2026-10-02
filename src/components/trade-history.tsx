import Link from "next/link";

import { assetSlug, getAsset } from "@/lib/assets";
import type { TradeRow } from "@/lib/data/portfolio";
import { formatDateTime, formatPriceNumber, formatQuantity, formatUsd } from "@/lib/format";

import { Trend } from "./trend";

const th = "px-3 py-2 font-normal";
const td = "px-3 py-1.5";

/** Historique des ordres, à placer dans un panneau. */
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
    return <p className="p-3 text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
        <thead className="caps text-left text-xs text-muted">
          <tr className="border-b border-line">
            <th scope="col" className={th}>Date</th>
            {showAsset && <th scope="col" className={th}>Actif</th>}
            <th scope="col" className={th}>Sens</th>
            <th scope="col" className={`${th} text-right`}>Quantité</th>
            <th scope="col" className={`${th} text-right`}>Prix</th>
            <th scope="col" className={`${th} text-right`}>Total</th>
            <th scope="col" className={`${th} text-right`}>Plus-value</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const asset = getAsset(t.symbol);
            const isBuy = t.side === "buy";
            return (
              <tr key={t.id} className="border-b border-line last:border-0">
                <td className={`${td} num whitespace-nowrap text-muted`}>{formatDateTime(t.createdAt)}</td>
                {showAsset && (
                  <td className={td}>
                    {asset ? (
                      <Link href={`/trade/${assetSlug(asset)}`} className="text-amber hover:underline">
                        {asset.base}
                      </Link>
                    ) : (
                      t.symbol
                    )}
                  </td>
                )}
                <td className={`${td} caps text-xs whitespace-nowrap ${isBuy ? "text-up" : "text-down"}`}>
                  <span aria-hidden className="text-[0.75em]">{isBuy ? "▲ " : "▼ "}</span>
                  {isBuy ? "Achat" : "Vente"}
                </td>
                <td className={`${td} num text-right`}>{formatQuantity(t.quantity)}</td>
                <td className={`${td} num text-right`}>{formatPriceNumber(t.price)}</td>
                <td className={`${td} num text-right`}>{formatUsd(t.total)}</td>
                <td className={`${td} text-right`}>
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
