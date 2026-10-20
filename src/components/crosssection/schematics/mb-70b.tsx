import { BREAK, GASKET, MONO, OUTLINE, RULE } from "../palette";
import type { SchematicDefinition } from "../types";

/* ------------------------------------------------------------------
   MB-70B — uproszczony przekrój profilu.

   Rysunek WŁASNY, zamiast dokumentacji warsztatowej producenta.

   Czego tu świadomie nie ma:
   - kreskowania przekroju (konwencja czytelna tylko dla technika),
   - numerków do odszukania w legendzie obok,
   - profili adaptacyjnych, listew i numerów katalogowych.

   Co zamiast tego: kształt. Profil aluminiowy ma rozpoznawalną sylwetkę —
   dwie powłoki z pustymi komorami, spięte paskiem tworzywa. Narysowany
   prostokątami wygląda jak prostokąty; dopiero wycięte komory, zaokrąglone
   krawędzie i metaliczny gradient sprawiają, że widać metal.

   Głębokości są prawdziwe: ościeżnica 70 mm, skrzydło 79 mm,
   w skali 1 mm = 4 px.
   ------------------------------------------------------------------ */

const MM = 4;

/* Pas rysunku siedzi w dolnej połowie kadru, bo wszystkie podpisy idą nad
   niego. Dół zostaje pusty: Stage kładzie tam plakietkę i przyciski
   przybliżania, a one zasłaniają wszystko, co się pod nie podsunie. */
const Y = 292;
const H = 196;

/* Ościeżnica: powłoka zewnętrzna | przekładka | powłoka wewnętrzna */
const F_X = 118;
const F_W = 70 * MM; // 280
const F_SHELL = 112;
const F_BREAK = 52;

/* Skrzydło domyka ościeżnicę — między nimi zostaje szczelina na uszczelkę. */
const S_X = F_X + F_W + 20;
const S_W = 79 * MM; // 316
const S_SHELL = 124;
const S_BREAK = 52;

const GLASS_X = S_X + S_W;

/** Komora w profilu — wycięta w metalu, więc w kolorze tła kadru. */
function komora(x: number, y: number, w: number, h: number) {
  return <rect x={x} y={y} width={w} height={h} rx="7" fill="#0f1113" opacity="0.92" />;
}

/** Podpis z cienką linią odniesienia. Sama nazwa — wyjaśnienia są w legendzie. */
function podpis({
  x,
  y,
  do: cel,
  tekst,
  kotwica = "start",
}: {
  x: number;
  y: number;
  do: { x: number; y: number };
  tekst: string;
  kotwica?: "start" | "middle" | "end";
}) {
  const start = kotwica === "end" ? x - 10 : x + 10;
  const zalamanie = (y + cel.y) / 2;
  return (
    <g>
      <path
        d={`M${start} ${y + 8} L${start} ${zalamanie} L${cel.x} ${zalamanie} L${cel.x} ${cel.y}`}
        fill="none"
        stroke={RULE}
        strokeWidth="1.3"
        opacity="0.5"
      />
      <circle cx={cel.x} cy={cel.y} r="4" fill={RULE} opacity="0.85" />
      <text x={x} y={y} fill="#ece8e1" fontFamily={MONO} fontSize="20" letterSpacing="1.6" textAnchor={kotwica}>
        {tekst}
      </text>
    </g>
  );
}

/** Linia wymiarowa głębokości. */
function glebokosc({ x1, x2, label }: { x1: number; x2: number; label: string }) {
  return (
    <g opacity="0.7">
      <line x1={x1} y1="136" x2={x2} y2="136" stroke={RULE} strokeWidth="1.3" />
      <line x1={x1} y1="130" x2={x1} y2="142" stroke={RULE} strokeWidth="1.3" />
      <line x1={x2} y1="130" x2={x2} y2="142" stroke={RULE} strokeWidth="1.3" />
      <text x={(x1 + x2) / 2} y="124" fill={RULE} fontFamily={MONO} fontSize="17" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

export const mb70bSchematic: SchematicDefinition = {
  id: "mb-70b",
  system: "MB-70B",
  label: "MB-70B – przekrój profilu",
  description:
    "Rysunek własny, uproszczony. Pokazuje, z czego składa się profil okna MB-70B. Głębokości są rzeczywiste: 70 mm ościeżnica, 79 mm skrzydło.",
  viewBox: "0 0 1000 620",
  outsideLabel: "ZEWNĄTRZ",
  insideLabel: "WEWNĄTRZ",

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
      desc: "Pasek tworzywa w środku profilu. Aluminium dobrze przewodzi ciepło, więc profil jest przecięty na pół i spięty tym paskiem – ciepło z pokoju nie ma którędy uciec na zewnątrz.",
    },
    {
      id: "uszczelka",
      no: 4,
      label: "Uszczelka",
      desc: "Guma na styku skrzydła z ościeżnicą. Zatrzymuje wiatr i wodę opadową.",
    },
    {
      id: "szyba",
      no: 5,
      label: "Szyba zespolona",
      desc: "Dwie lub trzy tafle szkła, między nimi szczelna przestrzeń z gazem. Tu mieści się pakiet grubości od 23,5 do 62 mm.",
    },
  ],

  /* Pusto celowo — numerki na rysunku każą szukać opisu w legendzie obok. */
  markers: [],

  Drawing: ({ dim }) => (
    <>
      <defs>
        {/* Metal czytelny bez kreskowania: jaśniejsza krawędź u góry,
            ciemniejsza u dołu — tak jak światło kładzie się na wytłoczce. */}
        <linearGradient id="mb70bAlu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d7dbde" />
          <stop offset="45%" stopColor="#b2b8bd" />
          <stop offset="100%" stopColor="#8d9398" />
        </linearGradient>
        <linearGradient id="mb70bSzyba" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fc2ba" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7d9a92" stopOpacity="0.26" />
        </linearGradient>
      </defs>

      {/* OŚCIEŻNICA */}
      <g opacity={dim("oscieznica")} style={{ transition: "opacity .35s" }}>
        <rect x={F_X} y={Y} width={F_SHELL} height={H} rx="10" fill="url(#mb70bAlu)" stroke={OUTLINE} strokeWidth="2" />
        <rect
          x={F_X + F_SHELL + F_BREAK}
          y={Y}
          width={F_W - F_SHELL - F_BREAK}
          height={H}
          rx="10"
          fill="url(#mb70bAlu)"
          stroke={OUTLINE}
          strokeWidth="2"
        />
        {komora(F_X + 26, Y + 30, F_SHELL - 52, H - 60)}
        {komora(F_X + F_SHELL + F_BREAK + 26, Y + 30, F_W - F_SHELL - F_BREAK - 52, H - 60)}
      </g>

      {/* SKRZYDŁO — wyższe od ościeżnicy, bo po zamknięciu ją przykrywa */}
      <g opacity={dim("skrzydlo")} style={{ transition: "opacity .35s" }}>
        <rect
          x={S_X}
          y={Y - 20}
          width={S_SHELL}
          height={H + 40}
          rx="10"
          fill="url(#mb70bAlu)"
          stroke={OUTLINE}
          strokeWidth="2"
        />
        <rect
          x={S_X + S_SHELL + S_BREAK}
          y={Y - 20}
          width={S_W - S_SHELL - S_BREAK}
          height={H + 40}
          rx="10"
          fill="url(#mb70bAlu)"
          stroke={OUTLINE}
          strokeWidth="2"
        />
        {komora(S_X + 28, Y + 12, S_SHELL - 56, H + 16)}
        {komora(S_X + S_SHELL + S_BREAK + 28, Y + 12, S_W - S_SHELL - S_BREAK - 56, H + 16)}
      </g>

      {/* PRZEKŁADKA TERMICZNA — spina obie powłoki, w obu profilach */}
      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        <rect
          x={F_X + F_SHELL}
          y={Y + 18}
          width={F_BREAK}
          height={H - 36}
          rx="4"
          fill={BREAK}
          stroke={OUTLINE}
          strokeWidth="1.6"
        />
        <rect
          x={S_X + S_SHELL}
          y={Y - 2}
          width={S_BREAK}
          height={H + 4}
          rx="4"
          fill={BREAK}
          stroke={OUTLINE}
          strokeWidth="1.6"
        />
      </g>

      {/* USZCZELKA — w szczelinie między ościeżnicą a skrzydłem */}
      <g opacity={dim("uszczelka")} style={{ transition: "opacity .35s" }}>
        <rect
          x={F_X + F_W - 3}
          y={Y + 56}
          width="26"
          height={H - 112}
          rx="13"
          fill={GASKET}
          stroke={OUTLINE}
          strokeWidth="1.6"
        />
      </g>

      {/* SZYBA ZESPOLONA — wychodzi ze skrzydła w głąb okna */}
      <g opacity={dim("szyba")} style={{ transition: "opacity .35s" }}>
        <rect
          x={GLASS_X}
          y={Y + 48}
          width={958 - GLASS_X}
          height={H - 96}
          rx="5"
          fill="url(#mb70bSzyba)"
          stroke={OUTLINE}
          strokeWidth="1.6"
        />
        {/* Dwie tafle i przestrzeń między nimi — stąd „zespolona” */}
        <line x1={GLASS_X + 8} y1={Y + 64} x2="946" y2={Y + 64} stroke="#dbe6e2" strokeWidth="2.5" opacity="0.85" />
        <line x1={GLASS_X + 8} y1={Y + H - 64} x2="946" y2={Y + H - 64} stroke="#dbe6e2" strokeWidth="2.5" opacity="0.85" />
      </g>

      {/* ---------------- PODPISY ---------------- */}
      <g opacity={dim("oscieznica")} style={{ transition: "opacity .35s" }}>
        {podpis({ x: 118, y: 190, do: { x: F_X + 56, y: Y - 2 }, tekst: "OŚCIEŻNICA" })}
      </g>
      <g opacity={dim("skrzydlo")} style={{ transition: "opacity .35s" }}>
        {podpis({ x: 476, y: 190, do: { x: S_X + 62, y: Y - 22 }, tekst: "SKRZYDŁO" })}
      </g>
      <g opacity={dim("szyba")} style={{ transition: "opacity .35s" }}>
        {podpis({ x: 944, y: 190, do: { x: 880, y: Y + 48 }, tekst: "SZYBA", kotwica: "end" })}
      </g>
      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        {podpis({
          x: 118,
          y: 244,
          do: { x: F_X + F_SHELL + F_BREAK / 2, y: Y + 20 },
          tekst: "PRZEKŁADKA TERMICZNA",
        })}
      </g>
      <g opacity={dim("uszczelka")} style={{ transition: "opacity .35s" }}>
        {podpis({ x: 700, y: 244, do: { x: F_X + F_W + 10, y: Y + 58 }, tekst: "USZCZELKA" })}
      </g>

      {/* Głębokości — jedyne liczby na rysunku, obie z karty systemu */}
      {glebokosc({ x1: F_X, x2: F_X + F_W, label: "70 mm" })}
      {glebokosc({ x1: S_X, x2: S_X + S_W, label: "79 mm" })}
    </>
  ),
};
