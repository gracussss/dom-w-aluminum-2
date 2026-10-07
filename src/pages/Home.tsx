import { Seo } from "../components/Seo";
import { organizationJsonLd } from "../lib/jsonLd";
import { Hero } from "../sections/Hero";
import { Manifest } from "../sections/Manifest";
import { OfferAreas } from "../sections/OfferAreas";
import { ProductStory } from "../sections/ProductStory";
import { Process } from "../sections/Process";
import { ContactSection } from "../sections/ContactSection";

export function Home() {
  return (
    <>
      {/* Wizytówka firmy w danych strukturalnych — tylko potwierdzone dane. */}
      <Seo
        title="Okna, drzwi i fasady aluminiowe"
        description="Projektujemy i wykonujemy stolarkę aluminiową: okna, drzwi, systemy przesuwne i fasady. Alukoncept Sp. z o.o. z Sosnowca. Wycena po pomiarze na budowie."
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
