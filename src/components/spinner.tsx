"use client";

import { useEffect, useState } from "react";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/** Indicateur d'attente façon ligne de commande ; fixe si l'utilisateur réduit les animations. */
export function Spinner() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <span aria-hidden className="inline-block w-[1ch]">
      {FRAMES[frame]}
    </span>
  );
}
