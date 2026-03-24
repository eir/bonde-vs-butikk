"use client";

import { cn } from "@/lib/utils";

type Props = {
  minYear: number;
  maxYear: number;
  fromYear: number;
  onFromYearChange: (year: number) => void;
};

const presets = [
  { label: "1 år", yearsBack: 1 },
  { label: "5 år", yearsBack: 5 },
  { label: "10 år", yearsBack: 10 },
  { label: "20 år", yearsBack: 20 },
  { label: "30 år", yearsBack: 30 },
  { label: "Alt", yearsBack: null },
];

export function TimeRangeSelector({
  minYear,
  maxYear,
  fromYear,
  onFromYearChange,
}: Props) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5"
      role="group"
      aria-label="Velg tidsperiode"
    >
      {presets.map((p) => {
        const targetYear = p.yearsBack != null ? maxYear - p.yearsBack : minYear;
        const isActive = fromYear === targetYear;
        return (
          <button
            key={p.label}
            onClick={() => onFromYearChange(targetYear)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
