/* ------------------------------------------------------------------
   SEKWENCJA PREZENTACJI PRODUKTU

   Jedna tablica opisuje i ujęcie kamery, i tekst kroku. Rozdzielenie ich
   na dwa pliki kończyło się rozjazdem: kamera pokazywała przekrój, a opis
   mówił o skrzydle.

   `{depth}` w treści podmienia UI na wartość z danych systemu. W kodzie
   nie ma żadnej liczby opisującej konkretny system — patrz src/catalog/geometry.ts.
   ------------------------------------------------------------------ */

export interface PresentationStep {
  id: string;
  no: string;
  /** Krótka etykieta na liście kroków. */
  label: string;
  title: string;
  body: string;
  camera: {
    pos: [number, number, number];
    look: [number, number, number];
  };
  /** Otwarcie skrzydła, 0–1. */
  open: number;
  /** Rozsunięcie warstw konstrukcji, 0–1. */
  spread: number;
  /** Wymiar głębokości zabudowy w scenie. */
  dimension?: boolean;
  /** Numerowane etykiety elementów. */
  parts?: boolean;
}

export const PRESENTATION_STEPS: PresentationStep[] = [
  {
    id: "konstrukcja",
    no: "01",
    label: "Konstrukcja",
    title: "Okno jednoskrzydłowe",
    body: "Przykładowa konstrukcja w tym systemie: ościeżnica osadzana w murze, skrzydło rozwierne i pakiet szybowy.",
    camera: { pos: [1.15, 0.34, 2.55], look: [0, 0, 0] },
    open: 0,
    spread: 0,
  },
  {
    id: "skrzydlo",
    no: "02",
    label: "Skrzydło",
    title: "Ruch skrzydła",
    body: "Skrzydło rozwierne. Ten sam system obejmuje też konstrukcje stałe i drzwi zewnętrzne.",
    camera: { pos: [1.45, 0.16, 2.35], look: [0, -0.02, 0.06] },
    open: 1,
    spread: 0,
  },
  {
    id: "zblizenie",
    no: "03",
    label: "Zbliżenie",
    title: "Styk profili",
    body: "Narożnik ościeżnicy — miejsce, w którym spotykają się profil pionowy i poziomy.",
    camera: { pos: [0.35, 0.9, 0.85], look: [-0.5, 0.65, 0] },
    open: 0.12,
    spread: 0,
  },
  {
    id: "profil",
    no: "04",
    label: "Profil",
    title: "Głębokość zabudowy",
    body: "{depth} — jedyny wymiar tego systemu podany przez producenta. Model odwzorowuje go w skali 1:1; pozostałe proporcje są poglądowe.",
    camera: { pos: [0.15, 0.12, 0.55], look: [-0.5, 0, 0] },
    open: 0,
    spread: 0,
    dimension: true,
  },
  {
    id: "przekroj",
    no: "05",
    label: "Przekrój",
    title: "Trzy warstwy profilu",
    body: "Dwie powłoki aluminium rozdzielone przekładką termiczną. Podział {depth} między warstwy jest poglądowy — producent go nie publikuje.",
    camera: { pos: [2.05, 0.3, 1.7], look: [0, 0, 0.1] },
    open: 0.1,
    spread: 1,
    dimension: true,
  },
  {
    id: "elementy",
    no: "06",
    label: "Elementy",
    title: "Części konstrukcji",
    body: "Cztery z siedmiu elementów schematu przekroju. Numeracja jest wspólna z rysunkiem w sekcji „Budowa profilu”.",
    camera: { pos: [2.45, 0.42, 2.45], look: [0, 0, 0.12] },
    open: 0.1,
    spread: 1,
    parts: true,
  },
  {
    id: "calosc",
    no: "07",
    label: "Całość",
    title: "Konstrukcja złożona",
    body: "Model poglądowy, zbudowany z danych katalogowych. Po otrzymaniu pliku od producenta zastąpi go model systemu.",
    camera: { pos: [1.15, 0.34, 2.55], look: [0, 0, 0] },
    open: 0,
    spread: 0,
  },
];

/** Podstawia wartości z danych systemu w treść kroku. */
export function stepBody(step: PresentationStep, depthLabel: string | null) {
  return step.body.replace("{depth}", depthLabel ?? "Głębokość zabudowy");
}
