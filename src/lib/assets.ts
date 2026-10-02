/** Cryptomonnaies disponibles à la négociation, cotées en USDT sur Binance. */
export const ASSETS = [
  { symbol: "BTCUSDT", base: "BTC", name: "Bitcoin", color: "#f7931a" },
  { symbol: "ETHUSDT", base: "ETH", name: "Ethereum", color: "#8c8cf7" },
  { symbol: "SOLUSDT", base: "SOL", name: "Solana", color: "#14f195" },
  { symbol: "BNBUSDT", base: "BNB", name: "BNB", color: "#f3ba2f" },
  { symbol: "XRPUSDT", base: "XRP", name: "XRP", color: "#9ca3af" },
  { symbol: "ADAUSDT", base: "ADA", name: "Cardano", color: "#3b82f6" },
  { symbol: "DOGEUSDT", base: "DOGE", name: "Dogecoin", color: "#c2a633" },
  { symbol: "AVAXUSDT", base: "AVAX", name: "Avalanche", color: "#e84142" },
  { symbol: "LINKUSDT", base: "LINK", name: "Chainlink", color: "#2a5ada" },
  { symbol: "LTCUSDT", base: "LTC", name: "Litecoin", color: "#a6a9aa" },
] as const;

export type Asset = (typeof ASSETS)[number];
export type AssetSymbol = Asset["symbol"];

export const ASSET_SYMBOLS = ASSETS.map((a) => a.symbol) as [AssetSymbol, ...AssetSymbol[]];

const bySymbol = new Map<string, Asset>(ASSETS.map((a) => [a.symbol, a]));

export function getAsset(symbol: string): Asset | undefined {
  return bySymbol.get(symbol);
}

/** Les URLs utilisent le code court en minuscules : `/trade/btc`. */
export function assetFromSlug(slug: string): Asset | undefined {
  return bySymbol.get(`${slug.toUpperCase()}USDT`);
}

export function assetSlug(asset: Asset): string {
  return asset.base.toLowerCase();
}
