import "server-only";

import { z } from "zod";

import { ASSETS, type Asset } from "./assets";
import type { Candle, Interval, Ticker } from "./market";

/**
 * API REST publique de Binance réservée aux données de marché. Contrairement
 * à api.binance.com, elle n'est pas bloquée depuis les serveurs américains.
 */
const API_URL = "https://data-api.binance.vision/api/v3";

const decimalString = z.string().regex(/^\d+(\.\d+)?$/);

const miniTickerSchema = z.object({
  symbol: z.string(),
  lastPrice: decimalString,
  openPrice: decimalString,
  highPrice: decimalString,
  lowPrice: decimalString,
  quoteVolume: decimalString,
});

// [ouverture, open, high, low, close, volume, ...]
const klineSchema = z.tuple(
  [z.number(), decimalString, decimalString, decimalString, decimalString, decimalString],
  z.unknown(),
);

async function getJson(path: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(`Binance a répondu ${response.status} pour ${path}`);
  }
  return response.json();
}

/** Statistiques 24 h de tous les actifs, mises en cache 10 secondes. */
export async function getTickers(): Promise<Ticker[]> {
  const symbols = encodeURIComponent(JSON.stringify(ASSETS.map((a) => a.symbol)));
  const data = z
    .array(miniTickerSchema)
    .parse(await getJson(`/ticker/24hr?type=MINI&symbols=${symbols}`, { next: { revalidate: 10 } }));

  return data.map((t) => ({
    symbol: t.symbol,
    price: Number(t.lastPrice),
    open: Number(t.openPrice),
    high: Number(t.highPrice),
    low: Number(t.lowPrice),
    quoteVolume: Number(t.quoteVolume),
  }));
}

/** Même chose, sans faire échouer la page si Binance est indisponible. */
export async function getTickersSafe(): Promise<Ticker[]> {
  try {
    return await getTickers();
  } catch (error) {
    console.error("Impossible de récupérer les prix Binance", error);
    return [];
  }
}

/**
 * Prix d'exécution d'un ordre : toujours lu côté serveur, sans cache. Le prix
 * affiché dans le navigateur n'est jamais utilisé pour exécuter un ordre.
 *
 * Renvoyé en chaîne pour être converti en décimal sans perte de précision.
 */
export async function getExecutionPrice(asset: Asset): Promise<string> {
  const data = z
    .object({ price: decimalString })
    .parse(await getJson(`/ticker/price?symbol=${asset.symbol}`, { cache: "no-store" }));
  return data.price;
}

export async function getCandles(asset: Asset, interval: Interval, limit = 300): Promise<Candle[]> {
  const data = z
    .array(klineSchema)
    .parse(
      await getJson(`/klines?symbol=${asset.symbol}&interval=${interval}&limit=${limit}`, {
        next: { revalidate: 30 },
      }),
    );

  return data.map(([openTime, open, high, low, close, volume]) => ({
    time: openTime / 1000,
    open: Number(open),
    high: Number(high),
    low: Number(low),
    close: Number(close),
    volume: Number(volume),
  }));
}
