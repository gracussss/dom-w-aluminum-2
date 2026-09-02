import type {
  Application,
  ConstructionType,
  Manufacturer,
  SystemCategory,
  Tag,
  Taxonomy,
} from "./types";

/* ------------------------------------------------------------------
   TAKSONOMIE KATALOGU

   Listy referencyjne, do których odwołują się systemy. Dodanie nowego
   producenta czy kategorii to dopisanie pozycji tutaj — komponenty
   czytają taksonomię z repozytorium i nie znają jej zawartości.

   Podział kategorii odwzorowuje sekcje oferty producenta
   (aluprof.com/pl/oferta), a nie nasz własny pomysł na porządek.
   ------------------------------------------------------------------ */

/**
 * UWAGA PRAWNA: `relationship: "none"`.
 * Obecność producenta w katalogu oznacza wyłącznie, że firma wykonuje
 * konstrukcje w jego systemach — nie oznacza autoryzacji ani partnerstwa.
 * Zmiana tej wartości wymaga pisemnego potwierdzenia od producenta.
 *
 * Lista jest jednoelementowa świadomie: katalog prezentuje dziś wyłącznie
 * ALUPROF. Architektura wieloproducencka zostaje nietknięta — dodanie
 * kolejnego producenta to dopisanie pozycji tutaj i systemów w `dataset.ts`.
 * Interfejs sam pokaże filtr producenta, gdy pozycji będzie więcej niż jedna.
 */
export const manufacturers: Manufacturer[] = [
  {
    id: "aluprof",
    slug: "aluprof",
    name: "ALUPROF",
    website: "https://aluprof.com",
    relationship: "none",
  },
];

export const categories: SystemCategory[] = [
  {
    id: "okna",
    slug: "okna",
    name: "Okna",
    short: "Okna",
    description:
      "Systemy okienne — od serii standardowych po wąskoprofilowe i pasywne, w tym okna dachowe i konstrukcje renowacyjne.",
  },
  {
    id: "drzwi",
    slug: "drzwi",
    name: "Drzwi",
    short: "Drzwi",
    description:
      "Systemy drzwiowe: wejściowe, panelowe, obrotowe i do obiektów o dużym natężeniu ruchu.",
  },
  {
    id: "przesuwne",
    slug: "drzwi-przesuwne",
    name: "Drzwi przesuwne",
    short: "Przesuwne",
    description:
      "Konstrukcje podnoszono-przesuwne, przesuwne i harmonijkowe — wyjścia na taras w dużym formacie.",
  },
  {
    id: "fasady",
    slug: "fasady",
    name: "Fasady",
    short: "Fasady",
    description:
      "Ściany osłonowe słupowo-ryglowe, elementowe i strukturalne, wraz z rozwiązaniami zintegrowanymi.",
  },
  {
    id: "wewnetrzne",
    slug: "sciany-wewnetrzne",
    name: "Ściany wewnętrzne",
    short: "Wewnętrzne",
    description: "Przeszklone ściany działowe i systemy podziału wnętrz biurowych.",
  },
  {
    id: "ppoz",
    slug: "systemy-przeciwpozarowe",
    name: "Systemy przeciwpożarowe",
    short: "Przeciwpożarowe",
    description:
      "Przegrody, drzwi i przeszklenia o określonej odporności ogniowej oraz konstrukcje oddymiające.",
  },
  {
    id: "indywidualne",
    slug: "rozwiazania-indywidualne",
    name: "Rozwiązania indywidualne",
    short: "Indywidualne",
    description:
      "Fasady elementowe i strukturalne projektowane pod konkretną inwestycję, poza katalogiem standardowym.",
  },
];

/**
 * Zastosowanie budynkowe. Producent NIE publikuje takiego przypisania przy
 * systemach, więc żaden system nie ma tu dziś wartości — filtr sam się
 * ukrywa, dopóki nie pojawi się źródło. Wpisanie tego „na oko” byłoby
 * zmyślaniem, a nie uzupełnianiem katalogu.
 */
export const applications: Application[] = [
  { id: "mieszkaniowe", name: "Budownictwo mieszkaniowe", short: "Mieszkaniowe" },
  { id: "komercyjne", name: "Obiekty komercyjne", short: "Komercyjne" },
  { id: "publiczne", name: "Obiekty użyteczności publicznej", short: "Publiczne" },
];

export const constructionTypes: ConstructionType[] = [
  { id: "rozwierne", name: "Rozwierne", glyph: "rozwierne" },
  { id: "przesuwne", name: "Przesuwne", glyph: "przesuwne" },
  { id: "slupowo-ryglowe", name: "Słupowo-ryglowe", glyph: "slupowo-ryglowe" },
  { id: "strukturalne", name: "Strukturalne", glyph: "strukturalne" },
  { id: "stale", name: "Stałe / nieotwieralne", glyph: "stale" },
];

/**
 * Cechy przekrojowe. Każda musi mieć oparcie w materiałach producenta —
 * `antywlamaniowe` pochodzi z sekcji oferty „Systemy antywłamaniowe”,
 * `renowacja` z podtytułów systemów RENO. Nie dopisujemy tu cech
 * „z wyczucia”: tag to twierdzenie techniczne jak każde inne.
 *
 * Antywłamaniowość celowo NIE jest kategorią — wszystkie pozycje z tej
 * sekcji oferty to systemy okienne, drzwiowe albo fasadowe, obecne już
 * w swoich kategoriach. Kategoria dublowałaby te same systemy.
 */
export const tags: Tag[] = [
  { id: "antywlamaniowe", name: "Antywłamaniowe" },
  { id: "renowacja", name: "Renowacyjne" },
];

export const taxonomy: Taxonomy = {
  manufacturers,
  categories,
  applications,
  constructionTypes,
  tags,
};
