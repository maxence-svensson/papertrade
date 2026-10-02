"use client";

import { useActionState, useId, useState } from "react";

import { placeOrder, type OrderState } from "@/app/actions";
import {
  ArrowsClockwiseIcon,
  CheckCircleIcon,
  InfoIcon,
  WalletIcon,
  WarningCircleIcon,
} from "@/components/icons";
import { LivePrice } from "@/components/live-price";
import { useTicker } from "@/components/prices-provider";
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
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="symbol" value={asset.symbol} />
      <input type="hidden" name="side" value={side} />

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-bg p-1" role="group" aria-label="Sens de l'ordre">
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
              className={`h-10 rounded-md text-sm font-semibold transition-colors ${
                active
                  ? value === "buy"
                    ? "bg-up-strong text-on-primary"
                    : "bg-down-strong text-on-primary"
                  : "text-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              {value === "buy" ? "Acheter" : "Vendre"}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted">
          <WalletIcon aria-hidden size={16} />
          Disponible
        </span>
        <span className="num font-medium">
          {isBuy ? formatUsd(cash) : `${formatQuantity(holdingQuantity ?? 0)} ${asset.base}`}
        </span>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${id}-quantity`} className="text-sm font-medium">
          Quantité
        </label>
        <div
          // Bordure de 2 px au focus (1 px + anneau), rouge si la saisie dépasse le disponible.
          className={`flex h-12 items-center rounded-lg border bg-bg transition-colors focus-within:ring-1 ${
            overLimit
              ? "border-down focus-within:ring-down"
              : "border-border-strong focus-within:border-primary focus-within:ring-primary"
          }`}
        >
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
            className="num h-full w-full bg-transparent px-3 text-base outline-none placeholder:text-muted/70"
          />
          <span className="pr-3 text-sm font-medium text-muted">{asset.base}</span>
        </div>
        <p id={`${id}-help`} className="sr-only">
          Saisissez une quantité en {asset.base}, avec 8 décimales au maximum.
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {PERCENTS.map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => fill(percent)}
              aria-label={`${percent * 100} % du disponible`}
              className="num h-8 rounded-md border border-border text-xs text-muted transition-colors hover:border-primary hover:text-fg"
            >
              {percent === 1 ? "Max" : `${percent * 100} %`}
            </button>
          ))}
        </div>
        {overLimit && (
          <p id={`${id}-limit`} className="flex items-center gap-1.5 text-sm text-down">
            <WarningCircleIcon aria-hidden size={16} className="shrink-0" />
            {limitMessage}
          </p>
        )}
      </div>

      <dl className="space-y-2 rounded-lg bg-bg p-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Prix du marché</dt>
          <dd>
            <LivePrice symbol={asset.symbol} />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Total estimé</dt>
          <dd className="num font-medium">{estimate === null ? "—" : `≈ ${formatUsd(estimate)}`}</dd>
        </div>
      </dl>

      <button
        type="submit"
        disabled={pending || !hasQuantity || overLimit}
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-lg font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${
          isBuy ? "bg-up-strong" : "bg-down-strong"
        }`}
      >
        {pending && <ArrowsClockwiseIcon aria-hidden size={18} className="motion-safe:animate-spin" />}
        {pending ? "Exécution…" : `${isBuy ? "Acheter" : "Vendre"} ${asset.base}`}
      </button>

      {/* Toujours présent pour que les lecteurs d'écran annoncent le résultat. */}
      <div id={`${id}-feedback`} role="status" aria-live="polite" className="min-h-5">
        {feedback && (
          <p
            className={`flex gap-2 rounded-lg border p-3 text-sm ${
              feedback.status === "error" ? "border-down/40 text-down" : "border-up/40 text-up"
            }`}
          >
            {feedback.status === "error" ? (
              <WarningCircleIcon aria-hidden size={18} weight="fill" className="shrink-0" />
            ) : (
              <CheckCircleIcon aria-hidden size={18} weight="fill" className="shrink-0" />
            )}
            {feedback.message}
          </p>
        )}
      </div>

      <p className="flex gap-2 text-xs leading-relaxed text-muted">
        <InfoIcon aria-hidden size={16} className="shrink-0" />
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
