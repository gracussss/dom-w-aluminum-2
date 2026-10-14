# Panel administracyjny — /admin

Panel do samodzielnej edycji treści. Silnik: [Decap CMS](https://decapcms.org),
darmowy, bez bazy danych i bez serwera. Każda zmiana to commit do
repozytorium. Netlify buduje stronę od nowa i **po 1–2 minutach** zmiana jest
na stronie.

| Sekcja panelu | Co edytuje | Plik(i) |
|---|---|---|
| Realizacje | osobny wpis na realizację: zdjęcia, opis, „prawdziwa realizacja” | `src/content/realizacje/*.json` |
| Aktualności | wpisy z treścią (pogrubienia, listy, zdjęcia); w menu od pierwszego wpisu | `src/content/aktualnosci/*.json` |
| Teksty stron | wszystkie nagłówki i teksty: strona główna (każda sekcja), Oferta (z wyceną), Systemy, Realizacje, Aktualności, O nas, Kontakt | `src/content/strony/*.json` |
| Zakres prac | obszary oferty (lista na stronie głównej i w Ofercie) | `src/content/oferta.json` |
| Pytania (FAQ) | pytania i odpowiedzi na stronie Oferta | `src/content/faq.json` |
| Zdjęcia na stronie | pierwszy ekran, „O nas”, tło kontaktu | `src/content/zdjecia.json` |
| Google (SEO) | tytuł i opis każdej podstrony w wynikach Google | `src/content/seo.json` |
| Dane firmy | adres, telefon, e-mail, godziny, social media, NIP/REGON/KRS, e-mail RODO | `src/content/firma.json` |
| Katalog systemów | systemy ALUPROF: oznaczenie, kategorie, parametry z karty producenta | `src/content/systemy/*.json` |

---

## 1. Jak to jest zbudowane

| Co | Gdzie |
|---|---|
| Treści z panelu | `src/content/` (JSON) |
| Odczyt treści przez stronę (puste pole nie wywraca strony) | `src/data/*.ts`, katalog: `src/catalog/systemFactory.ts` |
| Formularze panelu (pola, podpowiedzi, walidacja) | `public/admin/config.yml` |
| Strona panelu, jej CSP i polskie okienko logowania | `public/admin/index.html`, `public/admin/identity-pl.js` |
| Podgląd na żywo obok formularza | `src/admin/preview.tsx` → build do `/admin/preview/` (`adminPreview` w `vite.config.ts`) |
| Zbudowana paczka Decap CMS i widżet logowania | `public/admin/vendor/` (aktualizacja: `npm run cms:update`) |
| Zdjęcia wgrane w panelu | `public/uploads/` → na stronie `/uploads/…` |
| Testy styku panel ↔ strona | `src/data/content.test.ts`, `src/lib/markdown.test.ts` |

**Wersje robocze** (`publish_mode: editorial_workflow`). Zapis w panelu nie
trafia od razu na stronę. Każda zmiana dostaje gałąź `cms/…` i pull request,
a Netlify buduje do niego podgląd. W panelu w zakładce „Przepływ pracy” zmiana
przechodzi przez etapy: Robocze → Do sprawdzenia → Gotowe. Na stronę wchodzi
dopiero po „Opublikuj”. Każdy podgląd to jeden build na Netlify (ok. 1 min
z limitu planu).

**Podgląd na żywo.** Po prawej stronie formularza widać prawdziwe sekcje
strony z wpisywanymi danymi, w tym samym stylu. Animacje wejścia są tam
wyłączone (`StaticMotionContext`), a model 3D zastąpiony listą kroków.
Katalog systemów nie ma podglądu: karta systemu zależy od całego katalogu.

**Zdjęcia.** Plik prosto z telefonu jest w porządku. Na Netlify skaluje go
Image CDN do szerokości ekranu i formatu AVIF/WebP (`src/lib/responsiveImage.ts`).
Nazwy plików panel czyści sam („Dom Będzin.jpg” → `dom-bedzin.jpg`).

**Adresy wpisów** (realizacje, aktualności, systemy) powstają z tytułu przy
pierwszym zapisie. Później poprawka tytułu ich nie zmienia, więc linki, które
ktoś udostępnił, nadal działają.

**Treść aktualności** to Markdown z edytora panelu. Na stronę trafia po
sanityzacji (`src/lib/markdown.ts`):
- wklejony HTML wyświetla się jako tekst,
- linki `javascript:` nie są klikalne,
- nagłówki zaczynają się od `<h2>`.

**Zero zmyślania także w panelu:**
- FAQ startuje puste: odpowiedzi to oświadczenia firmy;
- NIP, REGON i KRS bez danych pokazują w polityce prywatności „do uzupełnienia”;
- realizacja trafia do Google dopiero po zaznaczeniu „Prawdziwa realizacja firmy”;
- system z odznaczonym „Oznaczenie potwierdzone” dostaje plakietkę „Nazwa robocza” i `noindex`;
- parametr systemu bez karty producenta i daty sprawdzenia nie ma źródła, więc go nie wpisujemy.

**Czego nie ma w panelu:**
- układu, kolorów i kolejności sekcji, bo to projekt, a nie treść;
- polityki prywatności poza danymi rejestrowymi, bo to tekst prawny;
- formularza kontaktowego.

---

## 2. Uruchomienie na Netlify (zrobione raz)

Logowanie e-mailem i hasłem przez **Netlify Identity** + **Git Gateway**.
Klientka nie potrzebuje konta na GitHubie.

1. Netlify → projekt `domwaluminum` → **Identity** → **Enable Identity**.
2. **Registration → Invite only.** Bez tego każdy mógłby założyć konto.
3. **Services → Git Gateway → Enable** (autoryzacja GitHuba wykonawcy).
4. **Invite users** → e-mail klientki.
5. Link z maila prowadzi na stronę główną, a ta sama przenosi go do `/admin`
   (`src/main.tsx`). Tam ustawia się hasło. Okienko logowania jest po polsku.

---

## 3. Gałąź i adres

`public/admin/config.yml`:
- `backend.branch: main` to gałąź strony głównej. Wersje robocze i tak idą
  przez osobne gałęzie `cms/…` i trafiają na `main` dopiero po „Opublikuj”.
- `site_url` i `display_url` po podpięciu domeny trzeba zmienić na nią.

Panel zapisuje commity na `main`. **Przed własną pracą w kodzie zawsze
`git pull`**, inaczej przy wypychaniu wyjdzie konflikt z poprawkami klientki.

---

## 4. Praca lokalnie

```bash
npm run build && npm run preview   # strona z podglądem na żywo: http://localhost:4173/admin/
npm run cms:local                  # w drugim terminalu: serwer plików panelu (port 8081)
```

Lokalnie panel zapisuje prosto do `src/content/` i `public/uploads/`, bez
logowania i bez wersji roboczych. Ten serwer ich nie obsługuje, więc „Opublikuj”
zapisuje od razu. Zdjęcie wgrane przed zapisem lokalnie nie ma miniatury.
Na Netlify ma.

Przy `npm run dev` panel działa pod `http://localhost:5173/admin/index.html`,
ale bez podglądu w stylu strony: `preview.js` powstaje tylko w buildzie.

---

## 5. Instrukcja dla klientki (do wysłania)

**Logowanie:** `adres-strony/admin` → „Zaloguj się” → e-mail i hasło
z zaproszenia.

**Jak działa zapis:** każda zmiana najpierw jest wersją roboczą. Po kliknięciu
„Zapisz” możesz otworzyć jej podgląd na stronie („Podgląd” w górnym pasku).
Gdy wszystko wygląda dobrze: **Opublikuj → Opublikuj teraz**. Po 1–2 minutach
zmiana jest na stronie. Podgląd po prawej stronie formularza pokazuje zmiany
od razu, jeszcze przed zapisem.

**Nowa realizacja:** Realizacje → „Nowa realizację” →
1. uzupełnij tytuł, typ obiektu, zakres prac i opis;
2. dodaj zdjęcie główne, a pozostałe zdjęcia opcjonalnie;
3. zaznacz **„Prawdziwa realizacja firmy”**;
4. zapisz i opublikuj.

**Nowy wpis w aktualnościach:** Aktualności → nowy wpis →
1. uzupełnij tytuł, zajawkę i treść;
2. formatowanie (pogrubienie, listy, linki, zdjęcia w treści) jest pod przyciskami nad polem;
3. zapisz i opublikuj.

Zakładka „Aktualności” pojawi się w menu po pierwszym wpisie.

**Teksty stron:** Teksty stron → wybierz stronę → rozwiń sekcję. W nagłówkach
każdy wiersz to osobna linia, a wiersz w gwiazdkach, np. `*tekst*`, jest
kursywą.

**Zdjęcie:** „Wybierz zdjęcie” → „Prześlij nowe” → wybierz plik → „Wybierz
zaznaczone”. Zdjęcie z telefonu jest w porządku.

**Google (SEO):** tytuł do 60 znaków, opis 50–160 znaków. Panel nie pozwoli
zapisać dłuższego, a podgląd po prawej pokazuje, jak to wygląda w Google.

**Katalog systemów:** wartości techniczne przepisuj wyłącznie z karty
systemu na aluprof.com i ustaw datę sprawdzenia. Nie wpisuj nic z pamięci.

**Pomyłka?** Każda zmiana jest zapisana w historii. Wykonawca może cofnąć
dowolną wersję, więc nic nie ginie.
