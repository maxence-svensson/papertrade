import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { anonymous } from "better-auth/plugins";

import { transferPortfolio } from "./data/portfolio";
import { db } from "./db";
import * as schema from "./db/schema";

export const githubEnabled = Boolean(
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
);

// Variables fournies automatiquement par Vercel à chaque déploiement.
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
  .filter(Boolean)
  .map((host) => `https://${host}`);

const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const auth = betterAuth({
  appName: "PaperTrade",
  baseURL,
  // Autorise aussi les URLs de prévisualisation Vercel.
  trustedOrigins: vercelOrigins,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: githubEnabled
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
      }
    : undefined,
  plugins: [
    // Compte invité : on peut tester l'app en un clic, sans inscription.
    anonymous({
      generateName: randomTraderName,
      // Un invité qui se connecte ensuite avec GitHub garde son portefeuille.
      onLinkAccount: ({ anonymousUser, newUser }) =>
        transferPortfolio(anonymousUser.user.id, newUser.user.id),
    }),
    // Doit rester le dernier plugin : écrit les cookies depuis les Server Actions.
    nextCookies(),
  ],
});

const ANIMALS = ["Taureau", "Ours", "Loup", "Faucon", "Renard", "Requin", "Lynx", "Hibou", "Dauphin", "Aigle"];
const TRAITS = ["audacieux", "prudent", "patient", "rusé", "intrépide", "zen", "agile", "malin", "stoïque", "téméraire"];

function randomTraderName() {
  const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];
  return `${pick(ANIMALS)} ${pick(TRAITS)} #${Math.floor(Math.random() * 90) + 10}`;
}
