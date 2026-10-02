/** Styles de boutons partagés : rectangles pleins ou filaires, libellés en capitales. */

const base =
  "caps inline-flex items-center justify-center gap-2 px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export const button = {
  primary: `${base} h-10 bg-amber text-on-amber hover:bg-amber/85`,
  secondary: `${base} h-10 border border-line-strong text-fg hover:bg-hover`,
  danger: `${base} h-10 bg-down text-on-amber hover:bg-down/85`,
  buy: `${base} h-11 bg-up text-on-amber hover:bg-up/85`,
  sell: `${base} h-11 bg-down text-on-amber hover:bg-down/85`,
  /** Petit bouton dans une ligne de tableau ou un en-tête de panneau. */
  small: `${base} h-7 border border-line-strong px-2.5 text-xs text-fg hover:border-amber hover:text-amber`,
};
