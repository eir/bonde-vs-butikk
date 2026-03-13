"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PricePoint } from "@/lib/types";
import { formatKr } from "@/lib/format";

type Props = {
  data: PricePoint[];
  unit: string;
};

export function PriceChart({ data, unit }: Props) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Ingen data tilgjengelig.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    year: d.year,
    Produsentpris: d.producerPrice,
    "KPI-justert": d.cpiAdjustedPrice,
    Butikkpris: d.retailPrice,
  }));

  return (
    <div className="w-full" role="img" aria-label="Prisutvikling over tid">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
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
              value: `kr/${unit}`,
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12, fill: "#64748b" },
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatKr(value),
              name,
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
          />
          <Line
            type="monotone"
            dataKey="Produsentpris"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            dot={false}
            name="Produsentpris (bonden får)"
          />
          <Line
            type="monotone"
            dataKey="KPI-justert"
            stroke="var(--chart-2)"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            name="Hadde fulgt inflasjonen"
          />
          <Line
            type="monotone"
            dataKey="Butikkpris"
            stroke="var(--chart-3)"
            strokeWidth={2}
            dot={false}
            name="Butikkpris (estimert)"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Kilde: SSB tabell 03675 (produsentprisindeks) og 03013 (KPI). Basisår
        2021=100.
      </p>
    </div>
  );
}
