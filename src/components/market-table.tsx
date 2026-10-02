"use client";

import Link from "next/link";
import { useState } from "react";

import { ASSETS, assetSlug, getAsset, type Asset } from "@/lib/assets";
import { formatCompactUsd, formatPercent, formatPriceNumber } from "@/lib/format";
import { changePercent, type Ticker } from "@/lib/market";

import { LivePrice, PriceChange } from "./live-price";
import { useTicker, useTickerReader, useTickers } from "./prices-provider";
import { Trend } from "./trend";
import { button } from "./ui";

type SortKey = "code" | "price" | "change" | "volume";

/**
 * L'ordre est calculé au moment du clic puis figé : sinon, avec des prix qui
 * changent chaque seconde, les lignes bougeraient sous le curseur.
 */
type Sort = { key: SortKey; dir: "asc" | "desc"; order: string[] };

const SORT_VALUE: Record<SortKey, (asset: Asset, ticker?: Ticker) => number | string> = {
  code: (asset) => asset.base,
  price: (_, t) => t?.price ?? 0,
  change: (_, t) => (t ? changePercent(t) : 0),
  volume: (_, t) => t?.quoteVolume ?? 0,
};

const th = "px-3 py-2 font-normal";

export function MarketTable() {
  const readTickers = useTickerReader();
  const [sort, setSort] = useState<Sort | null>(null);

  function sortBy(key: SortKey) {
    // Premier clic : alphabétique pour le code, décroissant pour les chiffres.
    const dir = sort?.key === key ? (sort.dir === "asc" ? "desc" : "asc") : key === "code" ? "asc" : "desc";
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Cours des cryptomonnaies en USDT. Les en-têtes de colonnes permettent de trier.
        </caption>
        <thead className="caps text-xs text-muted">
          <tr className="border-b border-line">
            <SortHeader {...header} column="code" label="Actif" align="left" />
            <SortHeader {...header} column="price" label="Dernier" />
            {/* Sur mobile, la variation s'affiche sous le prix (colonne masquée). */}
            <SortHeader {...header} column="change" label="Var. 24 h" className="hidden sm:table-cell" />
            <th scope="col" className={`${th} hidden text-right lg:table-cell`}>
              Bas 24 h
            </th>
            <th scope="col" className={`${th} hidden text-right lg:table-cell`}>
              Haut 24 h
            </th>
            <th scope="col" className={`${th} hidden text-left xl:table-cell`}>
              Position
            </th>
            <SortHeader {...header} column="volume" label="Volume" className="hidden md:table-cell" />
            <th scope="col" className={`${th} hidden sm:table-cell`}>
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
  const arrow = !active ? "↕" : sort.dir === "asc" ? "▲" : "▼";

  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
      className={`px-1 py-1 font-normal ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`caps inline-flex h-7 items-center gap-1.5 px-2 transition-colors hover:text-fg ${
          active ? "text-amber" : ""
        } ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        {label}
        <span aria-hidden className="text-[10px]">
          {arrow}
        </span>
      </button>
    </th>
  );
}

function MarketRow({ asset }: { asset: Asset }) {
  const ticker = useTicker(asset.symbol);
  const href = `/trade/${assetSlug(asset)}`;
  const td = "px-3 py-2";

  return (
    <tr className="border-b border-line transition-colors last:border-0 hover:bg-hover">
      <td className={td}>
        <Link href={href} className="flex items-baseline gap-3">
          <span className="w-10 text-amber">{asset.base}</span>
          <span className="text-xs text-muted">{asset.name}</span>
        </Link>
      </td>
      <td className={`${td} text-right`}>
        <LivePrice symbol={asset.symbol} currency={false} />
        <div className="text-xs sm:hidden">
          <PriceChange symbol={asset.symbol} />
        </div>
      </td>
      <td className={`${td} hidden text-right sm:table-cell`}>
        <PriceChange symbol={asset.symbol} />
      </td>
      <td className={`${td} num hidden text-right text-muted lg:table-cell`}>
        {ticker ? formatPriceNumber(ticker.low) : "—"}
      </td>
      <td className={`${td} num hidden text-right text-muted lg:table-cell`}>
        {ticker ? formatPriceNumber(ticker.high) : "—"}
      </td>
      <td className={`${td} hidden xl:table-cell`}>{ticker && <RangeBar ticker={ticker} />}</td>
      <td className={`${td} num hidden text-right text-muted md:table-cell`}>
        {ticker ? formatCompactUsd(ticker.quoteVolume) : "—"}
      </td>
      <td className={`${td} hidden text-right sm:table-cell`}>
        <Link href={href} aria-label={`Trader ${asset.name}`} className={button.small}>
          Trader
        </Link>
      </td>
    </tr>
  );
}

/**
 * Position du prix entre le plus bas et le plus haut des 24 dernières heures.
 * Décorative : les deux bornes sont dans les colonnes voisines.
 */
function RangeBar({ ticker }: { ticker: Ticker }) {
  const { low, high, price } = ticker;
  const position = high > low ? Math.min(Math.max((price - low) / (high - low), 0), 1) : 0.5;

  return (
    <div aria-hidden className="relative h-2 w-32 border-x border-line-strong">
      <div className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
      <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-amber" style={{ left: `${position * 100}%` }} />
    </div>
  );
}

/** Meilleure et moins bonne performance sur 24 h, pour l'en-tête du panneau. */
export function MarketMovers() {
  const tickers = useTickers();
  const ranked = ASSETS.filter((a) => tickers[a.symbol])
    .map((asset) => ({ asset, change: changePercent(tickers[asset.symbol]) / 100 }))
    .sort((a, b) => b.change - a.change);

  if (ranked.length < 2) return null;
  const [best, worst] = [ranked[0], ranked.at(-1)!];

  return (
    <span className="flex flex-wrap gap-x-4">
      <span>
        <span className="caps">Meilleure</span> <span className="text-fg">{best.asset.base}</span>{" "}
        <Trend value={best.change} digits={4}>
          {formatPercent(best.change)}
        </Trend>
      </span>
      <span>
        <span className="caps">Moins bonne</span> <span className="text-fg">{worst.asset.base}</span>{" "}
        <Trend value={worst.change} digits={4}>
          {formatPercent(worst.change)}
        </Trend>
      </span>
    </span>
  );
}
