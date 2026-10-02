import Link from "next/link";

import { githubEnabled } from "@/lib/auth";
import { getSession } from "@/lib/session";

import { ArrowRightIcon } from "./icons";
import { LogoMark } from "./logo";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      {/* Sur mobile, la navigation passe sur une seconde ligne. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 px-4 sm:flex-nowrap sm:px-6">
        <Link href="/" className="flex h-14 items-center gap-2.5 rounded-md font-semibold tracking-tight">
          <LogoMark />
          PaperTrade
        </Link>

        <NavLinks className="order-last -mx-2 w-full sm:order-none sm:mx-0 sm:w-auto sm:self-stretch" />

        <div className="ml-auto">
          {session ? (
            <UserMenu
              name={session.user.name}
              image={session.user.image ?? null}
              isGuest={Boolean(session.user.isAnonymous)}
              canLinkGithub={githubEnabled}
            />
          ) : (
            <Link
              href="/login"
              className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Commencer
              <ArrowRightIcon aria-hidden size={16} weight="bold" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
