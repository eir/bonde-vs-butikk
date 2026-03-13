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
      description: `Produsentpris per ${product.unit} (${endYear})`,
    },
    {
      label: `Produsentpris`,
      value: formatPercent(data.priceChangePercent),
      description: `Endring siden ${startYear}`,
    },
    {
      label: `Generell inflasjon (KPI)`,
      value: formatPercent(data.cpiChangePercent),
      description: `Prisvekst i samfunnet siden ${startYear}`,
    },
  ];

  // Butikkpris — fremhev hvis den stiger mer enn generell inflasjon
  if (data.retailChangePercent != null && data.currentRetailPrice != null) {
    const retailVsCpi = data.retailChangePercent - data.cpiChangePercent;
    figures.push({
      label: `Butikkpris`,
      value: formatPercent(data.retailChangePercent),
      description:
        retailVsCpi > 5
          ? `Butikkprisen har steget ${retailVsCpi.toFixed(0)} % mer enn inflasjonen — nå ca. ${formatPriceUnit(data.currentRetailPrice, product.unit)}`
          : `Endring i butikkpris siden ${startYear} — nå ca. ${formatPriceUnit(data.currentRetailPrice, product.unit)}`,
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
          ? `Bare ${data.farmerSharePercent.toFixed(0)} øre av hver krone i butikken går til bonden`
          : `Av det du betaler i butikken, går dette til bonden`,
      highlight: data.farmerSharePercent < 35 ? "warning" : false,
    });
  }

  // Differanse mellom produsentpris og inflasjon
  figures.push({
    label: `Hadde fulgt inflasjonen`,
    value: formatPriceUnit(data.hypotheticalPrice, product.unit),
    description:
      data.gapKr > 0
        ? `Bonden får ${formatKr(data.gapKr)} mindre per ${product.unit} enn inflasjonen tilsier`
        : `Bonden får ${formatKr(Math.abs(data.gapKr))} mer enn inflasjonen tilsier`,
  });

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
    </div>
  );
}
