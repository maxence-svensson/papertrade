import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Avatar } from "@/components/avatar";
import { ArrowRightIcon, MedalIcon, TrophyIcon } from "@/components/icons";
import { Trend } from "@/components/trend";
import { getTickersSafe } from "@/lib/binance";
import { getLeaderboard } from "@/lib/data/portfolio";
import { formatPercent, formatUsd } from "@/lib/format";
import { getSession } from "@/lib/session";
import { Dec } from "@/lib/trading";

export const metadata: Metadata = { title: "Classement" };

// Or, argent, bronze pour le podium (le rang reste écrit en chiffres).
const MEDAL_COLORS = ["var(--color-primary)", "#cbd5e1", "#d97706"];

export default async function LeaderboardPage() {
  const [tickers, session] = await Promise.all([getTickersSafe(), getSession()]);
  const prices = new Map(tickers.map((t) => [t.symbol, new Dec(t.price)]));
  const entries = await getLeaderboard(prices);
  const myRank = session ? entries.findIndex((e) => e.userId === session.user.id) + 1 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Classement</h1>
          <p className="text-sm text-muted">
            Joueurs ayant passé au moins un ordre, valorisés aux prix actuels du marché.
          </p>
        </div>
        {session &&
          (myRank > 0 ? (
            <p className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
              Votre rang : <strong className="num">{myRank}</strong>
              <span className="text-muted"> sur {entries.length}</span>
            </p>
          ) : (
            <Link href="/markets" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              Passez un ordre pour apparaître au classement
              <ArrowRightIcon aria-hidden size={16} />
            </Link>
          ))}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <TrophyIcon aria-hidden size={26} />
          </span>
          <div className="space-y-1">
            <h2 className="font-semibold">Le classement est vide</h2>
            <p className="text-sm text-muted">Personne n&apos;a encore passé d&apos;ordre. La première place est libre.</p>
          </div>
          <Link
            href="/markets"
            className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            Passer un premier ordre
            <ArrowRightIcon aria-hidden size={18} weight="bold" />
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">Classement des joueurs par valeur de portefeuille</caption>
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-border">
                <th scope="col" className="w-16 px-4 py-2.5 font-medium">Rang</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Joueur</th>
                <th scope="col" className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">Ordres</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Valeur</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Performance</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const isMe = entry.userId === session?.user.id;
                const medal = MEDAL_COLORS[index];
                return (
                  <tr
                    key={entry.userId}
                    aria-current={isMe ? "true" : undefined}
                    className={`border-b border-border last:border-0 ${isMe ? "bg-primary/10" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <span className="num inline-flex items-center gap-1.5 font-semibold">
                        {medal && <MedalIcon aria-hidden size={18} weight="fill" style={{ color: medal }} />}
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {entry.image ? (
                          <Image src={entry.image} alt="" width={32} height={32} className="rounded-full" />
                        ) : (
                          <Avatar name={entry.name} size={32} />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {entry.name}
                            {isMe && <span className="ml-2 text-xs font-semibold text-primary">vous</span>}
                          </p>
                          {entry.isGuest && <p className="text-xs text-muted">Invité</p>}
                        </div>
                      </div>
                    </td>
                    <td className="num hidden px-4 py-3 text-right text-muted sm:table-cell">{entry.tradeCount}</td>
                    <td className="num px-4 py-3 text-right font-medium">{formatUsd(entry.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <Trend value={entry.performance} digits={4}>{formatPercent(entry.performance)}</Trend>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
