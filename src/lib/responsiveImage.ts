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

/**
 * `srcSet` zbudowany z adresu źródłowego. Nie schodzimy powyżej szerokości
 * zapisanej w `src` — ta jest deklaracją maksymalnej sensownej wielkości
 * kadru i podnoszenie jej dawałoby rozmycie zamiast ostrości.
 */
export function responsiveSrcSet(src: string): string | undefined {
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
