const LOCALE = "fr-FR";

const usd = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  currencyDisplay: "narrowSymbol",
});

const compactUsd = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  currencyDisplay: "narrowSymbol",
  notation: "compact",
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const share = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const quantity = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 8 });

// Fuseau fixe : sinon les dates rendues sur Vercel (UTC) seraient décalées.
const dateTime = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

// Une instance par nombre de décimales, créées à la demande.
const priceFormats = new Map<number, Intl.NumberFormat>();

export function formatUsd(value: number | string): string {
  return usd.format(Number(value));
}

export function formatCompactUsd(value: number | string): string {
  return compactUsd.format(Number(value));
}

/** Les petits prix (DOGE, ADA…) ont besoin de plus de décimales que le BTC. */
export function formatPrice(value: number | string): string {
  const n = Number(value);
  const digits = Math.abs(n) >= 100 ? 2 : Math.abs(n) >= 1 ? 4 : 6;
  let format = priceFormats.get(digits);
  if (!format) {
    format = new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: digits,
    });
    priceFormats.set(digits, format);
  }
  return format.format(n);
}

/** Prix sans symbole monétaire, pour les affichages compacts. */
export function formatPriceNumber(value: number | string): string {
  return formatPrice(value).replace(/\s*\$$/, "");
}

/** Variation signée : `ratio` vaut 0.05 pour +5 %. */
export function formatPercent(ratio: number | string): string {
  return percent.format(Number(ratio));
}

/** Part d'un total, sans signe : 0.125 → « 12,5 % ». */
export function formatShare(ratio: number): string {
  return share.format(ratio);
}

export function formatQuantity(value: number | string): string {
  return quantity.format(Number(value));
}

export function formatDateTime(date: Date): string {
  return dateTime.format(date);
}

/** Classe de couleur selon le signe d'une variation. */
export function trendClass(value: number | string): string {
  const n = Number(value);
  return n > 0 ? "text-up" : n < 0 ? "text-down" : "text-muted";
}
