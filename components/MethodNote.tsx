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
            <strong>Datakilder:</strong> Produsentprisindeks fra SSB tabell
            03675 (førstegangsomsetning innenlands, hjemmemarked, 2021=100).
            Konsumprisindeks (KPI) fra SSB tabell 03013 (2015=100, konvertert).
          </p>
          <p>
            <strong>Beregning:</strong> Produsentprisen i kroneverdi er beregnet
            ut fra kjente referansepriser i 2021 (fra Totalkalkylen/NIBIO),
            justert med produsentprisindeksen. KPI-justert pris viser hva
            produsentprisen ville vært dersom den hadde fulgt den generelle
            prisveksten i samfunnet.
          </p>
          <p>
            <strong>Begrensninger:</strong> SSB tabell 03675 bruker
            SITC-varegrupper, ikke enkeltprodukter. «Kjøtt og kjøttvarer»
            omfatter alle kjøttslag samlet. Referanseprisene er omtrentlige.
            Butikkprisen er estimert basert på produsentprisindeksen og en kjent
            butikkpris i referanseåret — den gjenspeiler ikke faktiske
            butikkpriser.
          </p>
          <p>
            <strong>Bondens andel:</strong> Andelen som vises er et estimat
            basert på forholdet mellom produsentpris og butikkpris. Den faktiske
            andelen varierer med produkt, sesong og distribusjonskjede.
          </p>
        </div>
      )}
    </div>
  );
}
