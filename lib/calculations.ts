import type { Product, PricePoint, ProductData } from "./types";

/**
 * Konverterer indekstall til kroneverdi.
 * Formel: pris = referansepris × (indeks / referanseindeks)
 *
 * referanseindeks = 100 (fordi SSB 03675 har 2021=100,
 * og referanseprisen vår er fra 2021).
 */
export function indexToPrice(
  index: number,
  referencePrice: number,
  referenceIndex = 100
): number {
  return referencePrice * (index / referenceIndex);
}

/**
 * Beregn hva prisen ville vært i dag hvis den fulgte KPI.
 * Tar en historisk pris og justerer med KPI-endringen.
 *
 * hypotetiskPris = prisDaværende × (kpiNå / kpiDaværende)
 */
export function adjustForCPI(
  priceInStartYear: number,
  cpiStart: number,
  cpiNow: number
): number {
  if (cpiStart === 0) return 0;
  return priceInStartYear * (cpiNow / cpiStart);
}

/**
 * Bondens andel av butikkprisen.
 */
export function farmerShare(
  producerPrice: number,
  retailPrice: number
): number {
  if (retailPrice === 0) return 0;
  return (producerPrice / retailPrice) * 100;
}

/**
 * Bygg komplett tidsserie for et produkt.
 *
 * producerIndex: Map<år, indeks> fra SSB 03675
 * totalCPI: Map<år, indeks> fra SSB 03013 (TOTAL)
 * foodCPI: Map<år, indeks> fra SSB 03013 (matvaregruppe, f.eks. 01.1.4)
 * product: Produktkonfigurasjon med referansepriser
 */
export function buildTimeSeries(
  product: Product,
  producerIndex: Map<number, number>,
  totalCPI: Map<number, number>,
  foodCPI: Map<number, number>
): ProductData {
  const years = Array.from(producerIndex.keys()).sort((a, b) => a - b);
  if (years.length === 0) {
    return emptyProductData(product);
  }

  const refIndex = 100; // SSB 03675: 2021=100
  const kpiRef = 100;   // SSB 03013: 2015=100

  // Produsentpris i startåret
  const startYear = years[0];
  const startProducerIndex = producerIndex.get(startYear) ?? refIndex;
  const startPrice = indexToPrice(
    startProducerIndex,
    product.referencePrice,
    refIndex
  );
  const startCPI = totalCPI.get(startYear) ?? kpiRef;

  // Butikkpris: bruk KPI-matvareindeks (2015=100) med kjent butikkpris i 2021
  // KPI i 2021 ≈ indeksverdi som vi henter fra foodCPI
  const foodCPIRef = foodCPI.get(product.referenceYear) ?? kpiRef;

  const timeSeries: PricePoint[] = [];

  for (const year of years) {
    const pIdx = producerIndex.get(year);
    const cIdx = totalCPI.get(year);
    if (pIdx == null || cIdx == null) continue;

    const producerPrice = indexToPrice(pIdx, product.referencePrice, refIndex);
    const cpiAdjustedPrice = adjustForCPI(startPrice, startCPI, cIdx);

    // Butikkpris basert på KPI for denne matvaregruppen
    const fIdx = foodCPI.get(year);
    const retailPrice =
      fIdx != null
        ? indexToPrice(fIdx, product.retailReferencePrice, foodCPIRef)
        : null;

    timeSeries.push({
      year,
      producerIndex: pIdx,
      cpiIndex: cIdx,
      producerPrice: round2(producerPrice),
      cpiAdjustedPrice: round2(cpiAdjustedPrice),
      retailPrice: retailPrice != null ? round2(retailPrice) : null,
    });
  }

  // Beregn nøkkeltall
  const firstPoint = timeSeries[0];
  const lastPoint = timeSeries[timeSeries.length - 1];

  const priceChangePercent =
    ((lastPoint.producerPrice - firstPoint.producerPrice) /
      firstPoint.producerPrice) *
    100;
  const cpiChangePercent =
    ((lastPoint.cpiIndex - firstPoint.cpiIndex) / firstPoint.cpiIndex) * 100;

  const hypotheticalPrice = lastPoint.cpiAdjustedPrice;
  const currentPrice = lastPoint.producerPrice;
  const gapKr = hypotheticalPrice - currentPrice;

  const currentRetailPrice = lastPoint.retailPrice;

  const retailChangePercent =
    firstPoint.retailPrice != null && lastPoint.retailPrice != null
      ? round2(
          ((lastPoint.retailPrice - firstPoint.retailPrice) /
            firstPoint.retailPrice) *
            100
        )
      : null;

  const farmerSharePercent =
    lastPoint.retailPrice != null
      ? round2(farmerShare(lastPoint.producerPrice, lastPoint.retailPrice))
      : null;

  return {
    product,
    timeSeries,
    farmerSharePercent,
    priceChangePercent: round2(priceChangePercent),
    cpiChangePercent: round2(cpiChangePercent),
    retailChangePercent,
    gapKr: round2(gapKr),
    hypotheticalPrice: round2(hypotheticalPrice),
    currentPrice: round2(currentPrice),
    currentRetailPrice: currentRetailPrice != null ? round2(currentRetailPrice) : null,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function emptyProductData(product: Product): ProductData {
  return {
    product,
    timeSeries: [],
    farmerSharePercent: null,
    priceChangePercent: 0,
    cpiChangePercent: 0,
    retailChangePercent: null,
    gapKr: 0,
    hypotheticalPrice: 0,
    currentPrice: 0,
    currentRetailPrice: null,
  };
}
