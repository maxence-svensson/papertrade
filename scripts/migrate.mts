/**
 * Applique les migrations SQL du dossier `drizzle/`.
 *
 * Lancé avant `next build` : sur Vercel, la base est donc à jour avant la
 * mise en ligne. Sans DATABASE_URL (CI, build local sans base), on passe.
 */
import nextEnv from "@next/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

nextEnv.loadEnvConfig(process.cwd());

// Les migrations passent par une connexion directe plutôt que par le pooler.
const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

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
