"use client";

import { useConnectionStatus } from "./prices-provider";

const LABELS = {
  live: "En direct",
  connecting: "Connexion",
  offline: "Reconnexion",
} as const;

/** Indique si les prix arrivent réellement en temps réel. */
export function LiveBadge({ className = "" }: { className?: string }) {
  const status = useConnectionStatus();
  const live = status === "live";

  return (
    <span role="status" className={`caps inline-flex items-center gap-1.5 text-xs ${className}`}>
      <span aria-hidden className={live ? "text-up motion-safe:animate-pulse" : "text-muted"}>
        ●
      </span>
      <span className={live ? "text-fg" : "text-muted"}>{LABELS[status]}</span>
    </span>
  );
}
