import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./auth";

/** Session de la requête en cours, lue une seule fois par rendu. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSession>>>["user"];

/** Pour les pages privées : renvoie vers la connexion si besoin. */
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return session.user;
}

/** N'accepte que des chemins internes, pour éviter les redirections ouvertes. */
export function safeReturnPath(value: unknown, fallback: string): string {
  return typeof value === "string" && /^\/(?![/\\])/.test(value) ? value : fallback;
}
