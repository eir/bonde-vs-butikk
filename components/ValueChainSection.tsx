"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ProductData } from "@/lib/types";
import { formatKr, formatPriceUnit } from "@/lib/format";

type Props = {
  data: ProductData;
};

export function ValueChainSection({ data }: Props) {
  const { product, timeSeries } = data;

  // Trenger butikkpris for å vise verdikjede
  const pointsWithRetail = timeSeries.filter((p) => p.retailPrice != null);
  if (pointsWithRetail.length < 2) return null;

  const last = pointsWithRetail[pointsWithRetail.length - 1];
  const first = pointsWithRetail[0];
  const farmerKr = last.producerPrice;
  const retailKr = last.retailPrice!;
  const middleKr = retailKr - farmerKr;
  const farmerPct = (farmerKr / retailKr) * 100;
  const middlePct = 100 - farmerPct;

  // Beregn hvordan mellomleddet har vokst over tid
  const firstMiddle = first.retailPrice! - first.producerPrice;
  const middleGrowth =
    firstMiddle > 0
      ? ((middleKr - firstMiddle) / firstMiddle) * 100
      : 0;
  const farmerGrowth =
    first.producerPrice > 0
      ? ((farmerKr - first.producerPrice) / first.producerPrice) * 100
      : 0;

  // Data for stacked area chart
  const chartData = pointsWithRetail.map((p) => ({
    year: p.year,
    bonden: Math.round(p.producerPrice * 100) / 100,
    mellomleddet: Math.round((p.retailPrice! - p.producerPrice) * 100) / 100,
  }));

  return (
    <section aria-label="Verdikjede" className="space-y-4">
      <h2 className="text-xl">Hvor går pengene dine?</h2>

      {/* Visuell fordeling — nåtid */}
      <div className="rounded-lg border bg-card p-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Når du betaler anslagsvis{" "}
          <span className="font-semibold text-foreground">
            {formatPriceUnit(retailKr, product.unit)}
          </span>{" "}
          i butikken:
        </p>

        {/* Stacked bar */}
        <div
          className="flex h-14 w-full overflow-hidden rounded-lg text-sm font-medium"
          role="img"
          aria-label={`Bonden får ${farmerPct.toFixed(0)}%, mellomleddet ${middlePct.toFixed(0)}%`}
        >
          <div
            className="flex flex-col items-center justify-center bg-[var(--chart-1)] text-white"
            style={{ width: `${farmerPct}%` }}
          >
            <span className="text-xs">Bonden</span>
            <span>{formatKr(farmerKr)}</span>
          </div>
          <div
            className="flex flex-col items-center justify-center bg-[var(--chart-4,#94a3b8)] text-white"
            style={{ width: `${middlePct}%` }}
          >
            <span className="text-xs">Mellomledd</span>
            <span>{formatKr(middleKr)}</span>
          </div>
        </div>

        {/* Vekstsammenligning */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-[var(--chart-1)]/10 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Bonden har fått
            </p>
            <p className="text-lg font-bold text-[var(--chart-1)]">
              {farmerGrowth > 0 ? "+" : ""}
              {farmerGrowth.toFixed(0)} %
            </p>
            <p className="text-xs text-muted-foreground">
              siden {first.year}
            </p>
          </div>
          <div className="rounded-md bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Mellomleddet tar
            </p>
            <p className="text-lg font-bold">
              {middleGrowth > 0 ? "+" : ""}
              {middleGrowth.toFixed(0)} %
            </p>
            <p className="text-xs text-muted-foreground">
              mer siden {first.year}
            </p>
          </div>
        </div>
      </div>

      {/* Trend over tid — stacked area */}
      <div className="rounded-lg border bg-card p-4">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Slik har fordelingen endret seg over tid
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}`}
              label={{
                value: `kr/${product.unit}`,
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: "#64748b" },
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatKr(value),
                name === "bonden" ? "Til bonden" : "Mellomledd",
              ]}
              labelFormatter={(label: number) => `${label}`}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "0.875rem", paddingTop: "0.5rem" }}
              formatter={(value: string) =>
                value === "bonden" ? "Til bonden" : "Mellomledd (anslag — foredling, transport, butikk)"
              }
            />
            <Area
              type="monotone"
              dataKey="bonden"
              stackId="1"
              fill="var(--chart-1)"
              stroke="var(--chart-1)"
              fillOpacity={0.8}
            />
            <Area
              type="monotone"
              dataKey="mellomleddet"
              stackId="1"
              fill="#94a3b8"
              stroke="#94a3b8"
              fillOpacity={0.5}
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-muted-foreground">
          Mellomleddet er alt som skjer mellom bonden og butikkhyllen:
          meieri eller slakteri, lager, transport og butikkens påslag. Ofte eid av samme selskap.
        </p>
      </div>
    </section>
  );
}
