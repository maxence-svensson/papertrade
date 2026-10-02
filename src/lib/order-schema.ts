import { z } from "zod";

import { ASSET_SYMBOLS } from "./assets";
import { SCALE } from "./trading";

const quantityPattern = new RegExp(`^\\d+(\\.\\d{1,${SCALE}})?$`);

/** Validation d'un ordre reçu du navigateur : rien n'est considéré comme fiable. */
export const orderSchema = z.object({
  symbol: z.enum(ASSET_SYMBOLS, { error: "Actif inconnu." }),
  side: z.enum(["buy", "sell"], { error: "Sens de l'ordre invalide." }),
  quantity: z
    .string({ error: "Quantité manquante." })
    .trim()
    // Accepte la virgule décimale française : « 0,5 ».
    .transform((value) => value.replace(",", "."))
    .pipe(
      z
        .string()
        .regex(quantityPattern, `Quantité invalide (${SCALE} décimales maximum).`)
        .refine((value) => Number(value) > 0, "La quantité doit être supérieure à zéro."),
    ),
});

export type OrderInput = z.infer<typeof orderSchema>;
