import type { AluSystem, DataSource, DocumentKind, SystemDataStatus } from "./types";

/* ------------------------------------------------------------------
   KOMUNIKATY O STANIE DANYCH

   Treści wynikają z pól `dataStatus`, a nie z ręcznie wpisanego tekstu
   na stronie. Gdy dane zostaną uzupełnione, komunikat zmieni się sam.
   ------------------------------------------------------------------ */

/** Zastrzeżenie na poziomie całego katalogu. */
export const DATA_DISCLAIMER =
  "Nazwy systemów i parametry pochodzą z kart systemów i dokumentacji technicznej ALUPROF – przy każdej wartości podajemy źródło i datę. Zdjęcia są poglądowe; tam, gdzie nie ma jeszcze rysunku producenta, przekrój jest schematem własnym. Obecność producenta w katalogu nie oznacza autoryzacji ani partnerstwa.";

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

/** Źródła parametrów systemu — każde raz, w kolejności parametrów. */
export function specSources(system: AluSystem): DataSource[] {
  const byLabel = new Map<string, DataSource>();
  for (const spec of system.specs) {
    if (spec.source && !byLabel.has(spec.source.label)) byLabel.set(spec.source.label, spec.source);
  }
  return [...byLabel.values()];
}

/**
 * Podpis źródeł pod parametrami. Wcześniej brał źródło pierwszego
 * parametru — dopóki wszystko pochodziło z karty systemu, to wystarczało;
 * po dopisaniu wartości z katalogu technicznego podpis przemilczałby
 * drugi dokument.
 */
export function sourceNote(system: AluSystem): string | null {
  const sources = specSources(system);
  if (sources.length === 0) return null;
  const list = sources.map((s) => s.label + (s.accessedAt ? ", stan na " + s.accessedAt : "")).join("; ");
  return (sources.length > 1 ? "Źródła parametrów: " : "Źródło parametrów: ") + list + ".";
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
