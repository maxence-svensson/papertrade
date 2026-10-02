import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { PricesProvider } from "@/components/prices-provider";
import { SiteHeader } from "@/components/site-header";
import { getTickersSafe } from "@/lib/binance";

import "./globals.css";

// « Financial Trust » (IBM Plex Sans) pour l'interface, Plex Mono pour les chiffres.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    <html lang="fr" className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#contenu"
          className="sr-only rounded-md bg-primary px-3 py-2 font-medium text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Aller au contenu
        </a>
        <PricesProvider initial={tickers}>
          <SiteHeader />
          <main id="contenu" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-border">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
              <p>Projet éducatif : aucune transaction réelle, ne constitue pas un conseil en investissement.</p>
              <p>Données de marché : Binance (prix en USDT).</p>
            </div>
          </footer>
        </PricesProvider>
      </body>
    </html>
  );
}
