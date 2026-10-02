import nextEnv from "@next/env";

// Charge `.env.local` comme le fait Next.js (DATABASE_URL pour les tests d'intégration).
nextEnv.loadEnvConfig(process.cwd());
