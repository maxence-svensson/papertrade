"use client";

import { useActionState, useId, useState } from "react";

import { placeOrder, type OrderState } from "@/app/actions";
import { LivePrice } from "@/components/live-price";
import { Leader } from "@/components/panel";
import { useTicker } from "@/components/prices-provider";
import { Spinner } from "@/components/spinner";
import { button } from "@/components/ui";
import type { Asset } from "@/lib/assets";
import { formatQuantity, formatUsd } from "@/lib/format";

const PERCENTS = [0.25, 0.5, 0.75, 1];

/** Marge pour « Max » à l'achat : le prix peut bouger avant l'exécution. */
const BUY_SAFETY_MARGIN = 0.995;

export function OrderForm({
  asset,
  cash,
  holdingQuantity,
}: {
  asset: Asset;
  cash: string;
  holdingQuantity: string | null;
}) {
  const id = useId();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  // Masque le dernier message dès que l'utilisateur modifie son ordre.
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const price = useTicker(asset.symbol)?.price;

  const [state, formAction, pending] = useActionState(
    async (previous: OrderState, formData: FormData) => {
      const result = await placeOrder(previous, formData);
      if (result.status === "success") setQuantity("");
      return result;
    },
    { status: "idle" },
  );

  const isBuy = side === "buy";
  const parsedQuantity = Number(quantity.replace(",", "."));
  const hasQuantity = parsedQuantity > 0;
  const estimate = price && hasQuantity ? parsedQuantity * price : null;

  // Vérification immédiate ; le serveur reste seul juge au moment de l'exécution.
  const overLimit = isBuy
    ? estimate !== null && estimate > Number(cash)
    : hasQuantity && parsedQuantity > Number(holdingQuantity ?? 0);
  const limitMessage = isBuy
    ? "Montant supérieur à vos liquidités disponibles."
    : "Quantité supérieure à votre position.";

  const feedback = state.status !== "idle" && state.at !== dismissedAt ? state : null;

  function edit() {
    if (state.status !== "idle") setDismissedAt(state.at);
  }

  function fill(percent: number) {
    edit();
    if (isBuy) {
      if (!price) return;
      const budget = Number(cash) * percent * (percent === 1 ? BUY_SAFETY_MARGIN : 1);
      setQuantity(floorToString(budget / price));
    } else if (holdingQuantity) {
      // 100 % : on reprend la quantité exacte pour solder la position.
      setQuantity(percent === 1 ? trimZeros(holdingQuantity) : floorToString(Number(holdingQuantity) * percent));
    }
  }

  const describedBy = [`${id}-help`, overLimit && `${id}-limit`, feedback && `${id}-feedback`]
    .filter(Boolean)
    .join(" ");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="symbol" value={asset.symbol} />
      <input type="hidden" name="side" value={side} />

      <div className="grid grid-cols-2 border border-line" role="group" aria-label="Sens de l'ordre">
        {(["buy", "sell"] as const).map((value) => {
          const active = side === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => {
                edit();
                setSide(value);
              }}
              className={`caps h-9 text-sm transition-colors ${
                active
                  ? value === "buy"
                    ? "bg-up text-on-amber"
                    : "bg-down text-on-amber"
                  : "text-muted hover:bg-hover hover:text-fg"
              }`}
            >
              {value === "buy" ? "Achat" : "Vente"}
            </button>
          );
        })}
      </div>

      <dl>
        <Leader label="Disponible">
          {isBuy ? formatUsd(cash) : `${formatQuantity(holdingQuantity ?? 0)} ${asset.base}`}
        </Leader>
      </dl>

      <div className="space-y-2">
        <label htmlFor={`${id}-quantity`} className="caps text-xs text-muted">
          Quantité ({asset.base})
        </label>
        <div
          // Bordure de 2 px au focus (1 px + anneau), rouge si la saisie dépasse le disponible.
          className={`flex h-11 items-center border bg-bg transition-colors focus-within:ring-1 ${
            overLimit
              ? "border-down focus-within:ring-down"
              : "border-line-strong focus-within:border-amber focus-within:ring-amber"
          }`}
        >
          <span aria-hidden className="pl-3 text-amber">
            &gt;
          </span>
          <input
            id={`${id}-quantity`}
            name="quantity"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            value={quantity}
            aria-invalid={overLimit || feedback?.status === "error" || undefined}
            aria-describedby={describedBy}
            onChange={(event) => {
              edit();
              setQuantity(event.target.value);
            }}
            // Le contour du conteneur sert d'indicateur de focus.
            className="num h-full w-full bg-transparent px-2 text-base outline-none placeholder:text-muted/70"
          />
          <span className="pr-3 text-xs text-muted">{asset.base}</span>
        </div>
        <p id={`${id}-help`} className="sr-only">
          Saisissez une quantité en {asset.base}, avec 8 décimales au maximum.
        </p>
        <div className="grid grid-cols-4 gap-1">
          {PERCENTS.map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => fill(percent)}
              aria-label={`${percent * 100} % du disponible`}
              className={`${button.small} w-full px-0`}
            >
              {percent === 1 ? "Max" : `${percent * 100} %`}
            </button>
          ))}
        </div>
        {overLimit && (
          <p id={`${id}-limit`} className="text-xs text-down">
            <span aria-hidden>! </span>
            {limitMessage}
          </p>
        )}
      </div>

      <dl className="border-y border-line py-1">
        <Leader label="Prix du marché">
          <LivePrice symbol={asset.symbol} />
        </Leader>
        <Leader label="Total estimé">{estimate === null ? "—" : `≈ ${formatUsd(estimate)}`}</Leader>
      </dl>

      <button
        type="submit"
        disabled={pending || !hasQuantity || overLimit}
        className={`${isBuy ? button.buy : button.sell} w-full`}
      >
        {pending && <Spinner />}
        {pending ? "Exécution" : `${isBuy ? "Acheter" : "Vendre"} ${asset.base}`}
      </button>

      {/* Toujours présent pour que les lecteurs d'écran annoncent le résultat. */}
      <div id={`${id}-feedback`} role="status" aria-live="polite">
        {feedback && (
          <p
            className={`border-l-2 py-1 pl-3 text-sm ${
              feedback.status === "error" ? "border-down text-down" : "border-up text-up"
            }`}
          >
            {/* Le message de succès dit déjà « exécuté » ; seul le refus a besoin d'un préfixe. */}
            {feedback.status === "error" && <span className="caps">Refusé · </span>}
            {feedback.message}
          </p>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted">
        Ordre au marché : exécuté au dernier prix connu au moment de la validation, relu côté
        serveur.
      </p>
    </form>
  );
}

/** Arrondi à la baisse à 8 décimales, pour ne jamais dépasser le disponible. */
function floorToString(value: number): string {
  return trimZeros((Math.floor(value * 1e8) / 1e8).toFixed(8));
}

function trimZeros(value: string): string {
  return value.includes(".") ? value.replace(/\.?0+$/, "") : value;
}
