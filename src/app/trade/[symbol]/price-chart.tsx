"use client";

import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  TickMarkType,
  createChart,
  createSeriesMarkers,
  type CandlestickData,
  type HistogramData,
  type ISeriesMarkersPluginApi,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

import { formatCompactUsd } from "@/lib/format";
import { BINANCE_STREAM_URL, INTERVALS, type Candle, type Interval } from "@/lib/market";

export type ChartMarker = { time: number; side: "buy" | "sell" };

type KlineMessage = { k: { t: number; o: string; h: string; l: string; c: string; v: string } };

// Les horodatages sont en UTC : on affiche les heures dans le fuseau du navigateur.
const TICK_FORMATS: Record<TickMarkType, Intl.DateTimeFormatOptions> = {
  [TickMarkType.Year]: { year: "numeric" },
  [TickMarkType.Month]: { month: "short" },
  [TickMarkType.DayOfMonth]: { day: "numeric", month: "short" },
  [TickMarkType.Time]: { hour: "2-digit", minute: "2-digit" },
  [TickMarkType.TimeWithSeconds]: { hour: "2-digit", minute: "2-digit", second: "2-digit" },
};

const legendDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const toDate = (time: Time) => new Date((time as number) * 1000);

/**
 * Graphique en chandeliers (Lightweight Charts de TradingView) avec volumes.
 * L'historique vient du serveur, la bougie en cours est mise à jour par
 * WebSocket. La légende donne les valeurs O/H/L/C en texte : la hausse ou la
 * baisse ne repose pas que sur la couleur des bougies.
 *
 * À monter avec `key={symbole + intervalle}` : le graphique est recréé quand
 * l'un des deux change.
 */
export function PriceChart({
  name,
  symbol,
  interval,
  candles,
  markers,
}: {
  name: string;
  symbol: string;
  interval: Interval;
  candles: Candle[];
  markers: ChartMarker[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  // Seul l'historique initial est utilisé : ensuite, le flux temps réel est
  // plus à jour que les données re-rendues par le serveur.
  const [initialCandles] = useState(candles);
  const [legend, setLegend] = useState<Candle | null>(candles.at(-1) ?? null);

  const lastPrice = initialCandles.at(-1)?.close ?? 1;
  const precision = lastPrice >= 100 ? 2 : lastPrice >= 10 ? 3 : lastPrice >= 1 ? 4 : 5;
  const [priceFormat] = useState(
    () => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: precision, maximumFractionDigits: precision }),
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const css = getComputedStyle(document.documentElement);
    const color = (name: string) => css.getPropertyValue(name).trim();
    const up = color("--color-up");
    const down = color("--color-down");

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: color("--color-muted"),
        fontFamily: getComputedStyle(document.body).fontFamily,
        attributionLogo: true,
      },
      // Grille discrète : elle ne doit pas concurrencer les données.
      grid: {
        vertLines: { color: color("--color-line") },
        horzLines: { color: color("--color-line") },
      },
      // Réticule ambre, couleur des éléments interactifs du terminal.
      crosshair: {
        vertLine: { color: color("--color-amber"), labelBackgroundColor: color("--color-amber") },
        horzLine: { color: color("--color-amber"), labelBackgroundColor: color("--color-amber") },
      },
      rightPriceScale: { borderColor: color("--color-line") },
      timeScale: {
        borderColor: color("--color-line"),
        timeVisible: interval !== "1d",
        tickMarkFormatter: (time: Time, type: TickMarkType) =>
          new Intl.DateTimeFormat("fr-FR", TICK_FORMATS[type]).format(toDate(time)),
      },
      localization: {
        locale: "fr-FR",
        priceFormatter: priceFormat.format,
        timeFormatter: (time: Time) => legendDate.format(toDate(time)),
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: up,
      downColor: down,
      wickUpColor: up,
      wickDownColor: down,
      borderVisible: false,
      priceFormat: { type: "price", precision, minMove: 10 ** -precision },
    });
    series.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.25 } });

    // Volumes en bas du graphique, à 40 % d'opacité.
    const volumes = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
      lastValueVisible: false,
      priceLineVisible: false,
    });
    volumes.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    const toVolume = (c: Candle) => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: `${c.close >= c.open ? up : down}66`,
    });

    series.setData(initialCandles.map((c) => ({ ...c, time: c.time as UTCTimestamp })));
    volumes.setData(initialCandles.map(toVolume));
    markersRef.current = createSeriesMarkers(series, []);
    chart.timeScale().setVisibleLogicalRange({
      from: initialCandles.length - 120,
      to: initialCandles.length + 3,
    });

    // Légende : bougie survolée, sinon la dernière.
    let last = initialCandles.at(-1) ?? null;
    let hovering = false;
    chart.subscribeCrosshairMove((param) => {
      // Données d'une série en chandeliers et d'un histogramme : typage explicite.
      const bar = param.time ? (param.seriesData.get(series) as CandlestickData | undefined) : undefined;
      const volume = param.time ? (param.seriesData.get(volumes) as HistogramData | undefined) : undefined;
      hovering = bar !== undefined;
      if (bar) {
        setLegend({
          time: bar.time as number,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: volume?.value ?? 0,
        });
      } else {
        setLegend(last);
      }
    });

    const socket = new WebSocket(`${BINANCE_STREAM_URL}/ws/${symbol.toLowerCase()}@kline_${interval}`);
    socket.onmessage = (event) => {
      const { k } = JSON.parse(event.data as string) as KlineMessage;
      const candle: Candle = {
        time: k.t / 1000,
        open: Number(k.o),
        high: Number(k.h),
        low: Number(k.l),
        close: Number(k.c),
        volume: Number(k.v),
      };
      series.update({ ...candle, time: candle.time as UTCTimestamp });
      volumes.update(toVolume(candle));
      last = candle;
      if (!hovering) setLegend(candle);
    };

    return () => {
      socket.close();
      chart.remove();
      markersRef.current = null;
    };
  }, [symbol, interval, initialCandles, precision, priceFormat]);

  // Flèches d'achat et de vente de l'utilisateur sur les bougies concernées.
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    markersRef.current?.setMarkers(
      markers.map((m) => ({
        time: m.time as UTCTimestamp,
        position: m.side === "buy" ? "belowBar" : "aboveBar",
        shape: m.side === "buy" ? "arrowUp" : "arrowDown",
        color: css.getPropertyValue(m.side === "buy" ? "--color-up" : "--color-down").trim(),
        // Une lettre (A / V), comme sur les plateformes pro : un mot serait tronqué au bord droit.
        text: m.side === "buy" ? "A" : "V",
      })),
    );
  }, [markers]);

  const intervalLabel = INTERVALS.find((i) => i.value === interval)!.label;
  const legendUp = legend ? legend.close >= legend.open : true;
  const legendChange = legend && legend.open ? (legend.close - legend.open) / legend.open : 0;

  return (
    <div>
      {legend && (
        <dl
          aria-label="Valeurs de la bougie"
          className="num flex min-h-5 flex-wrap gap-x-3 gap-y-1 pb-2 text-xs text-muted"
        >
          <div className="text-fg">
            <dt className="sr-only">Date</dt>
            <dd>{legendDate.format(toDate(legend.time as Time))}</dd>
          </div>
          {(
            [
              ["O", "Ouverture", legend.open],
              ["H", "Plus haut", legend.high],
              ["L", "Plus bas", legend.low],
              ["C", "Clôture", legend.close],
            ] as const
          ).map(([short, long, value]) => (
            <div key={short} className="flex gap-1">
              <dt>
                <abbr title={long} className="no-underline">
                  {short}
                </abbr>
              </dt>
              <dd className={legendUp ? "text-up" : "text-down"}>{priceFormat.format(value)}</dd>
            </div>
          ))}
          <div className="flex gap-1">
            <dt className="sr-only">Variation</dt>
            <dd className={legendUp ? "text-up" : "text-down"}>
              {legendChange >= 0 ? "+" : ""}
              {(legendChange * 100).toFixed(2).replace(".", ",")} %
            </dd>
          </div>
          <div className="flex gap-1">
            <dt>
              <abbr title="Volume échangé" className="no-underline">
                Vol
              </abbr>
            </dt>
            <dd>≈ {formatCompactUsd(legend.volume * legend.close)}</dd>
          </div>
        </dl>
      )}
      <div
        ref={containerRef}
        role="img"
        aria-label={`Graphique en chandeliers ${name}, bougies de ${intervalLabel}, avec volumes. Valeurs détaillées dans la légende au-dessus.`}
        className="h-[360px] w-full sm:h-[440px]"
      />
    </div>
  );
}
