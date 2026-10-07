import { useParams } from "react-router-dom";
import { CatalogLanding } from "../components/catalog/CatalogLanding";
import { NotFound } from "./NotFound";
import { findManufacturerBySlug, useSystems, useTaxonomy } from "../catalog";

/**
 * Strona producenta. Wymienia systemy, w których firma wykonuje konstrukcje —
 * i mówi wprost, że to NIE jest deklaracja autoryzacji ani partnerstwa.
 * Bez tego zdania sama obecność logotypu producenta bywa tak odbierana.
 */
export function ProducentDetail() {
  const { slug } = useParams();
  const { data: taxonomy } = useTaxonomy();
  const manufacturer = taxonomy && slug ? findManufacturerBySlug(taxonomy, slug) : undefined;

  /* Jak wyżej — hook bezwarunkowy, wynik nieużywany przy nieznanym slugu. */
  const { data: list } = useSystems({ manufacturerIds: manufacturer ? [manufacturer.id] : [] });

  if (!taxonomy) return <div className="min-h-[70svh] bg-void" aria-busy />;
  if (!manufacturer) return <NotFound />;

  const relationNote =
    manufacturer.relationship === "authorized-partner"
      ? null
      : `Wykonujemy konstrukcje w systemach ${manufacturer.name}. Zestawienie ma charakter informacyjny – nie stanowi deklaracji autoryzacji, partnerstwa ani przedstawicielstwa producenta.`;

  return (
    <CatalogLanding
      breadcrumbs={[
        { label: "Systemy", to: "/systemy" },
        { label: manufacturer.name },
      ]}
      eyebrow="Producent"
      title={manufacturer.name}
      description={`Systemy ${manufacturer.name} obecne w naszym zestawieniu, w podziale na kategorie i typy konstrukcji.`}
      seoTitle={`Systemy ${manufacturer.name}`}
      seoDescription={`Zestawienie systemów ${manufacturer.name} – okna, drzwi, konstrukcje przesuwne i fasady w katalogu Dom w Aluminium.`}
      systems={list?.items ?? []}
      taxonomy={taxonomy}
      showManufacturer={false}
      catalogHref={`/systemy?producent=${manufacturer.id}`}
      catalogLabel="Otwórz w katalogu z filtrami"
      note={relationNote ?? undefined}
      emptyMessage="Dla tego producenta nie ma jeszcze pozycji w zestawieniu."
    />
  );
}
