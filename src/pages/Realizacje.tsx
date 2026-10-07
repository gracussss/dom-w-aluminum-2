import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageHero } from "../components/ui/PageHero";
import { ParallaxImage } from "../components/ui/ParallaxImage";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { Reveal } from "../components/ui/Reveal";
import { PORTFOLIO_DISCLAIMER, PORTFOLIO_SEO_DESCRIPTION, realizations } from "../data/realizations";

/* Jeden format i jedna wielkość kafla. Wcześniej był tu celowo nierówny
   układ editorial: sześć różnych proporcji (4/3, 3/4, 16/10, 4/5) i kafle
   przesunięte w pionie — pierwszy z prawej miał ujemny margines i wjeżdżał
   pod ciemny nagłówek strony. Klientka: „albo kwadraty, albo poziomy, albo
   piony — żeby była jednolitość”, „jedna wielkość musi być”. Kadr poziomy,
   bo tak zrobione są zdjęcia obiektów, a trzy kolumny dają kafle nieco
   mniejsze niż dotychczasowe duże pozycje. */
const TILE_RATIO = "aspect-[4/3]";

export function Realizacje() {
  return (
    <>
      <Seo
        title="Realizacje · konstrukcje aluminiowe"
        description={PORTFOLIO_SEO_DESCRIPTION}
        canonicalPath="/realizacje"
      />
      <PageHero
        eyebrow="Realizacje"
        title="Nasze realizacje"
        description="Przegląd obiektów w podziale na typ inwestycji i zakres wykonanych prac."
      />

      <section className="bg-limestone py-16 text-void md:py-24">
        <div className="container-edge">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {realizations.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 0.06} className={`group ${TILE_RATIO}`}>
                <Link to={`/realizacje/${item.slug}`} className="relative block h-full w-full overflow-hidden">
                  <ParallaxImage
                    src={item.cover}
                    alt={item.title}
                    className="h-full w-full"
                    imgClassName="transition-transform duration-[900ms] ease-[var(--ease-premium)] group-hover:scale-[1.06]"
                  />
                  <PlaceholderTag className="absolute right-4 top-4" />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/15 to-transparent opacity-75 transition-opacity duration-700 group-hover:opacity-95" />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-7">
                    <div className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:translate-y-0 group-focus-within:translate-y-0 [@media(hover:hover)]:translate-y-1.5">
                      <p className="label text-bronze-light">{item.category}</p>
                      <h2 className="display mt-2.5 text-2xl leading-tight text-limestone md:text-[26px]">
                        {item.title}
                      </h2>
                      <p className="mt-1.5 text-xs text-limestone/55">{item.scope}</p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-limestone/40 text-limestone transition-all duration-700 ease-[var(--ease-premium)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0">
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.4} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <p className="mt-14 max-w-3xl text-xs leading-relaxed text-void/60">{PORTFOLIO_DISCLAIMER}</p>
        </div>
      </section>
    </>
  );
}
