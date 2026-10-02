"use client";

import Link from "next/link";

import { AssetIcon } from "@/components/asset-icon";
import {
  ArrowRightIcon,
  ChartLineUpIcon,
  CoinsIcon,
  CurrencyDollarIcon,
  TrendUpIcon,
  WalletIcon,
} from "@/components/icons";
import { useTickers } from "@/components/prices-provider";
import { Trend } from "@/components/trend";
import { assetSlug, getAsset } from "@/lib/assets";
import { STARTING_CASH_USD } from "@/lib/constants";
import type { HoldingRow } from "@/lib/data/portfolio";
import { formatPercent, formatPrice, formatQuantity, formatShare, formatUsd } from "@/lib/format";

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

  return (
    <div className="space-y-6">
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={WalletIcon} label="Valeur totale" value={formatUsd(total)}>
          <span className="text-sm">
            <Trend value={performance} digits={4}>{formatPercent(performance)}</Trend>
            <span className="text-muted"> depuis le départ</span>
          </span>
        </Stat>
        <Stat icon={CurrencyDollarIcon} label="Liquidités" value={formatUsd(cash)}>
          <span className="text-sm text-muted">{formatShare(Number(cash) / total)} du portefeuille</span>
        </Stat>
        <Stat icon={ChartLineUpIcon} label="Plus-value latente">
          <Trend value={unrealizedPnl} className="text-xl font-semibold">
            {formatUsd(unrealizedPnl)}
          </Trend>
        </Stat>
        <Stat icon={TrendUpIcon} label="Plus-value réalisée">
          <Trend value={realizedPnl} className="text-xl font-semibold">
            {formatUsd(realizedPnl)}
          </Trend>
        </Stat>
      </dl>

      {positions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <CoinsIcon aria-hidden size={26} />
          </span>
          <div className="space-y-1">
            <h2 className="font-semibold">Aucune position ouverte</h2>
            <p className="text-sm text-muted">Choisissez une cryptomonnaie pour passer votre prochain ordre.</p>
          </div>
          <Link
            href="/markets"
            className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Explorer les marchés
            <ArrowRightIcon aria-hidden size={18} weight="bold" />
          </Link>
        </div>
      ) : (
        <>
          <AllocationBar cash={Number(cash)} positions={positions} total={total} />

          <section aria-labelledby="positions" className="space-y-3">
            <h2 id="positions" className="font-semibold">
              Positions
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr className="border-b border-border">
                    <th scope="col" className="px-4 py-2.5 font-medium">Actif</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Quantité</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Prix de revient</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Prix actuel</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Valeur</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Plus-value latente</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => (
                    <tr key={p.symbol} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        {p.asset ? (
                          <Link
                            href={`/trade/${assetSlug(p.asset)}`}
                            className="flex items-center gap-3 rounded-md font-medium hover:text-primary"
                          >
                            <AssetIcon asset={p.asset} size={28} />
                            {p.asset.name}
                          </Link>
                        ) : (
                          p.symbol
                        )}
                      </td>
                      <td className="num px-4 py-3 text-right">{formatQuantity(p.quantity)}</td>
                      <td className="num px-4 py-3 text-right text-muted">{formatPrice(p.cost / p.quantity)}</td>
                      <td className="num px-4 py-3 text-right">{formatPrice(p.price)}</td>
                      <td className="num px-4 py-3 text-right font-medium">{formatUsd(p.value)}</td>
                      <td className="px-4 py-3 text-right">
                        <Trend value={p.pnl}>
                          {formatUsd(p.pnl)} <span className="text-xs">({formatPercent(p.pnl / p.cost)})</span>
                        </Trend>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: typeof WalletIcon;
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <dt className="flex items-center gap-2 text-sm text-muted">
        <Icon aria-hidden size={16} />
        {label}
      </dt>
      <dd className="mt-2 space-y-0.5">
        {value && <span className="num block text-xl font-semibold">{value}</span>}
        {children}
      </dd>
    </div>
  );
}

function AllocationBar({
  cash,
  positions,
  total,
}: {
  cash: number;
  positions: { symbol: string; value: number; asset?: { base: string; color: string } }[];
  total: number;
}) {
  const segments = [
    ...positions.map((p) => ({ key: p.symbol, label: p.asset?.base ?? p.symbol, color: p.asset?.color ?? "#888", value: p.value })),
    { key: "cash", label: "Liquidités", color: "var(--color-border-strong)", value: cash },
  ].filter((s) => s.value > 0);

  return (
    <section aria-labelledby="repartition" className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h2 id="repartition" className="text-sm font-medium text-muted">
        Répartition
      </h2>
      {/* Barre décorative : les pourcentages sont donnés en texte dans la légende. */}
      <div aria-hidden className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
        {segments.map((s) => (
          <div key={s.key} style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}
            <span className="num text-muted">{formatShare(s.value / total)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
