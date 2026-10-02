import type { Metadata } from "next";

import { LiveBadge } from "@/components/live-badge";
import { MarketTable } from "@/components/market-table";
import { TopMovers } from "@/components/top-movers";

export const metadata: Metadata = { title: "Marchés" };

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Marchés</h1>
          <p className="text-sm text-muted">10 cryptomonnaies cotées en USDT, au prix réel de Binance.</p>
        </div>
        <LiveBadge />
      </div>
      <TopMovers />
      <MarketTable />
    </div>
  );
}
