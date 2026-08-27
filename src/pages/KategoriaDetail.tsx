import { useParams } from "react-router-dom";
import { CatalogLanding } from "../components/catalog/CatalogLanding";
import { NotFound } from "./NotFound";
import { findCategoryBySlug, useSystems, useTaxonomy } from "../catalog";

/**
 * Strona kategorii — indeksowalny adres dla „okien aluminiowych”,
 * „fasad” itd. Katalog z parametrem w adresie służy do przeglądania,
 * ta strona jest miejscem, do którego prowadzi wyszukiwarka i menu.
 */
export function KategoriaDetail() {
  const { slug } = useParams();
  const { data: taxonomy } = useTaxonomy();
  const category = taxonomy && slug ? findCategoryBySlug(taxonomy, slug) : undefined;

  /* Hooki muszą się wykonać niezależnie od tego, czy kategoria istnieje —
     przy nieznanym slugu wynik i tak nie zostanie użyty (patrz NotFound niżej). */
  const { data: list } = useSystems({ categoryIds: category ? [category.id] : [] });

  if (!taxonomy) return <div className="min-h-[70svh] bg-void" aria-busy />;
  if (!category) return <NotFound />;

  return (
    <CatalogLanding
      breadcrumbs={[
        { label: "Systemy", to: "/systemy" },
        { label: category.name },
      ]}
      eyebrow="Kategoria"
      title={category.name}
      description={category.description}
      /* Kropka zamiast myślnika: sufiks „— Dom w Aluminium” dokłada własny. */
      seoTitle={`${category.name} · systemy aluminiowe`}
      seoDescription={`${category.description} Zestawienie systemów w katalogu Dom w Aluminium.`}
      systems={list?.items ?? []}
      taxonomy={taxonomy}
      catalogHref={`/systemy?kategoria=${category.id}`}
      catalogLabel="Otwórz w katalogu z filtrami"
      emptyMessage="W tej kategorii nie ma jeszcze pozycji. Uzupełniamy katalog w miarę potwierdzania danych."
    />
  );
}
