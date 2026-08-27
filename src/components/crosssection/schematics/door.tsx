import { ALU, ALU_DARK, BREAK, GASKET, OUTLINE } from "../palette";
import type { SchematicDefinition } from "../types";

/* Drzwi rozwierne — przekrój poziomy przez ościeżnicę, skrzydło i wypełnienie.
   Względem okna: głębszy i sztywniejszy profil skrzydła, uszczelka przymykowa
   na styku ze skrzydłem i wypełnienie panelowe zamiast pakietu szybowego. */

export const doorSchematic: SchematicDefinition = {
  id: "drzwi",
  label: "Drzwi rozwierne — przekrój poziomy",
  description:
    "Rysunek pokazuje budowę drzwi aluminiowych: ościeżnicę, wzmocnione skrzydło drzwiowe, uszczelnienie przymykowe i wypełnienie panelowe dociśnięte listwą.",
  viewBox: "0 0 1000 620",
  outsideLabel: "ZEWNĄTRZ",
  insideLabel: "WEWNĄTRZ",

  parts: [
    {
      id: "oscieznica",
      no: 1,
      label: "Profil aluminiowy — ościeżnica",
      desc: "Nieruchoma rama drzwi kotwiona w murze. Przejmuje obciążenia od skrzydła i ruchu użytkowego.",
    },
    {
      id: "skrzydlo",
      no: 2,
      label: "Profil aluminiowy — skrzydło drzwiowe",
      desc: "Profil skrzydła o większej głębokości i grubszych ściankach niż okienny — przenosi ciężar i obciążenia eksploatacyjne.",
    },
    {
      id: "przekladka",
      no: 3,
      label: "Przekładka termiczna",
      desc: "Wkładka z tworzywa rozdzielająca zewnętrzną i wewnętrzną powłokę aluminium w ościeżnicy i w skrzydle.",
    },
    {
      id: "komora",
      no: 4,
      label: "Komory profilu",
      desc: "Przestrzenie wewnątrz profilu. W drzwiach część komór przyjmuje wzmocnienia i okucia zamka.",
    },
    {
      id: "uszczelka",
      no: 5,
      label: "Uszczelka przymykowa",
      desc: "Uszczelnienie na styku skrzydła z ościeżnicą, odpowiadające za szczelność zamkniętych drzwi.",
    },
    {
      id: "wypelnienie",
      no: 6,
      label: "Wypełnienie panelowe",
      desc: "Panel drzwiowy w miejscu pakietu szybowego. Może być pełny, ocieplony lub częściowo przeszklony.",
    },
    {
      id: "listwa",
      no: 7,
      label: "Listwa dociskowa",
      desc: "Profil dociskający wypełnienie w skrzydle, umożliwiający jego wymianę bez demontażu drzwi.",
    },
  ],

  markers: [
    { id: "oscieznica", no: 1, x: 145, y: 88 },
    { id: "skrzydlo", no: 2, x: 497, y: 118 },
    { id: "przekladka", no: 3, x: 230, y: 528 },
    { id: "komora", no: 4, x: 316, y: 88 },
    { id: "uszczelka", no: 5, x: 415, y: 478 },
    { id: "wypelnienie", no: 6, x: 790, y: 148 },
    { id: "listwa", no: 7, x: 893, y: 478 },
  ],

  Drawing: ({ dim }) => (
    <>
      {/* 1. OŚCIEŻNICA */}
      <g opacity={dim("oscieznica")} style={{ transition: "opacity .35s" }}>
        <rect x="90" y="115" width="110" height="390" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="90" y="115" width="110" height="390" fill="url(#csHatch)" />
        <rect x="260" y="115" width="110" height="390" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="260" y="115" width="110" height="390" fill="url(#csHatch)" />
        {/* przylga — o nią opiera się skrzydło */}
        <rect x="370" y="205" width="32" height="110" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* 3. PRZEKŁADKA TERMICZNA */}
      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        <rect x="200" y="145" width="60" height="80" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="200" y="400" width="60" height="80" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="558" y="178" width="52" height="72" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="558" y="372" width="52" height="72" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* 5. USZCZELKA PRZYMYKOWA */}
      <g opacity={dim("uszczelka")} style={{ transition: "opacity .35s" }}>
        <rect x="402" y="212" width="28" height="88" rx="8" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
        <rect x="402" y="340" width="28" height="88" rx="8" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
        <rect x="692" y="222" width="24" height="74" rx="6" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
        <rect x="692" y="344" width="24" height="74" rx="6" fill={GASKET} stroke={OUTLINE} strokeWidth="2" />
      </g>

      {/* 2. SKRZYDŁO DRZWIOWE */}
      <g opacity={dim("skrzydlo")} style={{ transition: "opacity .35s" }}>
        <rect x="440" y="148" width="118" height="324" fill={ALU} stroke={OUTLINE} strokeWidth="3" />
        <rect x="440" y="148" width="118" height="324" fill="url(#csHatch)" />
        <rect x="610" y="148" width="84" height="324" fill={ALU} stroke={OUTLINE} strokeWidth="3" />
        <rect x="610" y="148" width="84" height="324" fill="url(#csHatch)" />
      </g>

      {/* 6. WYPEŁNIENIE PANELOWE */}
      <g opacity={dim("wypelnienie")} style={{ transition: "opacity .35s" }}>
        {/* okładziny aluminiowe panelu */}
        <rect x="722" y="185" width="16" height="252" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2" />
        <rect x="842" y="185" width="16" height="252" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2" />
        {/* rdzeń izolacyjny */}
        <rect x="738" y="185" width="104" height="252" fill="url(#csPanel)" stroke={OUTLINE} strokeWidth="2" />
      </g>

      {/* 7. LISTWA DOCISKOWA */}
      <g opacity={dim("listwa")} style={{ transition: "opacity .35s" }}>
        <path
          d="M858 198 h44 a10 10 0 0 1 10 10 v206 a10 10 0 0 1 -10 10 h-44 z"
          fill={ALU}
          stroke={OUTLINE}
          strokeWidth="2.5"
        />
        <path d="M858 198 h44 a10 10 0 0 1 10 10 v206 a10 10 0 0 1 -10 10 h-44 z" fill="url(#csHatch)" />
      </g>
      {/* Komory na wierzchu — inaczej profile rysowane później by je zakryły */}
      {/* 4. KOMORY */}
      <g opacity={dim("komora")} style={{ transition: "opacity .35s" }}>
        <rect x="114" y="145" width="64" height="140" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="114" y="335" width="64" height="140" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="284" y="145" width="64" height="140" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="284" y="335" width="64" height="140" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="464" y="175" width="62" height="115" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="464" y="330" width="62" height="115" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="628" y="180" width="46" height="110" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="628" y="330" width="46" height="110" fill={OUTLINE} fillOpacity="0.82" />
      </g>

    </>
  ),
};
