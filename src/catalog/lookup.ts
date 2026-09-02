import type {
  AluSystem,
  Application,
  ConstructionType,
  Manufacturer,
  SystemCategory,
  Taxonomy,
} from "./types";

/* ------------------------------------------------------------------
   ODCZYT TAKSONOMII

   Systemy wskazują na producentów i kategorie identyfikatorami.
   Te funkcje rozwiązują je względem taksonomii otrzymanej z repozytorium —
   nigdy względem zaimportowanej na sztywno listy.
   ------------------------------------------------------------------ */

export function findManufacturer(taxonomy: Taxonomy, id: string): Manufacturer | undefined {
  return taxonomy.manufacturers.find((m) => m.id === id);
}

export function findCategory(taxonomy: Taxonomy, id: string): SystemCategory | undefined {
  return taxonomy.categories.find((c) => c.id === id);
}

/* Adresy podstron używają slugów, nie identyfikatorów — kategoria „przesuwne”
   ma slug „drzwi-przesuwne”, bo tak ją nazywa użytkownik. */

export function findCategoryBySlug(taxonomy: Taxonomy, slug: string): SystemCategory | undefined {
  return taxonomy.categories.find((c) => c.slug === slug);
}

export function findManufacturerBySlug(taxonomy: Taxonomy, slug: string): Manufacturer | undefined {
  return taxonomy.manufacturers.find((m) => m.slug === slug);
}

export function findConstructionType(taxonomy: Taxonomy, id: string): ConstructionType | undefined {
  return taxonomy.constructionTypes.find((c) => c.id === id);
}

export function findApplications(taxonomy: Taxonomy, ids: string[]): Application[] {
  return taxonomy.applications.filter((a) => ids.includes(a.id));
}

/** Kategoria wiodąca systemu — pierwsza z listy. Do breadcrumbs i grupowania. */
export function primaryCategory(taxonomy: Taxonomy, system: AluSystem): SystemCategory | undefined {
  return findCategory(taxonomy, system.categoryIds[0]);
}

/** Wszystkie kategorie systemu, w kolejności taksonomii. */
export function systemCategories(taxonomy: Taxonomy, system: AluSystem): SystemCategory[] {
  return taxonomy.categories.filter((c) => system.categoryIds.includes(c.id));
}

/**
 * Systemy pogrupowane w kolejności taksonomii — bez pustych grup.
 * UWAGA: system należący do kilku kategorii pojawi się w każdej z nich.
 * W katalogu numerację nadajemy po deduplikacji, żeby licznik się zgadzał.
 */
export function groupByCategory(
  systems: AluSystem[],
  taxonomy: Taxonomy
): { category: SystemCategory; items: AluSystem[] }[] {
  return taxonomy.categories
    .map((category) => ({
      category,
      items: systems.filter((s) => s.categoryIds.includes(category.id)),
    }))
    .filter((group) => group.items.length > 0);
}

/** Liczba systemów w każdej kategorii — dla zapowiedzi katalogu. */
export function countByCategory(systems: AluSystem[], taxonomy: Taxonomy): Map<string, number> {
  const counts = new Map<string, number>();
  for (const category of taxonomy.categories) {
    counts.set(category.id, systems.filter((s) => s.categoryIds.includes(category.id)).length);
  }
  return counts;
}
