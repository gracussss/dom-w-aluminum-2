import { byDateDesc, isoDate, slugify, text, textList, uniqueSlugs } from "../lib/content";
import type { ContentEntry } from "../lib/content";

/* ------------------------------------------------------------------
   MODEL REALIZACJI — CZYSTE FUNKCJE

   Osobno od `realizations.ts`, bo ten sam model czyta vite.config.ts
   (sitemapa). Tam nie działa `import.meta.glob`, więc config wczytuje pliki
   przez fs i przepuszcza je przez tę samą normalizację co strona — adresy
   w sitemapie i na stronie nie mogą się rozjechać.
   ------------------------------------------------------------------ */

export interface Realization {
  id: string;
  slug: string;
  title: string;
  /** RRRR-MM-DD — tylko do kolejności na liście, nie wyświetla się. */
  date: string;
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

interface RawRealization {
  title?: unknown;
  date?: unknown;
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

/** Jedna realizacja z danych panelu (także niezapisanych — podgląd w panelu). */
export function normalizeRealization(raw: unknown, slug: string): Realization {
  const item = (raw ?? {}) as RawRealization;
  return {
    id: slug,
    slug,
    title: text(item.title),
    date: isoDate(item.date),
    category: text(item.category),
    location: text(item.location),
    scope: text(item.scope),
    system: text(item.system),
    description: text(item.description),
    seoDescription: text(item.seoDescription),
    cover: text(item.cover),
    gallery: textList(item.gallery),
    verified: item.verified === true,
  };
}

/**
 * Lista realizacji: najnowsze na górze (pole „Data” w panelu). Pozycja bez
 * tytułu albo bez zdjęcia głównego jest pomijana: kafel bez kadru rozsypywał
 * siatkę, a pusty tytuł dawał link bez nazwy.
 */
export function normalizeRealizations(entries: ContentEntry[]): Realization[] {
  const valid = entries.filter(({ data }) => {
    const item = (data ?? {}) as RawRealization;
    return text(item.title) && text(item.cover);
  });
  /* Nazwa pliku przechodzi przez slugify także tu: plik dodany ręcznie
     („Dom Będzin.json”) dawałby adres ze spacją i polskimi znakami. */
  const slugs = uniqueSlugs(valid, (entry) => slugify(entry.slug));
  return valid.map((entry, i) => normalizeRealization(entry.data, slugs[i])).sort(byDateDesc);
}

/**
 * Przypis pod portfolio. Wyświetlany tylko wtedy, gdy na liście jest choć
 * jedna pozycja poglądowa — po wymianie wszystkich na prawdziwe znika sam.
 * Mówi o etykiecie, a nie o „wszystkich obiektach”, bo w okresie wymiany
 * na liście stoją obok siebie realizacje prawdziwe i przykładowe.
 */
export const PORTFOLIO_DISCLAIMER =
  "Obiekty i zdjęcia oznaczone etykietą „Zdjęcie poglądowe” mają charakter przykładowy. Nie przedstawiają zrealizowanych inwestycji firmy – zostaną zastąpione własną dokumentacją.";
