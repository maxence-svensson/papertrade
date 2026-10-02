import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Racine explicite : évite que Next.js remonte jusqu'à un package-lock.json
  // situé dans un dossier parent.
  turbopack: { root: __dirname },
};

export default nextConfig;
