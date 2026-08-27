import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ParallaxImage } from "../components/ui/ParallaxImage";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ArrowButton } from "../components/ui/ArrowButton";
import { realizations } from "../data/realizations";

/** Asymetryczny układ — świadome łamanie siatki zamiast równego gridu. */
const layout = [
  "lg:col-span-7 lg:mt-0 aspect-[4/3]",
  "lg:col-span-4 lg:col-start-9 lg:-mt-28 aspect-[3/4]",
  "lg:col-span-5 lg:col-start-2 lg:mt-8 aspect-[3/4]",
  "lg:col-span-6 lg:col-start-7 lg:mt-32 aspect-[16/10]",
];

export function FeaturedRealizations() {
  const featured = realizations.slice(0, 4);

  return (
    <section id="realizacje" className="grain relative overflow-hidden bg-void py-24 text-limestone md:py-32">
      <div className="container-edge relative">
        <SectionHeading
          index="07"
          eyebrow="Realizacje"
          tone="light"
          variant="inset"
          titleClassName="text-[9vw] leading-[0.94] sm:text-5xl md:text-6xl lg:text-7xl"
          lines={["Wybrane", "realizacje"]}
          description="Domy jednorodzinne, obiekty komercyjne i budynki użyteczności publicznej."
        />

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-8">
          {featured.map((item, i) => (
            <Reveal key={item.id} delay={(i % 2) * 0.06} className={`group ${layout[i]}`}>
              <Link to={`/realizacje/${item.slug}`} className="relative block h-full w-full overflow-hidden">
                <ParallaxImage
                  src={item.cover}
                  alt={item.title}
                  className="h-full w-full"
                  imgClassName="transition-transform duration-[900ms] ease-[var(--ease-premium)] group-hover:scale-[1.06]"
                />
                <PlaceholderTag className="absolute right-4 top-4" />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-95" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-7">
                  <div className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-y-0 group-focus-within:translate-y-0 [@media(hover:hover)]:translate-y-1.5">
                    <p className="label text-bronze-light">{item.category}</p>
                    <h3 className="display mt-2.5 text-2xl leading-tight md:text-[32px]">{item.title}</h3>
                    <p className="mt-1.5 text-xs text-limestone/55">{item.scope}</p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-limestone/40 transition-all duration-700 ease-[var(--ease-premium)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.4} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-20 flex justify-center lg:mt-28">
          <ArrowButton href="/realizacje" variant="outline" tone="dark">
            Wszystkie realizacje
          </ArrowButton>
        </Reveal>
      </div>
    </section>
  );
}
