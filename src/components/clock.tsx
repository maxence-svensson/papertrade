"use client";

import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
});

/** Heure locale de la barre d'état, rendue côté navigateur uniquement. */
export function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Premier rendu juste après l'hydratation, puis chaque seconde.
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  return (
    <time className="num text-xs text-muted" dateTime={now?.toISOString()}>
      {now ? format.format(now) : "--:--:--"}
    </time>
  );
}
