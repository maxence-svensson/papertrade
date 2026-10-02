/** Cryptomonnaies disponibles à la négociation, cotées en USDT sur Binance. */
export const ASSETS = [
  { symbol: "BTCUSDT", base: "BTC", name: "Bitcoin" },
  { symbol: "ETHUSDT", base: "ETH", name: "Ethereum" },
  { symbol: "SOLUSDT", base: "SOL", name: "Solana" },
  { symbol: "BNBUSDT", base: "BNB", name: "BNB" },
  { symbol: "XRPUSDT", base: "XRP", name: "XRP" },
  { symbol: "ADAUSDT", base: "ADA", name: "Cardano" },
  { symbol: "DOGEUSDT", base: "DOGE", name: "Dogecoin" },
  { symbol: "AVAXUSDT", base: "AVAX", name: "Avalanche" },
  { symbol: "LINKUSDT", base: "LINK", name: "Chainlink" },
  { symbol: "LTCUSDT", base: "LTC", name: "Litecoin" },
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
