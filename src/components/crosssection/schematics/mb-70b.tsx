import { ALU, ALU_DARK, BREAK, GASKET, MONO, OUTLINE, RULE } from "../palette";
import type { SchematicDefinition } from "../types";

/* ------------------------------------------------------------------
   MB-70B — uproszczony przekrój okna.

   Rysunek WŁASNY. Powstał, bo dokumentacja producenta jest dokumentacją
   warsztatową: numery katalogowe profili i uszczelek, tolerancje, notatki
   montażowe, kreskowanie przekroju. Osoba zamawiająca okna nie czyta
   rysunków technicznych i nie ma powodu ich czytać.

   Decyzje, które odróżniają ten rysunek od schematów technicznych
   w tym samym katalogu:

   - BEZ KRESKOWANIA. Ukośne kreski oznaczają „materiał przecięty" tylko
     dla kogoś, kto zna konwencję. Zamiast nich kolor materiału.
   - BEZ NUMERKÓW. Podpisy stoją wprost przy elementach, a nie jako cyfry
     do odszukania w legendzie obok.
   - PIĘĆ ELEMENTÓW, nie dwanaście. Komory, listwy przyszybowe i profile
     adaptacyjne są prawdziwe, ale nie pomagają zrozumieć, jak to działa.
   - STRONY OPISANE PO LUDZKU: zimno na dworze, ciepło w pokoju — bo cały
     sens przekładki termicznej widać dopiero wtedy.

   Proporcje zostają prawdziwe: ościeżnica 70 mm, skrzydło 79 mm,
   w skali 1 mm = 4 px. Obie liczby z karty katalogowej systemu.
   ------------------------------------------------------------------ */

const MM = 4;

/* Pas rysunku siedzi nisko, bo cała góra kadru należy do podpisów, a dół
   do plakietki i przycisków przybliżania, które Stage kładzie na wierzchu. */
const Y_TOP = 296;
const Y_BOTTOM = 452;
const H = Y_BOTTOM - Y_TOP;

const FRAME_X = 90;
const FRAME_W = 70 * MM; // 280 px
const FRAME_SHELL = 100;
const FRAME_BREAK = 62;

const SASH_X = FRAME_X + FRAME_W; // skrzydło domyka ościeżnicę
const SASH_W = 79 * MM; // 316 px
const SASH_SHELL = 112;
const SASH_BREAK = 62;

const GLASS_X = SASH_X + SASH_W + 16;

/** Podpis przy elemencie: nazwa, zdanie wyjaśniające i cienka linia do rysunku. */
function podpis({
  x,
  y,
  do: cel,
  nazwa,
  opis,
  kotwica = "start",
}: {
  x: number;
  y: number;
  do: { x: number; y: number };
  nazwa: string;
  opis?: string;
  kotwica?: "start" | "middle" | "end";
}) {
  return (
    <g>
      <line x1={x} y1={y + 10} x2={cel.x} y2={cel.y} stroke={RULE} strokeWidth="1.4" opacity="0.7" />
      <circle cx={cel.x} cy={cel.y} r="4.5" fill={RULE} />
      <text x={x} y={y} fill="#ece8e1" fontFamily={MONO} fontSize="21" letterSpacing="1.5" textAnchor={kotwica}>
        {nazwa}
      </text>
      {opis && (
        <text x={x} y={y + 30} fill={RULE} fontFamily={MONO} fontSize="17" textAnchor={kotwica}>
          {opis}
        </text>
      )}
    </g>
  );
}

/** Linia wymiarowa — jedyne liczby na rysunku. */
function wymiar({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g opacity="0.75">
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={RULE} strokeWidth="1.4" />
      <line x1={x1} y1={y - 8} x2={x1} y2={y + 8} stroke={RULE} strokeWidth="1.4" />
      <line x1={x2} y1={y - 8} x2={x2} y2={y + 8} stroke={RULE} strokeWidth="1.4" />
      <text x={(x1 + x2) / 2} y={y - 12} fill={RULE} fontFamily={MONO} fontSize="18" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

export const mb70bSchematic: SchematicDefinition = {
  id: "mb-70b",
  system: "MB-70B",
  label: "MB-70B – jak zbudowane jest okno",
  description:
    "Rysunek własny, uproszczony: pokazuje pięć elementów, z których składa się okno MB-70B. Głębokości profili są rzeczywiste – 70 mm ościeżnica, 79 mm skrzydło.",
  viewBox: "0 0 1000 620",
  outsideLabel: "ZEWNĄTRZ · ZIMNO",
  insideLabel: "WEWNĄTRZ · CIEPŁO",

  parts: [
    {
      id: "oscieznica",
      no: 1,
      label: "Ościeżnica – 70 mm",
      desc: "Rama zamocowana na stałe w murze. To ona trzyma całe okno.",
    },
    {
      id: "skrzydlo",
      no: 2,
      label: "Skrzydło – 79 mm",
      desc: "Ruchoma część z szybą – ta, którą otwierasz klamką.",
    },
    {
      id: "przekladka",
      no: 3,
      label: "Przekładka termiczna",
      desc: "Pasek tworzywa w środku profilu. Aluminium dobrze przewodzi ciepło, więc profil jest przecięty na pół i sklejony tym paskiem – tędy ciepło z pokoju nie ucieka na zewnątrz.",
    },
    {
      id: "uszczelka",
      no: 4,
      label: "Uszczelki",
      desc: "Gumowe listwy na styku skrzydła z ościeżnicą. Zatrzymują wiatr i wodę opadową.",
    },
    {
      id: "szyba",
      no: 5,
      label: "Szyba zespolona",
      desc: "Dwie lub trzy tafle szkła, a między nimi szczelna przestrzeń z gazem. W tym systemie mieści się pakiet grubości od 23,5 do 62 mm.",
    },
  ],

  /* Pusto celowo: numerki na rysunku każą szukać opisu w legendzie obok.
     Podpisy stoją przy elementach, a legenda jest tylko rozwinięciem. */
  markers: [],

  Drawing: ({ dim }) => (
    <>
      {/* OŚCIEŻNICA — dwie powłoki aluminium, między nimi przekładka */}
      <g opacity={dim("oscieznica")} style={{ transition: "opacity .35s" }}>
        <rect x={FRAME_X} y={Y_TOP} width={FRAME_SHELL} height={H} rx="4" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect
          x={FRAME_X + FRAME_SHELL + FRAME_BREAK}
          y={Y_TOP}
          width={FRAME_W - FRAME_SHELL - FRAME_BREAK}
          height={H}
          rx="4"
          fill={ALU}
          stroke={OUTLINE}
          strokeWidth="2.5"
        />
        {/* Komory — lekki rysunek wnętrza profilu, bez czerni i bez kreskowania */}
        <rect x={FRAME_X + 22} y={Y_TOP + 34} width="56" height={H - 68} rx="3" fill={ALU_DARK} opacity="0.45" />
        <rect
          x={FRAME_X + FRAME_SHELL + FRAME_BREAK + 26}
          y={Y_TOP + 34}
          width={FRAME_W - FRAME_SHELL - FRAME_BREAK - 52}
          height={H - 68}
          rx="3"
          fill={ALU_DARK}
          opacity="0.45"
        />
      </g>

      {/* SKRZYDŁO */}
      <g opacity={dim("skrzydlo")} style={{ transition: "opacity .35s" }}>
        <rect x={SASH_X} y={Y_TOP - 16} width={SASH_SHELL} height={H + 32} rx="4" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect
          x={SASH_X + SASH_SHELL + SASH_BREAK}
          y={Y_TOP - 16}
          width={SASH_W - SASH_SHELL - SASH_BREAK}
          height={H + 32}
          rx="4"
          fill={ALU}
          stroke={OUTLINE}
          strokeWidth="2.5"
        />
        <rect x={SASH_X + 24} y={Y_TOP + 18} width="64" height={H - 36} rx="3" fill={ALU_DARK} opacity="0.45" />
        <rect
          x={SASH_X + SASH_SHELL + SASH_BREAK + 26}
          y={Y_TOP + 18}
          width={SASH_W - SASH_SHELL - SASH_BREAK - 52}
          height={H - 36}
          rx="3"
          fill={ALU_DARK}
          opacity="0.45"
        />
      </g>

      {/* PRZEKŁADKA TERMICZNA — bohater rysunku, więc pełna wysokość i mocny kolor */}
      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        <rect x={FRAME_X + FRAME_SHELL} y={Y_TOP} width={FRAME_BREAK} height={H} fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x={SASH_X + SASH_SHELL} y={Y_TOP - 16} width={SASH_BREAK} height={H + 32} fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* USZCZELKI — na styku skrzydła z ościeżnicą */}
      <g opacity={dim("uszczelka")} style={{ transition: "opacity .35s" }}>
        <rect x={SASH_X - 22} y={Y_TOP + 16} width="24" height="62" rx="8" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
        <rect x={SASH_X - 22} y={Y_BOTTOM - 78} width="24" height="62" rx="8" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
      </g>

      {/* SZYBA ZESPOLONA — dwie tafle, między nimi przestrzeń z gazem */}
      <g opacity={dim("szyba")} style={{ transition: "opacity .35s" }}>
        <rect x={GLASS_X} y={Y_TOP + 26} width="16" height={H - 52} fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x={GLASS_X + 92} y={Y_TOP + 26} width="16" height={H - 52} fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <line
          x1={GLASS_X + 54}
          y1={Y_TOP + 48}
          x2={GLASS_X + 54}
          y2={Y_BOTTOM - 48}
          stroke={RULE}
          strokeWidth="1.2"
          strokeDasharray="6 8"
          opacity="0.6"
        />
      </g>

      {/* ---------------- PODPISY ----------------
          Wszystkie w górnym pasie, w dwóch rzędach. Pod rysunkiem nie ma dla
          nich miejsca: tam Stage kładzie plakietkę i przyciski przybliżania. */}
      <g opacity={dim("oscieznica")} style={{ transition: "opacity .35s" }}>
        {podpis({
          x: 92,
          y: 128,
          do: { x: FRAME_X + 50, y: Y_TOP - 4 },
          nazwa: "OŚCIEŻNICA",
          opis: "rama na stałe w murze",
        })}
      </g>

      <g opacity={dim("skrzydlo")} style={{ transition: "opacity .35s" }}>
        {podpis({
          x: 432,
          y: 128,
          do: { x: SASH_X + 56, y: Y_TOP - 20 },
          nazwa: "SKRZYDŁO",
          opis: "część, którą otwierasz",
        })}
      </g>

      <g opacity={dim("szyba")} style={{ transition: "opacity .35s" }}>
        {podpis({
          x: 918,
          y: 128,
          do: { x: GLASS_X + 54, y: Y_TOP + 26 },
          nazwa: "SZYBA",
          opis: "dwie tafle, gaz w środku",
          kotwica: "end",
        })}
      </g>

      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        {podpis({
          x: 92,
          y: 216,
          do: { x: FRAME_X + FRAME_SHELL + FRAME_BREAK / 2, y: Y_TOP + 6 },
          nazwa: "PRZEKŁADKA TERMICZNA",
          opis: "tędy ciepło nie ucieka na zewnątrz",
        })}
      </g>

      <g opacity={dim("uszczelka")} style={{ transition: "opacity .35s" }}>
        {podpis({
          x: 614,
          y: 216,
          do: { x: SASH_X - 10, y: Y_TOP + 40 },
          nazwa: "USZCZELKI",
          opis: "zatrzymują wiatr i wodę",
        })}
      </g>

      {/* Wymiary — głębokości profili, jedyne liczby na rysunku */}
      {/* Wymiary nad konstrukcją — pod nią przyciski przybliżania zasłaniały
          linię skrzydła. Liczby są prawdziwe: głębokości z karty systemu. */}
      {wymiar({ x1: FRAME_X, x2: FRAME_X + FRAME_W, y: Y_TOP - 18, label: "70 mm" })}
      {wymiar({ x1: SASH_X, x2: SASH_X + SASH_W, y: Y_TOP - 18, label: "79 mm" })}
    </>
  ),
};
