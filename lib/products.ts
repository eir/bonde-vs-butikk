import type { Product } from "./types";

/**
 * Produktkonfigurasjon.
 *
 * referencePrice = produsentpris i referanseåret (kr/enhet).
 * retailReferencePrice = butikkpris i referanseåret (kr/enhet).
 * referenceYear = 2021 (basisår for SSB indeks 03675, 2021=100).
 *
 * Kilder: Totalkalkylen (NIBIO), Landbruksdirektoratet, SSB.
 * Prisene er omtrentlige og brukes for å konvertere indekstall til kroneverdi.
 */
export const products: Product[] = [
  {
    id: "melk",
    name: "Kumelk",
    unit: "liter",
    sitcCode: "SITC02",
    kpiCode: "01.1.4",
    referencePrice: 5.58,
    retailReferencePrice: 19.9,
    referenceYear: 2021,
    icon: "🥛",
  },
  {
    id: "hvete",
    name: "Hvete",
    unit: "kg",
    sitcCode: "SITC04",
    kpiCode: "01.1.1",
    referencePrice: 3.15,
    retailReferencePrice: 25.0,
    referenceYear: 2021,
    icon: "🌾",
  },
  {
    id: "storfe",
    name: "Storfekjøtt",
    unit: "kg",
    sitcCode: "SITC01",
    kpiCode: "01.1.2",
    referencePrice: 62.0,
    retailReferencePrice: 200.0,
    referenceYear: 2021,
    icon: "🐄",
  },
  {
    id: "svin",
    name: "Svinekjøtt",
    unit: "kg",
    sitcCode: "SITC01",
    kpiCode: "01.1.2",
    referencePrice: 32.5,
    retailReferencePrice: 120.0,
    referenceYear: 2021,
    icon: "🐷",
  },
  {
    id: "egg",
    name: "Egg",
    unit: "kg",
    sitcCode: "SITC02",
    kpiCode: "01.1.4",
    referencePrice: 22.0,
    retailReferencePrice: 45.0,
    referenceYear: 2021,
    icon: "🥚",
  },
  {
    id: "poteter",
    name: "Poteter",
    unit: "kg",
    sitcCode: "SITC05",
    kpiCode: "01.1.7",
    referencePrice: 5.0,
    retailReferencePrice: 20.0,
    referenceYear: 2021,
    icon: "🥔",
  },
];

/** Finn et produkt basert på ID */
export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
