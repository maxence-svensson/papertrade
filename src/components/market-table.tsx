"use client";

import Link from "next/link";
import { useState } from "react";

import { ASSETS, assetSlug, getAsset, type Asset } from "@/lib/assets";
import { formatCompactUsd, formatPriceNumber } from "@/lib/format";
import { changePercent, type Ticker } from "@/lib/market";

import { AssetIcon } from "./asset-icon";
import { CaretDownIcon, CaretUpDownIcon, CaretUpIcon } from "./icons";
import { LivePrice, PriceChange } from "./live-price";
import { useTicker, useTickerReader } from "./prices-provider";

type SortKey = "name" | "price" | "change" | "volume";

/**
 * L'ordre est calculé au moment du clic puis figé : sinon, avec des prix qui
 * changent chaque seconde, les lignes bougeraient sous le curseur.
 */
type Sort = { key: SortKey; dir: "asc" | "desc"; order: string[] };

const SORT_VALUE: Record<SortKey, (asset: Asset, ticker?: Ticker) => number | string> = {
  name: (asset) => asset.name,
  price: (_, t) => t?.price ?? 0,
  change: (_, t) => (t ? changePercent(t) : 0),
  volume: (_, t) => t?.quoteVolume ?? 0,
};

export function MarketTable() {
  const readTickers = useTickerReader();
  const [sort, setSort] = useState<Sort | null>(null);

  function sortBy(key: SortKey) {
    // Premier clic : alphabétique pour le nom, décroissant pour les chiffres.
    const dir = sort?.key === key ? (sort.dir === "asc" ? "desc" : "asc") : key === "name" ? "asc" : "desc";
    const tickers = readTickers();
    const value = (a: Asset) => SORT_VALUE[key](a, tickers[a.symbol]);
    const order = [...ASSETS]
      .sort((a, b) => {
        const [x, y] = [value(a), value(b)];
        const cmp = typeof x === "string" ? x.localeCompare(String(y), "fr") : x - (y as number);
        return dir === "asc" ? cmp : -cmp;
      })
      .map((a) => a.symbol);
    setSort({ key, dir, order });
  }

  const rows = sort ? sort.order.map((symbol) => getAsset(symbol)!) : ASSETS;
  const header = { sort, onSort: sortBy };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Cours des cryptomonnaies en USDT. Les en-têtes de colonnes permettent de trier.
        </caption>
        <thead className="text-xs text-muted">
          <tr className="border-b border-border">
            <SortHeader {...header} column="name" label="Actif" align="left" />
            <SortHeader {...header} column="price" label="Prix" />
            {/* Sur mobile, la variation s'affiche sous le prix (colonne masquée). */}
            <SortHeader {...header} column="change" label="24 h" className="hidden sm:table-cell" />
            <th scope="col" className="hidden px-4 py-2.5 text-left font-medium lg:table-cell">
              Fourchette 24 h
            </th>
            <SortHeader {...header} column="volume" label="Volume 24 h" className="hidden md:table-cell" />
            <th scope="col" className="hidden px-4 py-2.5 sm:table-cell">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((asset) => (
            <MarketRow key={asset.symbol} asset={asset} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({
  column,
  label,
  sort,
  onSort,
  align = "right",
  className = "",
}: {
  column: SortKey;
  label: string;
  sort: Sort | null;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = sort?.key === column;
  const Icon = !active ? CaretUpDownIcon : sort.dir === "asc" ? CaretUpIcon : CaretDownIcon;

  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
      className={`px-2 py-1.5 font-medium ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex h-8 items-center gap-1 rounded-md px-2 transition-colors hover:text-fg ${
          active ? "text-fg" : ""
        } ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        {label}
        <Icon aria-hidden size={14} weight={active ? "bold" : "regular"} />
      </button>
    </th>
  );
}

function MarketRow({ asset }: { asset: Asset }) {
  const ticker = useTicker(asset.symbol);
  const href = `/trade/${assetSlug(asset)}`;

  return (
    <tr className="border-b border-border transition-colors last:border-0 hover:bg-surface-2/60">
      <td className="px-4 py-3">
        <Link href={href} className="flex items-center gap-3 rounded-md">
          <AssetIcon asset={asset} />
          <span>
            <span className="block font-medium">{asset.name}</span>
            <span className="text-xs text-muted">{asset.base}</span>
          </span>
        </Link>
      </td>
      <td className="px-4 py-3 text-right font-medium">
        <LivePrice symbol={asset.symbol} />
        <div className="mt-0.5 text-xs font-normal sm:hidden">
          <PriceChange symbol={asset.symbol} />
        </div>
      </td>
      <td className="hidden px-4 py-3 text-right sm:table-cell">
        <PriceChange symbol={asset.symbol} />
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">{ticker && <RangeBar ticker={ticker} />}</td>
      <td className="num hidden px-4 py-3 text-right text-muted md:table-cell">
        {ticker ? formatCompactUsd(ticker.quoteVolume) : "—"}
      </td>
      <td className="hidden px-4 py-3 text-right sm:table-cell">
        <Link
          href={href}
          aria-label={`Trader ${asset.name}`}
          className="inline-flex h-8 items-center rounded-lg border border-border-strong px-3 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
        >
          Trader
        </Link>
      </td>
    </tr>
  );
}

/** Position du prix actuel entre le plus bas et le plus haut des 24 dernières heures. */
function RangeBar({ ticker }: { ticker: Ticker }) {
  const { low, high, price } = ticker;
  const position = high > low ? Math.min(Math.max((price - low) / (high - low), 0), 1) : 0.5;

  return (
    <div className="w-44">
      <div className="relative h-1 rounded-full bg-surface-2">
        <div className="absolute inset-y-0 left-0 rounded-full bg-border-strong" style={{ width: `${position * 100}%` }} />
        <span
          aria-hidden
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-fg"
          style={{ left: `${position * 100}%` }}
        />
      </div>
      <div className="num mt-1.5 flex justify-between text-xs text-muted">
        <span>
          <span className="sr-only">Plus bas : </span>
          {formatPriceNumber(low)}
        </span>
        <span>
          <span className="sr-only">Plus haut : </span>
          {formatPriceNumber(high)}
        </span>
      </div>
    </div>
  );
}
