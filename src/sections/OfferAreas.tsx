import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { offerAreas } from "../data/products";
import { responsiveSrcSet } from "../lib/responsiveImage";

/**
 * Obszary oferty jako lista wierszy z miniaturą.
 *
 * Wcześniej obok listy stał duży, przyklejony podgląd (38% szerokości,
 * kadr 4/5). Klientka: zdjęcia „są ucinane i są za duże” — przy przewijaniu
 * podgląd wchodził pod krawędź sekcji i kadr był obcinany. Teraz zdjęcie jest
 * małą miniaturą w wierszu, na który wskazuje kursor, więc zawsze mieści się
 * w całości i nie odrywa się od nazwy, której dotyczy.
 */
export function OfferAreas() {
  return (
    <section id="oferta" className="grain relative overflow-hidden bg-void py-20 text-limestone md:py-28">
      <div className="container-edge relative">
        <SectionHeading
          index="02"
          eyebrow="Zakres prac"
          tone="light"
          variant="split"
          lines={["Co wykonujemy"]}
          description="Siedem obszarów — od pojedynczego okna po kompletną kopertę budynku."
        />

        {/* Jedna etykieta dla wszystkich miniatur — na kadrze 176 px
            plakietka zasłaniałaby połowę zdjęcia. */}
        <div className="mt-10 flex justify-end">
          <PlaceholderTag label="Zdjęcia poglądowe" />
        </div>

        <ul className="mt-4 border-t border-limestone/12">
          {offerAreas.map((area, i) => (
            <li key={area.id}>
              <Reveal delay={Math.min(i * 0.04, 0.2)}>
                <Link
                  to={`/systemy?kategoria=${area.categoryId}`}
                  className="group flex items-center gap-5 border-b border-limestone/12 py-6 md:gap-8 md:py-7"
                >
                  {/* Numer w kroju nagłówków, nie w 11-pikselowej etykiecie —
                      „te cyfry większe” (uwaga klientki). */}
                  <span className="display w-10 shrink-0 text-xl tabular-nums text-limestone/45 transition-colors duration-500 group-hover:text-bronze-light md:w-14 md:text-2xl">
                    0{i + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="display text-[6.5vw] leading-none tracking-[-0.04em] text-limestone/85 transition-colors duration-500 group-hover:text-limestone sm:text-3xl md:text-[40px]">
                      {area.name}
                    </h3>
                    <p className="mt-2.5 max-w-lg text-[15px] text-limestone/60 transition-colors duration-500 group-hover:text-limestone/75 md:text-base">
                      {area.short}
                    </p>
                  </div>

                  {/* Miniatura: na telefonie zawsze widoczna (nie ma kursora),
                      od `md` pojawia się dopiero przy wskazaniu wiersza. Stała
                      wysokość wiersza — pojawienie się zdjęcia nie przesuwa listy. */}
                  <img
                    src={area.image}
                    srcSet={responsiveSrcSet(area.image)}
                    /* Miniatura ma najwyżej 176 px szerokości. */
                    sizes="(min-width: 768px) 176px, 64px"
                    alt=""
                    loading="lazy"
                    className="h-12 w-16 shrink-0 object-cover md:h-[112px] md:w-[176px] md:translate-y-1 md:opacity-0 md:transition-all md:duration-500 md:ease-[var(--ease-premium)] md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100"
                  />

                  <ArrowUpRight
                    className="hidden h-5 w-5 shrink-0 text-limestone/55 transition-all duration-500 ease-[var(--ease-premium)] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-bronze-light sm:block md:h-6 md:w-6"
                    strokeWidth={1.2}
                  />
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
