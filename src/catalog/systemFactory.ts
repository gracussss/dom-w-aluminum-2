import { PHOTO_TONE } from "../lib/responsiveImage";
import type {
  AluSystem,
  CrossSectionKind,
  CrossSectionRef,
  DataSource,
  ModelType,
  SystemSpec,
  SystemVariant,
  Verification,
} from "./types";

/* ------------------------------------------------------------------
   FABRYKA SYSTEMÓW — Z ZAPISU W PANELU DO MODELU KATALOGU

   Każdy system to jeden plik src/content/systemy/<id>.json, edytowany
   w panelu (/admin → „Katalog systemów”). Plik zawiera tylko to, co
   podaje producent na karcie systemu; reszta modelu (źródło każdej
   wartości, status danych, zdjęcie zastępcze, typ modelu 3D) wynika
   z tych pól tutaj — nie da się jej wpisać ręcznie „na oko”.

   Czysta funkcja, bez I/O: te same pliki czyta strona (import.meta.glob
   w dataset.ts) i vite.config.ts (sitemapa, przez fs).

   ZASADA: żadna wartość techniczna bez źródła. Domyślnym źródłem jest
   karta systemu u producenta (adres z pola `aluprof`) z datą sprawdzenia
   (`sourceDate`). Wartość przepisana z innego dokumentu (katalog
   techniczny ze strefy partnera, rysunek) ma przy sobie nazwę tego
   dokumentu — inaczej podpis przypisałby ją karcie, na której jej nie ma.
   ------------------------------------------------------------------ */

const ALUPROF = "https://aluprof.com/produkt/";

/** Data pozyskania danych z kart systemów — gdy w pliku jej brakuje. */
export const DEFAULT_SOURCE_DATE = "2026-08-28";

function source(aluprofSlug: string, accessedAt: string): DataSource {
  return {
    label: "aluprof.com – karta systemu",
    url: ALUPROF + aluprofSlug,
    accessedAt,
  };
}

/**
 * Dokument wskazany w panelu przy wartości albo rysunku. Bez adresu:
 * katalogi techniczne leżą w strefie partnera, do której czytelnik strony
 * nie ma dostępu — link prowadziłby do ekranu logowania.
 */
function documentSource(label: string, fallback: DataSource): DataSource {
  return label ? { label, url: null, accessedAt: fallback.accessedAt } : fallback;
}

/**
 * Producent po pionowej kresce podaje raz JEDNOSTKĘ („Uf > 0,83 | W/(m2K)”),
 * a raz NORMĘ („klasa 4 | PN-EN 12207”). Rozdzielamy po treści: jednostka
 * dokleja się do wartości, norma trafia do własnego pola. Wrzucenie
 * jednostki w rubrykę normy dawałoby na karcie „W/(m2K)” jako podstawę
 * klasyfikacji — nieprawdę wyglądającą na dane techniczne.
 *
 * W panelu to dwa pola: „Wartość” i „Jednostka lub norma”.
 */
const STANDARD = /^(?:PN-)?EN[\s-]|^ASTM|^AAMA|^TAS\b/i;

function splitNote(value: string, note: string): { value: string; standard: string | null } {
  if (!note) return { value, standard: null };
  if (STANDARD.test(note)) return { value, standard: note };
  return { value: `${value} ${note}`, standard: null };
}

/* --------------------------- ZDJĘCIA --------------------------- */

function img(id: string, params = "w=1600&q=80&auto=format&fit=crop") {
  return "https://images.unsplash.com/" + id + "?" + params + "&" + PHOTO_TONE;
}

/**
 * Zdjęcia tymczasowe dobierane po kategorii wiodącej — własnych materiałów
 * firmy jeszcze nie ma, a 86 identycznych kadrów czytałoby się gorzej niż
 * kilka powtarzających się. Każde ma `placeholder: true` i widoczną etykietę.
 * Zdjęcie wgrane w panelu (pole „Zdjęcie”) zastępuje je i zdejmuje etykietę.
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

/* ----------------------------- WEJŚCIE ----------------------------- */

/** Zapis systemu w panelu (src/content/systemy/<id>.json). */
interface SystemFile {
  name?: unknown;
  /** false = nazwa robocza: plakietka „Nazwa robocza” i `noindex`. */
  nameConfirmed?: unknown;
  /** Kolejność w obrębie kategorii (rosnąco). */
  order?: unknown;
  /** Slug karty systemu u producenta — źródło danych i odnośnik. */
  aluprof?: unknown;
  /** Podtytuł z karty systemu. Pusty, gdy producent go nie podaje. */
  summary?: unknown;
  /** Kategorie w kolejności ważności; pierwsza jest wiodąca. */
  categories?: unknown;
  constructionType?: unknown;
  tags?: unknown;
  /** Parametry dokładnie jak na karcie: etykieta, wartość, jednostka albo norma. */
  specs?: unknown;
  /**
   * Głębokość zabudowy. Producent podaje ją w treści opisu, nie w bloku
   * parametrów, więc wpisujemy osobno i tylko tam, gdzie faktycznie pada.
   */
  depth?: unknown;
  /** Data sprawdzenia danych na karcie producenta (RRRR-MM-DD). */
  sourceDate?: unknown;
  /** Własny opis zamiast składanego z podtytułu. */
  description?: unknown;
  /** Własne zdjęcie systemu — zastępuje zdjęcie zastępcze kategorii. */
  image?: unknown;
  /** Dokument, z którego pochodzi głębokość — gdy nie karta systemu. */
  depthSource?: unknown;
  /** Rysunki przekrojów z dokumentacji producenta (pliki w public/przekroje). */
  drawings?: unknown;
}

export interface SystemEntry {
  /** Nazwa pliku = identyfikator i adres karty (/systemy/<id>). */
  slug: string;
  data: unknown;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function strList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(str).filter(Boolean) : [];
}

/* ----------------------------- FABRYKA ----------------------------- */

function variants(names: string[]): SystemVariant[] {
  return names.map((name, i) => ({ id: String(i + 1).padStart(2, "0"), name, note: null }));
}

/** Stopień wypełnienia parametrów liczony z danych, nie deklarowany ręcznie. */
function specStatus(specs: SystemSpec[]): Verification {
  const filled = specs.filter((s) => s.value !== null).length;
  if (filled === 0) return "missing";
  return filled === specs.length ? "verified" : "partial";
}

function buildSpecs(file: SystemFile, src: DataSource): SystemSpec[] {
  const rows = Array.isArray(file.specs) ? (file.specs as Record<string, unknown>[]) : [];

  const fromManufacturer: SystemSpec[] = rows
    .map((row) => ({
      label: str(row?.label),
      value: str(row?.value),
      note: str(row?.note),
      source: str(row?.source),
    }))
    .filter((row) => row.label && row.value)
    .map((row, i) => {
      const { value, standard } = splitNote(row.value, row.note);
      return { id: "p" + (i + 1), label: row.label, value, standard, source: documentSource(row.source, src) };
    });

  /* Głębokość zabudowy: wypełniona tam, gdzie producent ją podaje, w reszcie
     pusta. Jest kluczowa dla porównywania systemów i zasila geometrię sceny 3D. */
  const depth = str(file.depth);
  return [
    ...fromManufacturer,
    {
      id: "depth",
      label: "Głębokość zabudowy",
      value: depth || null,
      standard: null,
      source: depth ? documentSource(str(file.depthSource), src) : null,
    },
  ];
}

/* ----------------------------- PRZEKROJE ----------------------------- */

const DRAWING_KINDS: Record<CrossSectionKind, string> = {
  horizontal: "Przekrój poziomy",
  vertical: "Przekrój pionowy",
  threshold: "Próg",
  mullion: "Słupek",
  other: "Przekrój",
};

/* Rysunki trafiają tu tylko z dokumentacji producenta — panel nazywa pole
   „Rysunki producenta”. Gdy klientka nie wpisze dokumentu, podpis mówi
   ogólnie „dokumentacja techniczna”, ale nigdy nie przemilcza, czyj to rysunek. */
const DRAWING_SOURCE = "ALUPROF – dokumentacja techniczna systemu";

function buildDrawings(file: SystemFile, accessedAt: string): CrossSectionRef[] {
  const rows = Array.isArray(file.drawings) ? (file.drawings as Record<string, unknown>[]) : [];
  return rows
    .map((row) => ({
      image: str(row?.image),
      kind: (str(row?.kind) in DRAWING_KINDS ? str(row?.kind) : "other") as CrossSectionKind,
      label: str(row?.label),
      source: str(row?.source),
    }))
    .filter((row) => row.image)
    .map((row, i) => ({
      id: `${row.kind}-${i + 1}`,
      kind: row.kind,
      label: row.label || DRAWING_KINDS[row.kind],
      imageSrc: row.image,
      source: { label: row.source || DRAWING_SOURCE, url: null, accessedAt },
    }));
}

export function defineSystem(entry: SystemEntry): AluSystem {
  const file = (entry.data ?? {}) as SystemFile;
  const id = entry.slug;
  const name = str(file.name) || id;
  const aluprof = str(file.aluprof) || id;
  const cats = strList(file.categories);
  const lead = cats[0];
  const summary = str(file.summary);
  const ownImage = str(file.image);
  const accessedAt = /^\d{4}-\d{2}-\d{2}/.test(str(file.sourceDate))
    ? str(file.sourceDate).slice(0, 10)
    : DEFAULT_SOURCE_DATE;
  const specs = buildSpecs(file, source(aluprof, accessedAt));
  const crossSections = buildDrawings(file, accessedAt);

  return {
    id,
    slug: id,
    name,
    manufacturerId: "aluprof",
    categoryIds: cats,
    applicationIds: [],
    constructionTypeId: str(file.constructionType),
    tagIds: strList(file.tags),

    summary: summary || "System z oferty ALUPROF",
    description:
      str(file.description) ||
      (summary
        ? `${summary}. System z oferty ALUPROF – dane pochodzą z karty systemu u producenta.`
        : "System z oferty ALUPROF. Opis i parametry uzupełnimy na podstawie karty katalogowej producenta."),
    manufacturerUrl: ALUPROF + aluprof,

    media: {
      hero: ownImage
        ? { src: ownImage, alt: name, placeholder: false, credit: null }
        : {
            src: CATEGORY_IMAGE[lead] ?? CATEGORY_IMAGE.okna,
            alt: name,
            placeholder: true,
            credit: "Unsplash – materiał tymczasowy",
          },
      gallery: [],
    },

    crossSections,
    specs,
    variants: variants([]),
    documents: [],
    relatedSystemIds: [],

    pricing: { mode: "on-request", note: null },
    cta: [
      /* Etykieta mówi o TEJ pozycji — użytkownik stoi na karcie konkretnego
         systemu, a nie na ogólnym zaproszeniu do kontaktu. Nazwy systemów
         sięgają 34 znaków, więc nie wchodzą do etykiety przycisku. */
      { id: "quote", label: "Wyceń ten system", href: "/kontakt?system=" + id, kind: "quote" },
    ],

    model3d: { type: MODEL_BY_CATEGORY[lead] ?? null, url: null },

    dataStatus: {
      name: file.nameConfirmed === false ? "working-title" : "confirmed",
      specs: specStatus(specs),
      crossSection: crossSections.length > 0 ? "verified" : "missing",
      model3d: "missing",
      media: ownImage ? "own" : "stock",
      verifiedAt: accessedAt,
      note: null,
    },
  };
}

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

/**
 * Cały katalog z plików panelu. Kolejność: pole „Kolejność” (rosnąco),
 * potem nazwa — sortowanie katalogu „wg kategorii” jest stabilne i wewnątrz
 * kategorii zostawia właśnie tę kolejność. System bez kategorii wypada:
 * nie miałby gdzie stanąć w katalogu ani w ścieżce nawigacji.
 */
export function defineSystems(entries: SystemEntry[]): AluSystem[] {
  const order = (entry: SystemEntry) => {
    const value = Number((entry.data as SystemFile | undefined)?.order);
    return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
  };

  const sorted = [...entries]
    .filter((entry) => strList((entry.data as SystemFile | undefined)?.categories).length > 0)
    .sort((a, b) => order(a) - order(b) || a.slug.localeCompare(b.slug));

  return withRelated(sorted.map(defineSystem));
}
