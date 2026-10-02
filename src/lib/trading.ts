import Decimal from "decimal.js";

import { STARTING_CASH_USD } from "./constants";

/**
 * Règles de calcul du simulateur, sans accès à la base ni au réseau : tout
 * est testé unitairement dans `trading.test.ts`.
 *
 * On travaille en décimal exact (decimal.js) car en flottant, 0.1 + 0.2 !== 0.3.
 * Une instance dédiée évite de modifier la configuration globale de decimal.js.
 */
export const Dec = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export type Dec = Decimal;

/** Décimales conservées en base (colonnes `numeric(28, 8)`). */
export const SCALE = 8;
export const STARTING_CASH = new Dec(STARTING_CASH_USD);
export const MIN_ORDER_TOTAL = new Dec(1);

export class TradeError extends Error {}

export type Position = { quantity: Dec; costBasis: Dec };

type OrderInput = {
  cash: Dec;
  position: Position | null;
  quantity: Dec;
  price: Dec;
};

export type BuyResult = { total: Dec; cash: Dec; position: Position };
export type SellResult = { total: Dec; cash: Dec; position: Position | null; realizedPnl: Dec };

export function executeBuy({ cash, position, quantity, price }: OrderInput): BuyResult {
  assertPositive(quantity, price);
  // Arrondi au détriment du client, comme sur une vraie plateforme.
  const total = quantity.times(price).toDecimalPlaces(SCALE, Dec.ROUND_UP);

  if (total.lt(MIN_ORDER_TOTAL)) {
    throw new TradeError(`Montant minimum par ordre : ${MIN_ORDER_TOTAL} $.`);
  }
  if (total.gt(cash)) {
    throw new TradeError("Liquidités insuffisantes pour cet achat.");
  }

  return {
    total,
    cash: cash.minus(total),
    position: {
      quantity: (position?.quantity ?? new Dec(0)).plus(quantity),
      costBasis: (position?.costBasis ?? new Dec(0)).plus(total),
    },
  };
}

export function executeSell({ cash, position, quantity, price }: OrderInput): SellResult {
  assertPositive(quantity, price);

  if (!position || quantity.gt(position.quantity)) {
    throw new TradeError("Vous ne pouvez pas vendre plus que votre position.");
  }

  const total = quantity.times(price).toDecimalPlaces(SCALE, Dec.ROUND_DOWN);
  const closesPosition = quantity.eq(position.quantity);

  // On autorise une vente sous le minimum uniquement pour solder une position.
  if (total.lt(MIN_ORDER_TOTAL) && !closesPosition) {
    throw new TradeError(`Montant minimum par ordre : ${MIN_ORDER_TOTAL} $.`);
  }

  // Méthode du prix de revient moyen : la part du coût d'achat sortie du
  // portefeuille est proportionnelle à la quantité vendue.
  const costSold = closesPosition
    ? position.costBasis
    : position.costBasis.times(quantity).div(position.quantity).toDecimalPlaces(SCALE);

  return {
    total,
    cash: cash.plus(total),
    position: closesPosition
      ? null
      : { quantity: position.quantity.minus(quantity), costBasis: position.costBasis.minus(costSold) },
    realizedPnl: total.minus(costSold),
  };
}

export type Valuation = {
  total: Dec;
  holdingsValue: Dec;
  /** Performance depuis le départ (0.05 = +5 %). */
  performance: Dec;
};

export function valuePortfolio(
  cash: Dec,
  positions: { symbol: string; quantity: Dec; costBasis: Dec }[],
  prices: ReadonlyMap<string, Dec>,
): Valuation {
  const holdingsValue = positions.reduce((sum, p) => {
    // Sans prix disponible, on valorise au coût d'achat plutôt qu'à zéro.
    const price = prices.get(p.symbol);
    return sum.plus(price ? p.quantity.times(price) : p.costBasis);
  }, new Dec(0));

  const total = cash.plus(holdingsValue);

  return {
    total,
    holdingsValue,
    performance: total.minus(STARTING_CASH).div(STARTING_CASH),
  };
}

function assertPositive(quantity: Dec, price: Dec) {
  if (!quantity.isFinite() || quantity.lte(0)) {
    throw new TradeError("La quantité doit être supérieure à zéro.");
  }
  if (!price.isFinite() || price.lte(0)) {
    throw new TradeError("Prix de marché invalide.");
  }
}
