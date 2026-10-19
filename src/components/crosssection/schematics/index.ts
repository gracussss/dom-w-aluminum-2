import type { ModelType } from "../../../catalog";
import type { SchematicDefinition } from "../types";
import { windowSchematic } from "./window";
import { doorSchematic } from "./door";
import { slidingSchematic } from "./sliding";
import { facadeSchematic } from "./facade";
import { mb70bSchematic } from "./mb-70b";

/* ------------------------------------------------------------------
   Dobór schematu do typu konstrukcji. Każdy typ ma własny rysunek —
   fasada nie ma skrzydła, konstrukcja przesuwna nie ma przylgi,
   więc jeden uniwersalny przekrój byłby po prostu nieprawdziwy.
   ------------------------------------------------------------------ */

export const schematics: Record<string, SchematicDefinition> = {
  okno: windowSchematic,
  drzwi: doorSchematic,
  przesuwne: slidingSchematic,
  fasada: facadeSchematic,
};

/**
 * Rysunki robione pod konkretny system — mają jego głębokości i proporcje,
 * więc biją schemat ogólny dla typu konstrukcji. Klucz to identyfikator
 * systemu (nazwa pliku w src/content/systemy).
 */
export const systemSchematics: Record<string, SchematicDefinition> = {
  "mb-70b": mb70bSchematic,
};

/**
 * `null` dla typów bez sensownego przekroju (np. akcesoria) — sekcja
 * przekroju wtedy się nie pojawia, zamiast pokazywać cudzy rysunek.
 */
export function getSchematic(
  type: ModelType | undefined,
  systemId?: string
): SchematicDefinition | null {
  if (systemId && systemSchematics[systemId]) return systemSchematics[systemId];
  if (!type) return null;
  return schematics[type] ?? null;
}

export { windowSchematic, doorSchematic, slidingSchematic, facadeSchematic, mb70bSchematic };
