"use client";

import type { ProductData } from "@/lib/types";
import { formatPriceUnit, formatPercent } from "@/lib/format";

type Props = {
  data: ProductData;
};

export function PriceSummary({ data }: Props) {
  const { product, timeSeries } = data;
  if (timeSeries.length === 0) return null;

  const startYear = timeSeries[0].year;
  const hasRetail =
    data.currentRetailPrice != null && data.retailChangePercent != null;
  const markup =
    hasRetail && data.currentPrice > 0
      ? (data.currentRetailPrice! / data.currentPrice).toFixed(1)
      : null;

  const retailVsCpi =
    hasRetail ? data.retailChangePercent! - data.cpiChangePercent : 0;
  const retailVsProducer =
    hasRetail ? data.retailChangePercent! - data.priceChangePercent : 0;

  return (
    <div className="space-y-4">
      {/* Hovedfunn — den viktigste setningen */}
      {hasRetail && retailVsCpi > 5 && (
        <div className="rounded-md border-l-4 border-red-500 bg-red-50 px-3 py-2">
          <p className="text-sm font-semibold text-red-900">
            Butikkprisen har steget {retailVsCpi.toFixed(0)} % mer
            enn inflasjonen siden {startYear}
          </p>
          {retailVsProducer < -5 && (
            <p className="mt-1 text-xs text-red-800">
              Mens produsentprisen har steget {Math.abs(retailVsProducer).toFixed(0)} %
              {" "}mindre enn butikkprisen
            </p>
          )}
        </div>
      )}

      {/* Prissammenligning */}
      {hasRetail && (
        <div className="rounded-md bg-primary/5 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Du betaler i butikken
          </p>
          <p className="text-2xl font-bold text-[var(--chart-3)]">
            {formatPriceUnit(data.currentRetailPrice!, product.unit)}
          </p>

          <div className="my-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">
              ↓ bonden får
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-2xl font-bold text-[var(--chart-1)]">
            {formatPriceUnit(data.currentPrice, product.unit)}
          </p>

          {markup && (
            <p className="mt-2 text-sm font-medium text-accent">
              Butikkprisen er {markup}× produsentprisen
            </p>
          )}
        </div>
      )}

      {/* Bondens andel — visuell bar */}
      {data.farmerSharePercent != null && (
        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Bondens andel
            </p>
            <p className="text-lg font-bold">
              {data.farmerSharePercent.toFixed(0)} %
            </p>
          </div>
          <div className="mt-1 h-4 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--chart-1)] transition-all duration-500"
              style={{ width: `${data.farmerSharePercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Resten går til foredling, transport og butikk
          </p>
        </div>
      )}

      {/* Prisutvikling — kompakt sammenligning */}
      <div className="space-y-1 border-t pt-3 text-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Prisendring siden {startYear}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Produsentpris</span>
          <span className="font-semibold text-[var(--chart-1)]">
            {formatPercent(data.priceChangePercent)}
          </span>
        </div>
        {data.retailChangePercent != null && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Butikkpris</span>
            <span className="font-semibold text-[var(--chart-3)]">
              {formatPercent(data.retailChangePercent)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Inflasjon</span>
          <span className="font-semibold text-[var(--chart-2)]">
            {formatPercent(data.cpiChangePercent)}
          </span>
        </div>
      </div>
    </div>
  );
}
