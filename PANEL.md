# Panel administracyjny — /admin

Panel do samodzielnej edycji treści: realizacje ze zdjęciami, zakres prac,
zdjęcia na stronie, teksty, tytuły i opisy dla Google, dane firmy.
Silnik: [Decap CMS](https://decapcms.org) — darmowy, bez bazy danych
i bez serwera. Każdy zapis w panelu to commit do repozytorium. Netlify
buduje stronę od nowa i **po 1–2 minutach** zmiana jest na stronie.

---

## 1. Jak to jest zbudowane

| Co | Gdzie |
|---|---|
| Treści edytowane w panelu | `src/content/*.json` |
| Odczyt treści przez stronę (z wartościami zapasowymi) | `src/data/*.ts` |
| Formularze panelu (pola, podpowiedzi, walidacja) | `public/admin/config.yml` |
| Strona panelu i jej CSP | `public/admin/index.html` |
| Zbudowana paczka Decap CMS i widżet logowania | `public/admin/vendor/` (aktualizacja: `npm run cms:update`) |
| Zdjęcia wgrane w panelu | `public/uploads/` → na stronie `/uploads/…` |
| Testy styku panel ↔ strona | `src/data/content.test.ts` |

Czego **nie ma** w panelu i dlaczego:

- **katalog systemów** (`src/catalog/dataset.ts`) — każdy parametr musi mieć
  źródło (karta producenta). Formularz bez tej dyscypliny wpuściłby na stronę
  wartości „z pamięci” (zasada nr 1 w `CLAUDE.md`),
- **układ, kolory, nagłówki sekcji** — to projekt, a nie treść,
- **polityka prywatności** — tekst prawny, zmiany przez wykonawcę.

Zdjęcia: plik prosto z telefonu jest w porządku. Na Netlify skaluje go
Image CDN (`/.netlify/images`) do szerokości ekranu i formatu AVIF/WebP —
patrz `src/lib/responsiveImage.ts`. Limit 10 MB chroni repozytorium przed
plikami RAW. Nazwy plików panel czyści sam („Dom Będzin.jpg” →
`dom-bedzin.jpg`).

Etykieta „Zdjęcie poglądowe” znika sama: przy realizacji, gdy zaznaczone
jest „Prawdziwa realizacja firmy”, a w pozostałych miejscach, gdy zdjęcie
z banku zostanie zastąpione wgranym plikiem.

---

## 2. Uruchomienie na Netlify (jednorazowo, robi wykonawca)

Logowanie e-mailem i hasłem przez **Netlify Identity** + **Git Gateway**.
Klientka nie potrzebuje konta na GitHubie.

1. Netlify → strona `domwaluminum` → **Site configuration → Identity** →
   **Enable Identity**.
2. **Registration preferences → Invite only.** Bez tego każdy mógłby założyć
   konto w panelu.
3. **Services → Git Gateway → Enable Git Gateway** (autoryzacja GitHuba
   wykonawcy — tym kontem panel będzie zapisywał commity).
4. **Identity → Invite users** → e-mail klientki (i własny).
5. Zaproszenie przychodzi mailem z linkiem do strony głównej. Strona sama
   przekierowuje taki link do `/admin` (`src/main.tsx`), gdzie ustawia się hasło.

**Stan Netlify Identity:** w 2025 r. Netlify ogłosił wygaszanie Identity,
a w lutym 2026 r. według doniesień z forum Netlify wycofał tę decyzję. Przed
włączeniem sprawdzić na stronie Netlify, czy Identity da się włączyć dla
nowej strony. Jeśli nie: w `config.yml` zmienić `backend.name` na `github`
(logowanie kontem GitHub — klientka musi wtedy dostać dostęp do repozytorium).
Reszta panelu działa bez zmian.

---

## 3. Gałąź, na którą zapisuje panel

`public/admin/config.yml` → `backend.branch: main` — ta sama gałąź, z której
Netlify buduje stronę główną. Zapis w panelu = zmiana na stronie po 1–2 min.

Panel zapisuje commity prosto na `main`. Przed własną pracą w kodzie zawsze
`git pull` — inaczej przy wypychaniu wyjdzie konflikt z poprawkami klientki.

Po podpięciu domeny: `site_url` i `display_url` w tym samym pliku zmienić
na nową domenę.

---

## 4. Praca lokalnie (bez logowania, bez commitów)

```bash
npm run cms:local      # serwer plików panelu na porcie 8081 (decap-server)
npm run dev            # w drugim terminalu
```

Panel: `http://localhost:5173/admin/index.html`. Zapisy trafiają prosto do
`src/content/*.json` i `public/uploads/` na dysku. Commit robi się
normalnie, z terminala.

---

## 5. Instrukcja dla klientki (do wysłania)

**Logowanie:** `adres-strony/admin` → „Zaloguj się” → e-mail i hasło
z zaproszenia.

**Nowa realizacja:** Realizacje → „Dodaj realizację” → uzupełnić tytuł,
typ obiektu, zakres prac, opis i zdjęcie główne (+ opcjonalnie pozostałe
zdjęcia) → zaznaczyć **„Prawdziwa realizacja firmy”** → **Opublikuj →
Opublikuj teraz**. Po 1–2 minutach realizacja jest na stronie.

**Kolejność realizacji:** przeciągnąć pozycję za uchwyt `═` na górze
kafelka. Kolejność w panelu = kolejność na stronie.

**Zdjęcie:** „Wybierz zdjęcie” → „Prześlij nowe” → wybrać plik → „Wybierz
zaznaczone”. Zdjęcie z telefonu jest w porządku (do 10 MB).

**Google (SEO):** tytuł do 60 znaków, opis 50–160 znaków. Panel nie pozwoli
zapisać dłuższego. Google odświeża wyniki zwykle po kilku dniach.

**Pomyłka?** Każda zmiana jest zapisana w historii — wykonawca może cofnąć
dowolną wersję. Nic nie ginie.
