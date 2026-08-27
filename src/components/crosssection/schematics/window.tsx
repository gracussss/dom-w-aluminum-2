import { ALU, ALU_DARK, BREAK, GASKET, OUTLINE } from "../palette";
import type { SchematicDefinition } from "../types";

/* Okno rozwierne — przekrój poziomy przez ościeżnicę, skrzydło i szklenie. */

export const windowSchematic: SchematicDefinition = {
  id: "okno",
  label: "Okno rozwierne — przekrój poziomy",
  description:
    "Rysunek pokazuje zasadę budowy okna aluminiowego z przekładką termiczną: ościeżnicę osadzoną w murze, ruchome skrzydło i pakiet szybowy dociśnięty listwą.",
  viewBox: "0 0 1000 620",
  outsideLabel: "ZEWNĄTRZ",
  insideLabel: "WEWNĄTRZ",

  parts: [
    {
      id: "oscieznica",
      no: 1,
      label: "Profil aluminiowy — ościeżnica",
      desc: "Nieruchoma rama osadzana w murze. Przenosi obciążenia konstrukcji na budynek.",
    },
    {
      id: "skrzydlo",
      no: 2,
      label: "Profil aluminiowy — skrzydło",
      desc: "Ruchoma część konstrukcji, w której osadzony jest pakiet szybowy.",
    },
    {
      id: "przekladka",
      no: 3,
      label: "Przekładka termiczna",
      desc: "Wkładka z tworzywa rozdzielająca zewnętrzną i wewnętrzną powłokę aluminium, ograniczając przenikanie ciepła.",
    },
    {
      id: "komora",
      no: 4,
      label: "Komory profilu",
      desc: "Puste przestrzenie wewnątrz profilu — usztywniają konstrukcję i poprawiają izolacyjność.",
    },
    {
      id: "uszczelka",
      no: 5,
      label: "Uszczelnienie",
      desc: "Uszczelki przylgowe odpowiadające za szczelność na powietrze i wodę opadową.",
    },
    {
      id: "szyba",
      no: 6,
      label: "Pakiet szybowy",
      desc: "Zestaw szyb rozdzielonych ramkami dystansowymi, wypełniony gazem.",
    },
    {
      id: "listwa",
      no: 7,
      label: "Listwa przyszybowa",
      desc: "Profil dociskający pakiet szybowy w skrzydle, umożliwiający jego demontaż.",
    },
  ],

  markers: [
    { id: "oscieznica", no: 1, x: 142, y: 92 },
    { id: "skrzydlo", no: 2, x: 483, y: 127 },
    { id: "przekladka", no: 3, x: 225, y: 520 },
    { id: "komora", no: 4, x: 307, y: 92 },
    { id: "uszczelka", no: 5, x: 407, y: 470 },
    { id: "szyba", no: 6, x: 771, y: 155 },
    { id: "listwa", no: 7, x: 876, y: 470 },
  ],

  Drawing: ({ dim }) => (
    <>
      {/* 1. OŚCIEŻNICA — powłoka zewnętrzna, wewnętrzna i przylga */}
      <g opacity={dim("oscieznica")} style={{ transition: "opacity .35s" }}>
        <rect x="90" y="120" width="105" height="380" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="90" y="120" width="105" height="380" fill="url(#csHatch)" />
        <rect x="255" y="120" width="105" height="380" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="255" y="120" width="105" height="380" fill="url(#csHatch)" />
        <rect x="360" y="210" width="34" height="90" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* 3. PRZEKŁADKA TERMICZNA */}
      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        <rect x="195" y="150" width="60" height="72" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="195" y="398" width="60" height="72" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="537" y="185" width="52" height="66" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="537" y="379" width="52" height="66" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* 5. USZCZELNIENIE */}
      <g opacity={dim("uszczelka")} style={{ transition: "opacity .35s" }}>
        <rect x="394" y="215" width="26" height="80" rx="7" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
        <rect x="394" y="345" width="26" height="80" rx="7" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
        <rect x="672" y="228" width="22" height="70" rx="6" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
        <rect x="672" y="342" width="22" height="70" rx="6" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
      </g>

      {/* 2. SKRZYDŁO */}
      <g opacity={dim("skrzydlo")} style={{ transition: "opacity .35s" }}>
        <rect x="430" y="155" width="107" height="320" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="430" y="155" width="107" height="320" fill="url(#csHatch)" />
        <rect x="589" y="155" width="85" height="320" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="589" y="155" width="85" height="320" fill="url(#csHatch)" />
      </g>

      {/* 6. PAKIET SZYBOWY */}
      <g opacity={dim("szyba")} style={{ transition: "opacity .35s" }}>
        <rect x="700" y="185" width="18" height="260" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="762" y="185" width="18" height="260" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="824" y="185" width="18" height="260" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="718" y="415" width="44" height="30" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2" />
        <rect x="780" y="415" width="44" height="30" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2" />
      </g>

      {/* 7. LISTWA PRZYSZYBOWA */}
      <g opacity={dim("listwa")} style={{ transition: "opacity .35s" }}>
        <path
          d="M842 200 h58 a10 10 0 0 1 10 10 v220 a10 10 0 0 1 -10 10 h-58 z"
          fill={ALU}
          stroke={OUTLINE}
          strokeWidth="2.5"
        />
        <path d="M842 200 h58 a10 10 0 0 1 10 10 v220 a10 10 0 0 1 -10 10 h-58 z" fill="url(#csHatch)" />
      </g>
      {/* Komory na wierzchu — inaczej profile rysowane później by je zakryły */}
      {/* 4. KOMORY */}
      <g opacity={dim("komora")} style={{ transition: "opacity .35s" }}>
        <rect x="112" y="150" width="61" height="140" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="112" y="330" width="61" height="140" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="277" y="150" width="61" height="140" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="277" y="330" width="61" height="140" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="452" y="180" width="55" height="120" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="452" y="330" width="55" height="120" fill={OUTLINE} fillOpacity="0.82" />
      </g>

    </>
  ),
};
