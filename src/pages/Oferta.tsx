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

/** Zakres decyzji, które obejmie przyszła wycena online. */
const configuratorSteps = [
  { label: "System", body: "Seria profili dobrana do otworu i wymagań inwestycji." },
  { label: "Konstrukcja", body: "Sposób otwierania, podziały i kierunki skrzydeł." },
  { label: "Szklenie", body: "Pakiet szybowy — termika, akustyka, bezpieczeństwo." },
  { label: "Wykończenie", body: "Kolor z palety RAL lub anoda, struktura powierzchni." },
  { label: "Wymiar", body: "Wymiar z pomiaru na budowie, nie z projektu." },
];

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

      {/* Zapowiedź konfiguratora — oś wyboru zamiast kart z ceną „na zapytanie” */}
      <section className="grain bg-void py-20 text-limestone md:py-28">
        <div className="container-edge">
          <SectionHeading
            eyebrow="Wycena online"
            tone="light"
            variant="stacked"
            titleClassName="max-w-3xl text-[9vw] leading-[0.94] sm:text-5xl md:text-6xl"
            lines={["Konfigurator", "w przygotowaniu"]}
            description="Docelowo wycena prowadzona krok po kroku — od serii profili po wymiar z pomiaru. Poniżej zakres decyzji, które obejmie."
          />

          {/* Kroki konfiguratora */}
          <Reveal delay={0.1}>
            <ol className="mt-14 grid grid-cols-1 gap-px border-y border-limestone/12 bg-limestone/12 sm:grid-cols-2 lg:grid-cols-5 lg:border">
              {configuratorSteps.map((step, i) => (
                <li key={step.label} className="flex flex-col gap-6 bg-void p-6 md:p-7">
                  <span className="label text-bronze-light">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.02em]">{step.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-limestone/60">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.14} className="mt-12 flex flex-wrap gap-4">
            <ArrowButton href="/systemy" variant="solid" tone="dark">
              Katalog systemów
            </ArrowButton>
            <ArrowButton href="/kontakt" variant="outline" tone="dark">
              Zapytaj o wycenę
            </ArrowButton>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="mt-10 max-w-2xl text-xs leading-relaxed text-limestone/60">
              Do czasu uruchomienia konfiguratora każdą pozycję wyceniamy
              indywidualnie — na podstawie projektu i pomiaru na budowie.
              Cen katalogowych nie podajemy, bo w konstrukcjach aluminiowych
              nie istnieją.
            </p>
          </Reveal>
        </div>
      </section>

    </>
  );
}
