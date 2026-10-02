"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { authClient } from "@/lib/auth-client";

import { Avatar } from "./avatar";
import { ConfirmButton } from "./confirm-dialog";
import { SignOutIcon } from "./icons";

const signOutClass =
  "flex size-9 items-center justify-center gap-2 rounded-lg text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-50 md:w-auto md:px-2.5";

export function UserMenu({
  name,
  image,
  isGuest,
  canLinkGithub,
}: {
  name: string;
  image: string | null;
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

  const signOutContent = (
    <>
      <SignOutIcon aria-hidden size={18} />
      <span className="hidden md:inline">Déconnexion</span>
    </>
  );

  return (
    <div className="flex items-center gap-2 text-sm">
      {isGuest && canLinkGithub && (
        <Link
          href="/login?next=/portfolio"
          className="hidden h-9 items-center rounded-lg px-2.5 font-medium text-primary hover:bg-surface-2 lg:flex"
        >
          Sauvegarder ma progression
        </Link>
      )}

      <div className="flex items-center gap-2 pr-1">
        {image ? (
          <Image src={image} alt="" width={28} height={28} className="rounded-full" />
        ) : (
          <Avatar name={name} />
        )}
        <span className="hidden max-w-40 truncate lg:inline">{name}</span>
        {isGuest && (
          <span className="rounded-md border border-border px-1.5 py-0.5 text-xs text-muted">Invité</span>
        )}
      </div>

      {/* Action sensible : séparée visuellement du reste du menu. */}
      <span aria-hidden className="h-5 w-px bg-border" />

      {isGuest ? (
        <ConfirmButton
          ariaLabel="Déconnexion"
          className={signOutClass}
          title="Supprimer ce portefeuille ?"
          description="Avec un compte invité, la déconnexion supprime définitivement votre portefeuille et votre historique."
          confirmLabel="Se déconnecter"
          pendingLabel="Déconnexion…"
          onConfirm={signOut}
        >
          {signOutContent}
        </ConfirmButton>
      ) : (
        <button
          type="button"
          aria-label="Déconnexion"
          disabled={pending}
          onClick={() => startTransition(signOut)}
          className={signOutClass}
        >
          {signOutContent}
        </button>
      )}
    </div>
  );
}
