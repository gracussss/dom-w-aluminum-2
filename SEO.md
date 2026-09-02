# SEO — zasady, mapa treści i checklista publikacji

Stan na 2026-08-27 (po audycie końcowym). Dokument prowadzi treść i SEO strony „Dom w Aluminium”
(Alukoncept Sp. z o.o.). Dane techniczne systemów opisuje `MATERIALY.md`.

---

## 1. Zasada nadrzędna

W tytułach, opisach meta i danych strukturalnych może znaleźć się **wyłącznie
informacja potwierdzona**. Dane strukturalne wyszukiwarka traktuje jak
oświadczenie firmy, więc nie ma tam:

- cen i dostępności,
- ocen i opinii,
- certyfikatów, klas ogniowych i parametrów bez źródła,
- lat doświadczenia, liczby pracowników, obszaru działania,
- marki producenta przy systemie o nazwie roboczej.

Potwierdzone są trzy rzeczy: nazwa firmy, adres i telefon (`src/data/company.ts`).

---

## 2. Gdzie co siedzi

| Plik | Za co odpowiada |
|---|---|
| `src/lib/seo.ts` | nazwa marki, `VITE_SITE_URL`, obraz OG, budowa tytułu, adresy bezwzględne |
| `src/components/Seo.tsx` | title, description, canonical, Open Graph, Twitter, robots, JSON-LD |
| `src/lib/jsonLd.ts` | `BreadcrumbList`, `HomeAndConstructionBusiness`, `ItemList` |
| `vite.config.ts` (plugin `dwa-sitemap`) | `sitemap.xml` generowany przy buildzie z danych katalogu |
| `public/robots.txt` | blokada demo + gotowy blok produkcyjny |
| `public/_headers` | nagłówki Netlify: `X-Robots-Tag` (demo) i cache zasobów |
| `index.html` | wartości domyślne meta dla robotów bez JavaScriptu |
| `public/og-default.svg` | obraz podglądu przy udostępnianiu (1200×630) |
| `src/fonts.css` + `public/fonts/` | kroje pisma hostowane lokalnie — bez `fonts.googleapis.com` |

Podstrona podaje tylko to, co ją odróżnia:

```tsx
<Seo
  title="Kontakt i wycena"
  description="…"
  canonicalPath="/kontakt"
  jsonLd={organizationJsonLd()}
/>
```

---

## 3. Mapa meta

Do tytułu doklejane jest `— Dom w Aluminium` (poza stroną główną liczy się
suma: cel to ≤ 60 znaków). Opis: 120–160 znaków, jedno konkretne zdanie
o zawartości strony, bez upychania fraz.

**Rozdzielamy kropką środkową (`·`), nie myślnikiem** — myślnik jest już zajęty
przez sufiks marki i dwa myślniki w jednej linii się zlewają.

| Adres | Title (przed sufiksem) | Description |
|---|---|---|
| `/` | Okna, drzwi i fasady aluminiowe | zakres prac + firma + Sosnowiec + wycena po pomiarze |
| `/oferta` | Oferta · okna, drzwi i fasady | wyliczenie obszarów prac |
| `/systemy` | Katalog systemów aluminiowych | typy systemów + sposób filtrowania |
| `/systemy/kategoria/:slug` | `{Kategoria} · systemy aluminiowe` | opis kategorii z taksonomii |
| `/systemy/producent/:slug` | `Systemy {Producent}` | zestawienie systemów producenta |
| `/systemy/:slug` | `{System} · system aluminiowy {Producent}` (potwierdzone) lub sama nazwa robocza | nazwa + streszczenie + kategoria |
| `/realizacje` | Realizacje · konstrukcje aluminiowe | `PORTFOLIO_SEO_DESCRIPTION` |
| `/realizacje/:slug` | `{Tytuł}` | typ obiektu + zakres prac — **`noindex, follow`** dopóki `verified: false` |
| `/o-nas` | O nas · Alukoncept Sp. z o.o. | czym firma się zajmuje + miasto |
| `/kontakt` | Kontakt i wycena | adres + telefon |
| `/polityka-prywatnosci`, `/cookies` | tytuł dokumentu | krótki opis dokumentu |
| 404 | Strona nie znaleziona | **`noindex, follow`** |

### Frazy, na których stoi treść

Główne: *stolarka aluminiowa*, *okna aluminiowe*, *drzwi aluminiowe*,
*fasady aluminiowe*, *drzwi przesuwne (HS)*, *ściany osłonowe*.
Lokalne: *Sosnowiec*, Śląsk — wyłącznie tam, gdzie brzmią naturalnie
(strona główna, kontakt, o nas). Fraz nie powielamy w nagłówkach na siłę;
treść pisana jest pod czytelnika z branży.

---

## 4. Indeksowanie kart systemów

Karta systemu jest indeksowana **tylko wtedy, gdy oznaczenie jest potwierdzone**
(`nameStatus: "confirmed"` w `src/catalog/dataset.ts`). Pozostałe dostają
`noindex, follow` i nie trafiają do sitemapy — mają puste parametry i byłyby
cienką, powtarzalną treścią, a nazwa robocza przy marce producenta to
twierdzenie, którego nie potwierdzono.

Nic się tu nie przełącza ręcznie: uzupełnienie danych w `dataset.ts` włącza
indeksowanie, wpis w sitemapie i blok `Product` w danych strukturalnych.

Obecnie indeksowane: **MB-79N, MB-86N, MB-104 Passive** (3 z 20).

### Indeksowanie realizacji

Ta sama reguła obowiązuje portfolio. Karta realizacji jest indeksowana
**tylko przy `verified: true`** (`src/data/realizations.ts`); pozostałe
dostają `noindex, follow` i nie trafiają do sitemapy.

Powód jest ten sam co przy nazwach roboczych: wyszukiwarka czyta portfolio
jako oświadczenie firmy o tym, co wykonała. Zaindeksowany przykład ze zdjęciem
z banku byłby twierdzeniem nieprawdziwym — i to takim, które trafia do wyników
razem z nazwą i adresem prawdziwej spółki.

Obecnie indeksowanych realizacji: **0 z 6** — całe portfolio jest poglądowe.

---

## 5. Dane strukturalne

| Typ | Gdzie | Uwagi |
|---|---|---|
| `HomeAndConstructionBusiness` | `/`, `/kontakt` | nazwa, adres, telefon, URL — nic ponadto |
| `BreadcrumbList` | karty systemów, kategorie, producenci, karty realizacji | zgodne z widoczną ścieżką |
| `ItemList` | strony kategorii i producentów | nazwa + adres pozycji, bez marki i parametrów |
| `Product` | karty systemów z potwierdzonym oznaczeniem | bez ceny, oceny i dostępności; `additionalProperty` tylko z parametrów mających źródło |

Do dopisania, gdy klient poda dane: `openingHoursSpecification`, `sameAs`
(profile społecznościowe), `vatID`/`taxID`, `areaServed`.

---

## 6. Sitemap

Powstaje przy `npm run build` z tych samych danych, z których zbudowany jest
katalog — nie da się dodać systemu i zapomnieć o mapie strony.

```bash
VITE_SITE_URL=https://twoja-domena.pl npm run build
```

Bez `VITE_SITE_URL` plugin wypisuje ostrzeżenie i **nie tworzy** `sitemap.xml`.
Domeny nie zgadujemy — mapa ze zmyślonym adresem jest gorsza niż jej brak.

> **Stan na dziś (wdrożenie Netlify):** zmienna nie jest ustawiona, więc
> `sitemap.xml` nie powstaje, a `/sitemap.xml` trafia w regułę z `_redirects`
> i zwraca `index.html` z nagłówkiem `text/html`. Ustawienie zmiennej
> w Netlify (Site configuration → Environment variables → `VITE_SITE_URL`)
> i ponowny deploy załatwiają sprawę — Netlify serwuje istniejący plik
> statyczny przed regułami przepisania.

W mapie: 8 adresów stałych, kategorie, producenci, karty systemów
z potwierdzonymi danymi (`nameStatus: "confirmed"`) i karty realizacji
z potwierdzonymi (`verified: true`).

---

## 7. Ograniczenie do rozwiązania przed startem: renderowanie po stronie klienta

Aplikacja jest SPA — tytuł, opis, canonical i JSON-LD ustawia JavaScript po
wczytaniu strony. Googlebot to wykona, ale:

- boty Facebooka, LinkedIna i większości komunikatorów **nie wykonują JS** —
  do podglądu linku wezmą wartości domyślne z `index.html`, jednakowe dla
  wszystkich podstron,
- pozostałe wyszukiwarki i narzędzia AI indeksują takie strony gorzej.

Rekomendacja: prerendering statyczny przy buildzie (wygenerowanie HTML-a dla
listy adresów z sitemapy) albo migracja na framework z SSR. To zmiana
architektury — do decyzji klienta, poza zakresem warstwy treści.

---

## 8. PageSpeed / Lighthouse — jak czytać wynik

Sprawdzenie z 2026-08-31 na `domwaluminum.netlify.app`: **SEO 69**.

Ta liczba nie jest usterką treści. W kategorii SEO nie przechodzi jeden
audyt — „Page is blocked from indexing" — i to on ścina wynik z ~100 do ~69.
Blokada jest celowa (`robots.txt`, meta robots, `X-Robots-Tag`) i zdejmuje ją
checklista niżej. **Dopóki strona jest wersją demo, 69 to sufit i pogoń za
wyższym wynikiem oznaczałaby wypuszczenie dema do wyszukiwarki.**

Pozostałe audyty SEO są spełnione — sprawdzone na wdrożonej stronie:

| Audyt | Stan |
|---|---|
| `<title>`, `meta description` | unikalne na każdej podstronie |
| `canonical` | ustawiany, katalog z filtrami wskazuje `/systemy` |
| `lang="pl"`, `viewport` | są |
| Obrazy z `alt` | 9/9 (dekoracyjne mają `alt=""` — poprawnie) |
| Linki z tekstem | 100%, żadnego „kliknij tutaj" |
| Dane strukturalne | bez błędów składni |
| `sitemap.xml` | **nie działa** — patrz sekcja 6, brakuje `VITE_SITE_URL` |

Wydajność (73) nie zależy od treści, tylko od ekranu startowego: `Loader`
trzyma kadr, czeka na zdekodowanie tła hero i dopiero potem rozsuwa ramę.
Pierwsze malowanie treści następuje po tej sekwencji, a Lighthouse liczy je
jako FCP i LCP.

**Zrobione 2026-08-31:** `HOLD` 1300 → 800 ms, `MAX_WAIT` 2200 → 1600 ms,
a `TEMPO` (0.55) skraca proporcjonalnie całą choreografię znaku. Animacja
została w komplecie, intro trwa ~1,4 s zamiast 1,9–2,8 s. Zasada przy
kolejnych zmianach: `HOLD` musi być dłuższy niż sekwencja znaku, czyli
(0.88 + 0.4) × `TEMPO`.

Co nadal kosztuje, a nie zostało ruszone:

- **wjazd nagłówka hero** — ~1,05 s animacji z opóźnieniem 0,28 s; dopóki
  `h1` jest poza kadrem, nie liczy się jako LCP,
- **kroje pisma** — 6 plików `.woff2`, ~235 KB, największa pozycja transferu;
  podzestaw do znaków polskich zdejmuje mniej więcej połowę,
- **dwa warianty tła hero naraz** — `<link rel="preload">` bierze z `srcSet`
  inną szerokość niż `<img>` w hero (zmierzone: 960 px i 1280 px), ~53 KB
  nadmiaru na starcie.

To decyzje projektowe i buildowe, nie treściowe — lista jest punktem wyjścia
do rozmowy, nie zgodą na dalsze skracanie intro.

---

## 9. Checklista przed publikacją produkcyjną

1. `public/robots.txt` — usunąć `Disallow: /`, odkomentować blok produkcyjny
   i wstawić prawdziwy adres sitemapy.
2. `index.html` — usunąć `<meta name="robots" content="noindex, nofollow">`.
3. Nagłówki `X-Robots-Tag` — usunąć regułę `/*` z `public/_headers`
   (wdrożenie na Netlify) **oraz** nagłówek z `vercel.json` (gdyby projekt
   wrócił na Vercel). `vercel.json` na Netlify nie jest w ogóle czytany.
4. Ustawić `VITE_SITE_URL` w zmiennych środowiskowych hostingu, bez ukośnika
   na końcu (Netlify: Site configuration → Environment variables) — daje
   canonical, adresy w danych strukturalnych i sitemapę. **Do zrobienia już
   teraz**, niezależnie od reszty listy: bez tego `/sitemap.xml` zwraca HTML.
5. `public/og-default.svg` → wyeksportować do **PNG 1200×630**, wgrać jako
   `public/og-default.png` i zmienić `OG_IMAGE` w `src/lib/seo.ts`
   (Facebook i LinkedIn nie renderują SVG). Zaktualizować też `og:image`
   w `index.html` na adres bezwzględny.
6. Podmienić zdjęcia poglądowe (Unsplash) na własne — patrz `MATERIALY.md`.
   Po podmianie przepisać `PORTFOLIO_SEO_DESCRIPTION` i `PORTFOLIO_DISCLAIMER`
   w `src/data/realizations.ts` (znika słowo „poglądowe”, wchodzą realne
   inwestycje: lokalizacja, zakres, zastosowany system).
7. Uzupełnić dane w `src/pages/PolitykaPrywatnosci.tsx` (NIP, REGON, KRS,
   adres e-mail do spraw danych osobowych).
8. Podpiąć formularz kontaktowy: ustawić `VITE_CONTACT_ENDPOINT` na adres
   przyjmujący POST z JSON-em. Bez tej zmiennej formularz działa w trybie
   demonstracyjnym i mówi o tym wprost pod przyciskiem. Obowiązek informacyjny
   (art. 13 RODO) jest już pod formularzem — sprawdzić go z prawnikiem klienta.
9. Podpiąć profile społecznościowe (`socialLinks` w `src/data/company.ts`),
   potem dopisać `sameAs` w danych strukturalnych. Dopóki wartości to `"#"`,
   ikony **nie są renderowane** — nie ma martwych odnośników.
10. Ustawić `verified: true` przy realizacjach, które faktycznie zostały
   wykonane przez firmę (`src/data/realizations.ts`) — dopiero wtedy wejdą do
   sitemapy i do indeksu.
11. Po podpięciu Google Analytics / Meta Pixel: dopisać inicjalizację
   w `storeConsent` (`src/lib/cookieConsent.ts`) **i** uzupełnić wykaz
   na `/cookies` — dokument opisuje stan faktyczny, nie plan.
12. Google Search Console: zgłosić domenę i `sitemap.xml`, sprawdzić raport
    „Strony” i test wyników z elementami rozszerzonymi.
13. Wizytówka Google (Profil Firmy) dla adresu w Sosnowcu — dane muszą być
    identyczne jak w `company.ts` i w danych strukturalnych.
