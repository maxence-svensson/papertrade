"use client";

import { useState } from "react";

import { formatPercent, formatPrice } from "@/lib/format";
import { changePercent } from "@/lib/market";

import { Trend } from "./trend";
import { useTicker } from "./prices-provider";

/**
 * Prix en direct, surligné en vert ou rouge à chaque variation.
 *
 * Pas de région `aria-live` : annoncer chaque tick (toutes les secondes)
 * rendrait la page inutilisable au lecteur d'écran.
 */
export function LivePrice({ symbol, className = "" }: { symbol: string; className?: string }) {
  const price = useTicker(symbol)?.price;
  const [previous, setPrevious] = useState(price);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);

  // Calcul pendant le rendu plutôt que dans un effet (voir la doc React,
  // « Storing information from previous renders »).
  if (price !== previous) {
    setPrevious(price);
    if (price !== undefined && previous !== undefined) setDirection(price > previous ? "up" : "down");
  }

  if (price === undefined) return <span className={`num ${className}`}>—</span>;

  return (
    <span
      // Changer la clé rejoue l'animation à chaque nouveau prix.
      key={price}
      className={`num -mx-1 rounded px-1 ${direction ? `flash-${direction}` : ""} ${className}`}
    >
      {formatPrice(price)}
    </span>
  );
}

/** Variation sur 24 h : signe, flèche et couleur. */
export function PriceChange({ symbol, className = "" }: { symbol: string; className?: string }) {
  const ticker = useTicker(symbol);
  if (!ticker) return <span className={className}>—</span>;

  const change = changePercent(ticker) / 100;
  return (
    <Trend value={change} digits={4} className={className}>
      {formatPercent(change)}
    </Trend>
  );
}
