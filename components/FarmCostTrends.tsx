"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import type { FarmInputCosts } from "@/lib/types";

type Props = {
  inputCosts: FarmInputCosts | null;
};

function Sparkline({
  data,
  color,
}: {
  data: { year: number; value: number }[];
  color: string;
}) {
  if (data.length < 2) return null;
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function percentChange(data: { year: number; value: number }[]): number | null {
  if (data.length < 2) return null;
  const first = data[0].value;
  const last = data[data.length - 1].value;
  if (first === 0) return null;
  return Math.round(((last - first) / first) * 100);
}

type CostCardProps = {
  title: string;
  data: { year: number; value: number }[];
  color: string;
  detail: string;
};

function CostCard({ title, data, color, detail }: CostCardProps) {
  const pct = percentChange(data);
  if (pct == null || data.length < 2) return null;

  const first = data[0];
  const last = data[data.length - 1];

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight">
            {pct > 0 ? "+" : ""}{pct} %
          </p>
          <span className="text-lg" aria-hidden="true">
            {pct > 10 ? "↗" : pct < -10 ? "↘" : "→"}
          </span>
        </div>
        <p className="text-sm font-medium">
          siden {first.year}
        </p>
        <Sparkline data={data} color={color} />
        <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        <p className="mt-1 text-[0.65rem] text-muted-foreground/60">
          Kilde: SSB tabell 03675 (prisindeks, 2021=100)
        </p>
      </CardContent>
    </Card>
  );
}

export function FarmCostTrends({ inputCosts }: Props) {
  if (!inputCosts) return null;

  const hasFeed = inputCosts.feed.length >= 2;
  const hasFertilizer = inputCosts.fertilizer.length >= 2;
  const hasFuel = inputCosts.fuel.length >= 2;

  if (!hasFeed && !hasFertilizer && !hasFuel) return null;

  return (
    <section aria-label="Bondens kostnader" className="space-y-4">
      <h2 className="text-xl">Hva koster det å være bonde?</h2>
      <p className="text-sm text-muted-foreground">
        Prisindekser for noen av de viktigste innsatsvarene i jordbruket.
        Når kostnadene stiger raskere enn det bonden får betalt, krymper
        marginen.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hasFeed && (
          <CostCard
            title="Dyrefôr"
            data={inputCosts.feed}
            color="#e76f51"
            detail="Fôr er den største enkeltkostnaden for husdyrbønder. Prisen påvirkes av verdensmarkedet for korn og soya."
          />
        )}
        {hasFertilizer && (
          <CostCard
            title="Gjødsel"
            data={inputCosts.fertilizer}
            color="#d62828"
            detail="Kunstgjødsel er energikrevende å produsere. Prisen steg kraftig etter 2021 på grunn av høye gasspriser."
          />
        )}
        {hasFuel && (
          <CostCard
            title="Drivstoff"
            data={inputCosts.fuel}
            color="#264653"
            detail="Diesel til traktorer og maskiner. Jordbruket har avgiftslette på diesel, men prisen følger oljemarkedet."
          />
        )}
      </div>
    </section>
  );
}
