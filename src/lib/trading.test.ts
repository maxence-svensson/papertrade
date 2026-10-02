import { describe, expect, it } from "vitest";

import { databaseUrl } from "./db/url";
import { orderSchema } from "./order-schema";
import { Dec, TradeError, executeBuy, executeSell, valuePortfolio } from "./trading";

const d = (value: number | string) => new Dec(value);

describe("executeBuy", () => {
  it("débite les liquidités et ouvre une position", () => {
    const result = executeBuy({ cash: d(10_000), position: null, quantity: d("0.1"), price: d(60_000) });

    expect(result.total.toString()).toBe("6000");
    expect(result.cash.toString()).toBe("4000");
    expect(result.position.quantity.toString()).toBe("0.1");
    expect(result.position.costBasis.toString()).toBe("6000");
  });

  it("refuse un achat supérieur aux liquidités", () => {
    expect(() =>
      executeBuy({ cash: d(10_000), position: null, quantity: d("0.5"), price: d(60_000) }),
    ).toThrow(TradeError);
  });

  it("cumule la quantité et le coût d'achat sur une position existante", () => {
    const result = executeBuy({
      cash: d(10_000),
      position: { quantity: d(1), costBasis: d(2_000) },
      quantity: d(1),
      price: d(3_000),
    });

    expect(result.cash.toString()).toBe("7000");
    expect(result.position.quantity.toString()).toBe("2");
    expect(result.position.costBasis.toString()).toBe("5000");
  });

  it("reste exact là où les flottants se trompent", () => {
    // En JavaScript : 0.1 * 3 === 0.30000000000000004
    const result = executeBuy({ cash: d(10), position: null, quantity: d("0.1"), price: d(30) });

    expect(result.total.toString()).toBe("3");
    expect(result.cash.toString()).toBe("7");
  });

  it("arrondit le coût au 8e chiffre après la virgule, à la hausse", () => {
    // 0,25 × 4,00000001 = 1,0000000025
    const result = executeBuy({ cash: d(100), position: null, quantity: d("0.25"), price: d("4.00000001") });

    expect(result.total.toString()).toBe("1.00000001");
  });

  it("refuse un ordre sous le montant minimum", () => {
    expect(() =>
      executeBuy({ cash: d(100), position: null, quantity: d("0.00001"), price: d(60_000) }),
    ).toThrow(/minimum/);
  });

  it("refuse une quantité nulle ou négative", () => {
    expect(() => executeBuy({ cash: d(100), position: null, quantity: d(0), price: d(10) })).toThrow(TradeError);
    expect(() => executeBuy({ cash: d(100), position: null, quantity: d(-1), price: d(10) })).toThrow(TradeError);
  });
});

describe("executeSell", () => {
  const position = { quantity: d(2), costBasis: d(5_000) };

  it("crédite les liquidités et calcule la plus-value au prix de revient moyen", () => {
    const result = executeSell({ cash: d(0), position, quantity: d(1), price: d(4_000) });

    expect(result.total.toString()).toBe("4000");
    expect(result.cash.toString()).toBe("4000");
    // Prix de revient moyen : 2 500 $ → plus-value de 1 500 $
    expect(result.realizedPnl.toString()).toBe("1500");
    expect(result.position?.quantity.toString()).toBe("1");
    expect(result.position?.costBasis.toString()).toBe("2500");
  });

  it("arrondit le produit de la vente à la baisse", () => {
    const result = executeSell({
      cash: d(0),
      position: { quantity: d(1), costBasis: d(1) },
      quantity: d("0.25"),
      price: d("4.00000001"),
    });

    expect(result.total.toString()).toBe("1");
  });

  it("solde la position quand tout est vendu", () => {
    const result = executeSell({ cash: d(0), position, quantity: d(2), price: d(2_000) });

    expect(result.position).toBeNull();
    expect(result.realizedPnl.toString()).toBe("-1000");
  });

  it("autorise la vente d'un reliquat sous le minimum pour solder la position", () => {
    const dust = { quantity: d("0.00001"), costBasis: d("0.5") };
    const result = executeSell({ cash: d(0), position: dust, quantity: d("0.00001"), price: d(60_000) });

    expect(result.position).toBeNull();
    expect(result.total.toString()).toBe("0.6");
  });

  it("refuse de vendre plus que la position", () => {
    expect(() => executeSell({ cash: d(0), position, quantity: d(3), price: d(1_000) })).toThrow(TradeError);
  });

  it("refuse de vendre sans position", () => {
    expect(() => executeSell({ cash: d(0), position: null, quantity: d(1), price: d(1_000) })).toThrow(TradeError);
  });
});

describe("valuePortfolio", () => {
  it("valorise les positions aux prix du marché", () => {
    const valuation = valuePortfolio(
      d(5_000),
      [{ symbol: "BTCUSDT", quantity: d("0.1"), costBasis: d(5_000) }],
      new Map([["BTCUSDT", d(60_000)]]),
    );

    expect(valuation.holdingsValue.toString()).toBe("6000");
    expect(valuation.total.toString()).toBe("11000");
    expect(valuation.performance.toString()).toBe("0.1");
  });

  it("se rabat sur le coût d'achat quand un prix manque", () => {
    const valuation = valuePortfolio(
      d(0),
      [{ symbol: "ETHUSDT", quantity: d(1), costBasis: d(3_000) }],
      new Map(),
    );

    expect(valuation.total.toString()).toBe("3000");
  });
});

describe("orderSchema", () => {
  it("accepte la virgule décimale", () => {
    const parsed = orderSchema.parse({ symbol: "BTCUSDT", side: "buy", quantity: " 0,25 " });

    expect(parsed.quantity).toBe("0.25");
  });

  it.each(["0", "-1", "abc", "1e5", "0.123456789", ""])("rejette la quantité %j", (quantity) => {
    expect(orderSchema.safeParse({ symbol: "BTCUSDT", side: "buy", quantity }).success).toBe(false);
  });

  it("rejette un actif hors de la liste", () => {
    expect(orderSchema.safeParse({ symbol: "FAKEUSDT", side: "buy", quantity: "1" }).success).toBe(false);
  });
});

describe("databaseUrl", () => {
  it("rend explicite le mode SSL de Neon", () => {
    expect(databaseUrl("postgres://u:p@h/db?sslmode=require&channel_binding=require")).toBe(
      "postgres://u:p@h/db?sslmode=verify-full&channel_binding=require",
    );
  });

  it("laisse les autres URLs intactes", () => {
    expect(databaseUrl("postgres://u:p@localhost:5433/db")).toBe("postgres://u:p@localhost:5433/db");
    expect(databaseUrl(undefined)).toBeUndefined();
  });
});
