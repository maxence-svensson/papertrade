"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import type { Ticker } from "@/lib/market";
import * as priceStore from "@/lib/price-store";

type TickerMap = Readonly<Record<string, Ticker>>;

const EMPTY: TickerMap = {};

/**
 * Prix récupérés côté serveur au rendu de la page. Ils s'affichent
 * immédiatement, puis le flux WebSocket prend le relais.
 */
const InitialTickersContext = createContext<TickerMap>(EMPTY);

export function PricesProvider({
  initial,
  children,
}: {
  initial: Ticker[];
  children: React.ReactNode;
}) {
  const value = useMemo(() => Object.fromEntries(initial.map((t) => [t.symbol, t])), [initial]);
  return <InitialTickersContext value={value}>{children}</InitialTickersContext>;
}

/** Prix en temps réel d'un actif. Ne re-rend que lorsque cet actif bouge. */
export function useTicker(symbol: string): Ticker | undefined {
  const initial = useContext(InitialTickersContext);
  return useSyncExternalStore(
    priceStore.subscribe,
    () => priceStore.getTickers()[symbol] ?? initial[symbol],
    () => initial[symbol],
  );
}

/** Prix en temps réel de tous les actifs (pour les totaux de portefeuille). */
export function useTickers(): TickerMap {
  const initial = useContext(InitialTickersContext);
  const live = useSyncExternalStore(priceStore.subscribe, priceStore.getTickers, () => EMPTY);
  return useMemo(() => ({ ...initial, ...live }), [initial, live]);
}

/**
 * Lit les prix à la demande (dans un gestionnaire d'événement), sans
 * s'abonner : le composant ne se re-rend pas à chaque mise à jour.
 */
export function useTickerReader(): () => TickerMap {
  const initial = useContext(InitialTickersContext);
  return useCallback(() => ({ ...initial, ...priceStore.getTickers() }), [initial]);
}

export function useConnectionStatus(): priceStore.ConnectionStatus {
  return useSyncExternalStore(priceStore.subscribe, priceStore.getStatus, () => "connecting" as const);
}
