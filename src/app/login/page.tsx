import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Leader, Panel } from "@/components/panel";
import { githubEnabled } from "@/lib/auth";
import { getSession, safeReturnPath } from "@/lib/session";

import { SignInButtons } from "./sign-in-buttons";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const returnTo = safeReturnPath(next, "/markets");
  const session = await getSession();
  const isGuest = Boolean(session?.user.isAnonymous);

  // Un compte GitHub déjà connecté n'a rien à faire ici ; un invité peut
  // encore lier son compte GitHub pour sauvegarder sa progression.
  if (session && (!isGuest || !githubEnabled)) redirect(returnTo);

  return (
    <div className="mx-auto max-w-lg py-4 sm:py-10">
      <Panel
        headingLevel="p"
        title={isGuest ? "Session invité · sauvegarde" : "Connexion"}
        bodyClassName="space-y-5 p-4 sm:p-6"
      >
        <div className="space-y-2">
          <h1 className="text-2xl leading-tight">
            {isGuest ? "Sauvegarder ma progression" : "Ouvrir une session"}
          </h1>
          <p className="leading-relaxed text-muted">
            {isGuest
              ? "Connectez-vous avec GitHub : votre portefeuille d'invité sera conservé."
              : "Aucune carte bancaire, aucune adresse e-mail, aucun argent réel."}
          </p>
        </div>

        {!isGuest && (
          <dl>
            <Leader label="Capital de départ">10 000,00 $</Leader>
            <Leader label="Actifs">10 · prix Binance en direct</Leader>
            <Leader label="Inclus">Portefeuille · historique · classement</Leader>
          </dl>
        )}

        <SignInButtons githubEnabled={githubEnabled} guestEnabled={!session} returnTo={returnTo} />

        {!session && (
          <p className="border-t border-line pt-4 text-xs leading-relaxed text-muted">
            Le compte invité est lié à ce navigateur. Il est supprimé à la déconnexion ou après 7 jours
            d&apos;inactivité.
          </p>
        )}
      </Panel>
    </div>
  );
}
