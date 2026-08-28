import type {
  AluSystem,
  FacetOption,
  Facets,
  SortKey,
  SystemListResult,
  SystemQuery,
  Taxonomy,
} from "./types";

/* ------------------------------------------------------------------
   SILNIK ZAPYTAŃ KATALOGU

   Czyste funkcje — bez Reacta, bez I/O. Te same reguły zadziałają
   na serwerze, jeśli katalog przeniesie się do API.
   ------------------------------------------------------------------ */

/** Wymiary, po których można filtrować. Każdy działa niezależnie. */
type Dimension = "category" | "manufacturer" | "application" | "constructionType" | "tag";

/** Normalizacja do wyszukiwania — bez polskich znaków i wielkości liter. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // „ł” nie rozkłada się w NFD — trzeba osobno
    .replace(/ł/g, "l");
}

function selected(ids: string[] | undefined): string[] {
  return ids && ids.length > 0 ? ids : [];
}

/**
 * Czy system przechodzi filtr w danym wymiarze.
 * `skip` pozwala pominąć jeden wymiar — tak liczy się facety: liczba
 * wyników dla opcji zakłada, że pozostałe filtry działają.
 */
function passes(system: AluSystem, query: SystemQuery, skip?: Dimension): boolean {
  const categories = selected(query.categoryIds);
  if (skip !== "category" && categories.length > 0 && !categories.some((id) => system.categoryIds.includes(id))) {
    return false;
  }

  const manufacturers = selected(query.manufacturerIds);
  if (
    skip !== "manufacturer" &&
    manufacturers.length > 0 &&
    !manufacturers.includes(system.manufacturerId)
  ) {
    return false;
  }

  const applications = selected(query.applicationIds);
  if (
    skip !== "application" &&
    applications.length > 0 &&
    !applications.some((id) => system.applicationIds.includes(id))
  ) {
    return false;
  }

  const constructions = selected(query.constructionTypeIds);
  if (
    skip !== "constructionType" &&
    constructions.length > 0 &&
    !constructions.includes(system.constructionTypeId)
  ) {
    return false;
  }

  const tags = selected(query.tagIds);
  if (skip !== "tag" && tags.length > 0 && !tags.some((id) => system.tagIds.includes(id))) {
    return false;
  }

  const search = query.search?.trim();
  if (search) {
    const needle = normalize(search);
    const haystack = normalize(
      [system.name, system.summary, system.description, ...system.variants.map((v) => v.name)].join(" ")
    );
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

/**
 * Komparatory alfabetyczne. Nie ma tu wpisu dla `category` — ten porządek
 * nie jest alfabetem, tylko kolejnością taksonomii, i obsługuje go
 * `sortSystems` osobno. Wcześniej leżał tu komparator, którego nic
 * nie wywoływało.
 */
const SORTERS: Record<Exclude<SortKey, "category">, (a: AluSystem, b: AluSystem) => number> = {
  "name-asc": (a, b) => a.name.localeCompare(b.name, "pl"),
  "name-desc": (a, b) => b.name.localeCompare(a.name, "pl"),
  manufacturer: (a, b) =>
    a.manufacturerId.localeCompare(b.manufacturerId, "pl") || a.name.localeCompare(b.name, "pl"),
};

export const SORT_LABELS: Record<SortKey, string> = {
  category: "Wg kategorii",
  "name-asc": "Nazwa A–Z",
  "name-desc": "Nazwa Z–A",
  manufacturer: "Wg producenta",
};

export const DEFAULT_SORT: SortKey = "category";

/**
 * Sortowanie „wg kategorii” zachowuje kolejność taksonomii, a nie alfabet —
 * katalog ma się czytać w porządku oferty (okna → drzwi → … → akcesoria).
 * Wewnątrz kategorii zostaje kolejność ze zbioru danych: sortowanie jest
 * stabilne, więc MB-79N nie wskakuje za MB-104 tylko dlatego, że „1” < „7”.
 */
function sortSystems(items: AluSystem[], sort: SortKey, taxonomy: Taxonomy): AluSystem[] {
  if (sort === "category") {
    const order = new Map(taxonomy.categories.map((c, i) => [c.id, i]));
    return [...items].sort(
      (a, b) => (order.get(a.categoryIds[0]) ?? 99) - (order.get(b.categoryIds[0]) ?? 99)
    );
  }
  return [...items].sort(SORTERS[sort]);
}

function buildFacet(
  options: { id: string; name: string }[],
  dataset: AluSystem[],
  query: SystemQuery,
  dimension: Dimension,
  selectedIds: string[],
  belongs: (system: AluSystem, optionId: string) => boolean
): FacetOption[] {
  const pool = dataset.filter((s) => passes(s, query, dimension));
  return options.map((option) => {
    const count = pool.filter((s) => belongs(s, option.id)).length;
    return {
      id: option.id,
      name: option.name,
      count,
      disabled: count === 0,
      selected: selectedIds.includes(option.id),
    };
  });
}

function buildFacets(dataset: AluSystem[], query: SystemQuery, taxonomy: Taxonomy): Facets {
  return {
    categories: buildFacet(
      taxonomy.categories,
      dataset,
      query,
      "category",
      selected(query.categoryIds),
      (s, id) => s.categoryIds.includes(id)
    ),
    manufacturers: buildFacet(
      taxonomy.manufacturers,
      dataset,
      query,
      "manufacturer",
      selected(query.manufacturerIds),
      (s, id) => s.manufacturerId === id
    ),
    applications: buildFacet(
      taxonomy.applications,
      dataset,
      query,
      "application",
      selected(query.applicationIds),
      (s, id) => s.applicationIds.includes(id)
    ),
    constructionTypes: buildFacet(
      taxonomy.constructionTypes,
      dataset,
      query,
      "constructionType",
      selected(query.constructionTypeIds),
      (s, id) => s.constructionTypeId === id
    ),
    tags: buildFacet(taxonomy.tags, dataset, query, "tag", selected(query.tagIds), (s, id) =>
      s.tagIds.includes(id)
    ),
  };
}

/** Pełne wykonanie zapytania: filtr → sortowanie → paginacja → facety. */
export function selectSystems(
  dataset: AluSystem[],
  query: SystemQuery,
  taxonomy: Taxonomy
): SystemListResult {
  const matched = dataset.filter((s) => passes(s, query));
  const sorted = sortSystems(matched, query.sort ?? DEFAULT_SORT, taxonomy);

  const pageSize = query.pageSize ?? null;
  const page = Math.max(1, query.page ?? 1);
  const items = pageSize ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

  return {
    items,
    total: sorted.length,
    page,
    pageSize,
    facets: buildFacets(dataset, query, taxonomy),
  };
}

/** Czy zapytanie w ogóle coś zawęża — do sterowania przyciskiem „Wyczyść”. */
export function countActiveFilters(query: SystemQuery): number {
  return (
    selected(query.categoryIds).length +
    selected(query.manufacturerIds).length +
    selected(query.applicationIds).length +
    selected(query.constructionTypeIds).length +
    selected(query.tagIds).length
  );
}
