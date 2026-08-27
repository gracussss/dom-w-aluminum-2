import type { ModelType } from "../../../catalog";
import type { SchematicDefinition } from "../types";
import { windowSchematic } from "./window";
import { doorSchematic } from "./door";
import { slidingSchematic } from "./sliding";
import { facadeSchematic } from "./facade";

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
 * `null` dla typów bez sensownego przekroju (np. akcesoria) — sekcja
 * przekroju wtedy się nie pojawia, zamiast pokazywać cudzy rysunek.
 */
export function getSchematic(type: ModelType | undefined): SchematicDefinition | null {
  if (!type) return null;
  return schematics[type] ?? null;
}

export { windowSchematic, doorSchematic, slidingSchematic, facadeSchematic };
