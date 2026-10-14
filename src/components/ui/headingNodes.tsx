import type { ReactNode } from "react";
import type { HeadingLine } from "../../lib/content";

/**
 * Linie nagłówka z panelu jako węzły dla `SectionHeading` i własnych <h2>.
 * Kursywa dostaje kolor sekcji (`accentClassName`) — w każdej sekcji inny,
 * bo stoi raz na ciemnym, raz na jasnym tle.
 */
export function headingNodes(lines: HeadingLine[], accentClassName: string): ReactNode[] {
  return lines.map((line, i) =>
    line.accent ? (
      <span key={i} className={`editorial ${accentClassName}`}>
        {line.text}
      </span>
    ) : (
      line.text
    )
  );
}
