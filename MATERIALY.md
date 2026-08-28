# Materiały do podmiany — przekroje, modele 3D, parametry

Stan na 2026-08-27 (po audycie końcowym).
Warstwę treści i SEO (meta, dane strukturalne, sitemapa, checklista
publikacji) opisuje osobny dokument: `SEO.md`.

Parametry trzech systemów Aluprof (MB-79N, MB-86N, MB-104 Passive) pochodzą
z **publicznych stron producenta** i mają w danych zapisane źródło.
Wszystkie pozostałe pozycje mają nazwy robocze i puste pola techniczne,
wyraźnie oznaczone w interfejsie jako „Do uzupełnienia”.

---

## 1. Co Aluprof udostępnia publicznie (sprawdzone 2026-08-26)

Adres systemu: `https://aluprof.com/produkt/<slug>`, np. `/produkt/mb-86n`.
Na stronie każdego systemu są zakładki:

| Zakładka | Zawartość | Dostęp |
|---|---|---|
| Wizualizacja | render systemu | publiczny |
| **Rysunek techniczny** | **przekroje profili** | publiczny |
| Ogólne informacje | opis, warianty | publiczny |
| **Pliki BIM i CAD** | modele do projektowania | publiczny |
| Materiały do pobrania | katalogi, ulotki PDF | publiczny |
| Certyfikaty | dokumenty klasyfikacyjne | publiczny |

Dodatkowo `aluprof.com/do-pobrania` zawiera ulotki produktowe, foldery,
katalogi, dokumenty firmowe, pliki BIM i Alubook.

**Strefa autoryzowana** (`aluprof.com` → menu górne) to część zamknięta —
„dostęp do materiałów technicznych i handlowych dla partnerów ALUPROF”.
Pełna dokumentacja fabrykanta jest najpewniej właśnie tam.

> **Uwaga prawna — bez zmian:** to, że plik da się pobrać publicznie, **nie
> jest zgodą na jego publikację na stronie komercyjnej**. Przekroje, rendery
> i modele są objęte prawami producenta. Przed wgraniem czegokolwiek do
> `public/przekroje` czy `public/modele` trzeba mieć **pisemną zgodę**.
> Do czasu jej uzyskania bezpieczne są: własny schemat poglądowy, parametry
> tekstowe z podaniem źródła oraz **odnośnik** do strony systemu u producenta
> (pole `manufacturerUrl` — już jest na karcie systemu).

Aliplast i Schüco — nie sprawdzone, do zrobienia tak samo.

---

## 2. O co poprosić producenta

| Materiał | Format | Do czego |
|---|---|---|
| Przekroje profili | `.pdf`, `.dwg`, `.svg`, `.png` | Sekcja „Przekrój” na karcie systemu |
| Karty katalogowe | `.pdf` | Parametry techniczne (Uf/Uw, głębokość, klasy) |
| Modele BIM / 3D | `.glb`, `.gltf`, `.rvt`, `.ifc` | Sekcja „Model 3D” |
| Zdjęcia systemów | `.jpg`, `.webp` | Zdjęcia na kartach i w katalogu |
| Zgoda na publikację | pisemna | **Wymagana** dla wszystkich powyższych |

Modele w `.rvt` / `.ifc` / `.dwg` trzeba przekonwertować do `.glb`
(np. w Blenderze) — jednorazowa operacja.

---

## 3. Gdzie wgrać pliki

```
public/
  przekroje/     ← rysunki przekrojów (.svg / .png / .webp)
  modele/        ← modele 3D (.glb)
```

- **Przekroje:** `.svg`, jeśli producent daje wektor (nieskończony zoom),
  inaczej `.png`/`.webp` w szerokości min. 2000 px.
- **Modele:** `.glb`, skompresowane (Draco/meshopt), docelowo poniżej ~3 MB.

---

## 4. Architektura danych katalogu

Wszystko, co dotyczy systemów, żyje w `src/catalog/`:

```
src/catalog/
  types.ts        model domenowy (bez danych, bez Reacta)
  taxonomy.ts     producenci, kategorie, zastosowania, typy konstrukcji
  dataset.ts      rekordy systemów  ← TU DODAJESZ NOWE SYSTEMY
  query.ts        filtrowanie, sortowanie, liczenie facetów
  repository.ts   interfejs + adapter lokalny + szkielet adaptera HTTP
  source.ts       WYBÓR ŹRÓDŁA DANYCH  ← tu przełączasz lokalne/API
  hooks.ts        useSystems / useSystem / useTaxonomy
  index.ts        publiczne wejście
```

**Zasada:** widoki importują wyłącznie z `../catalog`.
Import z `src/catalog/dataset.ts` w komponencie omija repozytorium
i przywiązuje widok do lokalnych danych — to błąd.

Przejście na API/CMS to jedna zmiana w `src/catalog/source.ts`:

```ts
export const defaultRepository = createHttpRepository(import.meta.env.VITE_CATALOG_API);
```

Żaden komponent nie wymaga zmian.

W trybie deweloperskim `source.ts` sprawdza spójność danych i wypisuje
w konsoli m.in. nieznanych producentów, zduplikowane slugi oraz
**parametry z wartością, ale bez źródła**.

---

## 5. Jak dodać nowy system

Jedno wywołanie w `src/catalog/dataset.ts`:

```ts
defineSystem({
  id: "mb-slimline",
  name: "MB-SLIMLINE",
  nameStatus: "confirmed",           // tylko gdy potwierdzone u producenta
  manufacturerId: "aluprof",
  categoryId: "okna",
  applicationIds: ["mieszkaniowe"],
  constructionTypeId: "rozwierne",
  summary: "System okien o wąskich profilach",
  description: "…",
  image: img("photo-…"),
  manufacturerUrl: "https://aluprof.com/produkt/mb-slimline",
  variantNames: ["Okno rozwierne"],
}),
```

Wszystko, czego nie podasz, dostaje bezpieczną wartość domyślną: nazwa
robocza, puste parametry, brak przekroju, cena na zapytanie, CTA z kontekstem
systemu. Katalog, filtry, karta systemu i strona główna podchwytują pozycję
automatycznie — **bez zmian w komponentach**.

---

## 6. Jak podpiąć przekrój i model

Póki co pola są puste. Po otrzymaniu plików **i zgody**:

```ts
defineSystem({
  id: "mb-86n",
  // …
  modelUrl: "/modele/mb-86n.glb",
})
```

Przekroje to tablica (system może mieć przekrój poziomy, pionowy, próg):

```ts
crossSections: [
  {
    id: "poziomy",
    kind: "horizontal",
    label: "przekrój poziomy",
    imageSrc: "/przekroje/mb-86n-poziomy.svg",
    source: { label: "ALUPROF — karta katalogowa", url: null, accessedAt: "2026-09-01" },
  },
]
```

Gdy rysunków jest kilka, nad kadrem pojawia się przełącznik z ich etykietami —
nic nie trzeba włączać. `CrossSection` sam wykrywa rysunek i zamienia
„Schemat poglądowy” na „Przekrój systemu”, a legendę na podpis ze źródłem.
`SystemViewer` analogicznie dla modelu 3D.

---

## 6a. Schematy poglądowe — co pokazujemy bez rysunków producenta

`src/components/crosssection/schematics/` — po jednym rysunku na typ konstrukcji:

| Plik | Typ | Co pokazuje |
|---|---|---|
| `window.tsx` | `okno` | ościeżnica, skrzydło, przekładka, pakiet szybowy, listwa |
| `door.tsx` | `drzwi` | wzmocnione skrzydło, uszczelka przymykowa, wypełnienie panelowe |
| `sliding.tsx` | `przesuwne` | zazębienie skrzydeł, uszczelka szczotkowa, dwa tory |
| `facade.tsx` | `fasada` | słup, profil dociskowy, listwa maskująca, śruba, styk dwóch szyb |

Dobór: `getSchematic(modelType)`. Dla typów bez sensownego przekroju
(akcesoria) zwraca `null` i **cała sekcja przekroju znika** — lepiej jej nie
mieć, niż pokazać przy klamce przekrój okna.

Rysunki są **własne, bez skali i bez wymiarów** — pokazują zasadę budowy,
nie geometrię konkretnego systemu. Każda liczba na takim rysunku byłaby
zmyślona, więc żadnej tam nie ma. Napisane jest to wprost pod legendą.

Dodanie kolejnego typu: nowy plik ze strukturą `SchematicDefinition`
(`parts`, `markers`, `Drawing`) i wpis w `schematics/index.ts`.

### Obsługa rysunku

- przybliżanie: przycisk, podwójne kliknięcie, szczypanie, kółko myszy
  (kółko przejmuje sterowanie **dopiero po przybliżeniu** — przy 1:1
  przewija stronę, żeby duży rysunek nie łapał scrolla),
- przesuwanie: przeciągnięcie, ograniczone do krawędzi rysunku,
- pełny ekran: przycisk w rogu kadru, zamykany klawiszem Escape,
- legenda: działa **kliknięciem** (dotyk), najechaniem i z klawiatury;
  kliknięcie przypina element, numery na rysunku są elementami
  fokusowalnymi z `aria-pressed`.

---

## 7. Parametry techniczne

Plik `src/catalog/dataset.ts`, pole `specs`. **Każda wartość musi mieć źródło:**

```ts
specs: [
  spec("depth", "Głębokość zabudowy", "86 mm", null, aluprofPage("mb-86n")),
  spec("sash", "Maks. wymiar skrzydła"),   // brak danych → „Do uzupełnienia”
]
```

Argumenty: `id`, `etykieta`, `wartość`, `norma`, `źródło`.

Zasady:
- Etykieta dokładnie taka, jak u producenta — **Uf (profil) to nie to samo co
  Uw (okno)**. MB-79N podaje Uf, MB-86N podaje Uw.
- Norma osobno od wartości (`"klasa 4"` + `"PN-EN 12207"`), nie w jednym stringu.
- Wartość bez źródła zgłasza walidator jako błąd.
- Stopień wypełnienia liczy się sam — zdanie „Potwierdzone 5 z 6 parametrów”
  na karcie systemu bierze się z danych, nie z ręcznie wpisanego tekstu.

---

## 7a. Portfolio realizacji

Ta sama zasada, co przy nazwach systemów. Rekord w `src/data/realizations.ts`
ma pole `verified`:

| `verified` | Co to znaczy | Skutek |
|---|---|---|
| `false` | obiekt poglądowy, zdjęcia z banku | karta dostaje `noindex, follow`, nie wchodzi do sitemapy |
| `true` | realizacja faktycznie wykonana przez firmę | karta indeksowana, wchodzi do sitemapy |

Obecnie **wszystkie 6 pozycji ma `verified: false`**. Po wgraniu własnej
dokumentacji fotograficznej: uzupełnić `location`, `scope`, `description`
oraz zastosowany system — i dopiero wtedy przestawić flagę.

Razem z tym przepisać `PORTFOLIO_SEO_DESCRIPTION` i `PORTFOLIO_DISCLAIMER`
(znika słowo „poglądowe").

---

## 8. Pozostałe placeholdery

- **Zdjęcia systemów** — `src/catalog/dataset.ts`, pole `image` (Unsplash)
- **Zdjęcia realizacji** — `src/data/realizations.ts` (Unsplash)
- **Ceny** — nigdzie nie podane, wyłącznie „Zapytaj o wycenę”
- **Dane prawne** — `src/pages/PolitykaPrywatnosci.tsx` (NIP/REGON/KRS)
- **Social media** — `src/data/company.ts`, pole `socialLinks`
- **Tagi/cechy systemów** — `src/catalog/taxonomy.ts`, celowo pusta lista;
  filtr pojawi się sam, gdy pozycje zostaną dodane

Dane firmy (nazwa, adres, telefon) w `src/data/company.ts` są **prawdziwe**
i potwierdzone przez klienta.

---

## 9. Stan pokrycia danymi

| Pozycji w katalogu | 86 systemów ALUPROF |
|---|---|
| Kategorie | 7, wg sekcji oferty producenta |
| Nazwy potwierdzone u producenta | 86 z 86 |
| Parametry z podanym źródłem | ~300 wartości; średnio 3–4 na system |
| Systemy bez parametrów u producenta | 5 (MB-79N US, MB-45 OFFICE, MB-Slide, OpenSlide, MB-SR60 NY) |
| Schematy poglądowe (własne) | 4 — okno, drzwi, przesuwne, fasada |
| Przekroje producenta | 0 (pliki istnieją, brak zgody na publikację) |
| Modele 3D producenta | 0 |
| Zdjęcia własne | 0 |
---

## 10. Adresy katalogu

| Adres | Co to jest |
|---|---|
| `/systemy` | pełny katalog z filtrami, sortowaniem i wyszukiwarką |
| `/systemy/:slug` | karta systemu |
| `/systemy/kategoria/:slug` | strona kategorii (slug z `taxonomy.ts`, np. `drzwi-przesuwne`) |
| `/systemy/producent/:slug` | strona producenta |
| `/kontakt?system=:slug` | formularz z kontekstem systemu |

Katalog trzyma **cały stan w adresie** — filtry są wielokrotnego wyboru
i powtarzają się w zapytaniu:

```
/systemy?producent=aluprof&producent=schueco&kategoria=okna&sort=name-asc
```

Dzięki temu przefiltrowany widok da się wysłać linkiem, a powrót z karty
systemu odtwarza dokładnie to, co użytkownik miał na ekranie.

**Strony kategorii i producentów** są adresami docelowymi (menu, stopka,
wyszukiwarka), katalog z parametrami służy do przeglądania. Obie prowadzą
do siebie nawzajem.

### Kontekst zapytania

Przycisk „Zapytaj o wycenę” na karcie systemu prowadzi do
`/kontakt?system=mb-79n`. Formularz:

- pokazuje baner z nazwą systemu, producentem i kategorią (z odnośnikiem
  z powrotem i przyciskiem usunięcia kontekstu),
- ustawia temat zapytania na kategorię systemu,
- przekazuje slug w ukrytym polu `system`,
- wysyła komplet pól POST-em (JSON) pod adres z `VITE_CONTACT_ENDPOINT`.
  Bez tej zmiennej działa w trybie demonstracyjnym i mówi o tym wprost.

Lista tematów w formularzu buduje się z taksonomii katalogu, więc nowa
kategoria pojawia się tam sama.

### Dane strukturalne (schema.org)

- `BreadcrumbList` — na karcie systemu, stronie kategorii i producenta.
- `Product` — **wyłącznie** dla systemów o potwierdzonym oznaczeniu
  (`dataStatus.name === "confirmed"`). Przypisanie marki producenta do nazwy
  roboczej byłoby dla wyszukiwarki twierdzeniem firmy, a nie jest potwierdzone.
  W `additionalProperty` trafiają tylko parametry mające źródło.
- Cen, ocen ani dostępności nie podajemy nigdzie.

> Pamiętaj: `public/robots.txt` blokuje indeksowanie całej strony na czas dema.
> Dane strukturalne zaczną działać dopiero po jego usunięciu — razem z meta
> robots w `index.html` i `X-Robots-Tag` w `vercel.json`.

---

## 11. Katalog ALUPROF — jak jest zbudowany

Dane zebrane 2026-08-28 z sekcji oferty (`aluprof.com/pl/oferta/*`)
i publicznych kart systemów (`aluprof.com/produkt/<slug>`).

### System należy do WIELU kategorii

Producent przypisuje jeden system do kilku sekcji oferty — MB-79N stoi
i w oknach, i w drzwiach, i w rozwiązaniach indywidualnych. Dlatego pole
w modelu to `categoryIds: string[]`, a nie pojedyncze `categoryId`.
Pierwsza pozycja jest kategorią wiodącą: po niej idzie grupowanie w katalogu
i ścieżka nawigacyjna. Suma liczników kategorii (113) jest większa niż liczba
systemów (86) — to nie błąd, tylko konsekwencja przypisań producenta.

### Czego świadomie nie ma

| Pole | Dlaczego puste |
|---|---|
| `applicationIds` | producent nie przypisuje systemów do typów budynków; filtr sam się ukrywa |
| `variants` | karta systemu nie wylicza wykonań w formie nadającej się do przepisania |
| `depth` | poza MB-86N („profile o głębokości 86 mm”) nie pada w blokach parametrów |
| `crossSections` | pliki są u producenta, publikacja wymaga pisemnej zgody |
| `model3d.url` | brak plików; sekcja 3D na karcie systemu pojawia się dopiero z realnym modelem |

### Czego NIE ma w ofercie Aluprofa

Sprawdzone w całym menu oferty: **nie istnieje kategoria „szkło
przeciwpożarowe”**. Aluprof ma systemy ppoż. (MB-78EI, MB-86EI, MB-118EI),
a szkło jest wypełnieniem dobieranym do konstrukcji. Nie zakładamy tej
kategorii bez innego źródła.

Sekcja oferty „Systemy antywłamaniowe” to **cecha, nie kategoria** — wszystkie
jej pozycje (MB-104 Passive, MB-77HS, MB-SR50N, MB-70) to systemy obecne już
w oknach, drzwiach i fasadach. Stąd tag `antywlamaniowe`, nie ósma kategoria.

### Jak dopisać kolejny system

Jedno wejście w tablicy `INPUTS` w `src/catalog/dataset.ts`:

```ts
{
  id: "mb-86ei",                      // nasz slug
  name: "MB-86EI",
  aluprof: "mb-86ei",                 // slug karty u producenta
  summary: "Okna, drzwi i ścianki przeciwpożarowe klasy EI15, EW30, EI30",
  cats: ["ppoz", "drzwi"],            // pierwsza = wiodąca
  ct: "rozwierne",
  specs: [["Odporność ogniowa", "klasa EI30 | EN 13501-2:2016-07"]],
}
```

Po pionowej kresce producent podaje raz **jednostkę**, raz **normę**.
`splitTail()` rozdziela je po treści: jednostka dokleja się do wartości,
norma trafia do własnej rubryki. Nie wpisuj jednostki tam, gdzie ma być norma.

Źródło (`aluprof.com/produkt/<slug>` + data dostępu) dopisuje się samo do
każdego parametru — walidator w trybie deweloperskim zgłasza wartość bez źródła
jako błąd, a test `catalog.test.ts` pilnuje tego przy każdym uruchomieniu.

### Poza zakresem fazy 1

Osłony przeciwsłoneczne (żaluzje, pergole, screeny, rolety, moskitiery,
markizy), bramy, kraty handlowe i klamki. To ~80 dalszych pozycji o innym
charakterze — produkt gotowy, nie system profili — i wymagają innej karty.

---

## 12. Sekwencja 3D na stronie głównej

`ProductStory` wybiera raz przy pierwszym renderze: scena 3D albo wersja
zdjęciowa (`ScrollStory`).

**Scena idzie na każdą szerokość ekranu.** Wcześniej poniżej 768 px właczała
się wersja zdjęciowa — telefon, czyli większość ruchu, nie widział najlepszej
części strony. Warunki, na których to stoi:

- kadr trzyma `position: sticky`, a nie pinowanie ScrollTriggera — to jedyna
  technika, która na dotyku nie szarpie,
- scena montuje się dopiero przy wejściu w widok (`IntersectionObserver`),
- `frameloop="demand"` — rysuje wyłącznie przy zmianie scrolla, nie 60 fps,
- `frameloop="never"`, gdy sekcja wyjdzie z ekranu — GPU zwalnia całkiem,
- poniżej 768 px pułap DPR spada do 1,25 i wyłącza się wygładzanie krawędzi,
- postęp sekwencji żyje w `ref`, React renderuje się 6 razy na całą sekcję.

**Kadrowanie zależy od proporcji ekranu** (`StoryScene`, funkcja `Rig`): ujęcia
są komponowane pod szeroki widok, gdzie model stoi po prawej, a lewa połowa
zostaje na typografię. Poniżej 900 px model wraca na środek, unosi się nad blok
tekstu, a kamera cofa się — pionowy kadr przy `fov 38°` obcinałby konstrukcję
o proporcjach 1,9 × 2,45 m. Przejście jest płynne, nie skokowe.

Wersja zdjęciowa zostaje dla **braku WebGL** i dla **prefers-reduced-motion** —
to wybór użytkownika, nie ograniczenie sprzętu, i musi być uszanowany.

