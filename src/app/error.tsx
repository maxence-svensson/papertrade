"use client";

import { useEffect } from "react";

import { Panel } from "@/components/panel";
import { button } from "@/components/ui";

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
    <div className="mx-auto max-w-lg py-10">
      <Panel headingLevel="p" title="Erreur" bodyClassName="space-y-4 p-4">
        <h1 className="text-2xl">Une erreur est survenue</h1>
        <p className="text-muted">Les données de marché sont peut-être momentanément indisponibles.</p>
        <button type="button" onClick={() => retry()} className={button.secondary}>
          Réessayer
        </button>
      </Panel>
    </div>
  );
}
