import { BREAK, GASKET, MONO, OUTLINE, RULE } from "../palette";
import type { SchematicDefinition } from "../types";

/* ------------------------------------------------------------------
   MB-70B — uproszczony przekrój profilu.

   Rysunek WŁASNY. Trzy poprzednie podejścia były złe i warto wiedzieć
   dlaczego, żeby nie wrócić do nich przy kolejnych systemach: rysowałem
   profile prostokątami — najpierw pełnymi, potem z prostokątną dziurą.
   Wytłoczka aluminiowa tak nie wygląda i widać to na pierwszy rzut oka.

   Prawdziwy profil ma:
   - ściankę 2–3 mm, która wije się po całym obrysie,
   - przylgi i noski, na których siadają uszczelki,
   - rowek okuciowy od strony pokoju,
   - kilka komór różnej wielkości, rozdzielonych wewnętrznymi żebrami,
   - przylgę skrzydła zachodzącą na ościeżnicę.

   Dlatego każda powłoka jest tu łamanym obrysem z wyciętymi komorami
   (`fill-rule: evenodd`), a nie zaokrąglonym prostokątem.

   Uproszczenie względem katalogu producenta polega na LICZBIE detali —
   nie ma numerów katalogowych, tolerancji, wariantów uszczelek ani
   profili adaptacyjnych — a nie na zamianie wytłoczki w klocek.

   Skala 1 mm = 4 px. Głębokości rzeczywiste: ościeżnica 70, skrzydło 79 mm.
   ------------------------------------------------------------------ */

const MONO_SIZE = 19;

/** Obrys z wyciętymi komorami — jedno miejsce na wygląd metalu. */
function profil(d: string) {
  return <path d={d} fillRule="evenodd" fill="url(#mb70bAlu)" stroke={OUTLINE} strokeWidth="1.7" />;
}

/** Podpis z łamaną linią odniesienia. Sama nazwa — opisy są w legendzie. */
function podpis({
  x,
  y,
  do: cel,
  tekst,
}: {
  x: number;
  y: number;
  do: { x: number; y: number };
  tekst: string;
}) {
  return (
    <g>
      <path
        d={`M${x - 8} ${y - 6} H${cel.x + 26} L${cel.x} ${cel.y}`}
        fill="none"
        stroke={RULE}
        strokeWidth="1.2"
        opacity="0.5"
      />
      <circle cx={cel.x} cy={cel.y} r="3.6" fill={RULE} opacity="0.85" />
      <text x={x} y={y} fill="#ece8e1" fontFamily={MONO} fontSize={MONO_SIZE} letterSpacing="1.5">
        {tekst}
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
      desc: "Rama zamocowana na stałe w murze. Ścianka ma 2–3 mm, reszta to puste komory – dlatego aluminium jest lekkie, a konstrukcja sztywna.",
    },
    {
      id: "skrzydlo",
      no: 2,
      label: "Skrzydło – 79 mm",
      desc: "Ruchoma część z szybą, ta otwierana klamką. Przylgą zachodzi na ościeżnicę, więc po zamknięciu nie widać między nimi szczeliny.",
    },
    {
      id: "przekladka",
      no: 3,
      label: "Przekładka termiczna",
      desc: "Dwa pasy tworzywa spinające zewnętrzną i wewnętrzną powłokę profilu. Między nimi nie ma metalu – i tędy ciepło z pokoju nie ucieka na zewnątrz.",
    },
    {
      id: "uszczelka",
      no: 4,
      label: "Uszczelki",
      desc: "Gumowe profile na noskach ościeżnicy i wokół szyby. Zatrzymują wiatr, wodę opadową i hałas.",
    },
    {
      id: "szyba",
      no: 5,
      label: "Szyba zespolona",
      desc: "Dwie tafle szkła z ramką dystansową i szczelną przestrzenią z gazem. Listwa przyszybowa dociska pakiet od strony pokoju, więc szybę da się wymienić bez demontażu skrzydła.",
    },
  ],

  markers: [],

  Drawing: ({ dim }) => (
    <>
      <defs>
        <linearGradient id="mb70bAlu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e3e7ea" />
          <stop offset="48%" stopColor="#bcc2c7" />
          <stop offset="100%" stopColor="#8e9499" />
        </linearGradient>
        <linearGradient id="mb70bSzyba" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a9ccc4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7d9a92" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* ===================== OŚCIEŻNICA =====================
          Powłoka zewnętrzna: lico od ulicy, nosek pod uszczelkę przylgową
          u góry, dwie komory rozdzielone żebrem. */}
      <g opacity={dim("oscieznica")} style={{ transition: "opacity .35s" }}>
        {profil(
          `M150 436 H214 V414 H232 V436 H268 V586 H150 Z
           M161 447 H257 V498 H161 Z
           M161 509 H257 V575 H161 Z`
        )}
        {/* Powłoka wewnętrzna: rowek okuciowy od strony pokoju i przylga
            dla uszczelki centralnej. */}
        {profil(
          `M312 436 H364 V420 H382 V436 H430 V492 H408 V514 H430 V586 H312 Z
           M323 447 H419 V481 H323 Z
           M323 525 H419 V575 H323 Z`
        )}
      </g>

      {/* ===================== SKRZYDŁO =====================
          Powłoka zewnętrzna: przylga schodząca na ościeżnicę (lewy dół)
          i wrąb szybowy u góry. */}
      <g opacity={dim("skrzydlo")} style={{ transition: "opacity .35s" }}>
        {profil(
          `M150 232 H206 V214 H224 V232 H286 V416 H196 V440 H150 Z
           M161 243 H275 V312 H161 Z
           M161 323 H275 V405 H161 Z`
        )}
        {/* Powłoka wewnętrzna z zatrzaskiem listwy przyszybowej. */}
        {profil(
          `M330 232 H466 V352 H444 V374 H466 V416 H330 Z
           M341 243 H455 V318 H341 Z
           M341 330 H455 V405 H341 Z`
        )}
        {/* Listwa przyszybowa — dociska pakiet od strony pokoju. */}
        {profil(
          `M300 150 H340 V236 H300 Z
           M309 161 H331 V225 H309 Z`
        )}
      </g>

      {/* ===================== PRZEKŁADKI =====================
          Dwa pasy na profil; przestrzeń między nimi zostaje pusta. */}
      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        <rect x="268" y="443" width="44" height="24" rx="3" fill={BREAK} stroke={OUTLINE} strokeWidth="1.4" />
        <rect x="268" y="555" width="44" height="24" rx="3" fill={BREAK} stroke={OUTLINE} strokeWidth="1.4" />
        <rect x="286" y="240" width="44" height="24" rx="3" fill={BREAK} stroke={OUTLINE} strokeWidth="1.4" />
        <rect x="286" y="384" width="44" height="24" rx="3" fill={BREAK} stroke={OUTLINE} strokeWidth="1.4" />
      </g>

      {/* ===================== USZCZELKI =====================
          Na noskach, z wargą dociskaną przez skrzydło. */}
      <g opacity={dim("uszczelka")} style={{ transition: "opacity .35s" }}>
        <path d="M214 414 h18 v-16 l12 -8 v24 l-12 8 z" fill={GASKET} stroke={OUTLINE} strokeWidth="1.3" />
        <path d="M364 420 h18 v-16 l12 -8 v24 l-12 8 z" fill={GASKET} stroke={OUTLINE} strokeWidth="1.3" />
        {/* przyszybowe: po obu stronach pakietu */}
        <path d="M224 232 h20 v-18 h-20 z" fill={GASKET} stroke={OUTLINE} strokeWidth="1.2" />
        <path d="M284 232 h16 v-18 h-16 z" fill={GASKET} stroke={OUTLINE} strokeWidth="1.2" />
      </g>

      {/* ===================== SZYBA ZESPOLONA ===================== */}
      <g opacity={dim("szyba")} style={{ transition: "opacity .35s" }}>
        <rect x="236" y="60" width="18" height="154" fill="url(#mb70bSzyba)" stroke={OUTLINE} strokeWidth="1.5" />
        <rect x="272" y="60" width="18" height="154" fill="url(#mb70bSzyba)" stroke={OUTLINE} strokeWidth="1.5" />
        {/* ramka dystansowa — trzyma tafle w stałym rozstawie */}
        <rect x="254" y="186" width="18" height="28" rx="2" fill="#6d7378" stroke={OUTLINE} strokeWidth="1.2" />
      </g>

      {/* ===================== PODPISY ===================== */}
      <g opacity={dim("szyba")} style={{ transition: "opacity .35s" }}>
        {podpis({ x: 560, y: 108, do: { x: 300, y: 110 }, tekst: "SZYBA ZESPOLONA" })}
      </g>
      <g opacity={dim("skrzydlo")} style={{ transition: "opacity .35s" }}>
        {podpis({ x: 560, y: 268, do: { x: 470, y: 268 }, tekst: "SKRZYDŁO" })}
      </g>
      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        {podpis({ x: 560, y: 396, do: { x: 334, y: 396 }, tekst: "PRZEKŁADKA TERMICZNA" })}
      </g>
      <g opacity={dim("uszczelka")} style={{ transition: "opacity .35s" }}>
        {podpis({ x: 560, y: 432, do: { x: 400, y: 418 }, tekst: "USZCZELKI" })}
      </g>
      <g opacity={dim("oscieznica")} style={{ transition: "opacity .35s" }}>
        {podpis({ x: 560, y: 520, do: { x: 434, y: 520 }, tekst: "OŚCIEŻNICA" })}
      </g>

      {/* ===================== GŁĘBOKOŚCI ===================== */}
      <g opacity="0.72">
        <line x1="150" y1="40" x2="466" y2="40" stroke={RULE} strokeWidth="1.2" />
        <line x1="150" y1="34" x2="150" y2="46" stroke={RULE} strokeWidth="1.2" />
        <line x1="466" y1="34" x2="466" y2="46" stroke={RULE} strokeWidth="1.2" />
        <text x="308" y="29" fill={RULE} fontFamily={MONO} fontSize="16" textAnchor="middle">
          SKRZYDŁO 79 mm
        </text>

        <line x1="150" y1="604" x2="430" y2="604" stroke={RULE} strokeWidth="1.2" />
        <line x1="150" y1="598" x2="150" y2="610" stroke={RULE} strokeWidth="1.2" />
        <line x1="430" y1="598" x2="430" y2="610" stroke={RULE} strokeWidth="1.2" />
        <text x="290" y="594" fill={RULE} fontFamily={MONO} fontSize="16" textAnchor="middle">
          OŚCIEŻNICA 70 mm
        </text>
      </g>
    </>
  ),
};
