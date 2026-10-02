import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckCircleIcon, InfoIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { githubEnabled } from "@/lib/auth";
import { getSession, safeReturnPath } from "@/lib/session";

import { SignInButtons } from "./sign-in-buttons";

export const metadata: Metadata = { title: "Connexion" };

const PERKS = [
  "10 000 $ fictifs pour démarrer",
  "Prix réels de 10 cryptomonnaies, en direct",
  "Portefeuille, historique et classement",
];

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const returnTo = safeReturnPath(next, "/markets");
  const session = await getSession();
  const isGuest = Boolean(session?.user.isAnonymous);

  // Un compte GitHub déjà connecté n'a rien à faire ici ; un invité peut
  // encore lier son compte GitHub pour sauvegarder sa progression.
  if (session && (!isGuest || !githubEnabled)) redirect(returnTo);

  return (
    <div className="mx-auto max-w-md py-6 sm:py-12">
      <div className="space-y-6 rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <LogoMark size={40} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isGuest ? "Sauvegarder ma progression" : "Commencer à trader"}
          </h1>
          <p className="text-sm text-muted">
            {isGuest
              ? "Connectez-vous avec GitHub : votre portefeuille d'invité sera conservé."
              : "Aucune carte bancaire, aucun argent réel."}
          </p>
        </div>

        {!isGuest && (
          <ul className="space-y-2 text-sm">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5">
                <CheckCircleIcon aria-hidden size={18} weight="fill" className="shrink-0 text-up" />
                {perk}
              </li>
            ))}
          </ul>
        )}

        <SignInButtons githubEnabled={githubEnabled} guestEnabled={!session} returnTo={returnTo} />

        {!session && (
          <p className="flex gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted">
            <InfoIcon aria-hidden size={16} className="shrink-0" />
            Le compte invité est lié à ce navigateur. Il est supprimé à la déconnexion ou après 7 jours
            d&apos;inactivité.
          </p>
        )}
      </div>
    </div>
  );
}
