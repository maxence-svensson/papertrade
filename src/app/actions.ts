"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { getAsset } from "@/lib/assets";
import { getExecutionPrice } from "@/lib/binance";
import { executeOrder, resetPortfolio } from "@/lib/data/portfolio";
import { formatPrice, formatQuantity, formatUsd } from "@/lib/format";
import { orderSchema } from "@/lib/order-schema";
import { getSession } from "@/lib/session";
import { TradeError } from "@/lib/trading";

export type OrderState =
  | { status: "idle" }
  | { status: "success" | "error"; message: string; at: number };

const fail = (message: string): OrderState => ({ status: "error", message, at: Date.now() });

/**
 * Passe un ordre au marché. Seuls l'actif, le sens et la quantité viennent du
 * navigateur : l'utilisateur est déduit de la session et le prix est relu
 * côté serveur au moment de l'exécution.
 */
export async function placeOrder(_previous: OrderState, formData: FormData): Promise<OrderState> {
  const session = await getSession();
  if (!session) return fail("Connectez-vous pour passer un ordre.");

  const parsed = orderSchema.safeParse({
    symbol: formData.get("symbol"),
    side: formData.get("side"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { symbol, side, quantity } = parsed.data;
  const asset = getAsset(symbol)!;

  let price: string;
  try {
    price = await getExecutionPrice(asset);
  } catch (error) {
    console.error("Prix d'exécution indisponible", error);
    return fail("Prix du marché indisponible, réessayez dans un instant.");
  }

  let total: string;
  try {
    ({ total } = await executeOrder({ userId: session.user.id, asset, side, quantity, price }));
  } catch (error) {
    if (error instanceof TradeError) return fail(error.message);
    throw error;
  }

  // Réaffiche la page avec le nouveau solde, dans la même réponse.
  refresh();

  const verb = side === "buy" ? "Achat exécuté" : "Vente exécutée";
  return {
    status: "success",
    message: `${verb} : ${formatQuantity(quantity)} ${asset.base} à ${formatPrice(price)} (total ${formatUsd(total)}).`,
    at: Date.now(),
  };
}

export async function resetPortfolioAction() {
  const session = await getSession();
  if (!session) redirect("/login?next=/portfolio");

  await resetPortfolio(session.user.id);
  refresh();
}
