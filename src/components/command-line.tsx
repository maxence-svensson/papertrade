"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { ASSETS, assetSlug } from "@/lib/assets";

/** Écrans accessibles par leur code, en plus des actifs (BTC, ETH…). */
const SCREENS: Record<string, string> = {
  MKT: "/markets",
  MARCHES: "/markets",
  PORT: "/portfolio",
  PORTEFEUILLE: "/portfolio",
  RANK: "/leaderboard",
  CLASSEMENT: "/leaderboard",
};

/** « btc », « Bitcoin », « BTCUSDT » ou « BTC GO » mènent tous au Bitcoin. */
function resolve(input: string): string | null {
  const query = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+GO$/, "")
    .trim();
  if (!query) return null;
  if (SCREENS[query]) return SCREENS[query];
  const asset = ASSETS.find(
    (a) => a.base === query || a.symbol === query || a.name.toUpperCase() === query,
  );
  return asset ? `/trade/${assetSlug(asset)}` : null;
}

const subscribeNothing = () => () => {};

/**
 * Ligne de commande de la barre d'état : on tape un code d'actif ou d'écran,
 * puis Entrée. ⌘K / Ctrl+K y place le curseur (raccourci avec modificateur,
 * il ne gêne pas la saisie au clavier).
 */
export function CommandLine() {
  const id = useId();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Libellé du raccourci selon le système ; « Ctrl K » au rendu serveur.
  const shortcut = useSyncExternalStore(
    subscribeNothing,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K"),
    () => "Ctrl K",
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(event) => {
        event.preventDefault();
        const target = resolve(value);
        if (!target) {
          setError(value.trim() ? `Code inconnu : ${value.trim().toUpperCase()}. Essayez BTC, ETH, PORT ou RANK.` : null);
          return;
        }
        setError(null);
        setValue("");
        inputRef.current?.blur();
        router.push(target);
      }}
    >
      <label htmlFor={`${id}-cmd`} className="sr-only">
        Commande : code d&apos;un actif (BTC, ETH…) ou d&apos;un écran (MKT, PORT, RANK)
      </label>
      <div className="flex h-7 w-72 items-center border border-line bg-bg text-xs focus-within:border-amber">
        <span aria-hidden className="pl-2 text-amber">
          &gt;
        </span>
        <input
          ref={inputRef}
          id={`${id}-cmd`}
          list={`${id}-codes`}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          placeholder="BTC, ETH, PORT…"
          autoComplete="off"
          spellCheck={false}
          aria-describedby={error ? `${id}-error` : undefined}
          className="caps h-full min-w-0 flex-1 bg-transparent px-2 text-fg outline-none placeholder:text-muted/80 placeholder:normal-case"
        />
        <kbd className="mr-1.5 border border-line px-1 text-[11px] text-muted">{shortcut}</kbd>
      </div>
      <datalist id={`${id}-codes`}>
        {ASSETS.map((a) => (
          <option key={a.symbol} value={a.base} label={a.name} />
        ))}
        <option value="MKT" label="Marchés" />
        <option value="PORT" label="Portefeuille" />
        <option value="RANK" label="Classement" />
      </datalist>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="absolute top-full left-0 z-30 mt-1 w-max max-w-80 border border-down bg-panel px-2 py-1 text-xs text-down"
        >
          {error}
        </p>
      )}
    </form>
  );
}
