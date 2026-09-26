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
 * index   — strony katalogowe: tytuł po lewej, opis w prawej kolumnie
 *           wyśrodkowany w pionie względem tytułu
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

/* Tytuł o stopień niższy, a wejście krótsze — uwagi klientki do Oferty,
   Kontaktu i O nas: „tytuł za duży, za duże odstępy”. Przy 88 px i 192 px
   górnego pola pierwszy ekran podstrony był samym nagłówkiem. */
const TITLE_FULL = "text-[12vw] sm:text-5xl md:text-6xl lg:text-7xl";
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

  const padding = quiet ? "pb-14 pt-32 md:pb-16 md:pt-40" : "pb-14 pt-32 md:pb-20 md:pt-40";

  const heading = (
    <h1
      className={`display display-tight mt-6 max-w-4xl text-balance ${quiet ? TITLE_QUIET : TITLE_FULL}`}
    >
      {title}
    </h1>
  );

  const lead = description && (
    <p className="text-pretty text-base leading-relaxed text-limestone/60 md:text-lg">
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
            <Reveal>
              <Eyebrow label={eyebrow} tone="light" />
            </Reveal>
            {/* Bez linii domykającej: klientka pytała, czemu na Systemach jest
                kreska, a na Ofercie jej nie ma — i prosiła o jej usunięcie. */}
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
              <Reveal delay={0.08} className="lg:col-span-7">
                {heading}
              </Reveal>
              {lead && (
                /* Poniżej `lg` kolumna znika i akapit rozlałby się na całą
                   szerokość kontenera — stąd ograniczenie miary wiersza. */
                <Reveal delay={0.16} className="max-w-xl lg:col-span-4 lg:col-start-9 lg:mt-6 lg:max-w-none">
                  {lead}
                </Reveal>
              )}
            </div>
          </>
        ) : (
          <>
            <Reveal>
              <Eyebrow label={eyebrow} tone="light" />
            </Reveal>
            <Reveal delay={0.08}>{heading}</Reveal>
            {lead && (
              <Reveal delay={0.16} className={quiet ? "mt-6 max-w-2xl" : "mt-6 max-w-xl"}>
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
