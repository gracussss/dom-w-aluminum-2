import { entriesFromGlob } from "../lib/content";
import { normalizeRealizations } from "./realizationModel";

export { PORTFOLIO_DISCLAIMER, normalizeRealization } from "./realizationModel";
export type { Realization } from "./realizationModel";

/* Realizacje z panelu: jeden plik na realizację w src/content/realizacje/.
   Kolejność na stronie wynika z pola „Data” (najnowsze na górze). */
export const realizations = normalizeRealizations(
  entriesFromGlob(import.meta.glob("../content/realizacje/*.json", { eager: true, import: "default" }))
);

export const hasPlaceholderRealizations = realizations.some((r) => !r.verified);

export function getRealizationBySlug(slug: string) {
  return realizations.find((r) => r.slug === slug);
}

/** Pozycje, które wolno pokazać wyszukiwarce — patrz `verified`. */
export const verifiedRealizations = realizations.filter((r) => r.verified);
