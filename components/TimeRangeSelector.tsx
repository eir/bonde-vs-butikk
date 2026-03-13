"use client";

import { cn } from "@/lib/utils";

export type TimeRange = {
  label: string;
  years: number | null; // null = vis alt
};

const ranges: TimeRange[] = [
  { label: "5 år", years: 5 },
  { label: "10 år", years: 10 },
  { label: "15 år", years: 15 },
  { label: "20 år", years: 20 },
  { label: "30 år", years: 30 },
  { label: "Alt", years: null },
];

type Props = {
  selectedYears: number | null;
  onSelect: (years: number | null) => void;
};

export function TimeRangeSelector({ selectedYears, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Velg tidsperiode">
      {ranges.map((r) => (
        <button
          key={r.label}
          onClick={() => onSelect(r.years)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors",
            "hover:border-primary/50 hover:bg-primary/5",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            selectedYears === r.years
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
