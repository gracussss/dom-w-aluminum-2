import type { AluSystem, DocumentKind, SystemDataStatus } from "./types";

/* ------------------------------------------------------------------
   KOMUNIKATY O STANIE DANYCH

   Treści wynikają z pól `dataStatus`, a nie z ręcznie wpisanego tekstu
   na stronie. Gdy dane zostaną uzupełnione, komunikat zmieni się sam.
   ------------------------------------------------------------------ */

/** Zastrzeżenie na poziomie całego katalogu. */
export const DATA_DISCLAIMER =
  "Nazwy systemów i parametry pochodzą z publicznych kart systemów ALUPROF – przy każdej wartości podajemy źródło i datę dostępu. Zdjęcia są poglądowe, przekroje to rysunki własne. Obecność producenta w katalogu nie oznacza autoryzacji ani partnerstwa.";

export const TBD = "Do uzupełnienia";

export const NAME_STATUS_LABEL: Record<SystemDataStatus["name"], string> = {
  confirmed: "Oznaczenie producenta",
  "working-title": "Nazwa robocza",
};

/** Zdanie o pochodzeniu nazwy — na kartę systemu. */
export function nameStatusNote(system: AluSystem): string {
  if (system.dataStatus.name === "confirmed") {
    return "Oznaczenie handlowe potwierdzone w publicznych materiałach producenta.";
  }
  return "Nazwa robocza – oznaczenie handlowe do ustalenia z producentem.";
}

/** Zdanie o stanie parametrów technicznych. */
export function specsStatusNote(system: AluSystem): string {
  const total = system.specs.length;
  const filled = system.specs.filter((s) => s.value !== null).length;

  if (filled === 0) return "Parametry techniczne nie zostały jeszcze zweryfikowane.";
  if (filled === total) return "Wszystkie parametry potwierdzone materiałami producenta.";
  return (
    "Potwierdzone " +
    filled +
    " z " +
    total +
    " parametrów – pozostałe uzupełnimy po otrzymaniu karty katalogowej."
  );
}

/** Podpis źródła pod parametrem. */
export function sourceNote(system: AluSystem): string | null {
  const sourced = system.specs.find((s) => s.source !== null)?.source;
  if (!sourced) return null;
  const date = sourced.accessedAt ? ", dostęp " + sourced.accessedAt : "";
  return "Źródło parametrów: " + sourced.label + date + ".";
}

/** Czy karta powinna ostrzegać, że przekrój jest rysunkiem własnym. */
export function hasManufacturerCrossSection(system: AluSystem): boolean {
  return system.crossSections.some((c) => c.imageSrc !== null);
}

/** Nazwa modelu 3D odpowiadajaca typowi konstrukcji. */
export const MODEL_TYPE_LABEL: Record<string, string> = {
  okno: "Okno rozwierne",
  drzwi: "Drzwi rozwierne",
  przesuwne: "Drzwi przesuwne",
  fasada: "Fasada słupowo-ryglowa",
};

/** Nazwy rodzajów dokumentów na karcie systemu. */
export const DOCUMENT_KIND_LABEL: Record<DocumentKind, string> = {
  datasheet: "Karta katalogowa",
  brochure: "Folder / broszura",
  certificate: "Certyfikat",
  dop: "Deklaracja właściwości użytkowych",
  bim: "Model BIM",
  cad: "Rysunek CAD",
  other: "Dokument",
};
