import raw from "../content/oferta.json";
import { categories } from "../catalog/taxonomy";
import { slugify, text, uniqueSlugs } from "../lib/content";
import { plural } from "../lib/plural";

export interface OfferArea {
  id: string;
  /** Kotwica / filtr w katalogu systemów. */
  categoryId: string;
  name: string;
  short: string;
  description: string;
  image: string;
}

interface RawOfferArea {
  name?: unknown;
  short?: unknown;
  description?: unknown;
  categoryId?: unknown;
  image?: unknown;
}

const knownCategories = new Set(categories.map((c) => c.id));

/* Pozycja bez kategorii z katalogu prowadzi do konstrukcji indywidualnych,
   a nie na pusty adres `/systemy/kategoria/` — panel daje do wyboru tylko
   istniejące kategorie, ale plik da się zapisać też ręcznie. */
const FALLBACK_CATEGORY = "indywidualne";

const items = ((raw as { items?: RawOfferArea[] }).items ?? []).filter(
  (item) => text(item.name) && text(item.image)
);

/* Kotwica (`/oferta#okna-aluminiowe`) z nazwy — klient jej nie wpisuje. */
const ids = uniqueSlugs(items, (item) => slugify(text(item.name)));

/**
 * Obszary oferty prezentowane na stronie głównej i w „Ofercie”.
 * Edytowane w panelu (/admin → „Zakres prac”), plik src/content/oferta.json.
 */
export const offerAreas: OfferArea[] = items.map((item, i) => {
  const categoryId = text(item.categoryId);
  return {
    id: ids[i],
    categoryId: knownCategories.has(categoryId) ? categoryId : FALLBACK_CATEGORY,
    name: text(item.name),
    short: text(item.short),
    description: text(item.description),
    image: text(item.image),
  };
});

const COUNT_WORDS = ["", "Jeden", "Dwa", "Trzy", "Cztery", "Pięć", "Sześć", "Siedem", "Osiem", "Dziewięć", "Dziesięć"];

/**
 * „Siedem obszarów”, „Cztery obszary”, „Jeden obszar”. Liczba była wpisana
 * w nagłówek na sztywno — po dodaniu pozycji w panelu nagłówek kłamałby.
 */
export function offerAreasCount(count = offerAreas.length): string {
  return `${COUNT_WORDS[count] ?? String(count)} ${plural(count, "obszar", "obszary", "obszarów")}`;
}
