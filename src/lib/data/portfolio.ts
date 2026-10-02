import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import type { Asset } from "../assets";
import { db, type Transaction } from "../db";
import { holding, portfolio, session, trade, user } from "../db/schema";
import { Dec, STARTING_CASH, executeBuy, executeSell, valuePortfolio } from "../trading";

export type HoldingRow = { symbol: string; quantity: string; costBasis: string };

export type TradeRow = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: string;
  price: string;
  total: string;
  realizedPnl: string | null;
  createdAt: Date;
};

/** Chaque utilisateur démarre avec 10 000 $ fictifs, créés à la première visite. */
async function ensurePortfolio(executor: Transaction | typeof db, userId: string) {
  await executor
    .insert(portfolio)
    .values({ userId, cash: STARTING_CASH.toFixed() })
    .onConflictDoNothing();
}

export async function getPortfolio(userId: string) {
  await ensurePortfolio(db, userId);

  const [account, holdings, [stats]] = await Promise.all([
    db.select({ cash: portfolio.cash }).from(portfolio).where(eq(portfolio.userId, userId)),
    db
      .select({ symbol: holding.symbol, quantity: holding.quantity, costBasis: holding.costBasis })
      .from(holding)
      .where(eq(holding.userId, userId)),
    db
      .select({
        realizedPnl: sql<string>`coalesce(sum(${trade.realizedPnl}), 0)`,
        tradeCount: sql<number>`count(*)::int`,
      })
      .from(trade)
      .where(eq(trade.userId, userId)),
  ]);

  return {
    cash: account[0].cash,
    holdings: holdings satisfies HoldingRow[],
    realizedPnl: stats.realizedPnl,
    tradeCount: stats.tradeCount,
  };
}

export async function getTrades(
  userId: string,
  { symbol, limit = 50 }: { symbol?: string; limit?: number } = {},
): Promise<TradeRow[]> {
  return db
    .select({
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      price: trade.price,
      total: trade.total,
      realizedPnl: trade.realizedPnl,
      createdAt: trade.createdAt,
    })
    .from(trade)
    .where(symbol ? and(eq(trade.userId, userId), eq(trade.symbol, symbol)) : eq(trade.userId, userId))
    .orderBy(desc(trade.createdAt))
    .limit(limit);
}

/**
 * Exécute un ordre au marché dans une transaction.
 *
 * Les lignes du portefeuille et de la position sont verrouillées
 * (`SELECT ... FOR UPDATE`) : deux ordres envoyés en même temps sont traités
 * l'un après l'autre et ne peuvent pas dépenser deux fois les mêmes liquidités.
 */
export async function executeOrder(input: {
  userId: string;
  asset: Asset;
  side: "buy" | "sell";
  quantity: string;
  price: string;
}) {
  const { userId, asset, side } = input;
  const quantity = new Dec(input.quantity);
  const price = new Dec(input.price);

  return db.transaction(async (tx) => {
    await ensurePortfolio(tx, userId);

    const [account] = await tx
      .select({ cash: portfolio.cash })
      .from(portfolio)
      .where(eq(portfolio.userId, userId))
      .for("update");

    const [current] = await tx
      .select({ quantity: holding.quantity, costBasis: holding.costBasis })
      .from(holding)
      .where(and(eq(holding.userId, userId), eq(holding.symbol, asset.symbol)))
      .for("update");

    const order = {
      cash: new Dec(account.cash),
      position: current
        ? { quantity: new Dec(current.quantity), costBasis: new Dec(current.costBasis) }
        : null,
      quantity,
      price,
    };

    // Lève une TradeError (fonds insuffisants, etc.) qui annule la transaction.
    const result = side === "buy" ? executeBuy(order) : executeSell(order);

    await tx.update(portfolio).set({ cash: result.cash.toFixed() }).where(eq(portfolio.userId, userId));

    if (result.position) {
      const values = {
        quantity: result.position.quantity.toFixed(),
        costBasis: result.position.costBasis.toFixed(),
      };
      await tx
        .insert(holding)
        .values({ userId, symbol: asset.symbol, ...values })
        .onConflictDoUpdate({ target: [holding.userId, holding.symbol], set: values });
    } else {
      await tx
        .delete(holding)
        .where(and(eq(holding.userId, userId), eq(holding.symbol, asset.symbol)));
    }

    await tx.insert(trade).values({
      userId,
      symbol: asset.symbol,
      side,
      quantity: quantity.toFixed(),
      price: price.toFixed(),
      total: result.total.toFixed(),
      realizedPnl: "realizedPnl" in result ? result.realizedPnl.toFixed() : null,
    });

    return { total: result.total.toFixed() };
  });
}

/** Repart de zéro : 10 000 $, aucune position, historique effacé. */
export async function resetPortfolio(userId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(trade).where(eq(trade.userId, userId));
    await tx.delete(holding).where(eq(holding.userId, userId));
    await tx
      .insert(portfolio)
      .values({ userId, cash: STARTING_CASH.toFixed() })
      .onConflictDoUpdate({ target: portfolio.userId, set: { cash: STARTING_CASH.toFixed() } });
  });
}

/**
 * Appelé quand un invité se connecte avec GitHub. Si le compte GitHub n'a
 * encore rien fait, il récupère le portefeuille de l'invité ; sinon on garde
 * celui du compte GitHub. L'invité est supprimé ensuite par Better Auth.
 */
export async function transferPortfolio(fromUserId: string, toUserId: string) {
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: trade.id })
      .from(trade)
      .where(eq(trade.userId, toUserId))
      .limit(1);
    if (existing) return;

    await tx.delete(holding).where(eq(holding.userId, toUserId));
    await tx.delete(portfolio).where(eq(portfolio.userId, toUserId));
    await tx.update(portfolio).set({ userId: toUserId }).where(eq(portfolio.userId, fromUserId));
    await tx.update(holding).set({ userId: toUserId }).where(eq(holding.userId, fromUserId));
    await tx.update(trade).set({ userId: toUserId }).where(eq(trade.userId, fromUserId));
  });
}

export type LeaderboardEntry = {
  userId: string;
  name: string;
  image: string | null;
  isGuest: boolean;
  total: string;
  performance: string;
  tradeCount: number;
};

/** Classement des joueurs ayant passé au moins un ordre, valorisé aux prix actuels. */
export async function getLeaderboard(
  prices: ReadonlyMap<string, Dec>,
  limit = 50,
): Promise<LeaderboardEntry[]> {
  const players = await db
    .select({
      userId: user.id,
      name: user.name,
      image: user.image,
      isAnonymous: user.isAnonymous,
      cash: portfolio.cash,
      tradeCount: sql<number>`count(${trade.id})::int`,
    })
    .from(portfolio)
    .innerJoin(user, eq(user.id, portfolio.userId))
    .innerJoin(trade, eq(trade.userId, portfolio.userId))
    .groupBy(user.id, portfolio.cash);

  if (players.length === 0) return [];

  const positions = await db
    .select({ userId: holding.userId, symbol: holding.symbol, quantity: holding.quantity, costBasis: holding.costBasis })
    .from(holding)
    .where(inArray(holding.userId, players.map((p) => p.userId)));

  return players
    .map((player) => {
      const valuation = valuePortfolio(
        new Dec(player.cash),
        positions
          .filter((p) => p.userId === player.userId)
          .map((p) => ({ symbol: p.symbol, quantity: new Dec(p.quantity), costBasis: new Dec(p.costBasis) })),
        prices,
      );
      return { player, valuation };
    })
    .sort((a, b) => b.valuation.total.comparedTo(a.valuation.total))
    .slice(0, limit)
    .map(({ player, valuation }) => ({
      userId: player.userId,
      name: player.name,
      image: player.image,
      isGuest: Boolean(player.isAnonymous),
      total: valuation.total.toFixed(2),
      performance: valuation.performance.toFixed(6),
      tradeCount: player.tradeCount,
    }));
}

/**
 * Supprime les comptes invités devenus inaccessibles : plus aucune session
 * valide, donc personne ne pourra jamais s'y reconnecter.
 */
export async function deleteAbandonedGuests(): Promise<number> {
  const deleted = await db
    .delete(user)
    .where(
      and(
        eq(user.isAnonymous, true),
        sql`not exists (select 1 from ${session} where ${session.userId} = ${user.id} and ${session.expiresAt} > now())`,
      ),
    )
    .returning({ id: user.id });
  return deleted.length;
}
