"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChartLineUpIcon, TrophyIcon, WalletIcon } from "./icons";

const LINKS = [
  { href: "/markets", label: "Marchés", icon: ChartLineUpIcon, match: ["/markets", "/trade"] },
  { href: "/portfolio", label: "Portefeuille", icon: WalletIcon, match: ["/portfolio"] },
  { href: "/leaderboard", label: "Classement", icon: TrophyIcon, match: ["/leaderboard"] },
];

export function NavLinks({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation principale" className={`flex gap-1 overflow-x-auto text-sm ${className}`}>
      {LINKS.map(({ href, label, icon: Icon, match }) => {
        const active = match.some((prefix) => pathname.startsWith(prefix));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            // La page active est signalée par la couleur ET par un trait sous le lien.
            className={`relative flex h-11 items-center gap-2 rounded-md px-2.5 whitespace-nowrap transition-colors sm:h-auto ${
              active
                ? "font-medium text-fg after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                : "text-muted hover:text-fg"
            }`}
          >
            <Icon aria-hidden size={18} weight={active ? "fill" : "regular"} className={active ? "text-primary" : ""} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
