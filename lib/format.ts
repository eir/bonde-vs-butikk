/**
 * Formater tall som norsk valuta (kr).
 */
export function formatKr(value: number, decimals = 2): string {
  return (
    value.toLocaleString("nb-NO", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + " kr"
  );
}

/**
 * Formater tall som prosent.
 */
export function formatPercent(value: number, decimals = 1): string {
  const sign = value > 0 ? "+" : "";
  return (
    sign +
    value.toLocaleString("nb-NO", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    " %"
  );
}

/**
 * Formater pris med enhet (f.eks. "5,58 kr/liter").
 */
export function formatPriceUnit(value: number, unit: string): string {
  return formatKr(value) + "/" + unit;
}
