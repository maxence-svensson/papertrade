"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Écrans principaux, accessibles aussi par les touches de fonction F1 à F3. */
const SCREENS = [
  { key: "F1", href: "/markets", label: "Marchés", match: ["/markets", "/trade"] },
  { key: "F2", href: "/portfolio", label: "Portefeuille", match: ["/portfolio"] },
  { key: "F3", href: "/leaderboard", label: "Classement", match: ["/leaderboard"] },
];

export function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();

  // Les touches de fonction ne sont pas des caractères : elles ne gênent ni la
  // saisie ni les lecteurs d'écran (WCAG 2.1.4).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const screen = SCREENS.find((s) => s.key === event.key);
      if (!screen) return;
      event.preventDefault();
      router.push(screen.href);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <nav aria-label="Navigation principale" className="flex overflow-x-auto">
      {SCREENS.map(({ key, href, label, match }) => {
        const active = match.some((prefix) => pathname.startsWith(prefix));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-keyshortcuts={key}
            className={`caps flex h-9 items-center gap-2 border-r border-line px-3 text-xs whitespace-nowrap transition-colors ${
              active ? "bg-amber text-on-amber" : "text-fg hover:bg-hover"
            }`}
          >
            <kbd
              className={`hidden px-1 text-[11px] sm:inline ${
                active ? "bg-on-amber text-amber" : "border border-line text-muted"
              }`}
            >
              {key}
            </kbd>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
