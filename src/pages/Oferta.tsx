import { ArrowUpRight } from "lucide-react";
import { responsiveSrcSet } from "../lib/responsiveImage";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageHero } from "../components/ui/PageHero";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ArrowButton } from "../components/ui/ArrowButton";
import { offerAreas } from "../data/products";
import { findCategory, useTaxonomy } from "../catalog";

/**
 * Z czego składa się wycena konstrukcji aluminiowej.
 *
 * To NIE jest zapowiedź funkcji, tylko opis tego, co ustalamy dzisiaj —
 * i dopiero w drugiej kolejności zakres, który docelowo poprowadzi wycena
 * online. Wcześniej ta sekcja była odwrotnie: nagłówek obiecywał
 * konfigurator, a strona oferty kończyła się zapowiedzią zamiast
 * działającym kanałem kontaktu.
 */
const quoteFactors = [
  { label: "System", body: "Seria profili dobrana do otworu i wymagań inwestycji." },
  { label: "Konstrukcja", body: "Sposób otwierania, podziały i kierunki skrzydeł." },
  { label: "Szklenie", body: "Pakiet szybowy — termika, akustyka, bezpieczeństwo." },
  { label: "Wykończenie", body: "Kolor z palety RAL lub anoda, struktura powierzchni." },
  { label: "Wymiar", body: "Wymiar z pomiaru na budowie, nie z projektu." },
];

/* Nieparzysta liczba pozycji zostawiała w układzie dwukolumnowym pustą
   komórkę — przy hairline'ach rysowanych odstępem widać ją jako dziurę.
   Na pięciu kolumnach rząd wychodzi równo, więc rozciągnięcie znika. */
const factorsFillLast = quoteFactors.length % 2 === 1 ? "sm:col-span-2 lg:col-span-1" : "";

export function Oferta() {
  /* Slug kategorii bierzemy z taksonomii — obszar oferty wskazuje id. */
  const { data: taxonomy } = useTaxonomy();

  return (
    <>
      <Seo
        title="Oferta · okna, drzwi i fasady"
        description="Zakres prac: okna i drzwi aluminiowe, systemy przesuwne, fasady, konstrukcje przeciwpożarowe, ogrody zimowe i rozwiązania indywidualne."
      />
      <PageHero
        eyebrow="Oferta"
        title="Zakres prac"
        description="Od pojedynczego okna po kompletną kopertę budynku. Każdą pozycję wyceniamy indywidualnie na podstawie projektu i pomiaru."
      />

      {/* Obszary oferty — naprzemienny układ, bez powtarzalnej siatki kart */}
      <section className="bg-limestone py-16 text-void md:py-24">
        <div className="container-edge space-y-20 md:space-y-28">
          {offerAreas.map((area, i) => (
            <Reveal key={area.id}>
              <article
                id={area.id}
                className={`grid scroll-mt-32 items-center gap-8 lg:grid-cols-12 lg:gap-12 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden lg:col-span-7">
                  <img
                    src={area.image}
                    srcSet={responsiveSrcSet(area.image)}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    alt={area.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <PlaceholderTag className="absolute right-4 top-4" />
                </div>

                <div className="lg:col-span-4">
                  <span className="label text-bronze">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="display display-tight mt-5 text-4xl sm:text-5xl">{area.name}</h2>
                  <p className="mt-5 text-pretty leading-relaxed text-void/60">{area.description}</p>
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
          ))}
        </div>
      </section>

      {/* Na czym stoi wycena — pas decyzji, zamknięty kontaktem */}
      <section className="grain bg-void py-20 text-limestone md:py-28">
        <div className="container-edge">
          <SectionHeading
            eyebrow="Wycena"
            tone="light"
            variant="stacked"
            titleClassName="max-w-3xl text-[9vw] leading-[0.94] sm:text-5xl md:text-6xl"
            lines={["Cena powstaje", "po pomiarze"]}
            description="Konstrukcja aluminiowa nie ma ceny katalogowej. Składa się na nią pięć decyzji, które ustalamy dla konkretnego otworu i konkretnego budynku."
          />

          {/* Pas decyzji */}
          <Reveal delay={0.1}>
            <ol className="mt-14 grid grid-cols-1 gap-px border-y border-limestone/12 bg-limestone/12 sm:grid-cols-2 lg:grid-cols-5 lg:border">
              {quoteFactors.map((factor, i) => (
                <li
                  key={factor.label}
                  className={`flex flex-col gap-6 bg-void p-6 md:p-7 ${
                    i === quoteFactors.length - 1 ? factorsFillLast : ""
                  }`}
                >
                  <span className="label text-bronze-light">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.02em]">{factor.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-limestone/60">{factor.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          {/* Konfigurator schodzi do przypisu — jest planem, nie ofertą */}
          <Reveal delay={0.14}>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-limestone/60">
              Ten sam zakres poprowadzi docelowo wycena online. Dziś przechodzimy
              przez niego w rozmowie i podczas pomiaru na budowie.
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-10 flex flex-wrap gap-4">
            <ArrowButton href="/kontakt" variant="solid" tone="dark">
              Opisz projekt
            </ArrowButton>
            <ArrowButton href="/systemy" variant="outline" tone="dark">
              Katalog systemów
            </ArrowButton>
          </Reveal>
        </div>
      </section>

    </>
  );
}
