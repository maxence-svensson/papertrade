import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";

import { PricesProvider } from "@/components/prices-provider";
import { SiteHeader } from "@/components/site-header";
import { getTickersSafe } from "@/lib/binance";

import "./globals.css";

// Une seule police, à chasse fixe, en deux graisses : le gras dénature le dessin des mono.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "PaperTrade — simulateur de trading crypto",
    template: "%s · PaperTrade",
  },
  description:
    "Achetez et vendez des cryptomonnaies au prix réel du marché avec 10 000 $ fictifs. Projet éducatif, aucun argent réel.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const tickers = await getTickersSafe();

  return (
    <html lang="fr" className={`${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col text-sm">
        <a
          href="#contenu"
          className="caps sr-only bg-amber px-3 py-2 text-on-amber focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
        >
          Aller au contenu
        </a>
        <PricesProvider initial={tickers}>
          <SiteHeader />
          <main id="contenu" className="mx-auto w-full max-w-[1400px] flex-1 px-3 py-4 sm:px-4">
            {children}
          </main>
          <footer className="border-t border-line text-xs text-muted">
            <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-3 py-3 sm:flex-row sm:justify-between sm:px-4">
              <p>Projet éducatif · aucune transaction réelle · pas un conseil en investissement</p>
              <p>Données de marché : Binance, prix en USDT</p>
            </div>
          </footer>
        </PricesProvider>
      </body>
    </html>
  );
}
