import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { offerAreas } from "../data/products";
import { EASE_OUT } from "../lib/motion";
import { responsiveSrcSet } from "../lib/responsiveImage";

export function OfferAreas() {
  const [hovered, setHovered] = useState<string | null>(null);
  /* Stan spoczynkowy: pierwszy obszar. Wcześniej podgląd pojawiał się dopiero
     po najechaniu, więc dopóki użytkownik nie ruszył myszą, prawe 38% sekcji
     było puste — a na ekranie dotykowym, gdzie `hover` nie istnieje, puste
     zostawało zawsze. */
  const active = offerAreas.find((a) => a.id === hovered) ?? offerAreas[0];

  return (
    <section id="oferta" className="grain relative overflow-hidden bg-void py-24 text-limestone md:py-36">
      <div className="container-edge relative">
        <SectionHeading
          index="02"
          eyebrow="Zakres prac"
          tone="light"
          variant="split"
          titleClassName="text-[10vw] leading-[0.94] sm:text-5xl md:text-6xl lg:text-7xl"
          lines={["Co wykonujemy"]}
          description="Siedem obszarów — od pojedynczego okna po kompletną kopertę budynku."
        />

        <div className="relative mt-16">
          {/* Podgląd przy najechaniu — tylko desktop */}
          {/* Podgląd zostaje przy `lg`. Sprawdzone: od 768 px kadr 38% kładzie
              się na strzałce i opisie wiersza — na tablecie miniatura w wierszu
              działa lepiej niż nakładka. */}
          <div className="pointer-events-none absolute right-0 top-0 z-20 hidden h-full w-[38%] max-w-[440px] lg:block">
            <div className="sticky top-1/2 aspect-[4/5] w-full -translate-y-1/2">
              <AnimatePresence mode="wait">
                {active && (
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, scale: 1.04, clipPath: "inset(8% 8% 8% 8%)" }}
                    animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.55, ease: EASE_OUT }}
                    className="relative h-full w-full overflow-hidden"
                  >
                    <img
                      src={active.image}
                      srcSet={responsiveSrcSet(active.image)}
                      /* Podgląd ma stałe 38% szerokości okna, najwyżej 440 px. */
                      sizes="(min-width: 1024px) min(38vw, 440px), 0px"
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-void/25" />
                    <PlaceholderTag className="absolute bottom-3 right-3" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Lista kończy się przed kolumną podglądu zamiast biec pod nią.
              Przy stałym podglądzie nakładka trwale zasłaniałaby tytuły
              wierszy — teraz to dwie sąsiadujące kolumny, nie warstwy. */}
          <ul className="relative z-10 border-t border-limestone/12 lg:w-[57%]">
            {offerAreas.map((area, i) => (
              <li key={area.id}>
                <Reveal delay={Math.min(i * 0.04, 0.2)}>
                  <Link
                    to={`/systemy?kategoria=${area.categoryId}`}
                    onMouseEnter={() => setHovered(area.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="group flex items-center gap-5 border-b border-limestone/12 py-7 md:gap-8 md:py-9"
                  >
                    <span className="label w-7 shrink-0 text-limestone/55 transition-colors duration-500 group-hover:text-bronze-light">
                      0{i + 1}
                    </span>

                    <img
                      src={area.image}
                      srcSet={responsiveSrcSet(area.image)}
                      /* Miniatura ma 56 px — kadr 1800 px był tu czystą stratą. */
                      sizes="56px"
                      alt=""
                      loading="lazy"
                      className="h-14 w-14 shrink-0 object-cover lg:hidden"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="display text-[7vw] leading-none tracking-[-0.04em] text-limestone/85 transition-colors duration-500 group-hover:text-limestone sm:text-4xl md:text-[44px] lg:text-[52px]">
                        {area.name}
                      </h3>
                      <p className="mt-2.5 max-w-md text-sm text-limestone/55 transition-colors duration-500 group-hover:text-limestone/60">
                        {area.short}
                      </p>
                    </div>

                    <ArrowUpRight
                      className="h-5 w-5 shrink-0 text-limestone/55 transition-all duration-500 ease-[var(--ease-premium)] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-bronze-light md:h-6 md:w-6"
                      strokeWidth={1.2}
                    />
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
