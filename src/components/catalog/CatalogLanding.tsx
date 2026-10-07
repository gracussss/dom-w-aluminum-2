import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Seo } from "../Seo";
import { PageHero } from "../ui/PageHero";
import { PlaceholderTag } from "../ui/PlaceholderTag";
import { Reveal } from "../ui/Reveal";
import { Breadcrumbs } from "../ui/Breadcrumbs";
import type { Crumb } from "../ui/Breadcrumbs";
import { breadcrumbJsonLd, itemListJsonLd } from "../../lib/jsonLd";
import { siteOrigin } from "../../lib/seo";
import { SystemRow } from "./SystemRow";
import { DATA_DISCLAIMER } from "../../catalog";
import type { AluSystem, Taxonomy } from "../../catalog";
import { positions } from "../../lib/plural";

/* ------------------------------------------------------------------
   WSPÓLNY UKŁAD STRON PRZEKROJOWYCH KATALOGU

   Strona kategorii i strona producenta różnią się wyłącznie treścią
   nagłówka i doborem pozycji — lista ma się czytać identycznie jak
   w pełnym katalogu, więc korzysta z tego samego wiersza.
   ------------------------------------------------------------------ */

export interface CatalogLandingProps {
  breadcrumbs: Crumb[];
  eyebrow: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  systems: AluSystem[];
  taxonomy: Taxonomy;
  /** Na stronie producenta kolumna producenta jest zbędna. */
  showManufacturer?: boolean;
  /** Odnośnik do pełnego katalogu z nałożonym filtrem. */
  catalogHref: string;
  catalogLabel: string;
  /** Dodatkowe zastrzeżenie pod listą — np. o braku autoryzacji producenta. */
  note?: string;
  emptyMessage?: string;
}

export function CatalogLanding({
  breadcrumbs,
  eyebrow,
  title,
  description,
  seoTitle,
  seoDescription,
  systems,
  taxonomy,
  showManufacturer = true,
  catalogHref,
  catalogLabel,
  note,
  emptyMessage = "W tej sekcji nie ma jeszcze żadnych pozycji.",
}: CatalogLandingProps) {
  /* Origin z konfiguracji, nie z przeglądarki — inaczej po ustawieniu
     VITE_SITE_URL canonical wskazywałby domenę produkcyjną, a adresy
     w danych strukturalnych zostawały na adresie środowiska. */
  const origin = siteOrigin();

  /* Lista pozycji w danych strukturalnych: wyłącznie nazwa i adres.
     Bez marki, parametrów i cen — część pozycji ma dopiero nazwy robocze. */
  const jsonLd = [
    breadcrumbJsonLd(breadcrumbs, origin),
    itemListJsonLd(
      systems.map((system) => ({ name: system.name, path: `/systemy/${system.slug}` })),
      title
    ),
  ];

  return (
    <>
      <Seo title={seoTitle} description={seoDescription} jsonLd={jsonLd} />

      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        breadcrumbs={<Breadcrumbs items={breadcrumbs} tone="light" />}
        variant="index"
      />

      <section className="bg-limestone py-14 text-void md:py-20">
        <div className="container-edge">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-void/30 pb-3.5">
            {/* „20 pozycji" nie jest nagłówkiem — mówi ile, nie o czym.
                Tytuł listy dostaje czytnik, liczba zostaje na ekranie. */}
            <h2 className="sr-only">{title} – zestawienie systemów</h2>
            <p className="label text-[13px] text-void">
              {systems.length} {positions(systems.length)}
            </p>
            <div className="flex items-center gap-6">
              <Link
                to={catalogHref}
                className="group inline-flex items-center gap-2 label text-void/70 transition-colors hover:text-void"
              >
                {catalogLabel}
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.5}
                />
              </Link>
              <PlaceholderTag label="Zdjęcia poglądowe" tone="light" />
            </div>
          </div>

          {systems.length === 0 ? (
            <p className="mt-16 text-center text-void/70">{emptyMessage}</p>
          ) : (
            <Reveal>
              <ul>
                {systems.map((system, index) => (
                  <SystemRow
                    key={system.id}
                    system={system}
                    no={String(index + 1).padStart(2, "0")}
                    taxonomy={taxonomy}
                    showManufacturer={showManufacturer}
                  />
                ))}
              </ul>
            </Reveal>
          )}

          {note && <p className="mt-12 max-w-3xl text-xs leading-relaxed text-void/70">{note}</p>}
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-void/70">{DATA_DISCLAIMER}</p>
        </div>
      </section>
    </>
  );
}
