import { products } from "@/lib/products";
import { fetchProducerPriceIndex, fetchTotalCPI, fetchCPI, fetchFarmStats, fetchFarmInputCosts } from "@/lib/ssb";
import { buildTimeSeries } from "@/lib/calculations";
import { DashboardClient } from "@/components/DashboardClient";
import type { ProductData } from "@/lib/types";

export const revalidate = 86400; // Oppdater data daglig

const FROM_YEAR = 1979;

async function getAllProductData(): Promise<Record<string, ProductData>> {
  const totalCPI = await fetchTotalCPI(FROM_YEAR);

  const results: Record<string, ProductData> = {};

  // Hent data for alle produkter
  for (const product of products) {
    try {
      const [producerIndex, foodCPI] = await Promise.all([
        fetchProducerPriceIndex(product.sitcCode, FROM_YEAR),
        fetchCPI(product.kpiCode, FROM_YEAR),
      ]);
      results[product.id] = buildTimeSeries(
        product,
        producerIndex,
        totalCPI,
        foodCPI
      );
    } catch (error) {
      console.error(`Feil ved henting av data for ${product.name}:`, error);
    }
  }

  return results;
}

export default async function Home() {
  const [allData, farmStats, inputCosts] = await Promise.all([
    getAllProductData(),
    fetchFarmStats().catch((err) => {
      console.error("Feil ved henting av jordbruksstatistikk:", err);
      return null;
    }),
    fetchFarmInputCosts().catch((err) => {
      console.error("Feil ved henting av kostnadsdata:", err);
      return null;
    }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl">Bonde vs Butikk — Hvem får mest?</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Se hva bonden faktisk får betalt — og hvor mye av butikkprisen
          som forsvinner på veien.
        </p>
      </header>

      <DashboardClient allData={allData} farmStats={farmStats} inputCosts={inputCosts} />

      <footer className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
        <p>
          Data fra{" "}
          <a
            href="https://www.ssb.no"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Statistisk sentralbyrå (SSB)
          </a>
          . Referansepriser fra{" "}
          <a
            href="https://www.nibio.no/tema/landbruksokonomi/totalkalkylen"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Totalkalkylen (NIBIO)
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
