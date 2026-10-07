import { ALU, ALU_DARK, BREAK, GASKET, OUTLINE } from "../palette";
import type { SchematicDefinition } from "../types";

/* Konstrukcja przesuwna — przekrój poziomy przez zazębienie skrzydeł.
   To miejsce, w którym system przesuwny różni się najbardziej od rozwiernego:
   skrzydła nie dociskają się do przylgi, tylko zachodzą na siebie profilami
   spotkaniowymi, a szczelność daje uszczelka szczotkowa. */

export const slidingSchematic: SchematicDefinition = {
  id: "przesuwne",
  label: "Konstrukcja przesuwna – przekrój poziomy przez zazębienie skrzydeł",
  description:
    "Rysunek pokazuje styk dwóch skrzydeł systemu przesuwnego. Szyna jezdna i rolki są widoczne dopiero w przekroju pionowym przez próg – dodamy go razem z dokumentacją producenta.",
  viewBox: "0 0 1000 620",
  outsideLabel: "ZEWNĄTRZ",
  insideLabel: "WEWNĄTRZ",

  parts: [
    {
      id: "skrzydlo-przesuwne",
      no: 1,
      label: "Skrzydło przesuwne",
      desc: "Profil skrzydła poruszającego się po szynie. Prowadzony w torze zewnętrznym konstrukcji.",
    },
    {
      id: "skrzydlo-stale",
      no: 2,
      label: "Skrzydło stałe",
      desc: "Nieruchome skrzydło osadzone w torze wewnętrznym. Stanowi oparcie dla zazębienia.",
    },
    {
      id: "zazebienie",
      no: 3,
      label: "Profile spotkaniowe",
      desc: "Zachodzące na siebie profile obu skrzydeł. Zamykają szczelinę między torami bez docisku do przylgi.",
    },
    {
      id: "szczotka",
      no: 4,
      label: "Uszczelka szczotkowa",
      desc: "Uszczelnienie ślizgowe między skrzydłami. Musi uszczelniać, nie blokując przesuwu.",
    },
    {
      id: "przekladka",
      no: 5,
      label: "Przekładka termiczna",
      desc: "Wkładka z tworzywa rozdzielająca powłoki aluminium w obu skrzydłach.",
    },
    {
      id: "szyba",
      no: 6,
      label: "Pakiet szybowy",
      desc: "Zestaw szyb osadzony w skrzydle. W systemach przesuwnych zwykle cięższy niż w oknach – stąd wzmocnione profile.",
    },
    {
      id: "komora",
      no: 7,
      label: "Komory profilu",
      desc: "Przestrzenie wewnątrz profili. Przy dużych skrzydłach przyjmują wzmocnienia stalowe.",
    },
  ],

  markers: [
    { id: "skrzydlo-przesuwne", no: 1, x: 247, y: 116 },
    { id: "skrzydlo-stale", no: 2, x: 672, y: 116 },
    { id: "zazebienie", no: 3, x: 460, y: 116 },
    { id: "szczotka", no: 4, x: 441, y: 508 },
    { id: "przekladka", no: 5, x: 600, y: 508 },
    { id: "szyba", no: 6, x: 128, y: 152 },
    { id: "komora", no: 7, x: 248, y: 508 },
  ],

  Drawing: ({ dim }) => (
    <>
      {/* 6. PAKIETY SZYBOWE — po jednym w każdym skrzydle */}
      <g opacity={dim("szyba")} style={{ transition: "opacity .35s" }}>
        <rect x="96" y="185" width="15" height="250" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="150" y="185" width="15" height="250" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="111" y="405" width="39" height="30" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2" />

        <rect x="740" y="185" width="15" height="250" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="794" y="185" width="15" height="250" fill="url(#csGlass)" stroke={OUTLINE} strokeWidth="2" />
        <rect x="755" y="405" width="39" height="30" fill={ALU_DARK} stroke={OUTLINE} strokeWidth="2" />
      </g>

      {/* 5. PRZEKŁADKA TERMICZNA */}
      <g opacity={dim("przekladka")} style={{ transition: "opacity .35s" }}>
        <rect x="295" y="180" width="50" height="70" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="295" y="370" width="50" height="70" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="575" y="180" width="50" height="70" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="575" y="370" width="50" height="70" fill={BREAK} stroke={OUTLINE} strokeWidth="2.5" />
      </g>

      {/* 1. SKRZYDŁO PRZESUWNE — tor zewnętrzny */}
      <g opacity={dim("skrzydlo-przesuwne")} style={{ transition: "opacity .35s" }}>
        <rect x="200" y="150" width="95" height="320" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="200" y="150" width="95" height="320" fill="url(#csHatch)" />
        <rect x="345" y="150" width="55" height="320" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="345" y="150" width="55" height="320" fill="url(#csHatch)" />
      </g>

      {/* 2. SKRZYDŁO STAŁE — tor wewnętrzny, kreskowanie w drugą stronę */}
      <g opacity={dim("skrzydlo-stale")} style={{ transition: "opacity .35s" }}>
        <rect x="520" y="150" width="55" height="320" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="520" y="150" width="55" height="320" fill="url(#csHatchAlt)" />
        <rect x="625" y="150" width="95" height="320" fill={ALU} stroke={OUTLINE} strokeWidth="2.5" />
        <rect x="625" y="150" width="95" height="320" fill="url(#csHatchAlt)" />
      </g>

      {/* 3. PROFILE SPOTKANIOWE — zachodzą na siebie */}
      <g opacity={dim("zazebienie")} style={{ transition: "opacity .35s" }}>
        {/* hak skrzydła przesuwnego — otwarty w stronę wnętrza */}
        <path
          d="M400 190 h70 v40 h-34 v160 h34 v40 h-70 z"
          fill={ALU}
          stroke={OUTLINE}
          strokeWidth="2.5"
        />
        <path d="M400 190 h70 v40 h-34 v160 h34 v40 h-70 z" fill="url(#csHatch)" />
        {/* hak skrzydła stałego — wsuwa się w powyższy */}
        <path
          d="M520 252 h-66 v32 h30 v52 h-30 v32 h66 z"
          fill={ALU}
          stroke={OUTLINE}
          strokeWidth="2.5"
        />
        <path d="M520 252 h-66 v32 h30 v52 h-30 v32 h66 z" fill="url(#csHatchAlt)" />
      </g>

      {/* 4. USZCZELKA SZCZOTKOWA — włos ślizgający się po profilu */}
      <g opacity={dim("szczotka")} style={{ transition: "opacity .35s" }}>
        <rect x="436" y="232" width="10" height="20" fill={GASKET} stroke={OUTLINE} strokeWidth="1.5" />
        <rect x="436" y="368" width="10" height="20" fill={GASKET} stroke={OUTLINE} strokeWidth="1.5" />
        {[236, 240, 244, 248].map((y) => (
          <line key={`brush-top-${y}`} x1="446" y1={y} x2="466" y2={y} stroke={GASKET} strokeWidth="1.6" />
        ))}
        {[372, 376, 380, 384].map((y) => (
          <line key={`brush-bottom-${y}`} x1="446" y1={y} x2="466" y2={y} stroke={GASKET} strokeWidth="1.6" />
        ))}
      </g>
      {/* Komory na wierzchu — inaczej profile rysowane później by je zakryły */}
      {/* 7. KOMORY */}
      <g opacity={dim("komora")} style={{ transition: "opacity .35s" }}>
        <rect x="218" y="180" width="60" height="120" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="218" y="340" width="60" height="120" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="356" y="185" width="36" height="110" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="356" y="345" width="36" height="110" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="531" y="185" width="36" height="110" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="531" y="345" width="36" height="110" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="643" y="180" width="60" height="120" fill={OUTLINE} fillOpacity="0.82" />
        <rect x="643" y="340" width="60" height="120" fill={OUTLINE} fillOpacity="0.82" />
      </g>

    </>
  ),
};
