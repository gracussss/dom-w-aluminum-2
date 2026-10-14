import { Seo } from "../components/Seo";
import { organizationJsonLd } from "../lib/jsonLd";
import { pageSeo } from "../data/pages";
import { Hero } from "../sections/Hero";
import { Manifest } from "../sections/Manifest";
import { OfferAreas } from "../sections/OfferAreas";
import { ProductStory } from "../sections/ProductStory";
import { Process } from "../sections/Process";
import { ContactSection } from "../sections/ContactSection";

export function Home() {
  const seo = pageSeo("home");
  return (
    <>
      {/* Wizytówka firmy w danych strukturalnych — tylko potwierdzone dane. */}
      <Seo
        title={seo.title}
        description={seo.description}
        canonicalPath="/"
        jsonLd={organizationJsonLd()}
      />
      {/* Kolejność według klientki (październik 2026): zaraz po hero
          zakres prac, a „Podejście” bezpośrednio przed procesem — oba mówią
          o sposobie pracy, więc czytają się jako jedna część strony. */}
      <Hero />
      <OfferAreas />
      <ProductStory />
      <Manifest />
      <Process />
      <ContactSection />
    </>
  );
}
