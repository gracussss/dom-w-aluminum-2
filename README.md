# Alukoncept

Strona firmowa **Alukoncept Sp. z o.o.** (wcześniej robocza nazwa „Dom w Aluminium”) — stolarka
aluminiowa: okna, drzwi, systemy przesuwne, fasady, konstrukcje przeciwpożarowe
i indywidualne. Sosnowiec.

React 19 + TypeScript + Vite 8, Tailwind 4, React Router 7. Bez backendu —
dane katalogu leżą w repozytorium za interfejsem repozytorium, gotowym na
podmianę na API.

---

## Zasada nadrzędna

> **Nie zmyślamy danych technicznych.**

Każdy parametr systemu ma w danych pole `source` albo wartość `null`, która
renderuje się jako „Do uzupełnienia”. Wartość bez źródła jest **błędem**, nie
brakiem — pilnuje tego walidator (`validateSource`) i test. Ta sama zasada
obowiązuje w nazwach systemów (`nameStatus`), w portfolio (`verified`)
i w danych strukturalnych dla wyszukiwarki.

Wszystko, co jest materiałem tymczasowym, jest **oznaczone w interfejsie**
(`PlaceholderTag`, `LegalPlaceholder`, `DATA_DISCLAIMER`).

Szczegóły: `MATERIALY.md` (dane techniczne, prawa producentów) i `SEO.md`
(treść, meta, checklista publikacji).

---

## Uruchomienie

```bash
npm install
npm run dev
```

| Polecenie | Co robi |
|---|---|
| `npm run dev` | serwer deweloperski (port 5173, `PORT=…` zmienia) |
| `npm run build` | typecheck + build produkcyjny + `sitemap.xml` |
| `npm run preview` | podgląd builda |
| `npm run lint` | oxlint |
| `npm test` | vitest (silnik katalogu, SEO) |

---

## Zmienne środowiskowe

| Zmienna | Bez niej | Z nią |
|---|---|---|
| `VITE_SITE_URL` | canonical z adresu przeglądarki, **sitemapa nie powstaje** | canonical i dane strukturalne na domenie produkcyjnej + `sitemap.xml` |
| `VITE_CONTACT_ENDPOINT` | formularz działa w trybie demo i **mówi o tym wprost** pod przyciskiem | zapytania idą POST-em jako JSON pod podany adres |

Domeny nie zgadujemy — mapa strony ze zmyślonym adresem jest gorsza niż jej brak.

---

## Struktura

```
src/
  catalog/        model domenowy + silnik zapytań + repozytorium (bez Reacta)
    dataset.ts    JEDYNE miejsce z rekordami systemów
    taxonomy.ts   kategorie, producenci, zastosowania, typy konstrukcji
    query.ts      filtrowanie, sortowanie, facety — czyste funkcje
    repository.ts adapter lokalny + szkielet HTTP + walidator
  components/     UI (layout, ui, catalog, crosssection, product3d)
  sections/       sekcje strony głównej
  pages/          podstrony (routing w App.tsx)
  data/           dane firmy, nawigacja, zdjęcia, portfolio
  lib/            scroll, animacje, SEO, zgody cookies
```

**Podmiana źródła danych na API** to jedna linia w `src/catalog/source.ts`:

```ts
export const defaultRepository = createHttpRepository(import.meta.env.VITE_CATALOG_API)
```

Żaden komponent nie wymaga zmian — widoki znają wyłącznie hooki
(`useSystems`, `useSystem`, `useTaxonomy`) i ich stały kształt
`{ data, loading, error }`.

---

## Materiały do podmiany

| Co | Gdzie | Uwagi |
|---|---|---|
| Zdjęcia poglądowe | `src/data/images.ts`, `src/data/realizations.ts`, `dataset.ts` | Unsplash → materiały własne |
| Przekroje producenta | `public/przekroje/` → pole `crossSections` | wymaga **pisemnej zgody** |
| Modele 3D | `public/modele/` → pole `modelUrl` | `.glb`; wymaga zgody |
| Profile społecznościowe | `socialLinks` w `src/data/company.ts` | dopóki `"#"`, ikony **nie są renderowane** |
| Dane prawne | `src/pages/PolitykaPrywatnosci.tsx` | NIP/REGON/KRS, e-mail RODO |
| Obraz OG | `public/og-default.svg` → PNG 1200×630 | Facebook i LinkedIn nie renderują SVG |

Portfolio: dopóki realizacja ma `verified: false`, jej karta dostaje
`noindex, follow` i nie trafia do sitemapy. Zdjęcie z banku nie może zostać
zaindeksowane jako wykonana inwestycja.

---

## Kroje pisma

Archivo, Instrument Serif i IBM Plex Mono stoją **lokalnie** w `public/fonts`
(podzbiory `latin` i `latin-ext`, wagi 400/500/600 — tylko te są używane).
Definicje `@font-face`: `src/fonts.css`.

Świadomie bez `fonts.googleapis.com`: arkusz z obcego serwera blokował
renderowanie i przekazywał Google adres IP każdego odwiedzającego, zanim ten
cokolwiek kliknął.

**Zmiana krojów lub wag** — pobrać nowe `.woff2` z Google Fonts (nagłówek
`User-Agent` nowoczesnej przeglądarki, inaczej dostaniesz `.ttf`), wrzucić do
`public/fonts` i dopisać blok `@font-face` w `src/fonts.css`. Wagi nieużywane
w kodzie nie mają prawa tu leżeć.

---

## Zgody i prywatność

- Baner cookies zapisuje decyzję w `localStorage` (`cookie-consent`)
  i **odtwarza ją** przy ponownym otwarciu ustawień.
- Mapa Google ładuje się **dopiero** po kliknięciu „Pokaż mapę” albo przy
  zapisanej zgodzie marketingowej — nigdy z automatu.
- Żadne narzędzia analityczne ani marketingowe nie są podpięte. Miejsce na nie
  jest przygotowane w `storeConsent` (`src/lib/cookieConsent.ts`).
- Wykaz przechowywanych danych: `/cookies` — opisuje **stan faktyczny**,
  nie plan.

---

## Wydajność

- Pierwszy ekran: ~163 kB gzip JS, podzielone na osobno cache'owane paczki
  (`vendor-motion`, `vendor-router`, `vendor-lenis`, `vendor-icons`).
- **GSAP + ScrollTrigger dociągane na żądanie** (`src/lib/scrollAnimation.ts`) —
  pracują w trzech sekcjach, z których żadna nie jest widoczna na starcie.
- **three.js + drei** wyłącznie w paczkach leniwych, montowanych przez
  `IntersectionObserver`. Scena renderuje `frameloop="demand"` i staje, gdy
  wyjdzie z kadru.
- Tło hero wstępnie pobierane z `srcSet` przez plugin `dwa-hero-preload`
  (adres czytany z `images.ts`, nie przepisywany do HTML-a).

---

## Znane ograniczenie

Aplikacja jest SPA — meta i JSON-LD ustawia JavaScript po wczytaniu. Googlebot
to wykona, ale boty Facebooka i LinkedIna **nie**: do podglądu linku wezmą
wartości domyślne z `index.html`, jednakowe dla wszystkich podstron.

Rozwiązanie: prerendering statyczny przy buildzie albo migracja na framework
z SSR. To zmiana architektury — patrz `SEO.md`, sekcja 7.
