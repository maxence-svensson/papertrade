import type { Metadata } from "next";

import { MarketMovers, MarketTable } from "@/components/market-table";
import { Panel } from "@/components/panel";

export const metadata: Metadata = { title: "Marchés" };

export default function MarketsPage() {
  return (
    <Panel
      headingLevel="h1"
      title="Marchés · 10 actifs · USDT"
      aside={<MarketMovers />}
      bodyClassName=""
    >
      <MarketTable />
    </Panel>
  );
}
