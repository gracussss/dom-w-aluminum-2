import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./Eyebrow";

/**
 * Rejestr wejścia w podstronę.
 *
 * Wszystkie podstrony startowały identycznie: ta sama ciemna strefa, ta sama
 * siatka techniczna, ta sama skala tytułu i ta sama szerokość akapitu. Po
 * trzeciej podstronie wejście przestawało cokolwiek znaczyć — a dokument
 * prawny dostawał tę samą monumentalną oprawę co strona ofertowa.
 *
 * Trzy warianty odpowiadają trzem rodzajom treści, nie gustom:
 *
 * default — strony ofertowe i kontaktowe: pełna skala, akapit pod tytułem
 * index   — strony katalogowe: tytuł po lewej, opis w prawej kolumnie,
 *           linia domykająca nagłówek jak w arkuszu technicznym
 * quiet   — dokumenty (polityka, cookies): mniejsza skala, bez siatki
 *           technicznej, mniej powietrza — treść jest ważniejsza od oprawy
 */
export type PageHeroVariant = "default" | "index" | "quiet";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Ścieżka nawigacyjna nad znacznikiem sekcji — dla podstron katalogu. */
  breadcrumbs?: ReactNode;
  variant?: PageHeroVariant;
  children?: ReactNode;
}

const TITLE_FULL = "text-[13vw] sm:text-6xl md:text-7xl lg:text-[5.5rem]";
const TITLE_QUIET = "text-[9vw] sm:text-4xl md:text-5xl";

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  variant = "default",
  children,
}: PageHeroProps) {
  const quiet = variant === "quiet";

  const padding = quiet ? "pb-14 pt-32 md:pb-16 md:pt-40" : "pb-20 pt-36 md:pb-28 md:pt-48";

  const heading = (
    <h1
      className={`display display-tight mt-8 max-w-4xl text-balance ${quiet ? TITLE_QUIET : TITLE_FULL}`}
    >
      {title}
    </h1>
  );

  const lead = description && (
    <p className="text-pretty text-base leading-relaxed text-limestone/55 md:text-lg">
      {description}
    </p>
  );

  return (
    <section className={`grain relative overflow-hidden bg-void text-limestone ${padding}`}>
      {/* Dokument nie potrzebuje rysunku konstrukcyjnego w tle. */}
      {!quiet && <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden />}

      <div className="container-edge relative">
        {breadcrumbs && <div className="mb-8">{breadcrumbs}</div>}

        {variant === "index" ? (
          <>
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
              <div className="lg:col-span-7">
                <Reveal>
                  <Eyebrow label={eyebrow} tone="light" />
                </Reveal>
                <Reveal delay={0.08}>{heading}</Reveal>
              </div>
              {lead && (
                /* Poniżej `lg` kolumna znika i akapit rozlałby się na całą
                   szerokość kontenera — stąd ograniczenie miary wiersza. */
                <Reveal delay={0.16} className="max-w-xl lg:col-span-4 lg:col-start-9 lg:max-w-none">
                  {lead}
                </Reveal>
              )}
            </div>
            {/* Linia domyka nagłówek — pod nią zaczyna się zestawienie. */}
            <div className="mt-12 border-t border-limestone/12 md:mt-16" aria-hidden />
          </>
        ) : (
          <>
            <Reveal>
              <Eyebrow label={eyebrow} tone="light" />
            </Reveal>
            <Reveal delay={0.08}>{heading}</Reveal>
            {lead && (
              <Reveal delay={0.16} className={quiet ? "mt-6 max-w-2xl" : "mt-8 max-w-xl"}>
                {lead}
              </Reveal>
            )}
          </>
        )}

        {children}
      </div>
    </section>
  );
}
