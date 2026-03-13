/** Produktkonfigurasjonen — definerer hva vi kan vise */
export type Product = {
  id: string;
  name: string;
  unit: string;
  /** SITC-kode i SSB tabell 03675 */
  sitcCode: string;
  /** KPI-konsumgruppe i SSB tabell 03013 */
  kpiCode: string;
  /** Kjent pris i referanseåret (kr per enhet) */
  referencePrice: number;
  /** Butikkpris i referanseåret (kr per enhet) */
  retailReferencePrice: number;
  /** Referanseåret prisene gjelder for */
  referenceYear: number;
  /** Emoji-ikon */
  icon: string;
  /** Merknad om at indeksen deles med andre produkter */
  indexNote?: string;
};

/** Et enkelt datapunkt i tidsserien */
export type PricePoint = {
  year: number;
  /** Årlig gjennomsnittlig produsentprisindeks */
  producerIndex: number;
  /** Årlig gjennomsnittlig KPI */
  cpiIndex: number;
  /** Beregnet produsentpris i kr */
  producerPrice: number;
  /** Hva prisen ville vært hvis den fulgte KPI fra startår */
  cpiAdjustedPrice: number;
  /** Estimert butikkpris i kr (hvis tilgjengelig) */
  retailPrice: number | null;
};

/** Ferdigberegnet data for et produkt */
export type ProductData = {
  product: Product;
  timeSeries: PricePoint[];
  /** Bondens andel av butikkprisen i dag (%) */
  farmerSharePercent: number | null;
  /** Endring i produsentpris fra start til slutt (%) */
  priceChangePercent: number;
  /** KPI-endring i samme periode (%) */
  cpiChangePercent: number;
  /** Endring i butikkpris i samme periode (%) */
  retailChangePercent: number | null;
  /** Gap: KPI-justert pris minus faktisk produsentpris i dag (kr) */
  gapKr: number;
  /** Hva prisen ville vært i dag med KPI-justering */
  hypotheticalPrice: number;
  /** Faktisk pris i dag */
  currentPrice: number;
  /** Butikkpris i dag */
  currentRetailPrice: number | null;
};

/** Jordbruksstatistikk — strukturelle trender */
export type FarmStats = {
  /** Antall gårdsbruk per år */
  farmCount: { year: number; value: number }[];
  /** Gjeld per bonde (kr) per år */
  debtPerFarmer: { year: number; value: number }[];
  /** Netto næringsinntekt fra jordbruk (kr) per år */
  farmIncome: { year: number; value: number }[];
};

/** Bondens innsatskostnader — prisindekser for fôr, gjødsel, drivstoff */
export type FarmInputCosts = {
  /** Dyrefor (SITC08) — prisindeks per år */
  feed: { year: number; value: number }[];
  /** Rå gjødningsstoffer (SITC27) — prisindeks per år */
  fertilizer: { year: number; value: number }[];
  /** Mineralolje/drivstoff (SITC33) — prisindeks per år */
  fuel: { year: number; value: number }[];
};

/** Rå JSON-stat2-respons fra SSB (forenklet) */
export type SSBResponse = {
  id: string[];
  size: number[];
  dimension: Record<
    string,
    {
      label: string;
      category: {
        index: Record<string, number>;
        label: Record<string, string>;
      };
    }
  >;
  value: (number | null)[];
};
