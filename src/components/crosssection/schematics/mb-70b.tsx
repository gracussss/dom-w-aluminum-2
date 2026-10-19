import { ALU, ALU_DARK, BREAK, GASKET, MONO, OUTLINE, RULE } from "../palette";
import type { SchematicDefinition } from "../types";

/* ------------------------------------------------------------------
   MB-70B — przekrój poziomy przez ościeżnicę i skrzydło okna.

   Rysunek WŁASNY, narysowany na podstawie karty 04-05.00 z katalogu
   technicznego producenta. Różnica wobec oryginału jest celowa:
   katalog jest dokumentacją warsztatową — ma numery katalogowe profili
   i uszczelek (K518101X, 120522), tolerancje i notatki montażowe.
   Zamawiający okna nie potrzebuje żadnej z tych rzeczy; potrzebuje
   zobaczyć, że profil ma trzy komory, przekładkę pośrodku i gdzie
   siedzi szyba.

   W przeciwieństwie do schematów ogólnych (window/door/sliding/facade)
   ten ma PROPORCJE I GŁĘBOKOŚCI TEGO SYSTEMU: 70 mm ościeżnica,
   79 mm skrzydło. Skala rysunku: 1 mm = 4 px.
   ------------------------------------------------------------------ */

/** Skala przyjęta dla całego rysunku — głębokości muszą się zgadzać między sobą. */
const MM = 4;

/* Geometria w jednym miejscu — rysunek ma trzymać proporcje 70 : 79,
   więc każdy profil wynika z tych liczb, a nie z oka. */
const FRAME_X = 96;
const FRAME_W = 70 * MM; // 280 px
const FRAME_SHELL = 104; // powłoka zewnętrzna
const FRAME_BREAK = 60; // pas przekładek
const FRAME_INNER = FRAME_W - FRAME_SHELL - FRAME_BREAK; // 116 px

/* Skrzydło zachodzi na ościeżnicę w przyldze — zaczyna się przed jej końcem. */
const SASH_X = 366;
const SASH_W = 79 * MM; // 316 px
const SASH_SHELL = 130;
const SASH_BREAK = 60;
const SASH_INNER = SASH_W - SASH_SHELL - SASH_BREAK; // 126 px

const GLASS_X = 700;

/* Pionowy podział kadru: u góry pas na opisy stron (y=52, rysuje je SideLabels)
   i linie wymiarowe, na dole ~100 px wolnego — tam Stage kładzie plakietkę
   i przyciski przybliżania, więc nic rysunku nie może tam zajechać. */
const TOP = 190;
const BOTTOM = 520;

/**
 * Linia wymiarowa z podpisem — konwencja rysunku technicznego.
 *
 * Zwykła funkcja wołana w nawiasach, nie komponent w JSX: plik eksportuje
 * definicję schematu, a nie komponent, i mieszanie jednego z drugim gasi
 * odświeżanie na gorąco (oxlint: react/only-export-components).
 */
function wymiar({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={RULE} strokeWidth="1.6" />
      <line x1={x1} y1={y - 9} x2={x1} y2={y + 9} stroke={RULE} strokeWidth="1.6" />
      <line x1={x2} y1={y - 9} x2={x2} y2={y + 9} stroke={RULE} strokeWidth="1.6" />
      <text
        x={(x1 + x2) / 2}
        y={y - 14}
        fill={RULE}
        fontFamily={MONO}
        fontSize="22"
        letterSpacing="2"
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

export const mb70bSchematic: SchematicDefinition = {
  id: "mb-70b",
  system: "MB-70B",
  label: "MB-70B – przekrój poziomy okna",
  description:
    "Rysunek własny na podstawie katalogu technicznego MB-70B (karta 04-05.00). Pokazuje układ ościeżnicy 70 mm i skrzydła 79 mm z przekładkami termicznymi, uszczelką centralną i pakietem szybowym.",
  viewBox: "0 0 1000 620",
  outsideLabel: "ZEWNĄTRZ",
  insideLabel: "WEWNĄTRZ",

  parts: [
    {
      id: "oscieznica",
      no: 1,
      label: "Ościeżnica – 70 mm",
      desc: "Nieruchoma rama osadzana w murze. Trzykomorowy profil z przekładką termiczną pośrodku.",
    },
    {
      id: "skrzydlo",
      no: 2,
      label: "Skrzydło – 79 mm",
      desc: "Ruchoma część okna. Głębsze od ościeżnicy, dzięki czemu po zamknięciu licuje się z nią od zewnątrz.",
    },
    {
      id: "przekladka",
      no: 3,
      label: "Przekładka termiczna",
      desc: "Wkładka z tworzywa rozdzielająca zewnętrzną i wewnętrzną powłokę aluminium. To ona przerywa drogę ciepła.",
    },
    {
      id: "uszczelka",
      no: 4,
      label: "Uszczelki: przylgowa i centralna",
      desc: "Trzy linie uszczelnienia. Centralna, w pasie przekładek, odpowiada za szczelność na wodę i powietrze.",
    },
    {
      id: "szyba",
      no: 5,
      label: "Pakiet szybowy – 23,5 do 62 mm",
      desc: "Zakres grubości szklenia w skrzydle okna. Mieści zestawy jedno- i dwukomorowe.",
    },
    {
      id: "listwa",
      no: 6,
      label: "Listwa przyszybowa",
      desc: "Dociska pakiet szybowy od strony wnętrza. Pozwala wymienić szybę bez demontażu skrzydła.",
    },
  ],

  markers: [
    { id: "oscieznica", no: 1, x: 148, y: 236 },
    { id: "skrzydlo", no: 2, x: 452, y: 236 },
    { id: "przekladka", no: 3, x: 226, y: 498 },
    { id: "uszczelka", no: 4, x: 351, y: 356 },
    { id: "szyba", no: 5, x: 762, y: 236 },
    { id: "listwa", no: 6, x: 870, y: 470 },
  ],

  Drawing: ({ dim }) => (
    <>
      {/* 1. OŚCIEŻNICA — powłoka zewnętrzna, pas przekładek, powłoka wewnętrzna */}
      <g opacity={dim("oscieznica")} style={{ transition: "opacity .35s" }}>
        <rect x={FRAME_X} y={TOP} width={FRAME_SHELL} height={BOTTOM - TOP} fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x={FRAME_X} y={TOP} width={FRAME_SHELL} height={BOTTOM - TOP} fill="url(#csHatch)" />
        <rect x={FRAME_X + FRAME_SHELL + FRAME_BREAK} y={TOP} width={FRAME_INNER} height={BOTTOM - TOP} fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x={FRAME_X + FRAME_SHELL + FRAME_BREAK} y={TOP} width={FRAME_INNER} height={BOTTOM - TOP} fill="url(#csHatch)" />
      </g>

      {/* 2. SKRZYDŁO */}
      <g opacity={dim("skrzydlo")} style={{ transition: "opacity .35s" }}>
        <rect x={SASH_X} y={TOP + 18} width={SASH_SHELL} height={BOTTOM - TOP - 36} fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x={SASH_X} y={TOP + 18} width={SASH_SHELL} height={BOTTOM - TOP - 36} fill="url(#csHatch)" />
        <rect x={SASH_X + SASH_SHELL + SASH_BREAK} y={TOP + 18} width={SASH_INNER} height={BOTTOM - TOP - 36} fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x={SASH_X + SASH_SHELL + SASH_BREAK} y={TOP + 18} width={SASH_INNER} height={BOTTOM - TOP - 36} fill="url(#csHatch)" />
      </g>

      {/* 3. PRZEKŁADKI — w ościeżnicy i w skrzydle, w jednym pasie izolacji */}
      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        <rect x={FRAME_X + FRAME_SHELL} y={TOP + 26} width={FRAME_BREAK} height="88" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x={FRAME_X + FRAME_SHELL} y={BOTTOM - 114} width={FRAME_BREAK} height="88" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x={SASH_X + SASH_SHELL} y={TOP + 44} width={SASH_BREAK} height="82" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x={SASH_X + SASH_SHELL} y={BOTTOM - 126} width={SASH_BREAK} height="82" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* 4. USZCZELNIENIE — przylgowe na ościeżnicy, centralne w styku z przylgą skrzydła */}
      <g opacity={dim("uszczelka")} style={{ transition: "opacity .35s" }}>
        <rect x={FRAME_X + FRAME_W - 28} y={TOP + 34} width="26" height="92" rx="7" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
        <rect x={FRAME_X + FRAME_W - 28} y={BOTTOM - 126} width="26" height="92" rx="7" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
        <rect x={SASH_X - 30} y={TOP + 150} width="30" height="110" rx="9" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
      </g>

      {/* 5. PAKIET SZYBOWY — dwie komory, ramki dystansowe u dołu */}
      <g opacity={dim("szyba")} style={{ transition: "opacity .35s" }}>
        <rect x={GLASS_X} y={TOP + 34} width="18" height={BOTTOM - TOP - 68} fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x={GLASS_X + 62} y={TOP + 34} width="18" height={BOTTOM - TOP - 68} fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x={GLASS_X + 124} y={TOP + 34} width="18" height={BOTTOM - TOP - 68} fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x={GLASS_X + 18} y={BOTTOM - 68} width="44" height="30" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2" />
        <rect x={GLASS_X + 80} y={BOTTOM - 68} width="44" height="30" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2" />
      </g>

      {/* 6. LISTWA PRZYSZYBOWA — dociska pakiet od strony wnętrza */}
      <g opacity={dim("listwa")} style={{ transition: "opacity .35s" }}>
        <path
          d={`M${GLASS_X + 142} ${TOP + 50} h56 a10 10 0 0 1 10 10 v${BOTTOM - TOP - 120} a10 10 0 0 1 -10 10 h-56 z`}
          fill={ALU}
          stroke={OUTLINE}
          strokeWidth="2.5"
        />
        <path
          d={`M${GLASS_X + 142} ${TOP + 50} h56 a10 10 0 0 1 10 10 v${BOTTOM - TOP - 120} a10 10 0 0 1 -10 10 h-56 z`}
          fill="url(#csHatch)"
        />
      </g>

      {/* Komory na końcu — profile rysowane później by je zakryły */}
      <g opacity={dim("oscieznica")} style={{ transition: "opacity .35s" }}>
        <rect x={FRAME_X + 20} y={TOP + 30} width="64" height="124" fill={OUTLINE} fillOpacity="0.82" />
        <rect x={FRAME_X + 20} y={BOTTOM - 154} width="64" height="124" fill={OUTLINE} fillOpacity="0.82" />
        <rect x={FRAME_X + FRAME_SHELL + FRAME_BREAK + 22} y={TOP + 30} width="72" height="124" fill={OUTLINE} fillOpacity="0.82" />
        <rect x={FRAME_X + FRAME_SHELL + FRAME_BREAK + 22} y={BOTTOM - 154} width="72" height="124" fill={OUTLINE} fillOpacity="0.82" />
      </g>
      <g opacity={dim("skrzydlo")} style={{ transition: "opacity .35s" }}>
        <rect x={SASH_X + 22} y={TOP + 48} width="86" height="108" fill={OUTLINE} fillOpacity="0.82" />
        <rect x={SASH_X + 22} y={BOTTOM - 156} width="86" height="108" fill={OUTLINE} fillOpacity="0.82" />
        <rect x={SASH_X + SASH_SHELL + SASH_BREAK + 20} y={TOP + 48} width="86" height="108" fill={OUTLINE} fillOpacity="0.82" />
        <rect x={SASH_X + SASH_SHELL + SASH_BREAK + 20} y={BOTTOM - 156} width="86" height="108" fill={OUTLINE} fillOpacity="0.82" />
      </g>

      {/* Wymiary — jedyne liczby na rysunku, obie z karty katalogowej systemu.
          Nad konstrukcją, nie pod nią: dół kadru należy do plakietki i przycisków. */}
      {wymiar({ x1: FRAME_X, x2: FRAME_X + FRAME_W, y: 112, label: "OŚCIEŻNICA 70 mm" })}
      {wymiar({ x1: SASH_X, x2: SASH_X + SASH_W, y: 158, label: "SKRZYDŁO 79 mm" })}
    </>
  ),
};
