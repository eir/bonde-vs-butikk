"use client";

import { useMemo, useState } from "react";
import type { ProductData, PricePoint, FarmStats, FarmInputCosts } from "@/lib/types";
import { products } from "@/lib/products";
import { farmerShare } from "@/lib/calculations";
import { ProductSelector } from "./ProductSelector";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { PriceChart } from "./PriceChart";
import { PriceSummary } from "./PriceSummary";
import { KeyFigures } from "./KeyFigures";
import { FarmerShareBar } from "./FarmerShareBar";
import { ValueChainSection } from "./ValueChainSection";
import { FarmContextFacts } from "./FarmContextFacts";
import { FarmCostTrends } from "./FarmCostTrends";
import { MethodNote } from "./MethodNote";

type Props = {
  allData: Record<string, ProductData>;
  farmStats: FarmStats | null;
  inputCosts: FarmInputCosts | null;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Filtrer tidsserie og beregn nøkkeltall for valgt periode */
function filterByRange(
  data: ProductData,
  years: number | null
): ProductData {
  if (years == null) return data;

  const allPoints = data.timeSeries;
  if (allPoints.length === 0) return data;

  const lastYear = allPoints[allPoints.length - 1].year;
  const fromYear = lastYear - years;
  const filtered = allPoints.filter((p) => p.year >= fromYear);
  if (filtered.length < 2) return data;

  return recalculate(data, filtered);
}

/** Beregn nøkkeltall basert på filtrert tidsserie */
function recalculate(
  original: ProductData,
  timeSeries: PricePoint[]
): ProductData {
  const first = timeSeries[0];
  const last = timeSeries[timeSeries.length - 1];

  const priceChangePercent = round2(
    ((last.producerPrice - first.producerPrice) / first.producerPrice) * 100
  );
  const cpiChangePercent = round2(
    ((last.cpiIndex - first.cpiIndex) / first.cpiIndex) * 100
  );
  const retailChangePercent =
    first.retailPrice != null && last.retailPrice != null
      ? round2(
          ((last.retailPrice - first.retailPrice) / first.retailPrice) * 100
        )
      : null;

  // Rekalkuler KPI-justert pris for denne perioden
  const startCPI = first.cpiIndex;
  const lastCPI = last.cpiIndex;
  const hypotheticalPrice =
    startCPI > 0
      ? round2(first.producerPrice * (lastCPI / startCPI))
      : last.cpiAdjustedPrice;
  const currentPrice = last.producerPrice;
  const gapKr = round2(hypotheticalPrice - currentPrice);

  const farmerSharePercent =
    last.retailPrice != null
      ? round2(farmerShare(last.producerPrice, last.retailPrice))
      : null;

  // Oppdater cpiAdjustedPrice i tidsserien for denne perioden
  const adjustedTimeSeries = timeSeries.map((p) => ({
    ...p,
    cpiAdjustedPrice:
      startCPI > 0
        ? round2(first.producerPrice * (p.cpiIndex / startCPI))
        : p.cpiAdjustedPrice,
  }));

  return {
    ...original,
    timeSeries: adjustedTimeSeries,
    priceChangePercent,
    cpiChangePercent,
    retailChangePercent,
    gapKr,
    hypotheticalPrice,
    currentPrice,
    currentRetailPrice: last.retailPrice != null ? round2(last.retailPrice) : null,
    farmerSharePercent,
  };
}

export function DashboardClient({ allData, farmStats, inputCosts }: Props) {
  const [selectedId, setSelectedId] = useState(products[0].id);
  const [selectedYears, setSelectedYears] = useState<number | null>(null);
  const rawData = allData[selectedId];

  const data = useMemo(
    () => (rawData ? filterByRange(rawData, selectedYears) : undefined),
    [rawData, selectedYears]
  );

  return (
    <div className="space-y-8">
      <ProductSelector
        products={products}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">Tidsperiode:</span>
        <TimeRangeSelector
          selectedYears={selectedYears}
          onSelect={setSelectedYears}
        />
      </div>

      {data ? (
        <>
          {/* Hovedvisning: diagram + sammendrag side om side */}
          <section aria-label="Prisutvikling">
            <h2 className="mb-4 text-xl">
              Prisutvikling for {data.product.name.toLowerCase()}
            </h2>
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Diagram — tar mesteparten av plassen */}
              <div className="min-w-0 flex-1">
                <PriceChart data={data.timeSeries} unit={data.product.unit} indexNote={data.product.indexNote} />
              </div>
              {/* Sammendrag — ved siden av på desktop, under på mobil */}
              <div className="w-full shrink-0 rounded-lg border bg-card p-5 lg:w-64">
                <PriceSummary data={data} />
              </div>
            </div>
          </section>

          {/* Detaljerte nøkkeltall */}
          <section aria-label="Nøkkeltall">
            <h2 className="mb-4 text-xl">Detaljert sammenligning</h2>
            <KeyFigures data={data} />
          </section>

          {/* Verdikjede: Hvor går pengene? */}
          <ValueChainSection data={data} />

          <section aria-label="Bondens andel">
            <FarmerShareBar data={data} />
          </section>
        </>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          Ingen data tilgjengelig for dette produktet.
        </p>
      )}

      {/* Kontekst — uavhengig av valgt produkt */}
      <FarmCostTrends inputCosts={inputCosts} />

      <FarmContextFacts farmStats={farmStats} />

      <MethodNote />
    </div>
  );
}
