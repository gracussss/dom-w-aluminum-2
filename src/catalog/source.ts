import { systems } from "./dataset";
import { taxonomy } from "./taxonomy";
import { createLocalRepository, validateSource } from "./repository";
import type { LocalSource } from "./repository";

/* ------------------------------------------------------------------
   PUNKT WYBORU ŹRÓDŁA DANYCH

   To jedyne miejsce w projekcie, które wie, skąd biorą się dane.
   Przejście na API/CMS:

     import { createHttpRepository } from "./repository";
     export const defaultRepository = createHttpRepository(import.meta.env.VITE_CATALOG_API);

   Żaden komponent nie wymaga zmian.
   ------------------------------------------------------------------ */

export const localSource: LocalSource = { systems, taxonomy };

export const defaultRepository = createLocalRepository(localSource);

/* Spójność zbioru sprawdzana tylko w trybie deweloperskim — build produkcyjny
   nie płaci za walidację, a błąd w danych widać od razu przy pracy. */
if (import.meta.env.DEV) {
  const problems = validateSource(localSource);
  if (problems.length > 0) {
    console.error("[katalog] Niespójne dane:\n" + problems.map((p) => " - " + p).join("\n"));
  }
}
