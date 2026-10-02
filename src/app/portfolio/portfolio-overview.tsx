"use client";

import Link from "next/link";

import { Leader, Panel } from "@/components/panel";
import { useTickers } from "@/components/prices-provider";
import { Trend } from "@/components/trend";
import { button } from "@/components/ui";
import { assetSlug, getAsset } from "@/lib/assets";
import { STARTING_CASH_USD } from "@/lib/constants";
import type { HoldingRow } from "@/lib/data/portfolio";
import { formatPercent, formatPriceNumber, formatQuantity, formatShare, formatUsd } from "@/lib/format";

const th = "px-3 py-2 font-normal";
const td = "px-3 py-1.5";

/**
 * Valorisation en direct. Les montants enregistrés (liquidités, coûts) sont
 * exacts en base ; ici on ne fait que de l'affichage, en nombres classiques.
 */
export function PortfolioOverview({
  cash,
  holdings,
  realizedPnl,
}: {
  cash: string;
  holdings: HoldingRow[];
  realizedPnl: string;
}) {
  const tickers = useTickers();

  const positions = holdings
    .map((h) => {
      const quantity = Number(h.quantity);
      const cost = Number(h.costBasis);
      const price = tickers[h.symbol]?.price ?? cost / quantity;
      const value = quantity * price;
      return { ...h, asset: getAsset(h.symbol), quantity, cost, price, value, pnl: value - cost };
    })
    .sort((a, b) => b.value - a.value);

  const holdingsValue = positions.reduce((sum, p) => sum + p.value, 0);
  const total = Number(cash) + holdingsValue;
  const unrealizedPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const performance = total / STARTING_CASH_USD - 1;

  const allocation = [
    ...positions.map((p) => ({ key: p.symbol, label: p.asset?.base ?? p.symbol, value: p.value })),
    { key: "cash", label: "Liquidités", value: Number(cash) },
  ].filter((a) => a.value > 0);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Synthèse">
          <dl>
            <Leader label="Valeur totale">
              <span className="text-base">{formatUsd(total)}</span>
            </Leader>
            <Leader label="Performance">
              <Trend value={performance} digits={4}>
                {formatPercent(performance)}
              </Trend>
            </Leader>
            <Leader label="Liquidités">{formatUsd(cash)}</Leader>
            <Leader label="Plus-value latente">
              <Trend value={unrealizedPnl}>{formatUsd(unrealizedPnl)}</Trend>
            </Leader>
            <Leader label="Plus-value réalisée">
              <Trend value={realizedPnl}>{formatUsd(realizedPnl)}</Trend>
            </Leader>
          </dl>
        </Panel>

        <Panel title="Répartition">
          <ul className="space-y-2">
            {allocation.map((a) => {
              const share = total > 0 ? a.value / total : 0;
              return (
                <li key={a.key} className="grid grid-cols-[6rem_1fr_4.5rem] items-center gap-3">
                  <span className={a.key === "cash" ? "text-muted" : "text-amber"}>{a.label}</span>
                  {/* Barre décorative : la part est écrite à droite. */}
                  <span aria-hidden className="h-3 bg-head">
                    <span
                      className={`block h-full ${a.key === "cash" ? "bg-line-strong" : "bg-amber"}`}
                      style={{ width: `${share * 100}%` }}
                    />
                  </span>
                  <span className="num text-right">{formatShare(share)}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Positions"
        aside={`${positions.length} ouverte${positions.length > 1 ? "s" : ""}`}
        bodyClassName=""
      >
        {positions.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <p className="text-muted">Aucune position ouverte. Choisissez un actif pour passer un ordre.</p>
            <Link href="/markets" className={button.small}>
              Ouvrir les marchés
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="caps text-left text-xs text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className={th}>Actif</th>
                  <th scope="col" className={`${th} text-right`}>Quantité</th>
                  <th scope="col" className={`${th} text-right`}>Prix de revient</th>
                  <th scope="col" className={`${th} text-right`}>Dernier</th>
                  <th scope="col" className={`${th} text-right`}>Valeur</th>
                  <th scope="col" className={`${th} text-right`}>Plus-value latente</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.symbol} className="border-b border-line transition-colors last:border-0 hover:bg-hover">
                    <td className={td}>
                      {p.asset ? (
                        <Link href={`/trade/${assetSlug(p.asset)}`} className="flex items-baseline gap-3">
                          <span className="w-10 text-amber">{p.asset.base}</span>
                          <span className="text-xs text-muted">{p.asset.name}</span>
                        </Link>
                      ) : (
                        p.symbol
                      )}
                    </td>
                    <td className={`${td} num text-right`}>{formatQuantity(p.quantity)}</td>
                    <td className={`${td} num text-right text-muted`}>{formatPriceNumber(p.cost / p.quantity)}</td>
                    <td className={`${td} num text-right`}>{formatPriceNumber(p.price)}</td>
                    <td className={`${td} num text-right`}>{formatUsd(p.value)}</td>
                    <td className={`${td} text-right`}>
                      <Trend value={p.pnl}>
                        {formatUsd(p.pnl)} <span className="text-xs">({formatPercent(p.pnl / p.cost)})</span>
                      </Trend>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
