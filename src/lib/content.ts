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
