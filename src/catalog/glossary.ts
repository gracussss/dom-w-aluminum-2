import type { SystemSpec } from "./types";

/* ------------------------------------------------------------------
   SŁOWNIK WIELKOŚCI TECHNICZNYCH

   Karta systemu podaje „klasa 4", „klasa E 4800 Pa", „klasa C5". Dla
   projektanta to komplet informacji, dla inwestora — szum. Ten słownik
   tłumaczy, CO dana wielkość opisuje.

   Czego tu NIE ma i dlaczego:

   Wpis mówi wyłącznie o wielkości, nigdy o konkretnym systemie. Zdanie
   „klasa 4 to najwyższa klasa szczelności" jest twierdzeniem o treści
   normy — a norma jest źródłem, którego nie mamy w repozytorium. Dlatego
   `scale` startuje jako `null` i renderuje się tak samo jak każdy inny
   brak w tym projekcie: widocznym „do uzupełnienia". Uzupełnia się je
   po sięgnięciu do normy, razem z `source`.

   Rozpoznawanie jest CELOWO wąskie. Parametr trafia do słownika tylko
   wtedy, gdy da się go rozpoznać niezawodnie:

     1. po numerze normy w polu `standard` (76 z 288 parametrów),
     2. po symbolu wielkości w wartości — Uf / Uw / Ud (20 parametrów).

   Etykiet producenta NIE dopasowujemy po słowach kluczowych. Ta sama
   wielkość występuje w zbiorze pod nazwami „Wodoszczelność",
   „Wodoszczelność okien" i „Wodoszczelność okna", a dopasowanie po
   fragmencie tekstu prędzej czy później podpięłoby złe wyjaśnienie pod
   parametr. Brak wpisu jest tu lepszy niż wpis nietrafiony.
   ------------------------------------------------------------------ */

export interface GlossaryEntry {
  id: string;
  /** Nazwa wielkości — nasza, niezależna od tego, jak nazwał ją producent. */
  term: string;
  /** Co ta wielkość opisuje. Definicja, nie ocena konkretnego systemu. */
  what: string;
  /** Norma klasyfikująca, jeśli wielkość jest normowana. */
  standard: string | null;
  /**
   * Jak czytać skalę klas — ile ich jest i w którą stronę rosną.
   * `null` = treść normy niepotwierdzona źródłem, UI pokazuje brak.
   */
  scale: string | null;
}

/** Klucz = numer normy bez prefiksu kraju i bez roku wydania. */
const BY_STANDARD: Record<string, GlossaryEntry> = {
  "12207": {
    id: "air-permeability",
    term: "Przepuszczalność powietrza",
    what: "Ile powietrza przenika przez zamkniętą konstrukcję przy różnicy ciśnień po obu jej stronach. Odpowiada za odczucie przeciągu i za straty ciepła na nieszczelnościach, nie na przenikaniu przez profil.",
    standard: "PN-EN 12207",
    scale: null,
  },
  "12208": {
    id: "watertightness",
    term: "Wodoszczelność",
    what: "Do jakiego ciśnienia wody konstrukcja pozostaje szczelna w badaniu z jednoczesnym zraszaniem i naporem powietrza. Odpowiada odporności na deszcz padający pod wiatr.",
    standard: "PN-EN 12208",
    scale: null,
  },
  "12210": {
    id: "wind-load",
    term: "Odporność na obciążenie wiatrem",
    what: "Jakie parcie i ssanie wiatru konstrukcja przenosi bez trwałego odkształcenia i bez utraty pozostałych właściwości. Rośnie z wysokością budynku i z powierzchnią przeszklenia.",
    standard: "PN-EN 12210",
    scale: null,
  },
  "12152": {
    id: "cw-air-permeability",
    term: "Przepuszczalność powietrza ściany osłonowej",
    what: "To samo zjawisko co przy oknie, ale badane dla fasady jako całości – razem ze złączami między modułami i z mocowaniem do konstrukcji budynku.",
    standard: "PN-EN 12152",
    scale: null,
  },
  "12154": {
    id: "cw-watertightness",
    term: "Wodoszczelność ściany osłonowej",
    what: "Szczelność fasady na wodę opadową badana dla całej ściany, nie dla pojedynczego pola. Decydują o niej przede wszystkim złącza i odwodnienie profili.",
    standard: "PN-EN 12154",
    scale: null,
  },
  "14019": {
    id: "cw-impact",
    term: "Odporność ściany osłonowej na uderzenie",
    what: "Zachowanie fasady po uderzeniu ciałem miękkim i twardym – czy przeszklenie pozostaje na miejscu i czy nie powstaje zagrożenie dla przechodzących poniżej.",
    standard: "PN-EN 14019",
    scale: null,
  },
  "13501": {
    id: "fire",
    term: "Klasyfikacja ogniowa",
    what: "Zachowanie konstrukcji w pożarze. Klasa opisuje, przez ile minut przegroda zachowuje określone właściwości – nośność, szczelność ogniową, izolacyjność ogniową.",
    standard: "PN-EN 13501",
    scale: null,
  },
};

/**
 * Współczynniki przenikania ciepła. Rozdzielone celowo: to trzy RÓŻNE
 * wielkości i zestawianie ich ze sobą jest błędem merytorycznym, a nie
 * uproszczeniem. Producent podaje raz Uf, raz Uw — bez tego rozróżnienia
 * czytelnik porównuje ramę z całym oknem i wychodzi mu nieprawda.
 */
const U_NOTE =
  "Uf, Uw i Ud to trzy różne wielkości – nie zestawia się ich ze sobą ani nie przelicza jednej na drugą.";

const BY_SYMBOL: Record<string, GlossaryEntry> = {
  f: {
    id: "uf",
    term: "Uf – przenikanie ciepła profilu",
    what: `Współczynnik dla samej ramy, bez szyby. Mówi o profilu, nie o gotowym oknie. ${U_NOTE}`,
    standard: null,
    scale: null,
  },
  w: {
    id: "uw",
    term: "Uw – przenikanie ciepła okna",
    what: `Współczynnik dla całego okna: ramy razem z pakietem szybowym, w konkretnym wymiarze i podziale. ${U_NOTE}`,
    standard: null,
    scale: null,
  },
  d: {
    id: "ud",
    term: "Ud – przenikanie ciepła drzwi",
    what: `Współczynnik dla kompletnych drzwi razem z wypełnieniem. ${U_NOTE}`,
    standard: null,
    scale: null,
  },
};

/** Numer normy z zapisu producenta: „PN-EN 12208:2001" → „12208". */
function standardNumber(standard: string | null): string | null {
  if (!standard) return null;
  const match = standard.match(/(\d{4,5})/);
  return match ? match[1] : null;
}

/** Symbol wielkości z wartości: „Uw od 0,62" → „w". Wielkość liter bez znaczenia. */
function thermalSymbol(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/\bU([fwd])\b/i);
  return match ? match[1].toLowerCase() : null;
}

/** Wyjaśnienie dla parametru albo `null`, gdy nie rozpoznajemy go pewnie. */
export function explainSpec(spec: SystemSpec): GlossaryEntry | null {
  const number = standardNumber(spec.standard);
  if (number && BY_STANDARD[number]) return BY_STANDARD[number];

  const symbol = thermalSymbol(spec.value);
  if (symbol && BY_SYMBOL[symbol]) return BY_SYMBOL[symbol];

  return null;
}

/**
 * Wyjaśnienia dla zestawu parametrów — bez powtórzeń, w kolejności
 * pojawiania się na karcie. Legenda ma mówić o tym, co widać wyżej.
 */
export function explainSpecs(specs: SystemSpec[]): GlossaryEntry[] {
  const seen = new Set<string>();
  const entries: GlossaryEntry[] = [];

  for (const spec of specs) {
    const entry = explainSpec(spec);
    if (!entry || seen.has(entry.id)) continue;
    seen.add(entry.id);
    entries.push(entry);
  }

  return entries;
}
