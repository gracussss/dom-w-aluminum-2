import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./Eyebrow";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  /** Ścieżka nawigacyjna nad znacznikiem sekcji — dla podstron katalogu. */
  breadcrumbs?: ReactNode;
  children?: ReactNode;
}

/** Spójny nagłówek podstron. Ciemna strefa, duża typografia, dużo powietrza. */
export function PageHero({ eyebrow, title, description, breadcrumbs, children }: PageHeroProps) {
  return (
    <section className="grain relative overflow-hidden bg-void pb-20 pt-36 text-limestone md:pb-28 md:pt-48">
      <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden />
      <div className="container-edge relative">
        {breadcrumbs && <div className="mb-8">{breadcrumbs}</div>}
        <Reveal>
          <Eyebrow label={eyebrow} tone="light" />
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="display display-tight mt-8 max-w-4xl text-balance text-[13vw] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={0.16}>
            <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-limestone/55 md:text-lg">
              {description}
            </p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
