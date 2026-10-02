"use client";

import Link, { useLinkStatus } from "next/link";

import { INTERVALS, type Interval } from "@/lib/market";

/** Choix de l'intervalle des bougies. L'intervalle vit dans l'URL : la vue est partageable. */
export function IntervalTabs({ path, current }: { path: string; current: Interval }) {
  return (
    <nav aria-label="Intervalle des bougies" className="flex gap-1">
      {INTERVALS.map((i) => {
        const active = i.value === current;
        return (
          <Link
            key={i.value}
            href={`${path}?interval=${i.value}`}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={`relative flex h-8 min-w-12 items-center justify-center rounded-md px-2.5 text-xs font-medium transition-colors ${
              active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {i.label}
            <PendingHint />
          </Link>
        );
      })}
    </nav>
  );
}

/** Trait animé pendant le chargement : taille fixe, aucun décalage de mise en page. */
function PendingHint() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      // L'animation ne tourne que pendant le chargement : elle écraserait l'opacité 0.
      className={`absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-primary transition-opacity ${
        pending ? "opacity-100 motion-safe:animate-pulse" : "opacity-0"
      }`}
    />
  );
}
