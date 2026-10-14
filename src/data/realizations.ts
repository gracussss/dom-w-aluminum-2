import raw from "../content/realizacje.json";
import { slugify, text, textList, uniqueSlugs } from "../lib/content";

export interface Realization {
  id: string;
  slug: string;
  title: string;
  category: string;
  /** Pusty napis = lokalizacja jeszcze niepodana; strona pokazuje „Do uzupełnienia”. */
  location: string;
  scope: string;
  /** Zastosowany system — pusty napis jak przy lokalizacji. */
  system: string;
  description: string;
  /** Opis do wyników wyszukiwania. Pusty = składany z typu, zakresu i opisu. */
  seoDescription: string;
  cover: string;
  gallery: string[];
  /**
   * Czy pozycja przedstawia FAKTYCZNĄ realizację firmy.
   *
   * Ta sama zasada, co przy nazwach systemów (`nameStatus`): dopóki obiekt
   * jest poglądowy, jego karta dostaje `noindex, follow` i nie trafia do
   * sitemapy. Wyszukiwarka czyta portfolio jako oświadczenie firmy o tym,
   * co wykonała — zaindeksowany przykład z banku zdjęć jest twierdzeniem
   * nieprawdziwym. W panelu: pole „Prawdziwa realizacja firmy”.
   */
  verified: boolean;
}

/* ------------------------------------------------------------------
   REALIZACJE Z PANELU (src/content/realizacje.json)

   Kolejność z panelu jest kolejnością na stronie — klient przeciąga
   pozycje, a cztery pierwsze trafiają na stronę główną. Pozycja bez
   tytułu albo bez zdjęcia głównego jest pomijana: kafel bez kadru
   rozsypywał siatkę, a pusty tytuł dawał link bez nazwy.
   ------------------------------------------------------------------ */

interface RawRealization {
  title?: unknown;
  slug?: unknown;
  category?: unknown;
  location?: unknown;
  scope?: unknown;
  system?: unknown;
  description?: unknown;
  seoDescription?: unknown;
  cover?: unknown;
  gallery?: unknown;
  verified?: unknown;
}

const items = ((raw as { items?: RawRealization[] }).items ?? []).filter(
  (item) => text(item.title) && text(item.cover)
);

/* Adres z pola „adres podstrony”, a gdy puste — z tytułu. Przepuszczony
   przez slugify także wtedy, gdy wpisany ręcznie: spacja czy „ą” w adresie
   dawały link, który działał tylko w części przeglądarek. */
const slugs = uniqueSlugs(items, (item) => slugify(text(item.slug) || text(item.title)));

export const realizations: Realization[] = items.map((item, i) => ({
  id: slugs[i],
  slug: slugs[i],
  title: text(item.title),
  category: text(item.category),
  location: text(item.location),
  scope: text(item.scope),
  system: text(item.system),
  description: text(item.description),
  seoDescription: text(item.seoDescription),
  cover: text(item.cover),
  gallery: textList(item.gallery),
  verified: item.verified === true,
}));

/**
 * Przypis pod portfolio. Wyświetlany tylko wtedy, gdy na liście jest choć
 * jedna pozycja poglądowa — po wymianie wszystkich na prawdziwe znika sam.
 * Mówi o etykiecie, a nie o „wszystkich obiektach”, bo w okresie wymiany
 * na liście stoją obok siebie realizacje prawdziwe i przykładowe.
 */
export const PORTFOLIO_DISCLAIMER =
  "Obiekty i zdjęcia oznaczone etykietą „Zdjęcie poglądowe” mają charakter przykładowy. Nie przedstawiają zrealizowanych inwestycji firmy – zostaną zastąpione własną dokumentacją.";

export const hasPlaceholderRealizations = realizations.some((r) => !r.verified);

export function getRealizationBySlug(slug: string) {
  return realizations.find((r) => r.slug === slug);
}

/** Pozycje, które wolno pokazać wyszukiwarce — patrz `verified`. */
export const verifiedRealizations = realizations.filter((r) => r.verified);
