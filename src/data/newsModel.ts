import { byDateDesc, isoDate, slugify, text, uniqueSlugs } from "../lib/content";
import type { ContentEntry } from "../lib/content";

/* ------------------------------------------------------------------
   AKTUALNOŚCI — MODEL (czyste funkcje)

   Osobno od `news.ts` z tego samego powodu co `realizationModel.ts`:
   vite.config.ts (sitemapa) czyta wpisy z dysku i musi je znormalizować
   dokładnie tak, jak strona.
   ------------------------------------------------------------------ */

export interface NewsPost {
  slug: string;
  title: string;
  /** RRRR-MM-DD — data publikacji widoczna przy wpisie. */
  date: string;
  /** Zajawka na liście i opis dla Google. */
  excerpt: string;
  /** Zdjęcie główne; pusty napis = wpis bez zdjęcia (ciemny nagłówek). */
  cover: string;
  /** Treść w Markdownie — z edytora panelu (pogrubienia, listy, linki, zdjęcia). */
  body: string;
}

interface RawPost {
  title?: unknown;
  date?: unknown;
  excerpt?: unknown;
  cover?: unknown;
  body?: unknown;
}

export function normalizePost(raw: unknown, slug: string): NewsPost {
  const post = (raw ?? {}) as RawPost;
  return {
    slug,
    title: text(post.title),
    date: isoDate(post.date),
    excerpt: text(post.excerpt),
    cover: text(post.cover),
    body: typeof post.body === "string" ? post.body : "",
  };
}

/** Wpisy od najnowszego. Wpis bez tytułu albo bez daty jest pomijany. */
export function normalizePosts(entries: ContentEntry[]): NewsPost[] {
  const valid = entries.filter(({ data }) => {
    const post = (data ?? {}) as RawPost;
    return text(post.title) && isoDate(post.date);
  });
  const slugs = uniqueSlugs(valid, (entry) => slugify(entry.slug));
  return valid.map((entry, i) => normalizePost(entry.data, slugs[i])).sort(byDateDesc);
}

/** „14 października 2026” — data przy wpisie. */
export function formatPostDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}
