import { PHOTO_TONE } from "../lib/responsiveImage";

function img(id: string, params = "w=1800&q=80&auto=format&fit=crop") {
  return `https://images.unsplash.com/${id}?${params}&${PHOTO_TONE}`;
}

export interface Realization {
  id: string;
  slug: string;
  title: string;
  category: string;
  /** Placeholder — realna lokalizacja do uzupełnienia przez klienta. */
  location: string;
  scope: string;
  description: string;
  cover: string;
  gallery: string[];
  /**
   * Czy pozycja przedstawia FAKTYCZNĄ realizację firmy.
   *
   * Ta sama zasada, co przy nazwach systemów (`nameStatus`): dopóki obiekt
   * jest poglądowy, jego karta dostaje `noindex, follow` i nie trafia do
   * sitemapy. Wyszukiwarka czyta portfolio jako oświadczenie firmy o tym,
   * co wykonała — zaindeksowany przykład z banku zdjęć jest twierdzeniem
   * nieprawdziwym. Po wgraniu własnej dokumentacji: `verified: true`.
   */
  verified: boolean;
}

/**
 * PORTFOLIO POGLĄDOWE.
 * Zdjęcia tymczasowe (Unsplash). Tytuły to etykiety typu obiektu,
 * nie opisy prawdziwych, zrealizowanych inwestycji.
 * Do zastąpienia dokumentacją fotograficzną firmy.
 */
/**
 * Opis meta listy realizacji. Trzymany obok disclaimera, bo mówi to samo:
 * portfolio jest poglądowe. Po wgraniu własnej dokumentacji podmienia się
 * oba teksty w jednym miejscu.
 */
export const PORTFOLIO_SEO_DESCRIPTION =
  "Przegląd obiektów w podziale na typ inwestycji i zakres prac — domy jednorodzinne, budynki wielorodzinne i obiekty komercyjne. Zestawienie poglądowe.";

export const PORTFOLIO_DISCLAIMER =
  "Prezentowane obiekty i zdjęcia mają charakter poglądowy. Nie przedstawiają zrealizowanych inwestycji firmy — zostaną zastąpione własną dokumentacją.";

const TBD_LOCATION = "Lokalizacja — do uzupełnienia";

export const realizations: Realization[] = [
  {
    id: "dom-jednorodzinny",
    slug: "dom-jednorodzinny",
    title: "Dom jednorodzinny",
    category: "Realizacja prywatna",
    location: TBD_LOCATION,
    scope: "Okna, drzwi tarasowe",
    description:
      "Przykład zabudowy jednorodzinnej z dużymi przeszkleniami w konstrukcji aluminiowej. Opis zakresu prac do uzupełnienia.",
    cover: img("photo-1628012209120-d9db7abf7eab"),
    gallery: [
      img("photo-1783125127229-0850d689e014"),
      img("photo-1783125127082-3fb6c1bccd72"),
      img("photo-1760304879576-81565137ff2e"),
    ],
    verified: false,
  },
  {
    id: "biurowiec",
    slug: "biurowiec-fasada",
    title: "Biurowiec — fasada aluminiowa",
    category: "Obiekt komercyjny",
    location: TBD_LOCATION,
    scope: "Fasada słupowo-ryglowa",
    description:
      "Przykład ściany osłonowej na obiekcie biurowym. Zakres, powierzchnia i zastosowany system do uzupełnienia.",
    cover: img("photo-1783705093954-a4d64bb7bf69"),
    gallery: [img("photo-1523477593243-78bbf626fd3b"), img("photo-1584257354413-32f8603c40fe")],
    verified: false,
  },
  {
    id: "dom-przeszklenie",
    slug: "dom-z-przeszkleniem",
    title: "Dom z dużym przeszkleniem",
    category: "Realizacja prywatna",
    location: TBD_LOCATION,
    scope: "Przeszklenia wielkoformatowe",
    description:
      "Przykład realizacji z przeszkleniami o dużej powierzchni. Szczegóły konstrukcyjne do uzupełnienia.",
    cover: img("photo-1777835899388-2c1efc775fea"),
    gallery: [img("photo-1702724758750-9ff8d50f02e5"), img("photo-1522968941782-e27ac665baa3")],
    verified: false,
  },
  {
    id: "apartamentowiec",
    slug: "apartamentowiec",
    title: "Apartamentowiec",
    category: "Budynek wielorodzinny",
    location: TBD_LOCATION,
    scope: "Okna, drzwi balkonowe",
    description:
      "Przykład zabudowy wielorodzinnej z powtarzalnymi modułami stolarki. Zakres do uzupełnienia.",
    cover: img("photo-1786609836782-fafdcd51d8d8"),
    gallery: [img("photo-1783705093954-a4d64bb7bf69")],
    verified: false,
  },
  {
    id: "rezydencja",
    slug: "rezydencja-prywatna",
    title: "Rezydencja prywatna",
    category: "Realizacja prywatna",
    location: TBD_LOCATION,
    scope: "Kompleksowa stolarka",
    description:
      "Przykład kompleksowej realizacji stolarki aluminiowej w budynku prywatnym. Opis do uzupełnienia.",
    cover: img("photo-1783125127229-0850d689e014"),
    gallery: [img("photo-1783125127082-3fb6c1bccd72")],
    verified: false,
  },
  {
    id: "pawilon",
    slug: "pawilon-wystawowy",
    title: "Pawilon wystawowy",
    category: "Obiekt użyteczności publicznej",
    location: TBD_LOCATION,
    scope: "Przekrycie, ściany osłonowe",
    description:
      "Przykład obiektu z przekryciem przeszklonym i ścianami osłonowymi. Dane do uzupełnienia.",
    cover: img("photo-1768396856060-0e1feac4084e"),
    gallery: [img("photo-1558455322-911adf441b5a"), img("photo-1490656568362-e261fb612849")],
    verified: false,
  },
];

export function getRealizationBySlug(slug: string) {
  return realizations.find((r) => r.slug === slug);
}

/** Pozycje, które wolno pokazać wyszukiwarce — patrz `verified`. */
export const verifiedRealizations = realizations.filter((r) => r.verified);
