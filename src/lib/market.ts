/** Types de données de marché partagés entre le serveur et le navigateur. */

export type Ticker = {
  symbol: string;
  price: number;
  /** Prix d'il y a 24 h, pour calculer la variation. */
  open: number;
  high: number;
  low: number;
  /** Volume échangé sur 24 h, en USDT. */
  quoteVolume: number;
};

export type Candle = {
  /** Horodatage d'ouverture, en secondes (format attendu par Lightweight Charts). */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Volume échangé pendant la bougie, en unités de l'actif. */
  volume: number;
};

export const INTERVALS = [
  { value: "15m", label: "15 min", seconds: 15 * 60 },
  { value: "1h", label: "1 h", seconds: 60 * 60 },
  { value: "4h", label: "4 h", seconds: 4 * 60 * 60 },
  { value: "1d", label: "1 j", seconds: 24 * 60 * 60 },
] as const;

export type Interval = (typeof INTERVALS)[number]["value"];

export function parseInterval(value: unknown): Interval {
  return INTERVALS.find((i) => i.value === value)?.value ?? "1h";
}

export function changePercent(ticker: Pick<Ticker, "price" | "open">): number {
  return ticker.open === 0 ? 0 : ((ticker.price - ticker.open) / ticker.open) * 100;
}

/** Flux WebSocket public de Binance réservé aux données de marché. */
export const BINANCE_STREAM_URL = "wss://data-stream.binance.vision";
