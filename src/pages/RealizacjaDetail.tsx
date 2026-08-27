import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Seo } from "../components/Seo";
import { Reveal, RevealText } from "../components/ui/Reveal";
import { Eyebrow } from "../components/ui/Eyebrow";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { ParallaxImage } from "../components/ui/ParallaxImage";
import { SIZES_FULL, responsiveSrcSet } from "../lib/responsiveImage";
import { NotFound } from "./NotFound";
import { PORTFOLIO_DISCLAIMER, realizations } from "../data/realizations";
import { breadcrumbJsonLd } from "../lib/jsonLd";
import { siteOrigin } from "../lib/seo";

export function RealizacjaDetail() {
  const { slug } = useParams();
  const index = realizations.findIndex((r) => r.slug === slug);
  const item = index >= 0 ? realizations[index] : undefined;

  if (!item) return <NotFound />;

  const next = realizations[(index + 1) % realizations.length];

  /* Opis meta: typ obiektu, zakres prac i tyle zdań opisu, ile mieści się
     w 160 znakach — tyle wyszukiwarka pokazuje, reszta i tak zostaje ucięta.
     Ucinamy na kropce, żeby nie kończyć opisu w połowie zdania. */
  const seoDescription = item.description
    .split(/(?<=\.)\s+/)
    .reduce(
      (acc, sentence) => (`${acc} ${sentence}`.length <= 160 ? `${acc} ${sentence}` : acc),
      `${item.category}. Zakres prac: ${item.scope}.`
    );

  const crumbs = [{ label: "Realizacje", to: "/realizacje" }, { label: item.title }];
  /* Origin z konfiguracji, nie z przeglądarki — inaczej po ustawieniu
     VITE_SITE_URL canonical wskazywałby domenę produkcyjną, a adresy
     w danych strukturalnych zostawały na adresie środowiska. */
  const origin = siteOrigin();

  return (
    <>
      {/* Opis bez słowa „realizacja" — obiekty w portfolio są na razie
          poglądowe i strona mówi o tym wprost pod galerią. Tytuł się tu nie
          powtarza: wyszukiwarka pokazuje go osobno, nad opisem. */}
      <Seo
        title={item.title}
        description={seoDescription}
        canonicalPath={`/realizacje/${item.slug}`}
        /* Obiekt poglądowy nie może trafić do wyników wyszukiwania jako
           realizacja firmy — indeksowanie włącza `verified` w danych. */
        noindex={!item.verified}
        jsonLd={breadcrumbJsonLd(crumbs, origin)}
      />

      {/* DUŻE ZDJĘCIE */}
      <section className="relative h-[78svh] min-h-[520px] w-full overflow-hidden bg-void">
        <img
          src={item.cover}
          srcSet={responsiveSrcSet(item.cover)}
          sizes={SIZES_FULL}
          alt={item.title}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/35 to-void/50" />
        <div className="grain absolute inset-0" />
        <PlaceholderTag className="absolute right-5 top-24 md:right-10" />

        <div className="container-edge absolute inset-x-0 bottom-0 pb-14 md:pb-20">
          <Link
            to="/realizacje"
            className="label inline-flex items-center gap-2 text-limestone/55 transition-colors hover:text-limestone"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Realizacje
          </Link>
          <p className="label mt-8 text-bronze-light">{item.category}</p>
          <h1 className="display display-tight mt-4 max-w-4xl text-[12vw] leading-[0.92] text-limestone sm:text-6xl md:text-7xl">
            <RevealText>{item.title}</RevealText>
          </h1>
        </div>
      </section>

      {/* INFORMACJE */}
      <section className="bg-limestone py-20 text-void md:py-28">
        <div className="container-edge grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow index="01" label="O realizacji" tone="dark" />
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-8 text-pretty text-xl leading-relaxed text-void/70 md:text-2xl">
                {item.description}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="lg:col-span-6 lg:col-start-7">
            <dl className="divide-y divide-void/12 border-y border-void/12">
              <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                <dt className="label text-void/70">Typ obiektu</dt>
                <dd className="text-[15px] text-void/75">{item.category}</dd>
              </div>
              <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                <dt className="label text-void/70">Lokalizacja</dt>
                <dd className="text-[15px] text-void/60">{item.location}</dd>
              </div>
              <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                <dt className="label text-void/70">Zakres prac</dt>
                <dd className="text-[15px] text-void/75">{item.scope}</dd>
              </div>
              <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                <dt className="label text-void/70">Zastosowany system</dt>
                <dd className="text-[15px] text-void/60">Do uzupełnienia</dd>
              </div>
            </dl>

            <Link
              to="/systemy"
              className="group mt-8 inline-flex items-center gap-2.5 label text-void transition-colors hover:text-bronze"
            >
              Zobacz katalog systemów
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* WIĘCEJ ZDJĘĆ */}
      {item.gallery.length > 0 && (
        <section className="grain bg-void py-20 text-limestone md:py-28">
          <div className="container-edge">
            <Reveal>
              <Eyebrow index="02" label="Detale" tone="light" />
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-8">
              {item.gallery.map((src, i) => (
                <Reveal
                  key={src}
                  delay={(i % 2) * 0.06}
                  className={
                    i % 3 === 0
                      ? "lg:col-span-7 aspect-[4/3]"
                      : i % 3 === 1
                        ? "lg:col-span-5 lg:mt-16 aspect-[3/4]"
                        : "lg:col-span-6 lg:col-start-4 aspect-[16/10]"
                  }
                >
                  <div className="relative h-full w-full overflow-hidden">
                    <ParallaxImage src={src} alt={`${item.title} — detal ${i + 1}`} className="h-full w-full" />
                    <PlaceholderTag className="absolute right-3 top-3" />
                  </div>
                </Reveal>
              ))}
            </div>

            <p className="mt-14 max-w-3xl text-xs leading-relaxed text-limestone/55">{PORTFOLIO_DISCLAIMER}</p>
          </div>
        </section>
      )}

      {/* KOLEJNA REALIZACJA */}
      <section className="relative bg-void">
        <Link to={`/realizacje/${next.slug}`} className="group relative block h-[52svh] min-h-[360px] overflow-hidden">
          <img
            src={next.cover}
            srcSet={responsiveSrcSet(next.cover)}
            sizes={SIZES_FULL}
            alt={next.title}
            loading="lazy"
            className="h-full w-full object-cover opacity-45 transition-all duration-[900ms] ease-[var(--ease-premium)] group-hover:scale-105 group-hover:opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/40" />

          <div className="container-edge absolute inset-0 flex flex-col items-start justify-center">
            <span className="label text-limestone/55">Kolejna realizacja</span>
            <h2 className="display display-tight mt-5 max-w-3xl text-[10vw] leading-[0.94] text-limestone sm:text-5xl md:text-6xl">
              {next.title}
            </h2>
            <span className="mt-8 inline-flex items-center gap-3 label text-limestone">
              Zobacz
              <ArrowRight
                className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-1.5"
                strokeWidth={1.4}
              />
            </span>
          </div>
        </Link>
      </section>
    </>
  );
}
