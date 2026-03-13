"use client";

import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  products: Product[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function ProductSelector({ products, selectedId, onSelect }: Props) {
  return (
    <div
      className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3"
      role="radiogroup"
      aria-label="Velg produkt"
    >
      {products.map((p) => (
        <button
          key={p.id}
          role="radio"
          aria-checked={p.id === selectedId}
          onClick={() => onSelect(p.id)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-colors",
            "hover:border-primary/50 hover:bg-primary/5",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            p.id === selectedId
              ? "border-primary bg-primary/10 font-medium"
              : "border-border bg-card"
          )}
        >
          <span className="text-2xl" aria-hidden="true">
            {p.icon}
          </span>
          <span>{p.name}</span>
        </button>
      ))}
    </div>
  );
}
