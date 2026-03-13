"use client";

import type { ProductData } from "@/lib/types";
import { formatKr, formatPercent, formatPriceUnit } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  data: ProductData;
};

type Figure = {
  label: string;
  value: string;
  description: string;
  highlight?: "warning" | "danger" | false;
};

export function KeyFigures({ data }: Props) {
  const { product, timeSeries } = data;

  if (timeSeries.length === 0) return null;

  const startYear = timeSeries[0].year;
  const endYear = timeSeries[timeSeries.length - 1].year;

  const figures: Figure[] = [
    {
      label: `Bonden får i dag`,
      value: formatPriceUnit(data.currentPrice, product.unit),
      description: `Per ${product.unit} (${endYear})`,
    },
    {
      label: `Bondens pris`,
      value: formatPercent(data.priceChangePercent),
      description: `Så mye mer får bonden siden ${startYear}`,
    },
    {
      label: `Generell prisvekst`,
      value: formatPercent(data.cpiChangePercent),
      description: `Så mye har prisene ellers steget siden ${startYear}`,
    },
  ];

  // Butikkpris — fremhev hvis den stiger mer enn generell inflasjon
  if (data.retailChangePercent != null && data.currentRetailPrice != null) {
    const retailVsCpi = data.retailChangePercent - data.cpiChangePercent;
    figures.push({
      label: `Butikkpris (anslag)`,
      value: formatPercent(data.retailChangePercent),
      description:
        retailVsCpi > 5
          ? `Steget ${retailVsCpi.toFixed(0)} % mer enn den generelle prisveksten — du betaler nå ca. ${formatPriceUnit(data.currentRetailPrice, product.unit)}`
          : `Endring siden ${startYear} — du betaler nå ca. ${formatPriceUnit(data.currentRetailPrice, product.unit)}`,
      highlight: retailVsCpi > 5 ? "danger" : false,
    });
  }

  // Bondens andel — fremhev hvis under 35%
  if (data.farmerSharePercent != null) {
    figures.push({
      label: `Bondens andel av butikkprisen`,
      value: `${data.farmerSharePercent.toFixed(0)} %`,
      description:
        data.farmerSharePercent < 35
          ? `Bare ${data.farmerSharePercent.toFixed(0)} øre av hver krone du betaler i butikken går til bonden`
          : `Så mye av det du betaler i butikken går til bonden`,
      highlight: data.farmerSharePercent < 35 ? "warning" : false,
    });
  }

  // Differanse mellom faktisk pris og inflasjon — beregn for både bonde og butikk
  const firstPoint = timeSeries[0];
  const lastPoint = timeSeries[timeSeries.length - 1];
  const hasRetailGap =
    firstPoint.retailPrice != null && lastPoint.retailPrice != null && firstPoint.cpiIndex > 0;
  const hypotheticalRetailPrice = hasRetailGap
    ? firstPoint.retailPrice! * (lastPoint.cpiIndex / firstPoint.cpiIndex)
    : null;
  const retailGapKr = hasRetailGap
    ? Math.round((lastPoint.retailPrice! - hypotheticalRetailPrice!) * 100) / 100
    : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {figures.map((f) => (
        <Card
          key={f.label}
          className={
            f.highlight === "danger"
              ? "border-red-400 bg-red-50 ring-1 ring-red-200"
              : f.highlight === "warning"
                ? "border-amber-400 bg-amber-50 ring-1 ring-amber-200"
                : ""
          }
        >
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{f.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {f.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {f.description}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Sammenligning: bonde vs. butikk mot generell prisvekst */}
      <Card className="sm:col-span-2 lg:col-span-3">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Hvis prisene hadde fulgt den generelle prisveksten
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {/* Bonden */}
            <div className="rounded-md bg-[var(--chart-1)]/10 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bonden
              </p>
              <p className="mt-1 text-xl font-bold text-[var(--chart-1)]">
                {data.gapKr > 0 ? "−" : "+"}{formatKr(Math.abs(data.gapKr))}/{product.unit}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {data.gapKr > 0
                  ? `Bonden får ${formatKr(data.gapKr)} mindre enn prisveksten tilsier`
                  : `Bonden får ${formatKr(Math.abs(data.gapKr))} mer enn prisveksten tilsier`}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70">
                Ville vært {formatPriceUnit(data.hypotheticalPrice, product.unit)} — er {formatPriceUnit(data.currentPrice, product.unit)}
              </p>
            </div>
            {/* Butikken */}
            {retailGapKr != null && hypotheticalRetailPrice != null && (
              <div className="rounded-md bg-[var(--chart-3)]/10 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Butikken (anslag)
                </p>
                <p className="mt-1 text-xl font-bold text-[var(--chart-3)]">
                  {retailGapKr > 0 ? "+" : "−"}{formatKr(Math.abs(retailGapKr))}/{product.unit}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {retailGapKr > 0
                    ? `Butikkprisen har steget ${formatKr(retailGapKr)} mer enn prisveksten tilsier`
                    : `Butikkprisen har steget ${formatKr(Math.abs(retailGapKr))} mindre enn prisveksten tilsier`}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/70">
                  Ville vært {formatPriceUnit(Math.round(hypotheticalRetailPrice * 100) / 100, product.unit)} — er ca. {formatPriceUnit(lastPoint.retailPrice!, product.unit)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
