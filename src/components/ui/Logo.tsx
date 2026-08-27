interface LogoMarkProps {
  className?: string;
  /** Kolor akcentu słupka. Domyślnie anodowany brąz. */
  accent?: string;
}

/**
 * Znak: okno aluminiowe w widoku — rama, szyba, słupek.
 * Czytelny już przy 20 px, bez gradientów i efektów.
 */
export function LogoMark({ className = "", accent = "currentColor" }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden focusable="false">
      {/* rama zewnętrzna */}
      <rect x="2.5" y="2.5" width="27" height="27" stroke="currentColor" strokeWidth="2" />
      {/* przylga / rama wewnętrzna */}
      <rect x="7" y="7" width="18" height="18" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      {/* słupek — akcent */}
      <rect x="14.75" y="7" width="2.5" height="18" fill={accent} />
    </svg>
  );
}

interface WordmarkProps {
  className?: string;
  showLegal?: boolean;
  compact?: boolean;
}

export function Wordmark({ className = "", showLegal = true, compact = false }: WordmarkProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark
        className={compact ? "h-5 w-5 shrink-0" : "h-7 w-7 shrink-0"}
        accent="var(--color-bronze-light)"
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-semibold tracking-[-0.02em] ${compact ? "text-sm" : "text-[15px] md:text-[17px]"}`}
        >
          DOM W ALUMINIUM
        </span>
        {showLegal && (
          <span className="label-sm mt-1 hidden opacity-40 sm:block">Alukoncept Sp. z o.o.</span>
        )}
      </span>
    </span>
  );
}
