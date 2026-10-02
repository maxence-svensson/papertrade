"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { authClient } from "@/lib/auth-client";

import { ConfirmButton } from "./confirm-dialog";
import { button } from "./ui";

export function UserMenu({
  name,
  isGuest,
  canLinkGithub,
}: {
  name: string;
  isGuest: boolean;
  canLinkGithub: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function signOut() {
    // Un compte invité n'est plus accessible après déconnexion : on le supprime.
    // En cas d'échec, simple déconnexion ; la tâche de nettoyage s'en chargera.
    const deleted = isGuest && !(await authClient.deleteAnonymousUser()).error;
    if (!deleted) await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      {isGuest && canLinkGithub && (
        <Link href="/login?next=/portfolio" className="caps hidden text-amber hover:underline lg:inline">
          Sauvegarder
        </Link>
      )}
      <p className="hidden max-w-56 truncate sm:block">
        {isGuest && <span className="caps text-muted">Invité · </span>}
        {name}
      </p>
      {isGuest ? (
        <ConfirmButton
          className={button.small}
          title="Supprimer ce portefeuille ?"
          description="Avec un compte invité, la déconnexion supprime définitivement votre portefeuille et votre historique."
          confirmLabel="Se déconnecter"
          pendingLabel="Déconnexion…"
          onConfirm={signOut}
        >
          Déconnexion
        </ConfirmButton>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(signOut)}
          className={button.small}
        >
          Déconnexion
        </button>
      )}
    </div>
  );
}
