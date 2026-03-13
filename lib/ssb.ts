import type { SSBResponse, FarmStats, FarmInputCosts } from "./types";

const SSB_API = "https://data.ssb.no/api/v0/no/table";

/**
 * Hent data fra SSB API (v0, POST med JSON-body).
 * Returnerer JSON-stat2-respons.
 */
async function fetchSSB(
  tableId: string,
  query: { code: string; selection: { filter: string; values: string[] } }[]
): Promise<SSBResponse> {
  const body = {
    query,
    response: { format: "json-stat2" },
  };

  const res = await fetch(`${SSB_API}/${tableId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`SSB API feil for tabell ${tableId}: ${res.status}`);
  }

  return res.json();
}

/**
 * Hent produsentprisindeks (tabell 03675) for en SITC-kode.
 * Returnerer Map<år, gjennomsnittlig årsindeks>.
 */
export async function fetchProducerPriceIndex(
  sitcCode: string,
  fromYear = 1985
): Promise<Map<number, number>> {
  const data = await fetchSSB("03675", [
    {
      code: "Marked",
      selection: { filter: "item", values: ["2"] }, // Hjemmemarked
    },
    {
      code: "SITC",
      selection: { filter: "item", values: [sitcCode] },
    },
    {
      code: "ContentsCode",
      selection: { filter: "item", values: ["Indeksniva"] },
    },
    {
      code: "Tid",
      selection: { filter: "all", values: ["*"] },
    },
  ]);

  return aggregateToYearlyAverage(data, fromYear);
}

/**
 * Hent konsumprisindeks / KPI (tabell 03013) for en konsumgruppe.
 * Returnerer Map<år, gjennomsnittlig årsindeks>.
 */
export async function fetchCPI(
  kpiCode: string,
  fromYear = 1985
): Promise<Map<number, number>> {
  const data = await fetchSSB("03013", [
    {
      code: "Konsumgrp",
      selection: { filter: "item", values: [kpiCode] },
    },
    {
      code: "ContentsCode",
      selection: { filter: "item", values: ["KpiIndMnd"] },
    },
    {
      code: "Tid",
      selection: { filter: "all", values: ["*"] },
    },
  ]);

  return aggregateToYearlyAverage(data, fromYear);
}

/**
 * Hent total-KPI (alle varer og tjenester).
 * Brukes som generell inflasjonsreferanse.
 */
export async function fetchTotalCPI(
  fromYear = 1985
): Promise<Map<number, number>> {
  return fetchCPI("TOTAL", fromYear);
}

/**
 * Hent jordbruksstatistikk fra tre SSB-tabeller.
 * Returnerer tidsserier for gårdsbruk, gjeld og inntekt.
 */
export async function fetchFarmStats(): Promise<FarmStats> {
  const [farmData, debtData, incomeData] = await Promise.all([
    // Tabell 11582: Antall gårdsbruk (vekst "00" = alle i alt)
    fetchSSB("11582", [
      {
        code: "VekstarDekar",
        selection: { filter: "item", values: ["00"] },
      },
      {
        code: "Tid",
        selection: { filter: "all", values: ["*"] },
      },
    ]),
    // Tabell 09823: Gjeld per bonde
    fetchSSB("09823", [
      {
        code: "ContentsCode",
        selection: { filter: "item", values: ["GjennomsnittGjeld"] },
      },
      {
        code: "Tid",
        selection: { filter: "all", values: ["*"] },
      },
    ]),
    // Tabell 05038: Netto næringsinntekt fra jordbruk
    fetchSSB("05038", [
      {
        code: "ContentsCode",
        selection: { filter: "item", values: ["NettoNarInnt"] },
      },
      {
        code: "Tid",
        selection: { filter: "all", values: ["*"] },
      },
    ]),
  ]);

  return {
    farmCount: extractYearlyValues(farmData),
    debtPerFarmer: extractYearlyValues(debtData),
    farmIncome: extractYearlyValues(incomeData),
  };
}

/**
 * Hent prisindekser for bondens innsatskostnader fra SSB tabell 03675.
 * Bruker SITC-koder: 08 (dyrefor), 27 (gjødsel), 33 (drivstoff).
 * Returnerer indeksverdier (2021=100) per år.
 */
export async function fetchFarmInputCosts(
  fromYear = 2000
): Promise<FarmInputCosts> {
  const sitcCodes = ["SITC08", "SITC27", "SITC33"];
  const results = await Promise.all(
    sitcCodes.map((code) => fetchProducerPriceIndex(code, fromYear))
  );

  function mapToSeries(index: Map<number, number>): { year: number; value: number }[] {
    return Array.from(index.entries())
      .map(([year, value]) => ({ year, value }))
      .sort((a, b) => a.year - b.year);
  }

  return {
    feed: mapToSeries(results[0]),
    fertilizer: mapToSeries(results[1]),
    fuel: mapToSeries(results[2]),
  };
}

/** Hent enkle årsdata fra en JSON-stat2-respons med én verdidimensjon */
function extractYearlyValues(
  data: SSBResponse
): { year: number; value: number }[] {
  const tidDim =
    data.dimension["Tid"] ?? data.dimension[data.id[data.id.length - 1]];
  const tidIndex = tidDim.category.index;

  const result: { year: number; value: number }[] = [];
  for (const [tidKey, idx] of Object.entries(tidIndex)) {
    const year = parseInt(tidKey.substring(0, 4), 10);
    if (isNaN(year)) continue;
    const val = data.value[idx];
    if (val == null || val === 0) continue; // Filtrer bort 0 (datahull i 2020-2021)
    result.push({ year, value: val });
  }

  return result.sort((a, b) => a.year - b.year);
}

/**
 * Konverterer månedlige JSON-stat2-data til årlige gjennomsnitt.
 * Filtrerer bort år før fromYear.
 */
function aggregateToYearlyAverage(
  data: SSBResponse,
  fromYear: number
): Map<number, number> {
  const tidDim = data.dimension["Tid"] ?? data.dimension[data.id[data.id.length - 1]];
  const tidIndex = tidDim.category.index;
  const values = data.value;

  // Samle månedsverdier per år
  const yearValues = new Map<number, number[]>();

  for (const [tidKey, idx] of Object.entries(tidIndex)) {
    // tidKey er f.eks. "2021M03" eller "2021"
    const year = parseInt(tidKey.substring(0, 4), 10);
    if (year < fromYear || isNaN(year)) continue;

    const val = values[idx];
    if (val == null) continue;

    const existing = yearValues.get(year);
    if (existing) {
      existing.push(val);
    } else {
      yearValues.set(year, [val]);
    }
  }

  // Beregn gjennomsnitt per år
  const result = new Map<number, number>();
  for (const [year, vals] of yearValues) {
    const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
    result.set(year, Math.round(avg * 10) / 10);
  }

  return result;
}
