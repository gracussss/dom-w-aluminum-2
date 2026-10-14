/* ------------------------------------------------------------------
   MODEL DOMENOWY KATALOGU SYSTEMÓW ALUMINIOWYCH

   Warstwa czysto typowa — bez danych i bez zależności od Reacta.
   Zasada nadrzędna: model wymusza rozróżnienie między informacją
   POTWIERDZONĄ U PRODUCENTA a BRAKIEM DANYCH. Nie ma stanu pośredniego
   w rodzaju „mniej więcej”. Każda wartość techniczna albo ma źródło,
   albo jest `null` i renderuje się jako „Do uzupełnienia”.
   ------------------------------------------------------------------ */

/** Stopień potwierdzenia zestawu informacji. */
export type Verification = "verified" | "partial" | "missing";

/** Pochodzenie informacji. Bez źródła nie wpisujemy wartości technicznej. */
export interface DataSource {
  /** Nazwa dokumentu lub strony, np. „aluprof.com — strona systemu”. */
  label: string;
  url: string | null;
  /** Data pozyskania danych, ISO (YYYY-MM-DD). */
  accessedAt: string | null;
}

/* ---------------------------- TAKSONOMIE ---------------------------- */

export interface Manufacturer {
  id: string;
  slug: string;
  name: string;
  /** Strona producenta — źródło danych. NIE jest deklaracją współpracy. */
  website: string | null;
  /**
   * Relacja handlowa. `none` = brak potwierdzonej relacji — wartość domyślna
   * i jedyna dopuszczalna, dopóki nie ma pisemnego potwierdzenia od producenta.
   * Ustawienie `authorized-partner` bez takiego dokumentu jest nieprawdą
   * i naraża klienta na odpowiedzialność.
   */
  relationship: "none" | "authorized-partner";
}

export interface SystemCategory {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
}

export interface Application {
  id: string;
  name: string;
  short: string;
}

export interface ConstructionType {
  id: string;
  name: string;
  /** Oznaczenie symbolu rysunkowego typu konstrukcji. Symbol zniknął z listy
      katalogu (klientka nie rozumiała, co oznacza) — pole zostaje w modelu. */
  glyph: string;
}

/** Cecha przekrojowa (np. „ppoż.”, „wielkoformatowe”). Uzupełniana po weryfikacji. */
export interface Tag {
  id: string;
  name: string;
}

export interface Taxonomy {
  manufacturers: Manufacturer[];
  categories: SystemCategory[];
  applications: Application[];
  constructionTypes: ConstructionType[];
  tags: Tag[];
}

/* ------------------------------ SYSTEM ------------------------------ */

export type ModelType = "okno" | "drzwi" | "przesuwne" | "fasada" | null;

export interface SystemSpec {
  id: string;
  /** Etykieta dokładnie taka, jaką podaje producent (Uf ≠ Uw — to nie synonimy). */
  label: string;
  /** null = brak zweryfikowanych danych. NIGDY nie wypełniaj szacunkowo. */
  value: string | null;
  /** Norma lub klasyfikacja, jeśli producent ją podaje (np. „PN-EN 12207”). */
  standard: string | null;
  source: DataSource | null;
}

export type CrossSectionKind = "horizontal" | "vertical" | "threshold" | "mullion" | "other";

export interface CrossSectionRef {
  id: string;
  kind: CrossSectionKind;
  label: string;
  /** Plik w /public/przekroje. null = brak rysunku, UI pokazuje schemat poglądowy. */
  imageSrc: string | null;
  source: DataSource | null;
}

export type DocumentKind =
  | "datasheet"
  | "brochure"
  | "certificate"
  | "dop"
  | "bim"
  | "cad"
  | "other";

export interface SystemDocument {
  id: string;
  kind: DocumentKind;
  label: string;
  /** Plik hostowany u nas albo odnośnik do producenta. null = brak pliku. */
  url: string | null;
  source: DataSource | null;
  /**
   * Czy mamy prawo udostępnić ten plik na stronie komercyjnej.
   * Samo pobranie pliku ze strony producenta NIE daje takiego prawa.
   */
  publishable: boolean;
}

export interface SystemVariant {
  id: string;
  name: string;
  note: string | null;
}

export interface ImageRef {
  src: string;
  alt: string;
  /** true = materiał tymczasowy; UI musi pokazać widoczną etykietę. */
  placeholder: boolean;
  credit: string | null;
}

/** Cen nie podajemy. Tryb istnieje, żeby UI nie musiał zgadywać. */
export interface Pricing {
  mode: "on-request";
  note: string | null;
}

export interface SystemCta {
  id: string;
  label: string;
  href: string;
  kind: "quote" | "phone" | "external";
}

export interface SystemDataStatus {
  /** Czy oznaczenie handlowe jest potwierdzone u producenta. */
  name: "confirmed" | "working-title";
  specs: Verification;
  crossSection: Verification;
  model3d: Verification;
  /** `stock` = zdjęcie tymczasowe, wymaga etykiety w UI. */
  media: "own" | "stock";
  /** Data ostatniej weryfikacji, ISO. null = nigdy nie weryfikowano. */
  verifiedAt: string | null;
  note: string | null;
}

export interface AluSystem {
  id: string;
  slug: string;
  name: string;

  manufacturerId: string;
  /**
   * Kategorie, do których należy system — ZAWSZE tablica.
   * Producent przypisuje jeden system do kilku sekcji oferty: MB-79N stoi
   * i w oknach, i w drzwiach, MB-104 Passive dodatkowo w rozwiązaniach
   * indywidualnych. Pojedyncze pole gubiło połowę tych przypisań.
   * Pierwsza pozycja jest kategorią wiodącą (breadcrumbs, grupowanie).
   */
  categoryIds: string[];
  applicationIds: string[];
  constructionTypeId: string;
  tagIds: string[];

  summary: string;
  description: string;

  /** Strona systemu u producenta — źródło danych i odnośnik dla użytkownika. */
  manufacturerUrl: string | null;

  media: { hero: ImageRef; gallery: ImageRef[] };
  crossSections: CrossSectionRef[];
  specs: SystemSpec[];
  variants: SystemVariant[];
  documents: SystemDocument[];
  relatedSystemIds: string[];

  pricing: Pricing;
  cta: SystemCta[];
  model3d: { type: ModelType; url: string | null };
  dataStatus: SystemDataStatus;
}

/* ----------------------------- ZAPYTANIA ----------------------------- */

export type SortKey = "name-asc" | "name-desc" | "manufacturer" | "category";

/** Wszystkie wymiary wielokrotnego wyboru — pusta tablica = brak ograniczenia. */
export interface SystemQuery {
  search?: string;
  categoryIds?: string[];
  manufacturerIds?: string[];
  applicationIds?: string[];
  constructionTypeIds?: string[];
  tagIds?: string[];
  sort?: SortKey;
  /** Strona liczona od 1. Bez `pageSize` paginacja jest wyłączona. */
  page?: number;
  pageSize?: number;
}

export interface FacetOption {
  id: string;
  name: string;
  /** Liczba wyników po wybraniu tej opcji, przy zachowaniu pozostałych filtrów. */
  count: number;
  /** true = wybór dałby pustą listę. */
  disabled: boolean;
  selected: boolean;
}

export interface Facets {
  categories: FacetOption[];
  manufacturers: FacetOption[];
  applications: FacetOption[];
  constructionTypes: FacetOption[];
  tags: FacetOption[];
}

export interface SystemListResult {
  items: AluSystem[];
  total: number;
  page: number;
  pageSize: number | null;
  facets: Facets;
}
