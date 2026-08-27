/* ------------------------------------------------------------------
   Materiały rysunku technicznego — wspólne dla wszystkich schematów,
   żeby aluminium, przekładka i szkło znaczyły to samo na każdym rysunku.
   ------------------------------------------------------------------ */

export const ALU = "#b9bec2";
export const ALU_DARK = "#8b9196";
export const OUTLINE = "#101214";
export const BREAK = "#4a4034";
export const GASKET = "#1b1d1f";
export const GLASS = "#8fb0a8";
export const PANEL = "#7d7468";
export const STEEL = "#5c6165";

export const MONO = "'IBM Plex Mono', monospace";
export const RULE = "#9ba1a6";

/** Kreskowanie przekroju i gradient szkła — konwencja rysunku technicznego. */
export function SchematicDefs() {
  return (
    <defs>
      <pattern id="csHatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="7" stroke={OUTLINE} strokeWidth="1.1" opacity="0.42" />
      </pattern>
      {/* Drugie kreskowanie — przeciwny kierunek, dla profili przeciętych osobno
          (np. skrzydło stałe i przesuwne), tak jak w dokumentacji technicznej. */}
      <pattern
        id="csHatchAlt"
        width="7"
        height="7"
        patternTransform="rotate(-45)"
        patternUnits="userSpaceOnUse"
      >
        <line x1="0" y1="0" x2="0" y2="7" stroke={OUTLINE} strokeWidth="1.1" opacity="0.42" />
      </pattern>
      <linearGradient id="csGlass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={GLASS} stopOpacity="0.5" />
        <stop offset="100%" stopColor={GLASS} stopOpacity="0.28" />
      </linearGradient>
      <pattern id="csPanel" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill={PANEL} />
        <line x1="0" y1="0" x2="0" y2="10" stroke={OUTLINE} strokeWidth="0.8" opacity="0.3" />
      </pattern>
    </defs>
  );
}

/** Podpisy stron przekroju i linia odniesienia u góry rysunku.
    Na dole rysunku siedzi etykieta i sterowanie zoomem. */
export function SideLabels({
  outside,
  inside,
  y = 52,
  x1 = 90,
  x2 = 910,
}: {
  outside: string;
  inside: string;
  y?: number;
  x1?: number;
  x2?: number;
}) {
  return (
    <>
      <text x={x1} y={y} fontFamily={MONO} fontSize="14" letterSpacing="2" fill={RULE} opacity="0.65">
        {outside}
      </text>
      <text
        x={x2}
        y={y}
        textAnchor="end"
        fontFamily={MONO}
        fontSize="14"
        letterSpacing="2"
        fill={RULE}
        opacity="0.65"
      >
        {inside}
      </text>
      <line x1={x1} y1={y + 12} x2={x2} y2={y + 12} stroke={RULE} strokeWidth="1" opacity="0.25" />
    </>
  );
}
