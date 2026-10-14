import { defineSystems } from "./systemFactory";
import type { AluSystem } from "./types";

/* ------------------------------------------------------------------
   ZBIÓR DANYCH — ŹRÓDŁO LOKALNE

   Katalog systemów ALUPROF zebrany z publicznych kart systemów
   (aluprof.com/produkt/<slug>) oraz sekcji oferty (aluprof.com/pl/oferta).
   Przypisania do kategorii są takie, jak u producenta — dlatego jeden
   system bywa w kilku kategoriach naraz.

   Rekordy systemów żyją w src/content/systemy/*.json — jeden plik na
   system, edytowany w panelu (/admin → „Katalog systemów”). Ten moduł
   tylko je wczytuje; model składa systemFactory.ts. Kontrakt (typy) jest
   ten sam, komponenty nie wiedzą, skąd przyszły dane.

   ZASADA: żadna wartość techniczna bez pola `source`.
   Puste pole (`null`) jest poprawnym stanem i renderuje się jako
   „Do uzupełnienia”. Wartość bez źródła jest błędem, nie brakiem.

   CZEGO TU NIE MA I DLACZEGO:
   - zastosowanie budynkowe — producent go przy systemach nie podaje,
   - warianty — jw., karta systemu ich nie wylicza w sposób nadający się
     do przepisania,
   - głębokość zabudowy — poza nielicznymi systemami nie jest publikowana
     w bloku parametrów; zostaje jako pole puste,
   - przekroje i modele 3D — pliki są u producenta, ale ich publikacja
     wymaga pisemnej zgody (patrz MATERIALY.md).
   ------------------------------------------------------------------ */

export const systems: AluSystem[] = defineSystems(
  Object.entries(import.meta.glob("../content/systemy/*.json", { eager: true, import: "default" })).map(
    ([path, data]) => ({ slug: path.replace(/^.*\//, "").replace(/\.json$/, ""), data })
  )
);
