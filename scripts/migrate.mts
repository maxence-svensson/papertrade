/**
 * Applique les migrations SQL du dossier `drizzle/`.
 *
 * Lancé avant `next build` : sur Vercel, la base est donc à jour avant la
 * mise en ligne. Sans DATABASE_URL (build local sans base), on passe.
 *
 * Sur Vercel, seul le déploiement de production migre : une prévisualisation
 * (pull request) ne doit pas modifier la base de production avant la fusion.
 */
import nextEnv from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { databaseUrl } from "../src/lib/db/url";

nextEnv.loadEnvConfig(process.cwd());

// VERCEL_ENV vaut « production », « preview » ou « development » sur Vercel ;
// il est absent en local et en CI, où l'on migre toujours.
const vercelEnv = process.env.VERCEL_ENV;
if (vercelEnv && vercelEnv !== "production") {
  console.log(`Déploiement « ${vercelEnv} » : migrations ignorées (production uniquement).`);
  process.exit(0);
}

// Les migrations passent par une connexion directe plutôt que par le pooler.
const connectionString = databaseUrl(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);

if (!connectionString) {
  console.log("DATABASE_URL absente : migrations ignorées.");
  process.exit(0);
}

const pool = new Pool({ connectionString, max: 1 });

try {
  await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
  console.log("Migrations appliquées.");
} finally {
  await pool.end();
}
