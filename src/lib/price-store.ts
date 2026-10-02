import { ASSETS } from "./assets";
import { BINANCE_STREAM_URL, type Ticker } from "./market";

/**
 * Prix en temps réel côté navigateur, via le flux WebSocket public de Binance.
 *
 * - Une seule connexion pour toute l'app, ouverte quand un composant s'abonne
 *   et fermée quelques secondes après le départ du dernier.
 * - Binance envoie une mise à jour par seconde et par actif : on les regroupe
 *   et on ne notifie React que toutes les 500 ms.
 * - Chaque actif garde la même référence tant que son prix ne change pas, ce
 *   qui évite de re-rendre les composants qui ne sont pas concernés.
 *
 * Les fonctions sont prévues pour `useSyncExternalStore`.
 */

type MiniTickerMessage = {
  data: { s: string; c: string; o: string; h: string; l: string; q: string };
};

const STREAM_URL = `${BINANCE_STREAM_URL}/stream?streams=${ASSETS.map(
  (a) => `${a.symbol.toLowerCase()}@miniTicker`,
).join("/")}`;

const FLUSH_INTERVAL_MS = 500;
const IDLE_CLOSE_MS = 5_000;
const MAX_RETRY_DELAY_MS = 30_000;

export type ConnectionStatus = "connecting" | "live" | "offline";

let tickers: Readonly<Record<string, Ticker>> = {};
let status: ConnectionStatus = "connecting";
let pending: Record<string, Ticker> = {};
const listeners = new Set<() => void>();

let socket: WebSocket | null = null;
let retries = 0;
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  clearTimeout(closeTimer);
  connect();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) closeTimer = setTimeout(disconnect, IDLE_CLOSE_MS);
  };
}

export function getTickers(): Readonly<Record<string, Ticker>> {
  return tickers;
}

/** État de la connexion, pour ne pas afficher « En direct » à tort. */
export function getStatus(): ConnectionStatus {
  return status;
}

function setStatus(next: ConnectionStatus) {
  if (status === next) return;
  status = next;
  notify();
}

function connect() {
  if (socket || retryTimer) return;

  const ws = new WebSocket(STREAM_URL);
  socket = ws;
  setStatus("connecting");

  ws.onopen = () => {
    retries = 0;
    setStatus("live");
  };

  ws.onmessage = (event) => {
    const { data } = JSON.parse(event.data as string) as MiniTickerMessage;
    pending[data.s] = {
      symbol: data.s,
      price: Number(data.c),
      open: Number(data.o),
      high: Number(data.h),
      low: Number(data.l),
      quoteVolume: Number(data.q),
    };
    flushTimer ??= setTimeout(flush, FLUSH_INTERVAL_MS);
  };

  ws.onclose = () => {
    // Fermeture volontaire (`disconnect`) : une autre connexion a pu être ouverte depuis.
    if (socket !== ws) return;
    socket = null;
    if (listeners.size === 0) return;
    setStatus("offline");
    // Reconnexion avec attente exponentielle : 1 s, 2 s, 4 s… jusqu'à 30 s.
    const delay = Math.min(1_000 * 2 ** retries++, MAX_RETRY_DELAY_MS);
    retryTimer = setTimeout(() => {
      retryTimer = undefined;
      connect();
    }, delay);
  };
}

function disconnect() {
  clearTimeout(retryTimer);
  retryTimer = undefined;
  const ws = socket;
  socket = null;
  ws?.close();
}

function flush() {
  flushTimer = undefined;
  tickers = { ...tickers, ...pending };
  pending = {};
  notify();
}

function notify() {
  for (const listener of listeners) listener();
}
