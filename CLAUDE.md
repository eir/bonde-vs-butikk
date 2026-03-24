# CLAUDE.md — Bondens Pris

Datajournalistikk-prosjekt som viser forskjellen mellom hva bonden får og hva forbrukeren betaler.

## Kommandoer

```bash
npm run dev          # Dev-server med Turbopack
npm run build        # Produksjonsbygg (Next.js)
npm run lint         # ESLint
npx playwright test  # Playwright e2e-tester
npx tsc --noEmit     # TypeScript typesjekk
```

## Arkitektur

**Next.js 16 App Router** + TypeScript + Tailwind CSS v4

- **Data:** SSB API (Statistisk sentralbyrå) for prisstatistikk
- **Grafer:** Recharts for datavisualisering
- **UI:** shadcn/ui-komponenter
- **Produkter:** Definert i `data/`-mappen

### Dataflyt

SSB API → `data/`-filer → React-komponenter → Recharts-grafer

## Viktige mapper

- `app/` — Next.js App Router-sider
- `components/` — UI-komponenter
- `data/` — Produktdata og SSB-konfigurasjon
- `lib/` — Hjelpefunksjoner
- `e2e/` — Playwright-tester
- `public/` — Statiske filer

## Miljøvariabler

Ingen — prosjektet bruker kun offentlige SSB-APIer.

## Utrulling

GitHub-repo: https://github.com/eir/bonde-vs-butikk
Hosting: Vercel (ikke publisert ennå)

## Språk

All brukertekst på norsk (bokmål). Folkelig, lettfattelig språk — ikke akademisk.
