# Zasady pracy nad projektem „Dom w Aluminium”

Kontekst projektu i uruchomienie: `README.md`.
Dane techniczne i prawa producentów: `MATERIALY.md`.
Treść, meta i checklista publikacji: `SEO.md`.

---

## 1. Zero zmyślania — zasada nadrzędna

Strona należy do prawdziwej firmy i mówi o prawdziwych produktach.
**Nigdy nie wpisuj wartości, której nie ma w źródle.**

Dotyczy to:

- przekrojów, głębokości zabudowy, `Uf`/`Uw`, klas szczelności i ogniowych,
- oznaczeń handlowych systemów,
- lat działalności, liczby realizacji, powierzchni, lokalizacji obiektów,
- certyfikatów, autoryzacji, partnerstw,
- godzin otwarcia, NIP-u, REGON-u, adresu e-mail.

Brak danych ma w tym projekcie **własną reprezentację**:

| Warstwa | Jak wyrazić brak |
|---|---|
| Parametr systemu | `value: null` → renderuje się „Do uzupełnienia” |
| Nazwa systemu | `nameStatus: "working-title"` → plakietka „Nazwa robocza” + `noindex` |
| Realizacja | `verified: false` → `noindex`, poza sitemapą |
| Producent | `relationship: "none"` → zdanie o braku autoryzacji |
| Zdjęcie | `<PlaceholderTag />` |
| Treść prawna | `<LegalPlaceholder>` |

Wartość techniczna **bez pola `source` jest błędem**, nie brakiem — łapie to
`validateSource` (w DEV wypisuje do konsoli) i test w `src/catalog/catalog.test.ts`.

Jeżeli brakuje danych do zadania: **zostaw placeholder i powiedz o tym**.
Nie wypełniaj luki prawdopodobną wartością.

---

## 2. Dane strukturalne i SEO

W `schema.org` trafia wyłącznie informacja potwierdzona — wyszukiwarka czyta
je jako oświadczenie firmy. Nie ma tam cen, ocen, dostępności ani marki
producenta przy systemie o nazwie roboczej.

Indeksowanie **nie jest przełącznikiem ręcznym**: wynika z danych
(`nameStatus`, `verified`). Uzupełnienie danych samo włącza `index`, wpis
w sitemapie i blok `Product`.

Cała witryna jest teraz zablokowana przed indeksowaniem w czterech miejscach
(`robots.txt`, `index.html`, `public/_headers` dla Netlify, `vercel.json`).
Wdrożenie stoi na Netlify, więc **działają trzy pierwsze** — `vercel.json` nie
jest tam czytany. **Nie zdejmuj blokady** bez wyraźnej decyzji — checklista
w `SEO.md`, sekcja 9. Dlatego też wynik SEO w PageSpeed to ~69: blokada jest
jedynym nieprzechodzącym audytem i tak ma być do czasu publikacji (`SEO.md`,
sekcja 8).

---

## 3. Ocena przed zmianą

Ten projekt jest dopracowany. Przed edycją odpowiedz sobie, do której
kategorii należy to, co widzisz:

- **KEEP** — działa i jest przemyślane → **nie ruszaj**,
- **IMPROVE** — przeciętne → zaproponuj, nie przebudowuj po cichu,
- **FIX** — zepsute → napraw,
- **REMOVE** — martwe → usuń.

Nie refaktoryzuj kodu, który działa, tylko dlatego, że da się go napisać
inaczej. Nie dodawaj funkcji „na zapas” (paginacja przy 20 pozycjach,
warstwy abstrakcji bez drugiego użycia).

---

## 4. Komentarze

Komentarz odpowiada na pytanie **dlaczego**, nie **co**. W tym repozytorium
komentarz to zapis decyzji projektowej wraz z powodem — często z opisem
błędu, który wystąpił przed poprawką. Utrzymuj ten poziom; komentarze typu
„// ustawia stan” są gorsze niż ich brak.

Język komentarzy i treści: **polski**.

---

## 5. Warstwy i granice

- `src/catalog/` — model domenowy. **Bez Reacta i bez I/O.** Silnik zapytań
  to czyste funkcje; te same reguły mają zadziałać na serwerze.
- `src/catalog/source.ts` — jedyne miejsce, które wie, skąd biorą się dane.
- Widoki sięgają po dane **wyłącznie** przez hooki (`useSystems`, `useSystem`,
  `useTaxonomy`). Nigdy nie importuj `dataset.ts` w komponencie.
- `src/lib/scroll.ts` — sterowanie przewijaniem bez Reacta i bez GSAP-a
  (żeby nie było cyklu importów z leniwym mostem do ScrollTriggera).

---

## 6. Wydajność — czego nie zepsuć

- **GSAP dociągany na żądanie** przez `loadScrollAnimation()`. Nie importuj
  `gsap` statycznie w komponencie ładowanym na starcie — wróci do paczki
  pierwszego ekranu.
- **three.js tylko w paczkach leniwych.** Nie dodawaj `manualChunks` z workiem
  `vendor` — wciągnie scenę 3D do startu (sprawdzone: +90 kB gzip).
- Sceny 3D montuje `IntersectionObserver` i renderują `frameloop="demand"`.
- Nowe zdjęcia zdalne przepuszczaj przez `responsiveSrcSet()` i podaj `sizes`.

---

## 7. Dostępność i zgody

- Płótno 3D ma `touch-action: pan-y` — jeden palec przewija stronę, nie obraca
  modelu. Nie przywracaj `enableZoom` bez rozwiązania pułapki scrolla.
- Modale (menu, pełny ekran przekroju) mają pułapkę fokusu i powrót fokusu
  do elementu, który je otworzył. Nowy modal ma mieć to samo.
- Blokadę przewijania zakładaj przez `lockScroll`/`unlockScroll` (licznik) —
  samo `overflow: hidden` nie zatrzymuje Lenisa.
- **Nic z obcego serwera nie ładuje się przed zgodą.** Osadzenie (mapa, wideo,
  pixel) przepuść przez `useConsent()` — wzór: `src/components/ui/MapEmbed.tsx`.
- Kroje pisma hostujemy lokalnie. Nie wracaj do `fonts.googleapis.com`.

---

## 8. Przed oddaniem zmiany

```bash
npm run lint    # ma być czysto — 0 ostrzeżeń
npm test        # ma przechodzić
npm run build   # typecheck + build
```

Jeżeli zmiana jest widoczna w przeglądarce — sprawdź ją w podglądzie, a nie
proś o sprawdzenie użytkownika.
