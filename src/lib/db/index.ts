import "server-only";

import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";
import { databaseUrl } from "./url";

// En développement, le rechargement à chaud réévalue ce module : on garde le
// pool sur `globalThis` pour ne pas ouvrir de nouvelles connexions à chaque fois.
const globalForDb = globalThis as unknown as { pool?: Pool };

// `pg` n'ouvre aucune connexion avant la première requête, ce qui permet de
// lancer `next build` sans base de données.
export const pool =
  globalForDb.pool ?? new Pool({ connectionString: databaseUrl(process.env.DATABASE_URL), max: 5 });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

// Sur Vercel (Fluid compute), ferme proprement les connexions inactives
// avant que l'instance ne soit suspendue.
attachDatabasePool(pool);

export const db = drizzle(pool, { schema });

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
