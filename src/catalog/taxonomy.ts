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
   ------------------------------------------------------------------ */

/**
 * UWAGA PRAWNA: `relationship: "none"` przy każdym producencie.
 * Obecność producenta w katalogu oznacza wyłącznie, że firma wykonuje
 * konstrukcje w jego systemach — nie oznacza autoryzacji ani partnerstwa.
 * Zmiana tej wartości wymaga pisemnego potwierdzenia od producenta.
 */
export const manufacturers: Manufacturer[] = [
  {
    id: "aluprof",
    slug: "aluprof",
    name: "ALUPROF",
    website: "https://aluprof.com",
    relationship: "none",
  },
  {
    id: "aliplast",
    slug: "aliplast",
    name: "Aliplast",
    website: null,
    relationship: "none",
  },
  {
    id: "schueco",
    slug: "schueco",
    name: "Schüco",
    website: null,
    relationship: "none",
  },
];

export const categories: SystemCategory[] = [
  {
    id: "okna",
    slug: "okna",
    name: "Okna",
    short: "Okna",
    description: "Konstrukcje okienne — od pojedynczych otworów po przeszklenia wielkoformatowe.",
  },
  {
    id: "drzwi",
    slug: "drzwi",
    name: "Drzwi",
    short: "Drzwi",
    description: "Drzwi wejściowe, techniczne i wewnętrzne w konstrukcji aluminiowej.",
  },
  {
    id: "przesuwne",
    slug: "drzwi-przesuwne",
    name: "Drzwi przesuwne",
    short: "Przesuwne",
    description: "Systemy podnoszono-przesuwne i przesuwne do dużych przeszkleń.",
  },
  {
    id: "fasady",
    slug: "fasady",
    name: "Fasady",
    short: "Fasady",
    description: "Ściany osłonowe: słupowo-ryglowe, strukturalne i elementowe.",
  },
  {
    id: "wewnetrzne",
    slug: "systemy-wewnetrzne",
    name: "Systemy wewnętrzne",
    short: "Wewnętrzne",
    description: "Przeszklone ścianki działowe i drzwi wewnętrzne.",
  },
  {
    id: "ppoz",
    slug: "systemy-przeciwpozarowe",
    name: "Systemy przeciwpożarowe",
    short: "Przeciwpożarowe",
    description: "Konstrukcje o określonej odporności ogniowej — klasyfikacja z dokumentów producenta.",
  },
  {
    id: "specjalne",
    slug: "systemy-specjalne",
    name: "Systemy specjalne",
    short: "Specjalne",
    description: "Ogrody zimowe, świetliki, pergole i konstrukcje nietypowe.",
  },
  {
    id: "akcesoria",
    slug: "akcesoria",
    name: "Akcesoria",
    short: "Akcesoria",
    description: "Okucia, klamki, systemy ryglowania i automatyka.",
  },
];

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
 * Cechy przekrojowe (np. „antywłamaniowe RC2”, „pasywne”) świadomie puste.
 * Każdy tag byłby twierdzeniem technicznym — uzupełniamy wyłącznie na
 * podstawie kart katalogowych. Filtr po tagach ukrywa się, gdy lista jest pusta.
 */
export const tags: Tag[] = [];

export const taxonomy: Taxonomy = {
  manufacturers,
  categories,
  applications,
  constructionTypes,
  tags,
};
