/* ------------------------------------------------------------------
   TREŚCI Z PANELU — WSPÓLNE NARZĘDZIA

   Pliki w `src/content/*.json` zapisuje panel administracyjny (/admin).
   Panel pilnuje pól wymaganych, ale plik da się też poprawić ręcznie
   albo zapisać ze starszej wersji formularza. Dlatego każdy odczyt idzie
   przez te funkcje: brakujące pole daje pusty tekst, a nie wyjątek, który
   położyłby całą stronę zamiast jednej linijki.
   ------------------------------------------------------------------ */

/** Tekst z panelu: przycięty, a wszystko, co nie jest tekstem — pusty napis. */
export function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Tekst albo `null` — dla pól, których brak ma na stronie własny wygląd. */
export function optionalText(value: unknown): string | null {
  return text(value) || null;
}

/** Lista z panelu: tylko niepuste napisy, w kolejności z formularza. */
export function textList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

const PL_CHARS: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
};

/**
 * Adres podstrony z tytułu: „Dom w Będzinie” → „dom-w-bedzinie”.
 * „ł” nie rozkłada się przez NFD na literę i znak diakrytyczny, więc polskie
 * litery zamieniamy tablicą, a dopiero resztę (np. „é”) normalizacją.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => PL_CHARS[ch] ?? ch)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Unikalne adresy w obrębie listy. Dwie realizacje o tym samym tytule
 * dostawały ten sam adres i druga była nieosiągalna — klikało się zawsze
 * w pierwszą. Kolejne powtórzenie dostaje końcówkę „-2”, „-3”…
 */
export function uniqueSlugs<T>(items: T[], base: (item: T) => string): string[] {
  const used = new Map<string, number>();
  return items.map((item) => {
    const slug = base(item) || "pozycja";
    const count = (used.get(slug) ?? 0) + 1;
    used.set(slug, count);
    return count === 1 ? slug : `${slug}-${count}`;
  });
}

/** Adres profilu społecznościowego — przyjmujemy tylko pełny adres https. */
export function httpsUrl(value: unknown): string | null {
  const url = text(value);
  return /^https:\/\/\S+$/i.test(url) ? url : null;
}

/** Wpis z kolekcji „jeden plik = jedna pozycja” (realizacje, aktualności). */
export interface ContentEntry {
  /** Nazwa pliku bez rozszerzenia — panel nadaje ją przy tworzeniu wpisu. */
  slug: string;
  data: unknown;
}

/**
 * Wpisy z `import.meta.glob(…, { eager: true, import: "default" })`.
 *
 * Adres podstrony bierzemy z NAZWY PLIKU, nie z tytułu: panel nadaje ją raz,
 * przy tworzeniu wpisu, więc poprawka literówki w tytule nie zmienia adresu
 * i nie psuje linków, które ktoś już udostępnił.
 */
export function entriesFromGlob(modules: Record<string, unknown>): ContentEntry[] {
  return Object.entries(modules).map(([path, data]) => ({
    slug: path.replace(/^.*\//, "").replace(/\.[^.]+$/, ""),
    data,
  }));
}

/** Data w formacie RRRR-MM-DD albo pusty napis — do sortowania „najnowsze na górze”. */
export function isoDate(value: unknown): string {
  const raw = text(value);
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : "";
}

/** Najnowsze na górze; wpisy bez daty na końcu, w kolejności alfabetycznej. */
export function byDateDesc<T extends { date: string; title: string }>(a: T, b: T): number {
  if (a.date !== b.date) return b.date.localeCompare(a.date);
  return a.title.localeCompare(b.title, "pl");
}

/** Linia nagłówka z panelu. `accent` = kursywa (krój „editorial”). */
export interface HeadingLine {
  text: string;
  accent: boolean;
}

/**
 * Nagłówek wielowierszowy z jednego pola tekstowego: każdy wiersz w panelu
 * to osobna linia na stronie (każda wjeżdża osobno), a wiersz w gwiazdkach
 * — `*smukłość, której nie da*` — składa się kursywą. Jedno pole zamiast
 * listy obiektów: klientka pisze nagłówek tak, jak ma wyglądać.
 */
export function headingLines(value: unknown): HeadingLine[] {
  return text(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const accent = /^\*(.+)\*$/.exec(line);
      return accent ? { text: accent[1].trim(), accent: true } : { text: line, accent: false };
    });
}

/** Akapity z pola tekstowego — nowy akapit po pustej linii. */
export function paragraphs(value: unknown): string[] {
  return text(value)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

/** Lista obiektów z panelu: zawsze tablica, nawet gdy pole zniknęło z pliku. */
export function objectList<T>(value: unknown): Partial<T>[] {
  return Array.isArray(value) ? (value.filter((v) => v && typeof v === "object") as Partial<T>[]) : [];
}
