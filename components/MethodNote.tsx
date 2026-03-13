"use client";

import { useState } from "react";

export function MethodNote() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 border-t pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-expanded={open}
      >
        {open ? "Skjul metodebeskrivelse" : "Vis metodebeskrivelse"}
      </button>

      {open && (
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Hvor kommer tallene fra?</strong> Vi bruker offisiell
            statistikk fra SSB: prisindekser for det bonden får betalt (tabell
            03675) og den generelle prisveksten i samfunnet (tabell 03013).
          </p>
          <p>
            <strong>Hvordan regner vi?</strong> Vi tar kjente priser fra 2021
            (fra NIBIO/Totalkalkylen) og justerer dem med prisindeksene framover
            og bakover i tid. Den grønne linjen i diagrammet viser hva bonden
            ville fått hvis prisen hadde fulgt den generelle prisveksten.
          </p>
          <p>
            <strong>Hva er ikke helt nøyaktig?</strong> SSB grupperer varer i
            brede kategorier — for eksempel dekker «kjøtt» alle typer kjøtt
            samlet. Butikkprisene er anslag basert på prisindeksen, ikke faktiske
            priser fra butikkhyllene. Tallene gir et godt bilde av trenden, men
            er ikke eksakte kronebeløp.
          </p>
          <p>
            <strong>Bondens andel:</strong> Andelen vi viser er et anslag basert
            på forholdet mellom det bonden får og det du betaler i butikken. I
            praksis varierer dette fra produkt til produkt og fra sesong til
            sesong.
          </p>
          <p>
            <strong>Oppdatering av data:</strong> SSB tabell 03013 (KPI) ble
            avsluttet i desember 2025 og erstattes av tabell 14700.
            Produsentprisindeksen (03675) oppdateres fortsatt. Referansepriser
            er fra Totalkalkylen 2021 (NIBIO). Jordbruksstatistikken er fra SSB
            tabell 11582, 09823 og 05038.
          </p>
        </div>
      )}
    </div>
  );
}
