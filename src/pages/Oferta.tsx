import { ArrowUpRight } from "lucide-react";
import { isPlaceholderImage, responsiveSrcSet } from "../lib/responsiveImage";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageHero } from "../components/ui/PageHero";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ArrowButton } from "../components/ui/ArrowButton";
import { offerAreas } from "../data/products";
import { pageSeo } from "../data/pages";
import { offerPageContent } from "../data/subpages";
import type { OfferPageContent } from "../data/subpages";
import { headingNodes } from "../components/ui/headingNodes";
import { findCategory, useTaxonomy } from "../catalog";
import { FaqSection } from "../components/ui/FaqSection";
import { faq } from "../data/faq";
import { faqJsonLd } from "../lib/jsonLd";

/* Liczba kolumn pasa wyceny idzie za liczbą czynników z panelu (3–6).
   Przy stałych pięciu kolumnach cztery pozycje zostawiały pustą komórkę —
   przy liniach rysowanych odstępem widać ją jako dziurę. */
const FACTOR_COLUMNS: Record<number, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-3",
};

export function Oferta() {
  /* Slug kategorii bierzemy z taksonomii — obszar oferty wskazuje id. */
  const { data: taxonomy } = useTaxonomy();
  const seo = pageSeo("oferta");

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        /* FAQPage tylko wtedy, gdy klient dodał pytania w panelu. */
        jsonLd={
          faq.items.length > 0
            ? faqJsonLd(faq.items.map((item) => ({ question: item.question, answer: item.answer.join("\n\n") })))
            : undefined
        }
      />
      <PageHero
        eyebrow={offerPageContent.hero.eyebrow}
        title={offerPageContent.hero.title}
        description={offerPageContent.hero.description}
      />

      {/* Obszary oferty — naprzemienny układ, bez powtarzalnej siatki kart.
          Zdjęcie zawsze dochodzi do krawędzi kontenera: po lewej w wierszach
          parzystych, po prawej w nieparzystych. Wcześniej w wierszach
          odwróconych kończyło się kolumnę przed krawędzią i prawy margines
          był większy od lewego (uwaga klientki: „dwa takie same mają być”). */}
      <section className="bg-limestone py-14 text-void md:py-20">
        <div className="container-edge space-y-16 md:space-y-20">
          {offerAreas.map((area, i) => {
            const flipped = i % 2 === 1;
            return (
              <Reveal key={area.id}>
                <article
                  id={area.id}
                  className="grid scroll-mt-32 items-center gap-8 lg:grid-cols-12 lg:gap-12"
                >
                  <div
                    className={`relative aspect-[4/3] overflow-hidden lg:col-span-7 lg:row-start-1 ${
                      flipped ? "lg:col-start-6" : "lg:col-start-1"
                    }`}
                  >
                    <img
                      src={area.image}
                      srcSet={responsiveSrcSet(area.image)}
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      alt={area.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {isPlaceholderImage(area.image) && <PlaceholderTag className="absolute right-4 top-4" />}
                  </div>

                  <div
                    className={`lg:col-span-4 lg:row-start-1 ${flipped ? "lg:col-start-1" : "lg:col-start-9"}`}
                  >
                    <span className="display text-3xl leading-none text-bronze">{String(i + 1).padStart(2, "0")}</span>
                    <h2 className="display display-tight mt-4 text-4xl sm:text-[2.75rem]">{area.name}</h2>
                    <p className="mt-5 text-pretty text-lg leading-relaxed text-void/65">{area.description}</p>
                    <Link
                      to={
                        taxonomy
                          ? `/systemy/kategoria/${findCategory(taxonomy, area.categoryId)?.slug ?? ""}`
                          : "/systemy"
                      }
                      className="group mt-7 inline-flex items-center gap-2.5 label text-void transition-colors hover:text-bronze"
                    >
                      Zobacz systemy
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={1.5}
                      />
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <OfferQuote />
      <FaqSection />
    </>
  );
}

/**
 * Na czym stoi wycena — pas decyzji, zamknięty kontaktem.
 *
 * To NIE jest zapowiedź funkcji, tylko opis tego, co ustalamy dzisiaj —
 * i dopiero w drugiej kolejności zakres, który docelowo poprowadzi wycena
 * online. Wcześniej ta sekcja była odwrotnie: nagłówek obiecywał
 * konfigurator, a strona oferty kończyła się zapowiedzią zamiast
 * działającym kanałem kontaktu.
 */
export function OfferQuote({ content = offerPageContent.quote }: { content?: OfferPageContent["quote"] }) {
  const factors = content.factors;
  /* Nieparzysta liczba pozycji zostawiała w układzie dwukolumnowym pustą
     komórkę — ostatnia pozycja rozciąga się wtedy na oba pola. */
  const fillLast = factors.length % 2 === 1 ? "sm:col-span-2 lg:col-span-1" : "";

  return (
    <section className="grain bg-void pb-14 pt-20 text-limestone md:pb-16 md:pt-24">
      <div className="container-edge">
        {/* Tytuł i akapit w jednym wierszu, akapit na wysokości środka
            tytułu — tak jak prosiła klientka („w jednym wierszu, na środku”). */}
        <SectionHeading
          eyebrow={content.eyebrow}
          tone="light"
          variant="split"
          lines={headingNodes(content.title, "text-aluminium-light")}
          description={content.description}
        />

        {/* Pas decyzji */}
        <Reveal delay={0.1}>
          <ol
            className={`mt-10 grid grid-cols-1 gap-px border-y border-limestone/12 bg-limestone/12 sm:grid-cols-2 lg:border ${
              FACTOR_COLUMNS[factors.length] ?? "lg:grid-cols-3"
            }`}
          >
            {factors.map((factor, i) => (
              <li
                key={i}
                className={`flex flex-col gap-6 bg-void p-6 md:p-7 ${i === factors.length - 1 ? fillLast : ""}`}
              >
                <span className="display text-2xl leading-none text-bronze-light">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">{factor.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-limestone/65">{factor.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Konfigurator schodzi do przypisu — jest planem, nie ofertą */}
        {content.note && (
          <Reveal delay={0.14}>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-limestone/65">{content.note}</p>
          </Reveal>
        )}

        <Reveal delay={0.18} className="mt-8 flex flex-wrap gap-4">
          <ArrowButton href="/kontakt" variant="solid" tone="dark">
            Opisz projekt
          </ArrowButton>
          <ArrowButton href="/systemy" variant="outline" tone="dark">
            Katalog systemów
          </ArrowButton>
        </Reveal>
      </div>
    </section>
  );
}
