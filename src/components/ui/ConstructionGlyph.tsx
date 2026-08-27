interface ConstructionGlyphProps {
  type: string;
  className?: string;
}

/**
 * Symbol typu konstrukcji — uproszczone oznaczenie rysunkowe, takie jak na
 * elewacji w dokumentacji projektowej. Daje każdej pozycji katalogu
 * techniczny „odcisk palca” i pozwala skanować listę wzrokiem bez czytania.
 * To schemat sposobu otwierania, nie wizerunek konkretnego produktu.
 */
export function ConstructionGlyph({ type, className = "" }: ConstructionGlyphProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
      className={className}
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="27" height="27" />
      {type === "rozwierne" && <path d="M25.5 6.5 L7 16 L25.5 25.5" strokeOpacity="0.75" />}
      {type === "przesuwne" && (
        <>
          <path d="M16 2.5 V29.5" strokeOpacity="0.75" />
          <path d="M19.5 16 H27" strokeOpacity="0.75" />
          <path d="M24 12.5 L27.5 16 L24 19.5" strokeOpacity="0.75" />
        </>
      )}
      {type === "slupowo-ryglowe" && (
        <>
          <path d="M16 2.5 V29.5" strokeOpacity="0.75" />
          <path d="M2.5 12 H29.5" strokeOpacity="0.75" />
          <path d="M2.5 21 H29.5" strokeOpacity="0.75" />
        </>
      )}
      {type === "strukturalne" && <rect x="6.5" y="6.5" width="19" height="19" strokeOpacity="0.6" />}
      {type === "stale" && (
        <>
          <path d="M18.5 7.5 L25.5 14.5" strokeOpacity="0.6" />
          <path d="M22.5 6.5 L25.5 9.5" strokeOpacity="0.6" />
        </>
      )}
    </svg>
  );
}
