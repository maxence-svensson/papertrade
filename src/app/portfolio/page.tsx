import type { Metadata } from "next";

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Portefeuille</h1>
          <p className="text-sm text-muted">
            {account.tradeCount} ordre{plural} passé{plural} · capital de départ 10 000 $
          </p>
        </div>
        <ResetButton />
      </div>

      <PortfolioOverview cash={account.cash} holdings={account.holdings} realizedPnl={account.realizedPnl} />

      {trades.length > 0 && (
        <section aria-labelledby="historique" className="space-y-3">
          <h2 id="historique" className="font-semibold">
            Historique des ordres
          </h2>
          <TradeHistory trades={trades} />
        </section>
      )}
    </div>
  );
}
