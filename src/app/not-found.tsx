import Link from "next/link";

import { ArrowRightIcon, WarningCircleIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <WarningCircleIcon aria-hidden size={40} className="text-muted" />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-muted">Cet actif ou cette page n&apos;existe pas.</p>
      </div>
      <Link
        href="/markets"
        className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary transition-opacity hover:opacity-90"
      >
        Retour aux marchés
        <ArrowRightIcon aria-hidden size={18} weight="bold" />
      </Link>
    </div>
  );
}
