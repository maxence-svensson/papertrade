import Link from "next/link";

import { githubEnabled } from "@/lib/auth";
import { getSession } from "@/lib/session";

import { Clock } from "./clock";
import { CommandLine } from "./command-line";
import { LiveBadge } from "./live-badge";
import { NavLinks } from "./nav-links";
import { button } from "./ui";
import { UserMenu } from "./user-menu";

/** Barre d'état (marque, commande, connexion, heure, session) puis touches de fonction. */
export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg">
      <div className="flex h-11 items-center gap-4 border-b border-line px-3 sm:px-4">
        <Link href="/" className="caps shrink-0 text-sm text-amber">
          PaperTrade
        </Link>
        <div className="hidden md:block">
          <CommandLine />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <LiveBadge className="hidden sm:inline-flex" />
          <span className="hidden lg:inline">
            <Clock />
          </span>
          {session ? (
            <UserMenu
              name={session.user.name}
              isGuest={Boolean(session.user.isAnonymous)}
              canLinkGithub={githubEnabled}
            />
          ) : (
            <Link href="/login" className={button.small}>
              Connexion
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between bg-head">
        <NavLinks />
        <p className="hidden px-4 text-xs text-muted xl:block">Prix en USDT · source Binance</p>
      </div>
    </header>
  );
}
