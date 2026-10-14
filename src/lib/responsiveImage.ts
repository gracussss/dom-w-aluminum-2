/* ------------------------------------------------------------------
   ZDJĘCIA W KILKU SZEROKOŚCIACH

   Materiał poglądowy leży w Unsplash, a ten potrafi wydać dowolną
   szerokość przez parametr `w`. Bez `srcSet` telefon ściągał kadry
   przygotowane pod ekran 1600–2400 px — kilkanaście razy więcej pikseli,
   niż jest w stanie pokazać.

   Dla plików własnych firmy (po podmianie materiału) funkcja zwraca
   `undefined` i przeglądarka bierze samo `src`. Dzięki temu podmiana
   zdjęć nie wymaga dotykania komponentów.
   ------------------------------------------------------------------ */

/** Siatka szerokości: telefon, telefon 2x, tablet, laptop, desktop, desktop 2x. */
const WIDTHS = [640, 960, 1280, 1600, 2000, 2400] as const;

const REMOTE_HOST = "images.unsplash.com";

/* ------------------------------------------------------------------
   WSPÓLNA KOREKTA TONALNA KADRÓW POGLĄDOWYCH

   Zdjęcia z banku przychodzą z nasyconym błękitem nieba i cieplejszym
   balansem. Paleta strony to grafit, wapień i brąz — obok siebie te kadry
   czytały się jak stock wklejony w cudzy projekt, a nie jak materiał tej
   firmy. Ściągnięcie nasycenia przesuwa błękity w stronę stali i zdejmuje
   z fotografii najbardziej rozpoznawalny podpis banku zdjęć.

   Liczy to CDN (parametry Imgix), nie przeglądarka: kadr przychodzi już
   stonowany, bez filtra CSS przeliczanego przy każdym malowaniu, i korekta
   obejmuje też warianty z `srcSet` — te powstają z tego samego adresu.

   Wartości dobrane pomiarem na najbardziej kolorowych kadrach w projekcie:
   średnie nasycenie fasady spada z 0,31 do ok. 0,25, a różnica między
   kanałem czerwonym a niebieskim maleje z 49 do 36 punktów.

   To korekta WYŁĄCZNIE materiału tymczasowego. Własna dokumentacja firmy
   nie przechodzi przez `img()` i trafia na stronę bez korekty — realny
   montaż ma wyglądać jak realny montaż.
   ------------------------------------------------------------------ */
export const PHOTO_TONE = "sat=-32&con=6";

/** Zdjęcie z banku (materiał tymczasowy), a nie plik wgrany przez firmę. */
export function isPlaceholderImage(src: string): boolean {
  return src.includes(REMOTE_HOST);
}

/* ------------------------------------------------------------------
   ZDJĘCIA WGRANE PRZEZ PANEL

   Panel zapisuje pliki w `public/uploads` dokładnie takie, jakie przyszły
   z telefonu czy aparatu — często 4000 px i kilka MB. Na Netlify skaluje
   je Image CDN (`/.netlify/images`): ten sam plik w kilku szerokościach
   i w formacie, który przeglądarka obsługuje (AVIF/WebP).

   Poza Netlify (`npm run dev`, `vite preview`) tej ścieżki nie ma
   i warianty byłyby zepsutymi obrazkami — wtedy zostaje samo `src`.
   Flagę ustawia vite.config.ts na podstawie zmiennej NETLIFY z builda.
   ------------------------------------------------------------------ */
declare const __NETLIFY_IMAGES__: boolean | undefined;

/* `typeof`, bo ten sam moduł czyta też vite.config.ts (podgląd LCP) —
   tam stała nie jest podstawiona i goły odczyt rzucałby ReferenceError. */
const NETLIFY_IMAGES = typeof __NETLIFY_IMAGES__ !== "undefined" && __NETLIFY_IMAGES__ === true;

function netlifySrcSet(src: string): string {
  return WIDTHS.map((w) => `/.netlify/images?url=${encodeURIComponent(src)}&w=${w} ${w}w`).join(", ");
}

/**
 * `srcSet` zbudowany z adresu źródłowego. Nie schodzimy powyżej szerokości
 * zapisanej w `src` — ta jest deklaracją maksymalnej sensownej wielkości
 * kadru i podnoszenie jej dawałoby rozmycie zamiast ostrości.
 *
 * `netlify` — czy są dostępne warianty z Netlify Image CDN (domyślnie:
 * według builda; vite.config.ts podaje to jawnie).
 */
export function responsiveSrcSet(src: string, netlify = NETLIFY_IMAGES): string | undefined {
  if (src.startsWith("/uploads/")) return netlify ? netlifySrcSet(src) : undefined;
  if (!src.includes(REMOTE_HOST)) return undefined;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return undefined;
  }

  const max = Number(url.searchParams.get("w")) || WIDTHS[WIDTHS.length - 1];
  const usable = WIDTHS.filter((w) => w <= max);
  // Jedna szerokość to nie wybór — wtedy `srcSet` niczego nie wnosi.
  if (usable.length < 2) return undefined;

  return usable
    .map((w) => {
      const variant = new URL(url.href);
      variant.searchParams.set("w", String(w));
      return `${variant.href} ${w}w`;
    })
    .join(", ");
}

/** Najczęstszy układ w projekcie: pełna szerokość na telefonie, pół ekranu od laptopa. */
export const SIZES_HALF = "(min-width: 1024px) 50vw, 100vw";

/** Kadry pełnoekranowe — tło hero, sceny na całą szerokość. */
export const SIZES_FULL = "100vw";

/** Miniatury w siatce: jedna kolumna, dwie, trzy. */
export const SIZES_GRID = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";
