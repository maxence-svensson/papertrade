"use client";

import { resetPortfolioAction } from "@/app/actions";
import { ConfirmButton } from "@/components/confirm-dialog";
import { button } from "@/components/ui";

export function ResetButton() {
  return (
    <ConfirmButton
      className={`${button.small} hover:border-down hover:text-down`}
      title="Réinitialiser le portefeuille ?"
      description="Vous repartirez de 10 000 $ : vos positions et votre historique d'ordres seront effacés. Cette action est irréversible."
      confirmLabel="Réinitialiser"
      pendingLabel="Réinitialisation…"
      onConfirm={resetPortfolioAction}
    >
      Réinitialiser
    </ConfirmButton>
  );
}
