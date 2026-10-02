import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getAsset } from "../assets";
import { db, pool } from "../db";
import { user } from "../db/schema";
import { Dec, TradeError } from "../trading";
import { executeOrder, getPortfolio, resetPortfolio } from "./portfolio";

/**
 * Tests d'intégration sur une vraie base Postgres (`docker compose up -d`).
 * Ignorés si DATABASE_URL n'est pas définie.
 */
describe.skipIf(!process.env.DATABASE_URL)("executeOrder (Postgres)", () => {
  const userId = `test-${randomUUID()}`;
  const btc = getAsset("BTCUSDT")!;

  beforeAll(async () => {
    await db.insert(user).values({ id: userId, name: "Test", email: `${userId}@test.invalid` });
  });

  afterAll(async () => {
    // Supprime aussi portefeuille, positions et ordres (ON DELETE CASCADE).
    await db.delete(user).where(eq(user.id, userId));
    await pool.end();
  });

  it("ne dépense jamais deux fois les mêmes liquidités, même avec des ordres simultanés", async () => {
    await resetPortfolio(userId);

    // 10 achats de 2 000 $ envoyés en même temps avec 10 000 $ : seuls 5 passent.
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        executeOrder({ userId, asset: btc, side: "buy", quantity: "1", price: "2000" }),
      ),
    );

    const rejected = results.filter((r) => r.status === "rejected");
    expect(results.length - rejected.length).toBe(5);
    for (const r of rejected) expect(r.reason).toBeInstanceOf(TradeError);

    const account = await getPortfolio(userId);
    expect(new Dec(account.cash).toString()).toBe("0");
    expect(new Dec(account.holdings[0].quantity).toString()).toBe("5");
    expect(account.tradeCount).toBe(5);
  });

  it("enregistre la plus-value et supprime la position soldée", async () => {
    await resetPortfolio(userId);
    await executeOrder({ userId, asset: btc, side: "buy", quantity: "0.1", price: "50000" });
    await executeOrder({ userId, asset: btc, side: "sell", quantity: "0.1", price: "60000" });

    const account = await getPortfolio(userId);
    expect(new Dec(account.cash).toString()).toBe("11000");
    expect(account.holdings).toHaveLength(0);
    expect(new Dec(account.realizedPnl).toString()).toBe("1000");
  });
});
