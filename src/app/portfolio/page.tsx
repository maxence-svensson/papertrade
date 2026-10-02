import type { Metadata } from "next";

import { Panel } from "@/components/panel";
import { TradeHistory } from "@/components/trade-history";
import { getPortfolio, getTrades } from "@/lib/data/portfolio";
import { requireUser } from "@/lib/session";

import { PortfolioOverview } from "./portfolio-overview";
import { ResetButton } from "./reset-button";

export const metadata: Metadata = { title: "Portefeuille" };

export default async function PortfolioPage() {
  const user = await requireUser("/portfolio");
  const [account, trades] = await Promise.all([getPortfolio(user.id), getTrades(user.id)]);
  const plural = account.tradeCount > 1 ? "s" : "";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-panel px-3 py-2.5">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="caps text-amber">Portefeuille</h1>
          <p className="text-xs text-muted">
            {account.tradeCount} ordre{plural} passé{plural} · capital de départ 10 000 $
          </p>
        </div>
        <ResetButton />
      </div>

      <PortfolioOverview cash={account.cash} holdings={account.holdings} realizedPnl={account.realizedPnl} />

      {trades.length > 0 && (
        <Panel title="Historique des ordres" aside={`${trades.length} ordre${trades.length > 1 ? "s" : ""}`} bodyClassName="">
          <TradeHistory trades={trades} />
        </Panel>
      )}
    </div>
  );
}
