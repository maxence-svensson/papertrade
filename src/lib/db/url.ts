/**
 * Neon fournit des URLs en `sslmode=require`, que `pg` traite déjà comme
 * `verify-full` en affichant un avertissement à chaque démarrage. On écrit ce
 * mode explicitement : même niveau de sécurité, logs propres.
 */
export function databaseUrl(raw: string | undefined): string | undefined {
  return raw?.replace(/([?&])sslmode=require\b/, "$1sslmode=verify-full");
}
