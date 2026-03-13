"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import type { FarmStats } from "@/lib/types";

type Props = {
  farmStats: FarmStats | null;
};

type TrendCardProps = {
  title: string;
  figure: string;
  label: string;
  detail: string;
  source: string;
  data: { year: number; value: number }[];
  color: string;
  trend: "down" | "up" | "flat";
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

function TrendCard({
  title,
  figure,
  label,
  detail,
  source,
  data,
  color,
  trend,
}: TrendCardProps) {
  const arrow = trend === "down" ? "\u2198" : trend === "up" ? "\u2197" : "\u2192";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight">{figure}</p>
          <span className="text-lg" aria-hidden="true">
            {arrow}
          </span>
        </div>
        <p className="text-sm font-medium">{label}</p>
        <Sparkline data={data} color={color} />
        <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        <p className="mt-1 text-[0.65rem] text-muted-foreground/60">
          Kilde: {source}
        </p>
      </CardContent>
    </Card>
  );
}

/** Statiske fakta som ikke kommer fra SSB-tidsserier */
function StaticCard({
  figure,
  label,
  detail,
  source,
}: {
  figure: string;
  label: string;
  detail: string;
  source: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-bold tracking-tight">{figure}</p>
        <p className="mt-1 text-sm font-medium">{label}</p>
        <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        <p className="mt-1 text-[0.65rem] text-muted-foreground/60">
          Kilde: {source}
        </p>
      </CardContent>
    </Card>
  );
}

export function FarmContextFacts({ farmStats }: Props) {
  // Formater nåverdier fra SSB-data
  const latestFarms = farmStats?.farmCount.at(-1);
  const latestDebt = farmStats?.debtPerFarmer.at(-1);
  const latestIncome = farmStats?.farmIncome.at(-1);

  const formatThousands = (n: number) =>
    n.toLocaleString("nb-NO", { maximumFractionDigits: 0 });

  return (
    <section aria-label="Jordbruket i tall" className="space-y-4">
      <h2 className="text-xl">Jordbruket i tall</h2>
      <p className="text-sm text-muted-foreground">
        Tall som viser hvordan norske bønder har det — hentet fra SSB.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Kort med SSB-data og sparklines */}
        {farmStats?.farmCount && farmStats.farmCount.length > 0 && (
          <TrendCard
            title="Aktive gårdsbruk"
            figure={latestFarms ? formatThousands(latestFarms.value) : "—"}
            label={`i ${latestFarms?.year ?? "?"}`}
            detail="Siden år 2000 er antallet nesten halvert — omtrent 4 bruk forsvinner som selvstendige enheter hver dag, de fleste gjennom sammenslåing."
            source="SSB tabell 11582 (jordbruksbedrifter)"
            data={farmStats.farmCount}
            color="#e76f51"
            trend="down"
          />
        )}

        {farmStats?.debtPerFarmer && farmStats.debtPerFarmer.length > 0 && (
          <TrendCard
            title="Gjeld per bonde"
            figure={
              latestDebt
                ? `${(latestDebt.value / 1_000_000).toFixed(1)} mill kr`
                : "—"
            }
            label={`gjennomsnitt i ${latestDebt?.year ?? "?"}`}
            detail="Gjelden per gård er fem ganger høyere enn i 1999. Bøndene må investere mer, men tjener ikke tilsvarende mer."
            source="SSB tabell 09823 (gjennomsnittlig gjeld, jordbruksbedrifter)"
            data={farmStats.debtPerFarmer}
            color="#d62828"
            trend="up"
          />
        )}

        {farmStats?.farmIncome && farmStats.farmIncome.length > 0 && (
          <TrendCard
            title="Netto jordbruksinntekt"
            figure={
              latestIncome
                ? `${formatThousands(latestIncome.value)} kr`
                : "—"
            }
            label={`per bonde i ${latestIncome?.year ?? "?"}`}
            detail="Det bonden sitter igjen med fra gårdsdriften. 9 av 10 bønder må ha jobb ved siden av for å klare seg."
            source="SSB tabell 05038 (netto næringsinntekt, jordbruk)"
            data={farmStats.farmIncome}
            color="#2a9d8f"
            trend="flat"
          />
        )}

        {/* Statiske fakta */}
        <StaticCard
          figure="96,6 %"
          label="kontrollert av tre kjeder (2023)"
          detail="NorgesGruppen, Coop og Rema styrer nesten hele dagligvaremarkedet. De eier også lagrene, transporten og eiendommene — og har stor makt over hva bonden får betalt."
          source="Dagligvaretilsynet, Rapport om konkurransen i dagligvaremarkedet (2024)"
        />

        <StaticCard
          figure="ca. 36 %"
          label="selvforsyningsgrad (korrigert for importert fôr)"
          detail="Korrigert for at mye dyrefôr importeres, produserer Norge mat tilsvarende drøyt en tredel av forbruket. Uten denne korreksjonen er tallet rundt 45 %."
          source="NIBIO / Budsjettnemnda for jordbruket, Totalkalkylen (2023)"
        />
      </div>
    </section>
  );
}
