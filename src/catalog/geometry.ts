import type { AluSystem, DataSource } from "./types";

/* ------------------------------------------------------------------
   GEOMETRIA SYSTEMU CZYTANA Z DANYCH

   Scena 3D nie ma prawa mieć własnych liczb opisujących system. Każdy
   wymiar, który pada w prezentacji, pochodzi z parametru z podanym
   źródłem — albo nie pada wcale.

   Dlatego ten plik nie zawiera żadnej wartości: wyciąga je z rekordu
   systemu i mówi, czego brakuje. Warstwa czysta, bez Reacta i bez I/O.
   ------------------------------------------------------------------ */

export interface SystemGeometry {
  /** Głębokość zabudowy w METRACH (jednostka sceny). null = brak danych. */
  depth: number | null;
  /** Wartość dokładnie tak, jak podaje producent, np. „86 mm”. */
  depthLabel: string | null;
  depthSource: DataSource | null;
}

const MILLIMETRES = /^(\d+(?:[.,]\d+)?)\s*mm$/i;

/**
 * Zamienia parametr wymiarowy na metry.
 *
 * Do sceny trafia wyłącznie wartość JEDNOZNACZNA. „86 mm” → 0.086.
 * „od 62 mm”, „62–86 mm”, „> 83 mm” → null, bo z wartości brzegowej albo
 * zakresu nie da się zbudować bryły bez dopowiedzenia, którego nie mamy.
 */
export function parseMillimetres(value: string | null): number | null {
  if (!value) return null;

  const match = MILLIMETRES.exec(value.trim());
  if (!match) return null;

  const mm = Number(match[1].replace(",", "."));
  return Number.isFinite(mm) && mm > 0 ? mm / 1000 : null;
}

/**
 * Wymiary systemu nadające się do zbudowania modelu.
 *
 * Wartość bez źródła jest traktowana jak brak — walidator zbioru danych
 * uzna ją za błąd, a scena nie ma prawa jej pokazać.
 */
export function systemGeometry(system: AluSystem): SystemGeometry {
  const empty: SystemGeometry = { depth: null, depthLabel: null, depthSource: null };

  const spec = system.specs.find((s) => s.id === "depth");
  if (!spec?.source) return empty;

  const depth = parseMillimetres(spec.value);
  if (depth === null) return empty;

  return { depth, depthLabel: spec.value, depthSource: spec.source };
}

/**
 * Czy system ma dość danych, żeby pokazać prezentację z wymiarem.
 *
 * To jedyna bramka włączająca prezentację — nie ma tu listy identyfikatorów
 * systemów. Uzupełnienie głębokości zabudowy w danych włącza ją samo,
 * usunięcie wyłącza.
 */
export function hasMeasuredGeometry(system: AluSystem): boolean {
  return systemGeometry(system).depth !== null;
}
