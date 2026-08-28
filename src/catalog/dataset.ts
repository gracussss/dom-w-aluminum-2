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

   Katalog systemów ALUPROF zebrany z publicznych kart systemów
   (aluprof.com/produkt/<slug>) oraz sekcji oferty (aluprof.com/pl/oferta).
   Przypisania do kategorii są takie, jak u producenta — dlatego jeden
   system bywa w kilku kategoriach naraz.

   Ten plik jest jedynym miejscem, gdzie żyją rekordy systemów.
   Docelowo zastępuje go odpowiedź z API/CMS — kontrakt (typy) zostaje
   bez zmian, komponenty nie wiedzą, skąd przyszły dane.

   ZASADA: żadna wartość techniczna bez pola `source`.
   Puste pole (`null`) jest poprawnym stanem i renderuje się jako
   „Do uzupełnienia”. Wartość bez źródła jest błędem, nie brakiem.

   CZEGO TU NIE MA I DLACZEGO:
   - zastosowanie budynkowe — producent go przy systemach nie podaje,
   - warianty — jw., karta systemu ich nie wylicza w sposób nadający się
     do przepisania,
   - głębokość zabudowy — poza nielicznymi systemami nie jest publikowana
     w bloku parametrów; zostaje jako pole puste,
   - przekroje i modele 3D — pliki są u producenta, ale ich publikacja
     wymaga pisemnej zgody (patrz MATERIALY.md).
   ------------------------------------------------------------------ */

/** Data pozyskania danych z kart systemów. */
const ACCESSED = "2026-08-28";

const ALUPROF = "https://aluprof.com/produkt/";

function source(aluprofSlug: string): DataSource {
  return {
    label: "aluprof.com — karta systemu",
    url: ALUPROF + aluprofSlug,
    accessedAt: ACCESSED,
  };
}

/**
 * Producent po pionowej kresce podaje raz JEDNOSTKĘ („Uf > 0,83 | W/(m2K)”),
 * a raz NORMĘ („klasa 4 | PN-EN 12207”). Rozdzielamy po treści: jednostka
 * dokleja się do wartości, norma trafia do własnego pola. Wrzucenie
 * jednostki w rubrykę normy dawałoby na karcie „W/(m2K)” jako podstawę
 * klasyfikacji — nieprawdę wyglądającą na dane techniczne.
 */
const STANDARD = /^(?:PN-)?EN[\s-]|^ASTM|^AAMA|^TAS\b/i;

function splitTail(raw: string): { value: string; standard: string | null } {
  const [head, ...rest] = raw.split("|");
  const tail = rest.join("|").trim();
  const value = head.trim();

  if (!tail) return { value, standard: null };
  if (STANDARD.test(tail)) return { value, standard: tail };
  return { value: `${value} ${tail}`, standard: null };
}

/* --------------------------- ZDJĘCIA --------------------------- */

function img(id: string, params = "w=1600&q=80&auto=format&fit=crop") {
  return "https://images.unsplash.com/" + id + "?" + params;
}

/**
 * Zdjęcia tymczasowe dobierane po kategorii wiodącej — własnych materiałów
 * firmy jeszcze nie ma, a 86 identycznych kadrów czytałoby się gorzej niż
 * kilka powtarzających się. Każde ma `placeholder: true` i widoczną etykietę.
 */
const CATEGORY_IMAGE: Record<string, string> = {
  okna: img("photo-1783125127082-3fb6c1bccd72"),
  drzwi: img("photo-1762134768304-88c5d735d611"),
  przesuwne: img("photo-1702724758750-9ff8d50f02e5"),
  fasady: img("photo-1523477593243-78bbf626fd3b"),
  wewnetrzne: img("photo-1522968941782-e27ac665baa3"),
  ppoz: img("photo-1556621266-45150d1e9f4b"),
  indywidualne: img("photo-1783705093954-a4d64bb7bf69"),
};

/* --------------------------- TYPY MODELI 3D --------------------------- */

const MODEL_BY_CATEGORY: Record<string, ModelType> = {
  okna: "okno",
  drzwi: "drzwi",
  przesuwne: "przesuwne",
  fasady: "fasada",
  wewnetrzne: "fasada",
  ppoz: "drzwi",
  indywidualne: "fasada",
};

/* ----------------------------- FABRYKA ----------------------------- */

interface SystemInput {
  /** Nasz identyfikator i slug. Bywa krótszy niż slug producenta. */
  id: string;
  name: string;
  /** Slug karty systemu u producenta — źródło danych i odnośnik. */
  aluprof: string;
  /** Podtytuł z karty systemu. Pusty, gdy producent go nie podaje. */
  summary: string;
  /** Kategorie w kolejności ważności; pierwsza jest wiodąca. */
  cats: string[];
  /** Typ konstrukcji wyprowadzony z podtytułu i kategorii producenta. */
  ct: string;
  tags?: string[];
  /** Parametry dokładnie jak na karcie: [etykieta, „wartość | jednostka albo norma”]. */
  specs?: [string, string][];
  /**
   * Głębokość zabudowy. Producent podaje ją w treści opisu, nie w bloku
   * parametrów, więc nie da się jej wyciągnąć razem z resztą — wpisujemy
   * osobno i tylko tam, gdzie faktycznie pada.
   */
  depth?: string;
}

function variants(names: string[]): SystemVariant[] {
  return names.map((name, i) => ({ id: String(i + 1).padStart(2, "0"), name, note: null }));
}

/** Stopień wypełnienia parametrów liczony z danych, nie deklarowany ręcznie. */
function specStatus(specs: SystemSpec[]): Verification {
  const filled = specs.filter((s) => s.value !== null).length;
  if (filled === 0) return "missing";
  return filled === specs.length ? "verified" : "partial";
}

function buildSpecs(input: SystemInput): SystemSpec[] {
  const src = source(input.aluprof);

  const fromManufacturer: SystemSpec[] = (input.specs ?? []).map(([label, raw], i) => {
    const { value, standard } = splitTail(raw);
    return { id: "p" + (i + 1), label, value, standard, source: src };
  });

  /* Głębokość zabudowy: wypełniona tam, gdzie producent ją podaje, w reszcie
     pusta. Jest kluczowa dla porównywania systemów i zasila geometrię sceny 3D. */
  return [
    ...fromManufacturer,
    {
      id: "depth",
      label: "Głębokość zabudowy",
      value: input.depth ?? null,
      standard: null,
      source: input.depth ? src : null,
    },
  ];
}

function defineSystem(input: SystemInput): AluSystem {
  const specs = buildSpecs(input);
  const lead = input.cats[0];
  const summary = input.summary.trim();

  return {
    id: input.id,
    slug: input.id,
    name: input.name,
    manufacturerId: "aluprof",
    categoryIds: input.cats,
    applicationIds: [],
    constructionTypeId: input.ct,
    tagIds: input.tags ?? [],

    summary: summary || "System z oferty ALUPROF",
    description: summary
      ? `${summary}. System z oferty ALUPROF — dane pochodzą z karty systemu u producenta.`
      : "System z oferty ALUPROF. Opis i parametry uzupełnimy na podstawie karty katalogowej producenta.",
    manufacturerUrl: ALUPROF + input.aluprof,

    media: {
      hero: {
        src: CATEGORY_IMAGE[lead] ?? CATEGORY_IMAGE.okna,
        alt: input.name,
        placeholder: true,
        credit: "Unsplash — materiał tymczasowy",
      },
      gallery: [],
    },

    crossSections: [],
    specs,
    variants: variants([]),
    documents: [],
    relatedSystemIds: [],

    pricing: { mode: "on-request", note: null },
    cta: [
      { id: "quote", label: "Zapytaj o wycenę", href: "/kontakt?system=" + input.id, kind: "quote" },
    ],

    model3d: { type: MODEL_BY_CATEGORY[lead] ?? null, url: null },

    dataStatus: {
      name: "confirmed",
      specs: specStatus(specs),
      crossSection: "missing",
      model3d: "missing",
      media: "stock",
      verifiedAt: ACCESSED,
      note: null,
    },
  };
}

/* ------------------------------ SYSTEMY ------------------------------ */

const INPUTS: SystemInput[] = [
  /* ------------------------------ OKNA ------------------------------ */
  {
    id: "mb-79n",
    name: "MB-79N",
    aluprof: "mb-79n",
    summary: "System okienno-drzwiowy z izolacją termiczną",
    cats: ["okna", "drzwi", "indywidualne"],
    ct: "rozwierne",
    specs: [
      ["Izolacyjność termiczna profili", "Uf > 0,83 | W/(m2K)"],
      ["Wodoszczelność okien", "E 1950"],
      ["Przepuszczalność powietrza", "klasa 4 | EN 12207:2001"],
    ],
  },
  {
    id: "mb-79n-reno",
    name: "MB-79N RENO",
    aluprof: "mb-79n-reno",
    summary: "Okna do renowacji budynków",
    cats: ["okna"],
    ct: "rozwierne",
    tags: ["renowacja"],
    specs: [
      ["Izolacyjność termiczna profili", "Uw > 1,2 | W/(m2K)"],
      ["Wodoszczelność okien", "od 600 Pa do 1950 Pa"],
      ["Przepuszczalność powietrza", "do klasy 4"],
    ],
  },
  {
    id: "mb-79n-mono",
    name: "MB-79N MONO",
    aluprof: "mb-79n-mono",
    summary: "Okna do nowego budownictwa",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Izolacyjność termiczna profili", "Uw > 1,2 | W/(m2K)"],
      ["Wodoszczelność okien", "od 600 Pa do 1950 Pa"],
      ["Przepuszczalność powietrza", "do klasy 4"],
    ],
  },
  {
    id: "mb-79n-co",
    name: "MB-79N CO",
    aluprof: "mb-79n-co",
    summary: 'Okna typu "CRANK-OUT" i "PUSH-OUT"',
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Zgodność z normą AAMA", "klasa CW50"],
      ["Przepuszczalność powietrza", "do 1.57 psf"],
      ["Wodoszczelność", "do 7.52 psf"],
    ],
  },
  {
    id: "mb-79n-ww",
    name: "MB-79N WW",
    aluprof: "mb-79n-ww",
    summary: "Okna elementowe",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "do 6.24 psf (49 mph)"],
      ["Wodoszczelność", "do 12 psf"],
      ["Odporność na dynamiczne działanie wody", "do 12 psf"],
    ],
  },
  {
    id: "mb-79n-csf",
    name: "MB-79N CSF",
    aluprof: "mb-79n-csf",
    summary: "Okna wąskoprofilowe",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Minimalna szerokość profili okna stałego", "35,2 mm"],
      ["Minimalna szerokość profili okna otwieranego", "60,5 mm"],
      ["Maksymalny ciężar skrzydła", "80 kg"],
    ],
  },
  {
    id: "mb-79n-us",
    name: "MB-79N US",
    aluprof: "mb-79n-us",
    summary: "Okna z ukrytym skrzydłem",
    cats: ["okna"],
    ct: "rozwierne",
  },
  {
    id: "mb-79n-casement",
    name: "MB-79N CASEMENT",
    aluprof: "mb-79n-casement",
    summary: "Okna otwierane na zewnątrz",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4"],
      ["Wodoszczelność", "klasa E 1800"],
      ["Izolacyjność termiczna", "Uw od 0,74 W/(m²K)"],
      ["Odporność na obciążenie wiatrem", "klasa C5/B5"],
    ],
  },
  {
    id: "mb-86n",
    name: "MB-86N",
    aluprof: "mb-86n",
    summary: "System okienno-drzwiowy z izolacją termiczną",
    cats: ["okna", "drzwi", "indywidualne"],
    ct: "rozwierne",
    /* „Profile o głębokości 86 mm” — z opisu na karcie systemu. */
    depth: "86 mm",
    specs: [
      ["Izolacyjność termiczna okna", "Uw od 0,62 | W(m2K)"],
      ["Przepuszczalność powietrza okna", "klasa 4 | PN-EN 12207"],
      ["Wodoszczelność okna", "klasa E 4800 Pa | PN-EN 12208"],
      ["Odporność na obciążenie wiatrem okna", "klasa C5 | PN-EN 12210"],
    ],
  },
  {
    id: "mb-86b",
    name: "MB-86B",
    aluprof: "mb-86b",
    summary: "",
    cats: ["okna", "drzwi"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4"],
      ["Wodoszczelność", "klasa 9A / 6A"],
      ["Odporność na obciążenie wiatrem", "klasa C5/B5"],
    ],
  },
  {
    id: "mb-86us",
    name: "MB-86US ST, SI",
    aluprof: "mb-86us-st-si",
    summary: "Okno z ukrytym skrzydłem",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Izolacyjność termiczna", "od 0,86 | W/(m2K)"],
      ["Przepuszczalność powietrza", "klasa 4 | PN-EN 12207:2001"],
      ["Wodoszczelność", "klasa E1350 | PN-EN 12208:2001"],
      ["Obciążenie wiatrem", "do klasy C5/B5 | PN-EN 12210:2001"],
    ],
  },
  {
    id: "mb-86-casement",
    name: "MB-86 Casement",
    aluprof: "mb-86-casement",
    summary: "Okna otwierane na zewnątrz",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4"],
      ["Wodoszczelność", "klasa E 1950"],
      ["Odporność na obciążenie wiatrem", "klasa C5"],
    ],
  },
  {
    id: "mb-104-passive",
    name: "MB-104 PASSIVE",
    aluprof: "mb-104-passive",
    summary: "System okienno-drzwiowy o najwyższej izolacji termicznej",
    cats: ["okna", "drzwi", "indywidualne"],
    ct: "rozwierne",
    tags: ["antywlamaniowe"],
    specs: [
      ["Izolacyjność termiczna dla okna otwieranego", "UW od 0,53 | W/(m2K)"],
      ["Odporność na obciążenie wiatrem", "klasa C5/B5 | PN-EN 12210:2001"],
      ["Wodoszczelność", "klasa AE 1800 | PN-EN 12208:2001"],
      ["Przepuszczalność powietrza", "klasa 4 | PN-EN 12207:2001"],
    ],
  },
  {
    id: "mb-slimline",
    name: "MB-SLIMLINE",
    aluprof: "mb-slimline",
    summary: "System okien o wąskich profilach",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4"],
      ["Wodoszczelność", "klasa E 1500"],
      ["Izolacyjność termiczna Uw", "z 0,8 | W/(m2K)"],
    ],
  },
  {
    id: "mb-ferroline",
    name: "MB-FERROLINE",
    aluprof: "mb-ferroline",
    summary: "System okien o wąskich profilach",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4 | PN-EN 12207"],
      ["Wodoszczelność", "klasa E1350 | EN 12208"],
      ["Obciążenie wiatrem", "do klasy C5 | EN 12210"],
      ["Klasa antywłamaniowa", "RC2"],
    ],
  },
  {
    id: "mb-70",
    name: "MB-70",
    aluprof: "mb-70",
    summary: "System okienno-drzwiowy z izolacją termiczną",
    cats: ["okna", "drzwi"],
    ct: "rozwierne",
    tags: ["antywlamaniowe"],
    specs: [
      ["Izolacyjność termiczna Uf", "> 1,5 | W/(m2K)"],
      ["Przepuszczalność powietrza", "klasa 4"],
      ["Wodoszczelność", "klasa E1200"],
      ["Odporność na obciążenie wiatrem", "klasa C5"],
    ],
  },
  {
    id: "mb-70b",
    name: "MB-70B",
    aluprof: "mb-70b",
    summary: "System okienno-drzwiowy",
    cats: ["okna", "drzwi"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4, EN 1026; EN 12207"],
      ["Odporność na obciążenie wiatrem", "do klasy C5, EN 12211; EN 12210"],
      ["Wodoszczelność", "9A, EN 1027; EN 12208"],
      ["Izolacyjność termiczna", "Uw od 0,8 W/(m2K)"],
    ],
  },
  {
    id: "mb-69v",
    name: "MB-69V",
    aluprof: "mb-69v",
    summary: "Okna i drzwi",
    cats: ["okna", "drzwi"],
    ct: "rozwierne",
    specs: [
      ["Maksymalna wysokość skrzydła okna i drzwi", "2700 mm"],
      ["Maksymalna szerokość skrzydła okna i drzwi", "1700 mm"],
      ["Maksymalny ciężar skrzydła", "160 kg"],
      ["Grubość szklenia", "5 – 52 mm"],
    ],
  },
  {
    id: "mb-45",
    name: "MB-45",
    aluprof: "mb-45",
    summary: "System okienno-drzwiowy bez izolacji termicznej",
    cats: ["okna", "drzwi", "wewnetrzne"],
    ct: "rozwierne",
    specs: [
      ["Max wymiary skrzydła drzwi (H×L)", "H do 2400 mm; L do 1250 mm"],
      ["Max ciężar skrzydła (drzwi / okna)", "120-130 kg"],
      ["Odporność na przenikanie wody", "580 Pa (12 psf)"],
    ],
  },
  {
    id: "mb-rw",
    name: "MB-RW",
    aluprof: "mb-rw",
    summary: "System okna dachowego",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4 (1300 Pa) | EN 12207"],
      ["Wodoszczelność", "E 1800 | EN 12208"],
      ["Odporność na uderzenie", "klasa 4 | EN 1873"],
      ["Izolacyjność termiczna Uf", ">1,8 | W/(m2K)"],
    ],
  },
  {
    id: "mb-sr50n-rw",
    name: "MB-SR50N RW",
    aluprof: "mb-sr50n-rw",
    summary: "Okno dachowe",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4 | EN 12207"],
      ["Wodoszczelność", "E 1800 | EN 12208"],
      ["Odporność na uderzenie", "klasa 4 | EN 1873"],
      ["Izolacyjność termiczna Uf", ">1,8 | W/(m2K)"],
    ],
  },
  {
    id: "mb-sr50n-iw",
    name: "MB-SR50N IW",
    aluprof: "mb-sr50n-iw",
    summary: "Okno otwierane do wewnątrz zintegrowane z fasadą",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Izolacyjność termiczna", "Uf od 1,68 | W/(m2K)"],
      ["Wodoszczelność", "E1500 | EN 122008"],
      ["Odporność na obciążenie wiatrem", "E2400 | EN 12210"],
      ["Odporność na uderzenie", "E5/I5"],
    ],
  },
  {
    id: "mb-sr50n-ow-hi",
    name: "MB-SR50N OW HI+",
    aluprof: "mb-sr50n-ow-hi",
    summary: "Okno odchylno-wysuwne otwierane na zewnątrz",
    cats: ["okna"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4 | EN 12207"],
      ["Wodoszczelność", "E 1950 | EN 12208"],
      ["Odporność na obciążenie wiatrem", "klasa B5 / C5 | EN 12210"],
      ["Izolacyjność termiczna", "UW<0,9 | W/(m2K)"],
    ],
  },
  {
    id: "mb-slider-window",
    name: "MB-SLIDER WINDOW",
    aluprof: "mb-slider-window",
    summary: "Systemy okien przesuwnych",
    cats: ["okna"],
    ct: "przesuwne",
    specs: [
      ["Maksymalny ciężar skrzydła przesuwnego w poziomie", "80 | kg"],
      ["Maksymalny ciężar skrzydła przesuwnego w pionie", "25,5 | kg"],
      ["Grubość szklenia", "4 do 10,5 | mm"],
    ],
  },
  {
    id: "mb-plyty",
    name: "MB-PŁYTY",
    aluprof: "mb-plyty",
    summary: "System zabudowy w płycie warstwowej",
    cats: ["okna"],
    ct: "stale",
    specs: [["Grubość płyt warstwowych objętych systemem", "od 60 do 250 mm"]],
  },
  {
    id: "mb-glass-barrier",
    name: "MB-GLASS BARRIER",
    aluprof: "mb-glass-barrier",
    summary: "Balustrada zewnętrzna",
    cats: ["okna"],
    ct: "stale",
    specs: [
      ["Grubość szkła", "od 8,8 do 20,8 mm"],
      ["Maksymalna szerokość szyby", "2600 mm"],
      ["Maksymalna wysokość szyby", "1200 mm"],
    ],
  },
  {
    id: "mb-installation-solution",
    name: "MB-INSTALLATION SOLUTION",
    aluprof: "mb-installation-solution",
    summary: "System ciepłego i szczelnego montażu okien i drzwi",
    cats: ["okna"],
    ct: "stale",
    specs: [
      ["Współczynnik przewodzenia ciepła polistyrenu EPS", "λ = 0,032 W/(m²K)"],
      ["Szerokość ciepłych belek montażowych", "100 lub 200 mm"],
    ],
  },

  /* ------------------------------ DRZWI ------------------------------ */
  {
    id: "mb-86n-pivot-door",
    name: "MB-86N Pivot Door",
    aluprof: "mb-86n-pivot-door",
    summary: "Drzwi zewnętrzne z przesuniętą osią obrotu",
    cats: ["drzwi"],
    ct: "rozwierne",
    specs: [
      ["Max. wymiary skrzydła", "2,0 x 3,4 m"],
      ["Izolacyjność termiczna", "UD od 0,73 (W/m2K)"],
      ["Przepuszczalność powietrza", "klasa 3"],
      ["Wodoszczelność", "klasa 3B"],
    ],
  },
  {
    id: "drzwi-panelowe",
    name: "Drzwi panelowe",
    aluprof: "drzwi-panelowe",
    summary: "Na bazie systemów MB-79N, MB-86N oraz MB-104 Passive",
    cats: ["drzwi"],
    ct: "rozwierne",
    specs: [
      ["Izolacyjność termiczna UD", "od 0,44 | W/(m2K)"],
      ["Wodoszczelność", "> klasy E900 (900 Pa)"],
      ["Przepuszczalność powietrza", "klasa 4 | PN-EN 12207:2001"],
      ["Obciążenie wiatrem", "> klasy C5/B5 | PN-EN 12210:2001"],
    ],
  },
  {
    id: "mb-100gft",
    name: "MB-100GFT",
    aluprof: "mb-100gft",
    summary: "System drzwi do galerii handlowych, urzędów i restauracji",
    cats: ["drzwi"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "do klasy 3 (600Pa), EN 12207"],
      ["Wodoszczelność", "klasa 4A (150Pa), EN 12208"],
      ["Odporność na obciążenie wiatrem", "do klasy C2/B4/A5, EN 12210"],
      ["Odporność na wielokrotne otwieranie i zamykanie", "klasa 8, 1 000 000 cykli (w obu kierunkach), EN 12400"],
    ],
  },
  {
    id: "mb-60e",
    name: "MB-60E, MB-60E HI",
    aluprof: "mb-60e-mb-60e-hi",
    summary: "System drzwi ekonomicznych izolowanych termicznie",
    cats: ["drzwi"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 3"],
      ["Wodoszczelność", "klasa E1200"],
      ["Odporność na obciążenie wiatrem", "klasa C1"],
      ["Odporność na uderzenie", "klasa 3"],
    ],
  },
  {
    id: "mb-45s",
    name: "MB-45S",
    aluprof: "mb-45s",
    summary: "System drzwi wrębowych bez izolacji termicznej",
    cats: ["drzwi"],
    ct: "rozwierne",
    specs: [
      ["Max ciężar skrzydła (drzwi / okna)", "130 | kg"],
      ["Max wymiary skrzydła drzwi (H×L)", "H do 2400 mm; L do 1250 mm"],
    ],
  },
  {
    id: "mb-45-office",
    name: "MB-45 OFFICE",
    aluprof: "mb-45-office",
    summary: "System stałych i otwieranych ścian działowych",
    cats: ["wewnetrzne", "drzwi"],
    ct: "rozwierne",
  },

  /* --------------------------- PRZESUWNE --------------------------- */
  {
    id: "mb-77hs",
    name: "MB-77HS",
    aluprof: "mb-77hs",
    summary: "Drzwi balkonowe podnoszono-przesuwne",
    cats: ["przesuwne", "drzwi"],
    ct: "przesuwne",
    tags: ["antywlamaniowe"],
    specs: [
      ["Przepuszczalność powietrza", "klasa 4 | PN-EN 12207"],
      ["Wodoszczelność", "klasa 9A | EN 12208"],
      ["Izolacyjność termiczna UW", "> 0,84 | W/(m2K)"],
      ["Odporność na obciążenie wiatrem", "do klasy C4 | EN 12210"],
    ],
  },
  {
    id: "mb-77hsb",
    name: "MB-77HSB",
    aluprof: "mb-77hsb",
    summary: "Drzwi balkonowe podnoszono-przesuwne",
    cats: ["przesuwne", "drzwi"],
    ct: "przesuwne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4 | PN-EN 12207"],
      ["Wodoszczelność", "klasa 9A | EN 12208"],
      ["Uw", "> 0,88 | W/(m2K)"],
      ["Odporność na obciążenie wiatrem", "do klasy C2 | EN 12210"],
    ],
  },
  {
    id: "mb-82hs",
    name: "MB-82HS",
    aluprof: "mb-82hs",
    summary: "Drzwi tarasowe podnoszono-przesuwne",
    cats: ["przesuwne"],
    ct: "przesuwne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 4 | PN-EN 12207"],
      ["Wodoszczelność", "od 750 Pa do 1800 Pa | EN 12208"],
      ["Odporność na obciążenie wiatrem", "od 1200 Pa do 2400 Pa | EN 12210"],
      ["Izolacyjność termiczna UW", "od 0,62 | W/(m2K)"],
    ],
  },
  {
    id: "mb-59hs",
    name: "MB-59HS",
    aluprof: "mb-59hs",
    summary: "System drzwi podnoszono-przesuwnych",
    cats: ["przesuwne", "drzwi"],
    ct: "przesuwne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 3 | PN-EN 12207"],
      ["Obciążenie wiatrem", "klasa C3 | PN-EN 12210"],
      ["Izolacyjność termiczna Uf", "> 1,8 | W/(m2K)"],
      ["Wodoszczelność", "do klasy 9A (600 Pa), EN 12208"],
    ],
  },
  {
    id: "mb-59-slide",
    name: "MB-59 SLIDE",
    aluprof: "mb-59-slide",
    summary: "System drzwi balkonowych przesuwnych",
    cats: ["przesuwne", "drzwi"],
    ct: "przesuwne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 3 | PN-EN 12207"],
      ["Wodoszczelność", "klasa 6A | PN-EN 12208:2001"],
      ["Obciążenie wiatrem", "klasa C3 | PN-EN 12210:2001"],
      ["Izolacyjność termiczna Uf", "> 1,9 | W/(m2K)"],
    ],
  },
  {
    id: "mb-59-slide-galandage",
    name: "MB-59 SLIDE GALANDAGE",
    aluprof: "mb-59-slide-galandage",
    summary: "System drzwi balkonowych przesuwnych",
    cats: ["przesuwne", "drzwi"],
    ct: "przesuwne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 3 | PN-EN 12207:2001"],
      ["Wodoszczelność", "klasa 5A | PN-EN 12208:2001"],
      ["Obciążenie wiatrem", "klasa C2 / B2 | PN-EN 12210:2016"],
      ["Izolacyjność termiczna Uf", "od 1,9 | W/(m2K)"],
    ],
  },
  {
    id: "mb-skyline",
    name: "MB-SKYLINE",
    aluprof: "mb-skyline",
    summary: "Drzwi przesuwne z ukrytą ramą",
    cats: ["przesuwne"],
    ct: "przesuwne",
    specs: [
      ["Przepuszczalność powietrza", "klasa 3 | EN 12207"],
      ["Wodoszczelność", "do klasy 9A (600Pa) | EN 12208"],
      ["Odporność na obciążenie wiatrem", "do klasy C5 (2000Pa) | EN 12210"],
      ["Izolacyjność termiczna", "UW od 0,85 | W/(m2K)"],
    ],
  },
  {
    id: "mb-skyline-type-r",
    name: "MB-SKYLINE TYPE R",
    aluprof: "mb-skyline-type-r",
    summary: "Drzwi przesuwne z ukrytą ramą",
    cats: ["przesuwne", "drzwi"],
    ct: "przesuwne",
    specs: [
      ["Maksymalny ciężar skrzydła", "1200 kg"],
      ["Maksymalna wysokość drzwi", "4 m"],
      ["Szerokość słupka na połączeniu skrzydeł", "25 mm"],
      ["Głębokość ościeżnicy", "23 mm"],
    ],
  },
  {
    id: "mb-skyline-type-s",
    name: "MB-SKYLINE TYPE S",
    aluprof: "mb-skyline-type-s",
    summary: "Drzwi przesuwne wąskoprofilowe",
    cats: ["przesuwne"],
    ct: "przesuwne",
    specs: [
      ["Maksymalny ciężar skrzydła", "750 kg"],
      ["Maksymalna wysokość drzwi", "4 m"],
      ["Szerokość słupka na połączeniu skrzydeł", "25 mm"],
    ],
  },
  {
    id: "mb-86-fold-line-hd",
    name: "MB-86 FOLD LINE HD",
    aluprof: "mb-86-fold-line-hd",
    summary: "Drzwi harmonijkowe",
    cats: ["przesuwne"],
    ct: "przesuwne",
    specs: [
      ["Maksymalny ciężar skrzydła", "120 kg"],
      ["Maksymalna wysokość drzwi", "3,0 m"],
      ["Maksymalna szerokość skrzydła drzwi", "1,2 m"],
    ],
  },
  {
    id: "mb-43-slide-reno",
    name: "MB-43 SLIDE RENO",
    aluprof: "mb-43-slide-reno",
    summary: "Przesuwne drzwi tarasowe do renowacji budynków",
    cats: ["przesuwne"],
    ct: "przesuwne",
    tags: ["renowacja"],
    specs: [
      ["Izolacyjność termiczna profili", "Uw > 1,4 | W/(m2K)"],
      ["Wodoszczelność okien", "Klasa E 250"],
      ["Przepuszczalność powietrza", "Klasa 3"],
    ],
  },
  {
    id: "mb-43-slide-mono",
    name: "MB-43 SLIDE MONO",
    aluprof: "mb-43-slide-mono",
    summary: "Przesuwne drzwi tarasowe",
    cats: ["przesuwne"],
    ct: "przesuwne",
    specs: [
      ["Izolacyjność termiczna profili", "Uw > 1,2 | W/(m2K)"],
      ["Wodoszczelność okien", "Klasa E 250"],
      ["Przepuszczalność powietrza", "Klasa 3"],
    ],
  },
  {
    id: "mb-37-slide-storm",
    name: "MB-37 SLIDE STORM",
    aluprof: "mb-37-slide-storm",
    summary: "Drzwi balkonowe przesuwne z odpornością na huragan",
    cats: ["przesuwne"],
    ct: "przesuwne",
    specs: [
      ["Przepuszczalność powietrza", "0.30 cfm/ft2K) | ASTM E283, TAS 202-94"],
      ["Wodoszczelność", "12 psf | ASTM E331, TAS 202-9"],
      ["Odporność na statyczne ciśnienie powietrza", "±60 psf / ±90 psf | ASTM E330, TAS 202-94"],
      ["Odporność na uderzenie", "Klasa 10, ASTM F588, TAS 202-94"],
    ],
  },
  {
    id: "mb-50v-slide",
    name: "MB-50V SLIDE",
    aluprof: "mb-50v-slide",
    summary: "Drzwi tarasowe przesuwne",
    cats: ["przesuwne"],
    ct: "przesuwne",
    specs: [
      ["Maksymalny wymiar skrzydła", "3000 x 3000 mm"],
      ["Maksymalny ciężar skrzydła", "220 kg"],
      ["Grubość szklenia", "4 – 34 mm"],
    ],
  },
  {
    id: "mb-slide",
    name: "MB-Slide, MB-Slide ST",
    aluprof: "mb-slide-mb-slide-st",
    summary: "Okna i drzwi przesuwne",
    cats: ["przesuwne"],
    ct: "przesuwne",
  },
  {
    id: "mb-dpa",
    name: "MB-DPA",
    aluprof: "mb-dpa",
    summary: "Drzwi przesuwne, automatycznie i manualnie",
    cats: ["przesuwne"],
    ct: "przesuwne",
    specs: [
      ["max. szerokość skrzydła drzwi", "3,0 m"],
      ["max. ciężar skrzydła drzwi", "200 kg"],
    ],
  },
  {
    id: "mb-openslide",
    name: "OpenSlide",
    aluprof: "mb-openslide",
    summary: "Całoszklana zabudowa przesuwna do pergoli, tarasów i loggii",
    cats: ["przesuwne"],
    ct: "przesuwne",
  },

  /* ----------------------------- FASADY ----------------------------- */
  {
    id: "mb-sr50n",
    name: "MB-SR50N",
    aluprof: "mb-sr50n",
    summary: "Ściana słupowo-ryglowa",
    cats: ["fasady"],
    ct: "slupowo-ryglowe",
    tags: ["antywlamaniowe"],
    specs: [
      ["Izolacyjność termiczna Uf", "od 0,6 | W/(m2K)"],
      ["Przepuszczalność powietrza", "AE 1200"],
      ["Wodoszczelność", "RE 1200 | EN 12154"],
      ["Odporność na uderzenie", "I5/E5 | EN 14019"],
    ],
  },
  {
    id: "mb-sr50n-hi",
    name: "MB-SR50N HI",
    aluprof: "mb-sr50n-hi",
    summary: "Ściana słupowo-ryglowa o podwyższonej izolacyjności termicznej",
    cats: ["fasady"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Przepuszczalność powietrza", "AE 1200"],
      ["Wodoszczelność", "RE 1500 | EN 12154"],
      ["Odporność na uderzenie", "I5/E5 | EN 14019"],
      ["Izolacyjność termiczna Uf", ">0,85 | W/(m2K)"],
    ],
  },
  {
    id: "mb-sr50n-hi-plus",
    name: "MB-SR50N HI+",
    aluprof: "mb-sr50n-hi-plus",
    summary: "Ściana słupowo-ryglowa o wysokiej izolacyjności termicznej",
    cats: ["fasady", "indywidualne"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Przepuszczalność powietrza", "AE 1200 Pa"],
      ["Wodoszczelność", "RE 1200 Pa | EN 12154"],
      ["Odporność na uderzenie", "I5/E5 | EN 14019"],
      ["Izolacyjność termiczna", "Uf od 0,59 | W/(m2K)"],
    ],
  },
  {
    id: "mb-sr50n-efekt",
    name: "MB-SR50N EFEKT",
    aluprof: "mb-sr50n-efektmb-sr50n-efekt",
    summary: "Fasada półstrukturalna",
    cats: ["fasady"],
    ct: "strukturalne",
    specs: [
      ["Przepuszczalność powietrza", "AE 1200 Pa"],
      ["Wodoszczelność", "RE 1200 Pa | EN 12154"],
      ["Odporność na uderzenie", "I5/E5 | EN 14019"],
      ["Odporność na obciążenie wiatrem", "do 2400 Pa"],
    ],
  },
  {
    id: "mb-sr50n-a",
    name: "MB-SR50N A",
    aluprof: "mb-sr50n-a",
    summary: "System nakładkowy na drewno i stal",
    cats: ["fasady"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Szklenie zestawami przeziernymi o grubości", "24-64 | mm"],
      ["Maksymalny ciężar wypełnienia", "do 600 | kg"],
      ["Izolacyjność termiczna", "Uf od 0,72 | W/(m2K)"],
    ],
  },
  {
    id: "mb-sr50n-pl",
    name: "MB-SR50N PL",
    aluprof: "mb-sr50n-pl",
    summary: "Fasada w układzie poziomych linii",
    cats: ["fasady"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Przepuszczalność powietrza", "klasa AE | PN-EN 12152"],
      ["Wodoszczelność", "RE 1200 | EN 12154"],
      ["Odporność na obciążenie wiatrem", "2,4 | kN/m2"],
      ["Odporność na uderzenie", "klasa I5/E5 | EN 14019"],
    ],
  },
  {
    id: "mb-sr50n-zs",
    name: "MB-SR50N ZS",
    aluprof: "mb-sr50n-zs",
    summary: "System fasadowy kompatybilny z żaluzjami SkyFlow",
    cats: ["fasady"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Przepuszczalność powietrza", "klasa AE1200 | Pa"],
      ["Wodoszczelność", "klasa RE1200 | Pa"],
      ["Odporność na obciążenie wiatrem", "2,4 | kN/m2"],
    ],
  },
  {
    id: "mb-sr50n-pv",
    name: "MB-SR50N PV",
    aluprof: "mb-sr50n-pv",
    summary: "Fasada zintegrowana z instalacją fotowoltaiczną",
    cats: ["fasady"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Przepuszczalność powietrza", "AE 1200 Pa"],
      ["Wodoszczelność", "RE 1200 Pa"],
      ["Odporność na obciążenie wiatrem", "2400 Pa"],
      ["Izolacyjność termiczna", "Uf od 1,13 W/(m2K)"],
    ],
  },
  {
    id: "mb-sr50n-ei",
    name: "MB-SR50N EI, MB-SR50N EI EFEKT",
    aluprof: "mb-sr50n-eibrmb-sr50n-ei-efekt",
    summary: "Ściana słupowo-ryglowa przeciwpożarowa",
    cats: ["ppoz", "fasady"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Przepuszczalność powietrza", "klasa AE 1050 Pa | PN-EN 12152"],
      ["Wodoszczelność", "klasa RE1200 | PN-EN 12154"],
      ["Izolacyjność termiczna Uf", ">1,8 | W/(m2K)"],
      ["Klasy odporności ogniowej", "EI30 oraz EI60 | EN 13501-2"],
    ],
  },
  {
    id: "mb-sr60n",
    name: "MB-SR60N, MB-SR60N HI",
    aluprof: "mb-sr60n-brmb-sr60n-hi",
    summary: "Ściana słupowo-ryglowa",
    cats: ["fasady"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Przepuszczalność powietrza", "do AE 1350 | EN 12152"],
      ["Wodoszczelność", "do RE 1500 | EN 12154"],
      ["Odporność na obciążenie wiatrem", "2,4 kN/m | EN 13116"],
      ["Odporność na uderzenie", "I5/E5 | EN 14019"],
    ],
  },
  {
    id: "mb-mt50n",
    name: "MB-MT50N",
    aluprof: "mb-mt50n",
    summary: "Ściana słupowo-ryglowa o wysokiej izolacyjności termicznej",
    cats: ["fasady", "indywidualne"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Przepuszczalność powietrza", "AE 1950 Pa"],
      ["Wodoszczelność", "RE 1950 Pa"],
      ["Odporność na obciążenie wiatrem", "3000 Pa"],
      ["Izolacyjność termiczna", "Uf od 0,55 W/(m2K)"],
    ],
  },
  {
    id: "mb-mm50n",
    name: "MB-MM50N",
    aluprof: "mb-mm50n",
    summary: "Ściana słupowo-ryglowa o wysokiej izolacyjności termicznej",
    cats: ["fasady"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Przepuszczalność powietrza", "AE 1200 | Pa"],
      ["Wodoszczelność", "RE 1200 | Pa"],
      ["Odporność na obciążenie wiatrem", "2400 | Pa"],
      ["Izolacyjność termiczna", "Uf > 0,62 | W/(m2K)"],
    ],
  },
  {
    id: "mb-se65",
    name: "MB-SE65",
    aluprof: "mb-se65",
    summary: "Fasada elementowa",
    cats: ["fasady"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Przepuszczalność powietrza", "AE 1200 Pa"],
      ["Wodoszczelność", "RE 1200 Pa"],
      ["Odporność na obciążenie wiatrem", "±2000 Pa"],
      ["Izolacyjność termiczna", "UCW < 0,9 W/(m²K)"],
    ],
  },
  {
    id: "mb-wg60",
    name: "MB-WG60",
    aluprof: "mb-wg60",
    summary: "System ogrodów zimowych",
    cats: ["fasady"],
    ct: "slupowo-ryglowe",
    specs: [["Pochylenie dachu", "od 5 do 45 st."]],
  },
  {
    id: "mb-sunprof",
    name: "MB-SUNPROF",
    aluprof: "mb-sunprof",
    summary: "Żaluzje fasadowe",
    cats: ["fasady"],
    ct: "stale",
    specs: [
      ["Kąt pochylenia żaluzji", "od 0 do 45 st."],
      ["Szerokość profili żaluzji", "od 100 do 300 mm"],
    ],
  },
  {
    id: "earthline",
    name: "EARTHLINE",
    aluprof: "earthline",
    summary: "Lamele elewacyjne",
    cats: ["fasady"],
    ct: "stale",
    specs: [
      ["Szerokość lameli w wariancie pionowym", "30 mm lub 90 mm"],
      ["Szerokość lameli w wariancie poziomym", "45 mm"],
      ["Wysokość lameli", "19,5 mm lub 40,5 mm"],
    ],
  },

  /* ------------------------ ŚCIANY WEWNĘTRZNE ------------------------ */
  {
    id: "mb-harmony-office",
    name: "MB-HARMONY OFFICE",
    aluprof: "mb-harmony-office",
    summary: "Systemy ścian wewnętrznych",
    cats: ["wewnetrzne"],
    ct: "stale",
    specs: [
      ["Izolacyjność akustyczna", "Rw 48 dB/ Ra1 46 dB"],
      ["Wysokość", "do 3600 mm"],
    ],
  },
  {
    id: "mb-80-office",
    name: "MB-80 OFFICE",
    aluprof: "mb-80-office",
    summary: "System ścian działowych",
    cats: ["wewnetrzne"],
    ct: "stale",
    specs: [
      ["Grubość ścian działowych", "80 mm oraz 92 mm"],
      ["Grubość wypełnień (szyb lub płyt)", "4-18 mm"],
      ["Izolacyjność akustyczna", "do 50dB"],
    ],
  },

  /* --------------------------- PRZECIWPOŻAROWE --------------------------- */
  {
    id: "mb-78ei",
    name: "MB-78EI",
    aluprof: "mb-78ei",
    summary: "Przegrody przeciwpożarowe z drzwiami w klasach EI15 do EI90",
    cats: ["ppoz", "drzwi", "wewnetrzne"],
    ct: "rozwierne",
    specs: [
      ["Klasy odporności ogniowej", "od EI 15 do EI 90 | EN 13501-2:2016-07"],
      ["Dymoszczelność", "Sa3 , S200 | EN 13501-2:2016-07"],
      ["Izolacyjność akustyczna", "RW do 41dB"],
      ["Samozamykalność", "C5 | EN 1191:2013-06"],
    ],
  },
  {
    id: "mb-78ei-dpa",
    name: "MB-78EI DPA",
    aluprof: "mb-78ei-dpa",
    summary: "Automatyczne przeciwpożarowe drzwi przesuwne",
    cats: ["ppoz", "drzwi"],
    ct: "przesuwne",
    specs: [
      ["Izolacyjność termiczna Uf", "> 1,62 | W/(m2K)"],
      ["Klasy przeciwpożarowe", "EI15, EI30"],
    ],
  },
  {
    id: "mb-86ei",
    name: "MB-86EI",
    aluprof: "mb-86ei",
    summary: "Okna, drzwi i ścianki przeciwpożarowe klasy EI15, EW30, EI30",
    cats: ["ppoz", "drzwi"],
    ct: "rozwierne",
    specs: [
      ["Wodoszczelność", "klasa E 1500 Pa | EN 12208"],
      ["Izolacyjność termiczna", "Uw od 0,86 | W/(m2K)"],
      ["Przepuszczalność powietrza", "klasa 4 | EN 12207"],
      ["Odporność ogniowa", "klasa EI30 | EN 13501-2:2016-07"],
    ],
  },
  {
    id: "mb-86n-ei",
    name: "MB-86N EI",
    aluprof: "mb-86n-ei",
    summary: "Okna, drzwi i ścianki przeciwpożarowe klasy EI15, EW30, EI30, drzwi klasy EI60",
    cats: ["ppoz"],
    ct: "rozwierne",
    specs: [
      ["Wodoszczelność", "klasa E 1500 Pa | EN 12208"],
      ["Izolacyjność termiczna", "Uw od 0,86 | W/(m2K)"],
      ["Przepuszczalność powietrza", "klasa 4 | EN 12207"],
      ["Odporność ogniowa", "klasa EI30 | EN 13501-2:2016-07"],
    ],
  },
  {
    id: "mb-118ei",
    name: "MB-118EI",
    aluprof: "mb-118ei",
    summary: "Przegrody przeciwpożarowe w klasie EI120",
    cats: ["ppoz"],
    ct: "rozwierne",
    specs: [
      ["Przepuszczalność powietrza", "klasa A4"],
      ["Wodoszczelność", "klasa RE 750"],
      ["Odporność ogniowa", "klasa EI120"],
    ],
  },
  {
    id: "mb-60e-ei",
    name: "MB-60E EI",
    aluprof: "mb-60e-ei",
    summary: "Przegrody przeciwpożarowe z drzwiami w klasie EI30",
    cats: ["ppoz"],
    ct: "rozwierne",
    specs: [
      ["Konstrukcje w klasach", "EI30 | EN 13501-2"],
      ["Dymoszczelność", "Sa3 , S200 | EN 13501-2"],
      ["Samozamykalność", "C5 | EN 1191"],
    ],
  },
  {
    id: "przeszklone-dachy-przeciwpozarowe",
    name: "Przeszklone dachy przeciwpożarowe",
    aluprof: "przeszklone-dachy-przeciwpozarowe",
    summary: "",
    cats: ["ppoz"],
    ct: "slupowo-ryglowe",
    specs: [
      ["Odporność ogniowa", "klasa REI30, RE45"],
      ["Pochylenie dachu", "5°- 75°"],
      ["Max wymiar szyb", "1250 mm x 3250 mm"],
    ],
  },
  {
    id: "okna-i-klapy-oddymiajace",
    name: "Okna i klapy oddymiające",
    aluprof: "okna-i-klapy-oddymiajace",
    summary: "Klapy, świetliki przeciwpożarowe",
    cats: ["ppoz", "okna"],
    ct: "rozwierne",
    specs: [
      ["Wymiary maksymalne skrzydła okna (układ poziomy)", "L do 2500 mm, H do 1600 mm"],
      ["Wymiary maksymalne skrzydła okna (układ pionowy)", "L do 1600 mm, H do 2500 mm"],
      ["Wymiary max. skrzydła okna dachowego", "L do 1500 mm, H do 2200 mm"],
    ],
  },

  /* ---------------------- ROZWIĄZANIA INDYWIDUALNE ---------------------- */
  {
    id: "mb-se80-sg",
    name: "MB-SE80 SG",
    aluprof: "mb-se80-sg",
    summary: "Fasada elementowa",
    cats: ["indywidualne"],
    ct: "strukturalne",
    specs: [
      ["Przepuszczalność powietrza", "klasa AE 1200 Pa"],
      ["Odporność na obciążenie wiatrem", "1676 Pa"],
      ["Wodoszczelność", "RE 1436 Pa"],
    ],
  },
  {
    id: "mb-se80-sg-ww",
    name: "MB-SE80 SG WW",
    aluprof: "mb-se80-sg-ww",
    summary: "Fasada elementowa strukturalna",
    cats: ["indywidualne"],
    ct: "strukturalne",
    specs: [
      ["Przepuszczalność powietrza", "klasa AE 1200 Pa"],
      ["Wodoszczelność", "RE 1500Pa"],
      ["Odporność na obciążenie wiatrem", "1500Pa"],
      ["Odporność na uderzenie", "klasa I5/E5"],
    ],
  },
  {
    id: "mb-se80-mlt",
    name: "MB-SE80 MLT",
    aluprof: "mb-se80-mlt",
    summary: "Ściana elementowa",
    cats: ["indywidualne"],
    ct: "strukturalne",
    specs: [
      ["Przepuszczalność powietrza", "klasa AE, 6.24 psf (300 Pa)"],
      ["Wodoszczelność", "RE 1200, 15psf"],
      ["Odporność na obciążenie wiatrem", "+/- 2250 Pa, +/- 48psf"],
    ],
  },
  {
    id: "mb-se85-sg",
    name: "MB-SE85 SG",
    aluprof: "mb-se85-sg",
    summary: "Fasada elementowa strukturalna",
    cats: ["indywidualne"],
    ct: "strukturalne",
    specs: [
      ["Przepuszczalność powietrza", "klasa AE 1200 Pa"],
      ["Wodoszczelność", "klasa RE 1200 Pa"],
      ["Odporność na obciążenie wiatrem", "3000 Pa"],
      ["Odporność na uderzenie", "klasa I5/E5"],
    ],
  },
  {
    id: "mb-se90-sg",
    name: "MB-SE90 SG",
    aluprof: "mb-se90-sg",
    summary: "Fasada elementowa strukturalna",
    cats: ["indywidualne"],
    ct: "strukturalne",
    specs: [
      ["Przepuszczalność powietrza", "klasa A4 (600 Pa)"],
      ["Wodoszczelność", "klasa RE 1200"],
      ["Odporność na obciążenie wiatrem", "±2000 Pa"],
      ["Odporność na uderzenie", "klasa I5/E5"],
    ],
  },
  {
    id: "mb-se98-sg",
    name: "MB-SE98 SG",
    aluprof: "mb-se98-sg",
    summary: "Fasada elementowa",
    cats: ["indywidualne"],
    ct: "strukturalne",
    specs: [
      ["Przepuszczalność powietrza", "6.24psf (298 Pa)"],
      ["Wodoszczelność", "15psf"],
      ["Odporność na obciążenie wiatrem", "±50/-100 psf (+2394/-4788 Pa)"],
    ],
  },
  {
    id: "mb-se155-sg",
    name: "MB-SE155 SG",
    aluprof: "mb-se155-sg",
    summary: "Fasada elementowa",
    cats: ["indywidualne"],
    ct: "strukturalne",
    specs: [
      ["Przepuszczalność powietrza", "6.24 psf"],
      ["Wodoszczelność", "15 psf; 5 gph/ft2 15 min"],
      ["Odporność na obciążenie wiatrem", "30 psf"],
    ],
  },
  {
    id: "mb-sg60",
    name: "MB-SG60",
    aluprof: "mb-sg60",
    summary: "",
    cats: ["indywidualne"],
    ct: "strukturalne",
    specs: [["Izolacyjność termiczna Uf", "1,64 | W/(m2K)"]],
  },
  {
    id: "mb-sr60-ny",
    name: "MB-SR60 NY",
    aluprof: "mb-sr60-ny",
    summary: "Fasada słupowo-ryglowa",
    cats: ["indywidualne"],
    ct: "slupowo-ryglowe",
  },
  {
    id: "mb-sr100-sr80",
    name: "MB-SR100 i MB-SR80",
    aluprof: "mb-sr100-mb-sr80",
    summary: "",
    cats: ["indywidualne"],
    ct: "slupowo-ryglowe",
    specs: [["Izolacyjność termiczna Uf", "≤2,8 | W/(m2K)"]],
  },
];

/**
 * Systemy powiązane liczone z nazw: „MB-79N RENO” i „MB-79N MONO” należą
 * do rodziny „MB-79N”. To wynik z oznaczeń producenta, nie nasza ocena
 * podobieństwa — dlatego można je wyliczyć, zamiast wpisywać ręcznie.
 */
function familyKey(name: string): string {
  return name.split(/[\s,]+/)[0];
}

function withRelated(list: AluSystem[]): AluSystem[] {
  const byFamily = new Map<string, AluSystem[]>();
  for (const system of list) {
    const key = familyKey(system.name);
    byFamily.set(key, [...(byFamily.get(key) ?? []), system]);
  }

  return list.map((system) => ({
    ...system,
    relatedSystemIds: (byFamily.get(familyKey(system.name)) ?? [])
      .filter((other) => other.id !== system.id)
      .slice(0, 4)
      .map((other) => other.id),
  }));
}

export const systems: AluSystem[] = withRelated(INPUTS.map(defineSystem));
