import type { Metadata } from "next";
import Link from "next/link";

import { Panel } from "@/components/panel";
import { Trend } from "@/components/trend";
import { button } from "@/components/ui";
import { getTickersSafe } from "@/lib/binance";
import { getLeaderboard } from "@/lib/data/portfolio";
import { formatPercent, formatUsd } from "@/lib/format";
import { getSession } from "@/lib/session";
import { Dec } from "@/lib/trading";

export const metadata: Metadata = { title: "Classement" };

const th = "px-3 py-2 font-normal";
const td = "px-3 py-1.5";

export default async function LeaderboardPage() {
  const [tickers, session] = await Promise.all([getTickersSafe(), getSession()]);
  const prices = new Map(tickers.map((t) => [t.symbol, new Dec(t.price)]));
  const entries = await getLeaderboard(prices);
  const myRank = session ? entries.findIndex((e) => e.userId === session.user.id) + 1 : 0;

  return (
    <Panel
      headingLevel="h1"
      title="Classement · valeur aux prix actuels"
      aside={
        session &&
        (myRank > 0 ? (
          <span>
            <span className="caps">Votre rang</span>{" "}
            <span className="num text-amber">
              {myRank}/{entries.length}
            </span>
          </span>
        ) : (
          <Link href="/markets" className="text-amber hover:underline">
            Passez un ordre pour apparaître au classement
          </Link>
        ))
      }
      bodyClassName=""
    >
      {entries.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3">
          <p className="text-muted">Personne n&apos;a encore passé d&apos;ordre. La première place est libre.</p>
          <Link href="/markets" className={button.small}>
            Passer un premier ordre
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Joueurs ayant passé au moins un ordre, classés par valeur de portefeuille
            </caption>
            <thead className="caps text-left text-xs text-muted">
              <tr className="border-b border-line">
                <th scope="col" className={`${th} w-14`}>Rang</th>
                <th scope="col" className={th}>Joueur</th>
                <th scope="col" className={`${th} hidden text-right sm:table-cell`}>Ordres</th>
                <th scope="col" className={`${th} text-right`}>Valeur</th>
                <th scope="col" className={`${th} text-right`}>Perf.</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const isMe = entry.userId === session?.user.id;
                return (
                  <tr
                    key={entry.userId}
                    aria-current={isMe ? "true" : undefined}
                    className={`border-b border-line last:border-0 ${isMe ? "bg-amber/10" : ""}`}
                  >
                    {/* Podium en ambre ; le rang reste écrit en chiffres. */}
                    <td className={`${td} num ${index < 3 ? "text-amber" : "text-muted"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className={td}>
                      <span className="truncate">{entry.name}</span>
                      {entry.isGuest && <span className="caps ml-2 text-xs text-muted">Invité</span>}
                      {isMe && <span className="caps ml-2 text-xs text-amber">Vous</span>}
                    </td>
                    <td className={`${td} num hidden text-right text-muted sm:table-cell`}>{entry.tradeCount}</td>
                    <td className={`${td} num text-right`}>{formatUsd(entry.total)}</td>
                    <td className={`${td} text-right`}>
                      <Trend value={entry.performance} digits={4}>
                        {formatPercent(entry.performance)}
                      </Trend>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
