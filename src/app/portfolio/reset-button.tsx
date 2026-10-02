"use client";

import { resetPortfolioAction } from "@/app/actions";
import { ConfirmButton } from "@/components/confirm-dialog";
import { ArrowsClockwiseIcon } from "@/components/icons";

export function ResetButton() {
  return (
    <ConfirmButton
      className="flex h-10 items-center gap-2 rounded-lg border border-border-strong px-3.5 text-sm font-medium text-muted transition-colors hover:border-down hover:text-down"
      title="Réinitialiser le portefeuille ?"
      description="Vous repartirez de 10 000 $ : vos positions et votre historique d'ordres seront effacés. Cette action est irréversible."
      confirmLabel="Réinitialiser"
      pendingLabel="Réinitialisation…"
      onConfirm={resetPortfolioAction}
    >
      <ArrowsClockwiseIcon aria-hidden size={16} />
      Réinitialiser
    </ConfirmButton>
  );
}
