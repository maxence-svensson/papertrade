"use client";

import { useId, useRef, useState, useTransition } from "react";

import { button } from "./ui";

/**
 * Bouton qui demande confirmation avant une action destructive, dans une
 * boîte de dialogue native (`<dialog>`) : focus piégé, fermeture avec Échap.
 * Le bouton « Annuler » reçoit le focus pour éviter une validation par mégarde.
 */
export function ConfirmButton({
  children,
  className,
  title,
  description,
  confirmLabel,
  pendingLabel,
  onConfirm,
}: {
  children: React.ReactNode;
  className?: string;
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
        className="m-auto w-[calc(100%-2rem)] max-w-md border border-down bg-panel p-0 text-fg backdrop:bg-black/80"
      >
        <div className="border-b border-down bg-down px-3 py-1.5">
          <h2 id={`${id}-title`} className="caps text-xs text-on-amber">
            {title}
          </h2>
        </div>
        <div className="space-y-4 p-4 text-sm">
          <p id={`${id}-description`} className="text-muted">
            {description}
          </p>
          {failed && (
            <p role="alert" className="text-down">
              L&apos;opération a échoué. Réessayez.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              autoFocus
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
              className={button.secondary}
            >
              Annuler
            </button>
            <button type="button" disabled={pending} onClick={confirm} className={button.danger}>
              {pending ? pendingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
