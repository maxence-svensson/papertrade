"use client";

import { useConnectionStatus } from "./prices-provider";

const LABELS = {
  live: "En direct",
  connecting: "Connexion…",
  offline: "Reconnexion…",
} as const;

/** Indique si les prix arrivent réellement en temps réel. */
export function LiveBadge({ className = "" }: { className?: string }) {
  const status = useConnectionStatus();
  const live = status === "live";

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-xs font-medium ${
        live ? "text-fg" : "text-muted"
      } ${className}`}
    >
      <span aria-hidden className="relative flex size-2">
        {live && <span className="absolute inset-0 rounded-full bg-up motion-safe:animate-ping" />}
        <span className={`relative size-2 rounded-full ${live ? "bg-up" : "bg-muted"}`} />
      </span>
      {LABELS[status]}
    </span>
  );
}
