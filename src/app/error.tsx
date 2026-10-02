"use client";

import { useEffect } from "react";

import { ArrowsClockwiseIcon, WarningCircleIcon } from "@/components/icons";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <WarningCircleIcon aria-hidden size={40} className="text-down" />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
        <p className="text-muted">Les données de marché sont peut-être momentanément indisponibles.</p>
      </div>
      <button
        type="button"
        onClick={() => retry()}
        className="flex h-11 items-center gap-2 rounded-lg border border-border-strong px-5 font-medium transition-colors hover:bg-surface"
      >
        <ArrowsClockwiseIcon aria-hidden size={18} />
        Réessayer
      </button>
    </div>
  );
}
