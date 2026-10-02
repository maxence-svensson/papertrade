"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Spinner } from "@/components/spinner";
import { button } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

export function SignInButtons({
  githubEnabled,
  guestEnabled,
  returnTo,
}: {
  githubEnabled: boolean;
  guestEnabled: boolean;
  returnTo: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function signInAsGuest() {
    startTransition(async () => {
      setError(null);
      const { error } = await authClient.signIn.anonymous();
      if (error) {
        setError("Impossible de créer le compte invité. Réessayez.");
        return;
      }
      router.push(returnTo);
      router.refresh();
    });
  }

  function signInWithGithub() {
    startTransition(async () => {
      setError(null);
      // Redirige vers GitHub puis revient sur `returnTo`.
      const { error } = await authClient.signIn.social({ provider: "github", callbackURL: returnTo });
      if (error) setError("Connexion GitHub indisponible. Réessayez.");
    });
  }

  return (
    <div className="space-y-2">
      {githubEnabled && (
        <button
          type="button"
          onClick={signInWithGithub}
          disabled={pending}
          className={`${guestEnabled ? button.secondary : button.primary} w-full`}
        >
          Continuer avec GitHub
        </button>
      )}
      {guestEnabled && (
        <button type="button" onClick={signInAsGuest} disabled={pending} className={`${button.primary} w-full`}>
          {pending && <Spinner />}
          {pending ? "Création du compte" : "Essayer sans compte"}
        </button>
      )}
      {error && (
        <p role="alert" className="text-sm text-down">
          <span aria-hidden>! </span>
          {error}
        </p>
      )}
    </div>
  );
}
