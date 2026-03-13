"use client";

import type { ProductData } from "@/lib/types";

type Props = {
  data: ProductData;
};

export function FarmerShareBar({ data }: Props) {
  const { farmerSharePercent, product } = data;

  if (farmerSharePercent == null || data.timeSeries.length === 0) return null;

  const lastPoint = data.timeSeries[data.timeSeries.length - 1];
  const restPercent = 100 - farmerSharePercent;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">
        Bondens andel av butikkprisen for {product.name.toLowerCase()}
      </h3>
      <div
        className="flex h-12 w-full overflow-hidden rounded-lg text-sm font-medium"
        role="img"
        aria-label={`Bonden får ${farmerSharePercent.toFixed(0)}% av butikkprisen`}
      >
        <div
          className="flex items-center justify-center bg-primary text-primary-foreground"
          style={{ width: `${farmerSharePercent}%` }}
        >
          Bonden: {farmerSharePercent.toFixed(0)}%
        </div>
        <div
          className="flex items-center justify-center bg-muted text-muted-foreground"
          style={{ width: `${restPercent}%` }}
        >
          Foredling, distribusjon, butikk: {restPercent.toFixed(0)}%
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Av butikkprisen på ca.{" "}
        {lastPoint.retailPrice?.toLocaleString("nb-NO", {
          maximumFractionDigits: 0,
        })}{" "}
        kr/{product.unit} går ca.{" "}
        {lastPoint.producerPrice.toLocaleString("nb-NO", {
          maximumFractionDigits: 2,
        })}{" "}
        kr til bonden. Resten dekker foredling, transport, emballasje og
        butikkens påslag.
      </p>
    </div>
  );
}
