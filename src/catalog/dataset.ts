import type {
  AluSystem,
  DataSource,
  ModelType,
  SystemSpec,
  SystemVariant,
  Verification,
} from "./types";

/* ------------------------------------------------------------------
   ZBIÓR DANYCH — ŹRÓDŁO LOKALNE

   Ten plik jest jedynym miejscem, gdzie żyją rekordy systemów.
   Docelowo zastępuje go odpowiedź z API/CMS — kontrakt (typy) zostaje
   bez zmian, komponenty nie wiedzą, skąd przyszły dane.

   ZASADA: żadna wartość techniczna bez pola `source`.
   Puste pole (`null`) jest poprawnym stanem i renderuje się jako
   „Do uzupełnienia”. Wartość bez źródła jest błędem, nie brakiem.
   ------------------------------------------------------------------ */

function img(id: string, params = "w=1600&q=80&auto=format&fit=crop") {
  return "https://images.unsplash.com/" + id + "?" + params;
}

/** Data pozyskania danych ze stron producentów w tej iteracji. */
const ACCESSED = "2026-08-26";

/** Źródło: publiczna strona systemu na aluprof.com. */
function aluprofPage(slug: string): DataSource {
  return {
    label: "aluprof.com — strona systemu",
    url: "https://aluprof.com/produkt/" + slug,
    accessedAt: ACCESSED,
  };
}

function spec(
  id: string,
  label: string,
  value: string | null = null,
  standard: string | null = null,
  source: DataSource | null = null
): SystemSpec {
  return { id, label, value, standard, source };
}

/** Szkielet parametrów dla systemu bez potwierdzonych danych. */
function emptySpecs(): SystemSpec[] {
  return [
    spec("depth", "Głębokość zabudowy"),
    spec("uf", "Izolacyjność termiczna Uf"),
    spec("sash", "Maks. wymiar skrzydła"),
    spec("air", "Przepuszczalność powietrza"),
    spec("water", "Wodoszczelność"),
    spec("wind", "Odporność na obciążenie wiatrem"),
  ];
}

function variants(names: string[]): SystemVariant[] {
  return names.map((name, i) => ({
    id: String(i + 1).padStart(2, "0"),
    name,
    note: null,
  }));
}

/* --------------------------- TYPY MODELI 3D --------------------------- */

const MODEL_BY_CATEGORY: Record<string, ModelType> = {
  okna: "okno",
  drzwi: "drzwi",
  przesuwne: "przesuwne",
  fasady: "fasada",
  wewnetrzne: "fasada",
  ppoz: "drzwi",
  specjalne: "fasada",
  akcesoria: null,
};

/** Wyjątki tam, gdzie kategoria nie oddaje typu konstrukcji. */
const MODEL_OVERRIDES: Record<string, ModelType> = {
  "drzwi-wewnetrzne": "drzwi",
  "ppoz-sciany": "fasada",
  "okno-panorama": "fasada",
};

/* ----------------------------- FABRYKA ----------------------------- */

interface SystemInput {
  id: string;
  slug?: string;
  name: string;
  /** Domyślnie nazwa robocza. „confirmed” wyłącznie po potwierdzeniu u producenta. */
  nameStatus?: "confirmed" | "working-title";
  manufacturerId: string;
  categoryId: string;
  applicationIds: string[];
  constructionTypeId: string;
  summary: string;
  description: string;
  image: string;
  manufacturerUrl?: string | null;
  specs?: SystemSpec[];
  variantNames?: string[];
  relatedSystemIds?: string[];
  modelType?: ModelType;
  modelUrl?: string | null;
  verifiedAt?: string | null;
  note?: string | null;
}

/** Stopień wypełnienia parametrów liczony z danych, nie deklarowany ręcznie. */
function specStatus(specs: SystemSpec[]): Verification {
  const filled = specs.filter((s) => s.value !== null).length;
  if (filled === 0) return "missing";
  return filled === specs.length ? "verified" : "partial";
}

/**
 * Buduje kompletny rekord systemu z minimum pól. Wszystko, czego nie podano,
 * dostaje bezpieczną wartość domyślną: brak przekrojów, brak dokumentów,
 * cena na zapytanie, CTA z kontekstem systemu.
 *
 * Dodanie kolejnego systemu = jedno wywołanie tej funkcji. Bez zmian w UI.
 */
function defineSystem(input: SystemInput): AluSystem {
  const slug = input.slug ?? input.id;
  const specs = input.specs ?? emptySpecs();
  const modelType =
    input.modelType ?? MODEL_OVERRIDES[input.id] ?? MODEL_BY_CATEGORY[input.categoryId] ?? null;

  return {
    id: input.id,
    slug,
    name: input.name,
    manufacturerId: input.manufacturerId,
    categoryId: input.categoryId,
    applicationIds: input.applicationIds,
    constructionTypeId: input.constructionTypeId,
    tagIds: [],

    summary: input.summary,
    description: input.description,
    manufacturerUrl: input.manufacturerUrl ?? null,

    media: {
      hero: {
        src: input.image,
        alt: input.name,
        placeholder: true,
        credit: "Unsplash — materiał tymczasowy",
      },
      gallery: [],
    },

    /** Puste = UI pokazuje własny schemat poglądowy właściwy dla typu konstrukcji. */
    crossSections: [],
    specs,
    variants: variants(input.variantNames ?? []),
    documents: [],
    relatedSystemIds: input.relatedSystemIds ?? [],

    pricing: { mode: "on-request", note: null },
    cta: [
      {
        id: "quote",
        label: "Zapytaj o wycenę",
        href: "/kontakt?system=" + slug,
        kind: "quote",
      },
    ],

    model3d: { type: modelType, url: input.modelUrl ?? null },

    dataStatus: {
      name: input.nameStatus ?? "working-title",
      specs: specStatus(specs),
      crossSection: "missing",
      model3d: input.modelUrl ? "verified" : "missing",
      media: "stock",
      verifiedAt: input.verifiedAt ?? null,
      note: input.note ?? null,
    },
  };
}

/* ------------------------------ SYSTEMY ------------------------------ */

export const systems: AluSystem[] = [
  /* ---- ALUPROF — parametry z publicznych stron producenta ---- */
  defineSystem({
    id: "mb-79n",
    name: "MB-79N",
    nameStatus: "confirmed",
    manufacturerId: "aluprof",
    categoryId: "okna",
    applicationIds: ["mieszkaniowe", "komercyjne"],
    constructionTypeId: "rozwierne",
    summary: "System okienno-drzwiowy z izolacją termiczną",
    description:
      "System profili aluminiowych do konstrukcji okiennych i drzwiowych. Parametry poniżej pochodzą z publicznej strony systemu na aluprof.com — pełną specyfikację potwierdzamy kartą katalogową producenta.",
    image: img("photo-1783125127082-3fb6c1bccd72"),
    manufacturerUrl: "https://aluprof.com/produkt/mb-79n",
    verifiedAt: ACCESSED,
    relatedSystemIds: ["mb-86n", "mb-104-passive"],
    specs: [
      spec("depth", "Głębokość zabudowy"),
      spec("uf", "Izolacyjność termiczna profili Uf", "> 0,83 W/(m²K)", null, aluprofPage("mb-79n")),
      spec("sash", "Maks. wymiar skrzydła"),
      spec("air", "Przepuszczalność powietrza", "klasa 4", "EN 12207:2001", aluprofPage("mb-79n")),
      spec("water", "Wodoszczelność okien", "E 1950", null, aluprofPage("mb-79n")),
      spec("wind", "Odporność na obciążenie wiatrem"),
    ],
    variantNames: ["Okno rozwierne", "Okno uchylno-rozwierne", "Konstrukcja stała"],
  }),

  defineSystem({
    id: "mb-86n",
    name: "MB-86N",
    nameStatus: "confirmed",
    manufacturerId: "aluprof",
    categoryId: "okna",
    applicationIds: ["mieszkaniowe", "komercyjne"],
    constructionTypeId: "rozwierne",
    summary: "System okienno-drzwiowy z izolacją termiczną",
    description:
      "System profili aluminiowych o podwyższonych wymaganiach termicznych, stosowany w konstrukcjach okiennych i drzwiowych. Parametry pochodzą z publicznej strony systemu na aluprof.com.",
    image: img("photo-1760304879576-81565137ff2e"),
    manufacturerUrl: "https://aluprof.com/produkt/mb-86n",
    verifiedAt: ACCESSED,
    relatedSystemIds: ["mb-79n", "mb-104-passive"],
    specs: [
      spec("depth", "Głębokość zabudowy", "86 mm", null, aluprofPage("mb-86n")),
      spec("uw", "Izolacyjność termiczna okna Uw", "od 0,62 W/(m²K)", null, aluprofPage("mb-86n")),
      spec("sash", "Maks. wymiar skrzydła"),
      spec("air", "Przepuszczalność powietrza okna", "klasa 4", "PN-EN 12207", aluprofPage("mb-86n")),
      spec("water", "Wodoszczelność okna", "klasa E 4800 Pa", "PN-EN 12208", aluprofPage("mb-86n")),
      spec(
        "wind",
        "Odporność na obciążenie wiatrem okna",
        "klasa C5",
        "PN-EN 12210",
        aluprofPage("mb-86n")
      ),
    ],
    variantNames: ["Okno rozwierne", "Drzwi zewnętrzne", "Konstrukcja stała"],
  }),

  defineSystem({
    id: "mb-104-passive",
    name: "MB-104 Passive",
    nameStatus: "confirmed",
    manufacturerId: "aluprof",
    categoryId: "okna",
    applicationIds: ["mieszkaniowe"],
    constructionTypeId: "rozwierne",
    summary: "System okienno-drzwiowy o najwyższej izolacji termicznej",
    description:
      "System przeznaczony do budownictwa o obniżonym zapotrzebowaniu na energię. Parametry pochodzą z publicznej strony systemu na aluprof.com.",
    image: img("photo-1777835899388-2c1efc775fea"),
    manufacturerUrl: "https://aluprof.com/produkt/mb-104-passive",
    verifiedAt: ACCESSED,
    relatedSystemIds: ["mb-86n", "mb-79n"],
    specs: [
      spec("depth", "Głębokość zabudowy"),
      spec(
        "uw",
        "Izolacyjność termiczna okna otwieranego Uw",
        "od 0,53 W/(m²K)",
        null,
        aluprofPage("mb-104-passive")
      ),
      spec("sash", "Maks. wymiar skrzydła"),
      spec(
        "air",
        "Przepuszczalność powietrza",
        "klasa 4",
        "PN-EN 12207:2001",
        aluprofPage("mb-104-passive")
      ),
      spec(
        "water",
        "Wodoszczelność",
        "klasa AE 1800",
        "PN-EN 12208:2001",
        aluprofPage("mb-104-passive")
      ),
      spec(
        "wind",
        "Odporność na obciążenie wiatrem",
        "klasa C5/B5",
        "PN-EN 12210:2001",
        aluprofPage("mb-104-passive")
      ),
    ],
    variantNames: ["Okno rozwierne", "Okno uchylno-rozwierne", "Drzwi zewnętrzne"],
  }),

  /* ---- Pozycje bez potwierdzonych danych — nazwy robocze ---- */
  defineSystem({
    id: "okno-standard",
    slug: "system-okienny-standardowy",
    name: "System okienny — seria standardowa",
    manufacturerId: "aliplast",
    categoryId: "okna",
    applicationIds: ["mieszkaniowe"],
    constructionTypeId: "rozwierne",
    summary: "Podstawowa konstrukcja okienna",
    description:
      "Miejsce na system okienny z podstawowej serii. Oznaczenie handlowe i dane techniczne do uzupełnienia.",
    image: img("photo-1783125127229-0850d689e014"),
    variantNames: ["Okno rozwierne", "Okno uchylno-rozwierne"],
  }),

  defineSystem({
    id: "okno-panorama",
    slug: "system-okienny-panoramiczny",
    name: "System okienny — przeszklenia panoramiczne",
    manufacturerId: "schueco",
    categoryId: "okna",
    applicationIds: ["mieszkaniowe", "komercyjne"],
    constructionTypeId: "stale",
    summary: "Duże formaty, minimalna rama",
    description:
      "Miejsce na system do przeszkleń wielkoformatowych o zredukowanej szerokości ramy. Dane do uzupełnienia.",
    image: img("photo-1628012209120-d9db7abf7eab"),
    variantNames: ["Konstrukcja stała", "Okno narożne"],
  }),

  defineSystem({
    id: "drzwi-wejsciowe",
    slug: "system-drzwi-wejsciowych",
    name: "System drzwi wejściowych",
    manufacturerId: "aluprof",
    categoryId: "drzwi",
    applicationIds: ["mieszkaniowe", "komercyjne"],
    constructionTypeId: "rozwierne",
    summary: "Wejścia do budynków mieszkalnych i obiektów",
    description:
      "Miejsce na system drzwi wejściowych z wypełnieniem panelowym lub przeszkleniem. Oznaczenie i parametry do uzupełnienia.",
    image: img("photo-1762134768304-88c5d735d611"),
    variantNames: ["Jednoskrzydłowe", "Dwuskrzydłowe", "Z naświetlem"],
  }),

  defineSystem({
    id: "drzwi-techniczne",
    slug: "system-drzwi-technicznych",
    name: "System drzwi technicznych",
    manufacturerId: "aliplast",
    categoryId: "drzwi",
    applicationIds: ["komercyjne", "publiczne"],
    constructionTypeId: "rozwierne",
    summary: "Drzwi o podwyższonej odporności eksploatacyjnej",
    description:
      "Miejsce na system drzwi do pomieszczeń technicznych i ciągów komunikacyjnych. Dane do uzupełnienia.",
    image: img("photo-1543710397-c21ee19e2b95"),
    variantNames: ["Pełne", "Częściowo przeszklone"],
  }),

  defineSystem({
    id: "hs-portal",
    slug: "system-podnoszono-przesuwny",
    name: "System podnoszono-przesuwny (HS)",
    manufacturerId: "schueco",
    categoryId: "przesuwne",
    applicationIds: ["mieszkaniowe"],
    constructionTypeId: "przesuwne",
    summary: "Wielkoformatowe wyjścia na taras",
    description:
      "Miejsce na system podnoszono-przesuwny do dużych przeszkleń tarasowych. Maksymalne wymiary i masa skrzydła do potwierdzenia.",
    image: img("photo-1702724758750-9ff8d50f02e5"),
    relatedSystemIds: ["slim-slide"],
    variantNames: ["Dwuskrzydłowy", "Trzyszynowy", "Narożnikowy"],
  }),

  defineSystem({
    id: "slim-slide",
    slug: "system-przesuwny-slim",
    name: "System przesuwny — wąski profil",
    manufacturerId: "aliplast",
    categoryId: "przesuwne",
    applicationIds: ["mieszkaniowe", "komercyjne"],
    constructionTypeId: "przesuwne",
    summary: "Minimalna szerokość profilu w widoku",
    description:
      "Miejsce na system przesuwny o zredukowanych szerokościach profili. Dane techniczne do uzupełnienia.",
    image: img("photo-1565261949232-3fcc78206c0c"),
    relatedSystemIds: ["hs-portal"],
    variantNames: ["Dwuskrzydłowy", "Chowany w ścianę"],
  }),

  defineSystem({
    id: "fasada-sr",
    slug: "fasada-slupowo-ryglowa",
    name: "Fasada słupowo-ryglowa",
    manufacturerId: "aluprof",
    categoryId: "fasady",
    applicationIds: ["komercyjne", "publiczne"],
    constructionTypeId: "slupowo-ryglowe",
    summary: "Ściana osłonowa dla dużych powierzchni",
    description:
      "Miejsce na system fasadowy słupowo-ryglowy. Rozpiętości, klasy i parametry do uzupełnienia.",
    image: img("photo-1523477593243-78bbf626fd3b"),
    relatedSystemIds: ["fasada-strukturalna", "fasada-elementowa"],
    variantNames: ["Widoczna siatka", "Półstrukturalna"],
  }),

  defineSystem({
    id: "fasada-strukturalna",
    slug: "fasada-strukturalna",
    name: "Fasada strukturalna",
    manufacturerId: "schueco",
    categoryId: "fasady",
    applicationIds: ["komercyjne"],
    constructionTypeId: "strukturalne",
    summary: "Jednolita płaszczyzna szkła",
    description:
      "Miejsce na system fasady strukturalnej z licowaną płaszczyzną szklenia. Dane do uzupełnienia.",
    image: img("photo-1783705093954-a4d64bb7bf69"),
    relatedSystemIds: ["fasada-sr", "fasada-elementowa"],
    variantNames: ["Klejona", "Mocowana mechanicznie"],
  }),

  defineSystem({
    id: "fasada-elementowa",
    slug: "fasada-elementowa",
    name: "Fasada elementowa",
    manufacturerId: "schueco",
    categoryId: "fasady",
    applicationIds: ["komercyjne"],
    constructionTypeId: "slupowo-ryglowe",
    summary: "Prefabrykacja w zakładzie, szybki montaż",
    description:
      "Miejsce na system fasady elementowej montowanej z gotowych modułów. Dane do uzupełnienia.",
    image: img("photo-1786609836782-fafdcd51d8d8"),
    relatedSystemIds: ["fasada-sr", "fasada-strukturalna"],
    variantNames: ["Moduł kondygnacyjny", "Moduł narożny"],
  }),

  defineSystem({
    id: "sciany-dzialowe",
    slug: "sciany-dzialowe",
    name: "Ścianki działowe",
    manufacturerId: "aliplast",
    categoryId: "wewnetrzne",
    applicationIds: ["komercyjne", "publiczne"],
    constructionTypeId: "stale",
    summary: "Podziały wnętrz biurowych",
    description:
      "Miejsce na system przeszklonych ścianek działowych. Parametry akustyczne do uzupełnienia.",
    image: img("photo-1522968941782-e27ac665baa3"),
    relatedSystemIds: ["drzwi-wewnetrzne"],
    variantNames: ["Pojedyncze szklenie", "Podwójne szklenie"],
  }),

  defineSystem({
    id: "drzwi-wewnetrzne",
    slug: "drzwi-wewnetrzne-aluminiowe",
    name: "Drzwi wewnętrzne aluminiowe",
    manufacturerId: "aliplast",
    categoryId: "wewnetrzne",
    applicationIds: ["komercyjne", "publiczne"],
    constructionTypeId: "rozwierne",
    summary: "Uzupełnienie ścianek działowych",
    description:
      "Miejsce na system drzwi wewnętrznych spójny wizualnie ze ściankami. Dane do uzupełnienia.",
    image: img("photo-1770816306599-b1d21102ed53"),
    relatedSystemIds: ["sciany-dzialowe"],
    variantNames: ["Rozwierne", "Przesuwne naścienne"],
  }),

  defineSystem({
    id: "ppoz-drzwi",
    slug: "drzwi-przeciwpozarowe",
    name: "Drzwi przeciwpożarowe",
    manufacturerId: "aluprof",
    categoryId: "ppoz",
    applicationIds: ["komercyjne", "publiczne"],
    constructionTypeId: "rozwierne",
    summary: "Konstrukcje o określonej odporności ogniowej",
    description:
      "Miejsce na system drzwi przeciwpożarowych. Klasa odporności ogniowej wymaga potwierdzenia dokumentami producenta — nie podajemy jej bez weryfikacji.",
    image: img("photo-1556621266-45150d1e9f4b"),
    relatedSystemIds: ["ppoz-sciany"],
    specs: [...emptySpecs(), spec("fire", "Klasa odporności ogniowej")],
    variantNames: ["Jednoskrzydłowe", "Dwuskrzydłowe"],
  }),

  defineSystem({
    id: "ppoz-sciany",
    slug: "sciany-przeciwpozarowe",
    name: "Ściany przeciwpożarowe",
    manufacturerId: "aluprof",
    categoryId: "ppoz",
    applicationIds: ["komercyjne", "publiczne"],
    constructionTypeId: "stale",
    summary: "Przeszklone przegrody oddzielenia pożarowego",
    description:
      "Miejsce na system przeszklonych ścian o odporności ogniowej. Klasyfikacja do potwierdzenia.",
    image: img("photo-1584257354413-32f8603c40fe"),
    relatedSystemIds: ["ppoz-drzwi"],
    specs: [...emptySpecs(), spec("fire", "Klasa odporności ogniowej")],
    variantNames: ["Wewnętrzne", "Zewnętrzne"],
  }),

  defineSystem({
    id: "ogrod-zimowy",
    slug: "ogrody-zimowe",
    name: "Ogrody zimowe",
    manufacturerId: "aliplast",
    categoryId: "specjalne",
    applicationIds: ["mieszkaniowe"],
    constructionTypeId: "slupowo-ryglowe",
    summary: "Zabudowy przeszklone przy budynku",
    description:
      "Miejsce na system konstrukcji ogrodów zimowych. Rozpiętości i obciążenia do uzupełnienia.",
    image: img("photo-1768396856060-0e1feac4084e"),
    relatedSystemIds: ["swietliki", "pergole"],
    variantNames: ["Jednospadowy", "Wielospadowy"],
  }),

  defineSystem({
    id: "swietliki",
    slug: "swietliki-dachowe",
    name: "Świetliki dachowe",
    manufacturerId: "schueco",
    categoryId: "specjalne",
    applicationIds: ["komercyjne", "publiczne"],
    constructionTypeId: "slupowo-ryglowe",
    summary: "Doświetlenie od góry",
    description:
      "Miejsce na system świetlików i przekryć dachowych. Kąty nachylenia i obciążenia do uzupełnienia.",
    image: img("photo-1558455322-911adf441b5a"),
    relatedSystemIds: ["ogrod-zimowy"],
    variantNames: ["Pasmo świetlne", "Świetlik punktowy"],
  }),

  defineSystem({
    id: "pergole",
    slug: "pergole-aluminiowe",
    name: "Pergole aluminiowe",
    manufacturerId: "aliplast",
    categoryId: "specjalne",
    applicationIds: ["mieszkaniowe", "komercyjne"],
    constructionTypeId: "stale",
    summary: "Zadaszenia stref zewnętrznych",
    description: "Miejsce na system pergoli i zadaszeń tarasowych. Dane techniczne do uzupełnienia.",
    image: img("photo-1490656568362-e261fb612849"),
    relatedSystemIds: ["ogrod-zimowy"],
    variantNames: ["Stała", "Z regulowanymi lamelami"],
  }),

  defineSystem({
    id: "okucia",
    slug: "okucia-i-akcesoria",
    name: "Okucia i akcesoria",
    manufacturerId: "aluprof",
    categoryId: "akcesoria",
    applicationIds: ["mieszkaniowe", "komercyjne", "publiczne"],
    constructionTypeId: "rozwierne",
    summary: "Klamki, zawiasy, systemy ryglowania",
    description:
      "Miejsce na zestawienie okuć i akcesoriów dobieranych do konstrukcji. Dane do uzupełnienia.",
    image: img("photo-1759185301790-e079e2970809"),
    variantNames: ["Standardowe", "Antywłamaniowe", "Automatyka"],
  }),
];
