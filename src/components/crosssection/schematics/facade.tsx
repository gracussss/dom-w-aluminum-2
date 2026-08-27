import { ALU, ALU_DARK, BREAK, GASKET, OUTLINE, STEEL } from "../palette";
import type { SchematicDefinition } from "../types";

/* Fasada słupowo-ryglowa — przekrój poziomy przez słup.
   Fasada buduje się odwrotnie niż okno: nie ma ramy i skrzydła, jest nośny
   słup od wewnątrz i pakiety szybowe dociskane od zewnątrz profilem
   dociskowym, przykrytym listwą maskującą. */

export const facadeSchematic: SchematicDefinition = {
  id: "fasada",
  label: "Fasada słupowo-ryglowa — przekrój poziomy przez słup",
  description:
    "Rysunek pokazuje styk dwóch pakietów szybowych na słupie. Ta sama zasada obowiązuje na ryglu — różni się tylko ułożeniem profilu i odprowadzeniem wody.",
  viewBox: "0 0 1000 620",
  outsideLabel: "ZEWNĄTRZ",
  insideLabel: "WEWNĄTRZ",

  parts: [
    {
      id: "slup",
      no: 1,
      label: "Słup — profil nośny",
      desc: "Główny element konstrukcyjny fasady. Przenosi ciężar przeszkleń i obciążenie wiatrem na konstrukcję budynku.",
    },
    {
      id: "dociskowy",
      no: 2,
      label: "Profil dociskowy",
      desc: "Przykręcany do słupa od zewnątrz. Dociska oba pakiety szybowe do uszczelek — to on utrzymuje szkło.",
    },
    {
      id: "listwa",
      no: 3,
      label: "Listwa maskująca",
      desc: "Nasuwana na profil dociskowy. Zakrywa mocowanie i decyduje o wyglądzie siatki fasady z zewnątrz.",
    },
    {
      id: "przekladka",
      no: 4,
      label: "Przekładka izolacyjna",
      desc: "Rozdziela profil dociskowy od słupa, przerywając mostek termiczny w miejscu mocowania.",
    },
    {
      id: "uszczelki",
      no: 5,
      label: "Uszczelki szklenia",
      desc: "Uszczelnienie po obu stronach szkła — wewnętrzne układa szybę na słupie, zewnętrzne przejmuje docisk.",
    },
    {
      id: "szyba",
      no: 6,
      label: "Pakiet szybowy",
      desc: "Dwa sąsiednie pakiety spotykają się na osi słupa. Krawędź szkła nie styka się z aluminium — pracuje na uszczelkach.",
    },
    {
      id: "sruba",
      no: 7,
      label: "Śruba mocująca",
      desc: "Przechodzi przez profil dociskowy i przekładkę do słupa. Rozstaw śrub wynika z obliczeń dla danego przeszklenia.",
    },
  ],

  /* Detal fasady jest ciasny — numery stoją obok rysunku i wskazują element
     linią odniesienia, tak jak na rysunku warsztatowym. Współrzędne
     uwzględniają przesunięcie rysunku (patrz `translate` niżej). */
  markers: [
    { id: "slup", no: 1, x: 612, y: 183, to: { x: 612, y: 240 } },
    { id: "dociskowy", no: 2, x: 326, y: 196, to: { x: 326, y: 252 } },
    { id: "listwa", no: 3, x: 250, y: 196, to: { x: 262, y: 262 } },
    { id: "przekladka", no: 4, x: 470, y: 470, to: { x: 412, y: 338 } },
    { id: "uszczelki", no: 5, x: 330, y: 470, to: { x: 360, y: 378 } },
    { id: "szyba", no: 6, x: 394, y: 92, to: { x: 394, y: 125 } },
    { id: "sruba", no: 7, x: 250, y: 440, to: { x: 292, y: 330 } },
  ],

  /* Detal jest wąski, więc rysunek jest wyśrodkowany w kadrze przesunięciem. */
  Drawing: ({ dim }) => (
    <g transform="translate(150 8)">
      {/* 1. SŁUP */}
      <g opacity={dim("slup")} style={{ transition: "opacity .35s" }}>
        <rect x="282" y="210" width="360" height="200" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="282" y="210" width="360" height="200" fill="url(#csHatch)" />
        <rect x="312" y="238" width="88" height="144" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="420" y="238" width="100" height="144" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="538" y="238" width="88" height="144" fill={OUTLINE} fillOpacity="0.82" />
      </g>

      {/* 6. PAKIETY SZYBOWE — dwa sąsiednie, spotykają się na osi słupa */}
      <g opacity={dim("szyba")} style={{ transition: "opacity .35s" }}>
        <rect x="222" y="100" width="13" height="192" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="256" y="100" width="13" height="192" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="235" y="270" width="21" height="22" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2" />

        <rect x="222" y="328" width="13" height="192" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="256" y="328" width="13" height="192" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="235" y="328" width="21" height="22" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2" />
      </g>

      {/* 5. USZCZELKI SZKLENIA */}
      <g opacity={dim("uszczelki")} style={{ transition: "opacity .35s" }}>
        <rect x="206" y="248" width="16" height="44" fill={GASKET} stroke={OUTLINE} strokeWidth="1.8" />
        <rect x="206" y="328" width="16" height="44" fill={GASKET} stroke={OUTLINE} strokeWidth="1.8" />
        <rect x="269" y="248" width="13" height="44" fill={GASKET} stroke={OUTLINE} strokeWidth="1.8" />
        <rect x="269" y="328" width="13" height="44" fill={GASKET} stroke={OUTLINE} strokeWidth="1.8" />
      </g>

      {/* 4. PRZEKŁADKA IZOLACYJNA — w szczelinie między pakietami */}
      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        <rect x="206" y="292" width="76" height="36" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* 2. PROFIL DOCISKOWY */}
      <g opacity={dim("dociskowy")} style={{ transition: "opacity .35s" }}>
        <rect x="146" y="238" width="60" height="144" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="146" y="238" width="60" height="144" fill="url(#csHatch)" />
      </g>

      {/* 7. ŚRUBA MOCUJĄCA */}
      <g opacity={dim("sruba")} style={{ transition: "opacity .35s" }}>
        <rect x="152" y="303" width="173" height="14" fill={STEEL} stroke={OUTLINE} strokeWidth="1.8" />
        <rect x="138" y="294" width="14" height="32" fill={STEEL} stroke={OUTLINE} strokeWidth="1.8" />
      </g>

      {/* 3. LISTWA MASKUJĄCA */}
      <g opacity={dim("listwa")} style={{ transition: "opacity .35s" }}>
        <path
          d="M146 252 h-44 a14 14 0 0 0 -14 14 v88 a14 14 0 0 0 14 14 h44 z"
          fill={ALU}
          stroke={OUTLINE}
          strokeWidth="2.5"
        />
        <path
          d="M146 252 h-44 a14 14 0 0 0 -14 14 v88 a14 14 0 0 0 14 14 h44 z"
          fill="url(#csHatch)"
        />
      </g>
    </g>
  ),
};
