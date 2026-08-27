import { selectSystems } from "./query";
import type { AluSystem, SystemListResult, SystemQuery, Taxonomy } from "./types";

/* ------------------------------------------------------------------
   REPOZYTORIUM KATALOGU

   Jedyna granica między UI a źródłem danych. Komponenty znają wyłącznie
   ten interfejs — nie wiedzą, czy dane leżą w pliku, w API czy w CMS.
   Podmiana źródła = jedna linia w miejscu tworzenia repozytorium.

   Interfejs jest asynchroniczny, bo takie jest docelowe źródło.
   Adapter lokalny dodatkowo wystawia metody `peek*` — synchroniczny
   podgląd danych, które i tak trzyma w pamięci. Dzięki temu widok
   nie migocze stanem ładowania tam, gdzie nie ma czego ładować,
   a po przejściu na API po prostu przestaje ich dostarczać i UI
   płynnie przechodzi na stan ładowania.
   ------------------------------------------------------------------ */

export interface CatalogRepository {
  /** Do diagnostyki i decyzji UI (np. czy pokazywać stan ładowania). */
  readonly kind: "local" | "http";

  getTaxonomy(): Promise<Taxonomy>;
  listSystems(query?: SystemQuery): Promise<SystemListResult>;
  getSystemBySlug(slug: string): Promise<AluSystem | null>;
  getRelatedSystems(id: string): Promise<AluSystem[]>;

  /** Synchroniczny podgląd. `undefined` = źródło nie potrafi odpowiedzieć od ręki. */
  peekTaxonomy?(): Taxonomy | undefined;
  peekSystems?(query?: SystemQuery): SystemListResult | undefined;
  peekSystemBySlug?(slug: string): AluSystem | null | undefined;
  peekRelatedSystems?(id: string): AluSystem[] | undefined;
}

/* --------------------------- ADAPTER LOKALNY --------------------------- */

export interface LocalSource {
  systems: AluSystem[];
  taxonomy: Taxonomy;
}

export function createLocalRepository(source: LocalSource): CatalogRepository {
  const bySlug = new Map(source.systems.map((s) => [s.slug, s]));
  const byId = new Map(source.systems.map((s) => [s.id, s]));

  const peekSystems = (query: SystemQuery = {}) =>
    selectSystems(source.systems, query, source.taxonomy);

  const peekSystemBySlug = (slug: string) => bySlug.get(slug) ?? null;

  const peekRelatedSystems = (id: string) => {
    const system = byId.get(id);
    if (!system) return [];
    return system.relatedSystemIds
      .map((related) => byId.get(related))
      .filter((s): s is AluSystem => Boolean(s));
  };

  return {
    kind: "local",

    getTaxonomy: async () => source.taxonomy,
    listSystems: async (query = {}) => peekSystems(query),
    getSystemBySlug: async (slug) => peekSystemBySlug(slug),
    getRelatedSystems: async (id) => peekRelatedSystems(id),

    peekTaxonomy: () => source.taxonomy,
    peekSystems,
    peekSystemBySlug,
    peekRelatedSystems,
  };
}

/* ---------------------------- ADAPTER HTTP ----------------------------- */

/**
 * Szkielet pod przyszłe API/CMS. Nie jest nigdzie podpięty — istnieje po to,
 * żeby kontrakt był sprawdzony przez kompilator, a przejście na zdalne dane
 * sprowadzało się do zamiany `createLocalRepository` na `createHttpRepository`
 * w jednym miejscu (src/catalog/index.ts).
 *
 * Endpointy i kształt odpowiedzi trzeba dopasować do faktycznego backendu —
 * poniżej celowo najprostsze założenie: serwer zwraca te same struktury.
 */
export function createHttpRepository(baseUrl: string): CatalogRepository {
  const request = async <T>(path: string, params?: URLSearchParams): Promise<T> => {
    const url = baseUrl.replace(/\/$/, "") + path + (params ? "?" + params.toString() : "");
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error("Katalog: " + response.status + " dla " + path);
    }
    return (await response.json()) as T;
  };

  const toParams = (query: SystemQuery): URLSearchParams => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.sort) params.set("sort", query.sort);
    if (query.page) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));
    const lists: [string, string[] | undefined][] = [
      ["category", query.categoryIds],
      ["manufacturer", query.manufacturerIds],
      ["application", query.applicationIds],
      ["construction", query.constructionTypeIds],
      ["tag", query.tagIds],
    ];
    for (const [key, values] of lists) {
      for (const value of values ?? []) params.append(key, value);
    }
    return params;
  };

  return {
    kind: "http",
    getTaxonomy: () => request<Taxonomy>("/taxonomy"),
    listSystems: (query = {}) => request<SystemListResult>("/systems", toParams(query)),
    getSystemBySlug: (slug) => request<AluSystem | null>("/systems/" + slug),
    getRelatedSystems: (id) => request<AluSystem[]>("/systems/" + id + "/related"),
    // Brak `peek*` — UI automatycznie przechodzi na stan ładowania.
  };
}

/* ------------------------------ WALIDACJA ------------------------------ */

/**
 * Sprawdza spójność zbioru: unikalne identyfikatory oraz istnienie
 * wszystkich wskazywanych producentów, kategorii i typów konstrukcji.
 * Literówka w `manufacturerId` przestaje być cichym błędem renderowania.
 *
 * Zwraca listę problemów — pusta lista oznacza zbiór spójny.
 */
export function validateSource(source: LocalSource): string[] {
  const problems: string[] = [];
  const { systems, taxonomy } = source;

  const ids = new Set<string>();
  const slugs = new Set<string>();
  const knownIds = new Set(systems.map((s) => s.id));
  const manufacturerIds = new Set(taxonomy.manufacturers.map((m) => m.id));
  const categoryIds = new Set(taxonomy.categories.map((c) => c.id));
  const applicationIds = new Set(taxonomy.applications.map((a) => a.id));
  const constructionIds = new Set(taxonomy.constructionTypes.map((c) => c.id));
  const tagIds = new Set(taxonomy.tags.map((t) => t.id));

  for (const system of systems) {
    const where = 'System "' + system.id + '"';

    if (ids.has(system.id)) problems.push(where + ": zduplikowane id.");
    ids.add(system.id);

    if (slugs.has(system.slug)) problems.push(where + ": zduplikowany slug " + system.slug + ".");
    slugs.add(system.slug);

    if (!manufacturerIds.has(system.manufacturerId)) {
      problems.push(where + ": nieznany producent " + system.manufacturerId + ".");
    }
    if (!categoryIds.has(system.categoryId)) {
      problems.push(where + ": nieznana kategoria " + system.categoryId + ".");
    }
    if (!constructionIds.has(system.constructionTypeId)) {
      problems.push(where + ": nieznany typ konstrukcji " + system.constructionTypeId + ".");
    }
    for (const application of system.applicationIds) {
      if (!applicationIds.has(application)) {
        problems.push(where + ": nieznane zastosowanie " + application + ".");
      }
    }
    for (const tag of system.tagIds) {
      if (!tagIds.has(tag)) problems.push(where + ": nieznany tag " + tag + ".");
    }
    for (const related of system.relatedSystemIds) {
      if (!knownIds.has(related)) {
        problems.push(where + ": wskazuje nieistniejący system " + related + ".");
      }
      if (related === system.id) problems.push(where + ": wskazuje sam siebie jako powiązany.");
    }

    /* Reguła danych: wartość techniczna bez źródła to błąd, nie brak. */
    for (const spec of system.specs) {
      if (spec.value !== null && spec.source === null) {
        problems.push(where + ': parametr "' + spec.label + '" ma wartość bez źródła.');
      }
    }
  }

  return problems;
}
