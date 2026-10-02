"use client";

import { useId, useRef, useState, useTransition } from "react";

import { WarningCircleIcon } from "./icons";

/**
 * Bouton qui demande confirmation avant une action destructive, dans une
 * boîte de dialogue native (`<dialog>`) : focus piégé, fermeture avec Échap.
 * Le bouton « Annuler » reçoit le focus pour éviter une validation par mégarde.
 */
export function ConfirmButton({
  children,
  className,
  ariaLabel,
  title,
  description,
  confirmLabel,
  pendingLabel,
  onConfirm,
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  onConfirm: () => Promise<unknown>;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function confirm() {
    startTransition(async () => {
      setFailed(false);
      try {
        await onConfirm();
        dialogRef.current?.close();
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className={className}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        // Un clic sur le fond (hors du contenu) ferme la boîte de dialogue.
        onClick={(event) => {
          if (event.target === event.currentTarget && !pending) event.currentTarget.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/70"
      >
        <div className="space-y-4 p-6">
          <div className="flex gap-3">
            <WarningCircleIcon aria-hidden size={24} weight="fill" className="shrink-0 text-down" />
            <div className="space-y-1">
              <h2 id={`${id}-title`} className="font-semibold">
                {title}
              </h2>
              <p id={`${id}-description`} className="text-sm text-muted">
                {description}
              </p>
            </div>
          </div>
          {failed && (
            <p role="alert" className="text-sm text-down">
              L&apos;opération a échoué. Réessayez.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              autoFocus
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
              className="h-10 rounded-lg border border-border-strong px-4 text-sm font-medium transition-colors hover:bg-surface-2 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={confirm}
              className="h-10 rounded-lg bg-down-strong px-4 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? pendingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
