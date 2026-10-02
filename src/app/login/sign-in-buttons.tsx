"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ArrowsClockwiseIcon, GithubLogoIcon, UserCircleIcon, WarningCircleIcon } from "@/components/icons";
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
    <div className="space-y-3">
      {githubEnabled && (
        <button
          type="button"
          onClick={signInWithGithub}
          disabled={pending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-fg font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <GithubLogoIcon aria-hidden size={20} weight="fill" />
          Continuer avec GitHub
        </button>
      )}
      {guestEnabled && (
        <button
          type="button"
          onClick={signInAsGuest}
          disabled={pending}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg font-semibold transition-opacity disabled:opacity-50 ${
            githubEnabled
              ? "border border-border-strong hover:bg-surface-2"
              : "bg-primary text-on-primary hover:opacity-90"
          }`}
        >
          {pending ? (
            <ArrowsClockwiseIcon aria-hidden size={20} className="motion-safe:animate-spin" />
          ) : (
            <UserCircleIcon aria-hidden size={20} />
          )}
          {pending ? "Création du compte…" : "Essayer sans compte"}
        </button>
      )}
      {error && (
        <p role="alert" className="flex items-center justify-center gap-1.5 text-sm text-down">
          <WarningCircleIcon aria-hidden size={16} />
          {error}
        </p>
      )}
    </div>
  );
}
