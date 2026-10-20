import type { ReactNode } from "react";

/* ------------------------------------------------------------------
   SCHEMATY POGLĄDOWE PRZEKROJÓW

   Każdy typ konstrukcji ma własny rysunek — okno rozwierne, drzwi,
   konstrukcja przesuwna i fasada słupowo-ryglowa budują się inaczej
   i nie wolno ilustrować ich jednym obrazkiem.

   To rysunki WŁASNE, poglądowe: pokazują zasadę budowy, nie geometrię
   konkretnego systemu. Nie zawierają wymiarów ani skali, bo każda liczba
   na takim rysunku byłaby zmyślona.
   ------------------------------------------------------------------ */

export interface SchematicPart {
  id: string;
  no: number;
  label: string;
  desc: string;
}

export interface SchematicMarker {
  /** Odpowiada `id` elementu z listy `parts`. */
  id: string;
  no: number;
  x: number;
  y: number;
  /** Linia odniesienia do elementu — gdy numer nie mieści się przy nim. */
  to?: { x: number; y: number };
}

export interface SchematicDefinition {
  id: string;
  /** Nagłówek nad rysunkiem, np. „Okno rozwierne — przekrój poziomy”. */
  label: string;
  /** Czego dotyczy rysunek — jedno zdanie pod legendą. */
  description: string;
  viewBox: string;
  parts: SchematicPart[];
  markers: SchematicMarker[];
  /** Opisy stron przekroju. */
  outsideLabel: string;
  insideLabel: string;
  /**
   * Rysunek. `dim(id)` zwraca krycie elementu — wygasza wszystko poza
   * elementem wskazanym w legendzie.
   */
  Drawing: (props: { dim: (id: string) => number }) => ReactNode;
}
