import seoRaw from "../content/seo.json";
import homeRaw from "../content/strona-glowna.json";
import aboutRaw from "../content/o-nas.json";
import { text } from "../lib/content";

/* ------------------------------------------------------------------
   TEKSTY PODSTRON Z PANELU

   Tytuły i opisy dla wyszukiwarki (src/content/seo.json) oraz teksty,
   które klient zmienia sam (strona główna, „O nas”). Każde pole ma
   wartość zapasową: puste pole w panelu nie może zostawić podstrony
   bez tytułu w Google ani bez akapitu na stronie.
   ------------------------------------------------------------------ */

interface PageSeo {
  title: string;
  description: string;
}

type SeoKey = "home" | "oferta" | "systemy" | "realizacje" | "oNas" | "kontakt";

const SEO_FALLBACK: Record<SeoKey, PageSeo> = {
  home: { title: "Okna, drzwi i fasady aluminiowe", description: "Projektujemy i wykonujemy stolarkę aluminiową: okna, drzwi, systemy przesuwne i fasady." },
  oferta: { title: "Oferta", description: "Zakres prac: okna i drzwi aluminiowe, systemy przesuwne, fasady i konstrukcje indywidualne." },
  systemy: { title: "Katalog systemów aluminiowych", description: "Katalog systemów aluminiowych z wyszukiwarką, filtrami i kartą techniczną każdego systemu." },
  realizacje: { title: "Realizacje", description: "Przegląd obiektów w podziale na typ inwestycji i zakres prac." },
  oNas: { title: "O nas", description: "Projektowanie i wykonawstwo stolarki aluminiowej." },
  kontakt: { title: "Kontakt i wycena", description: "Zapytaj o wycenę okien, drzwi, systemów przesuwnych i fasad aluminiowych." },
};

const seoData = seoRaw as Partial<Record<SeoKey, { title?: unknown; description?: unknown }>>;

export function pageSeo(key: SeoKey): PageSeo {
  const entry = seoData[key];
  return {
    title: text(entry?.title) || SEO_FALLBACK[key].title,
    description: text(entry?.description) || SEO_FALLBACK[key].description,
  };
}

export const homeContent = {
  heroEyebrow: text(homeRaw.heroEyebrow) || "Producent stolarki aluminiowej",
  heroLead:
    text(homeRaw.heroLead) ||
    "Projektujemy i wykonujemy konstrukcje aluminiowe – od pojedynczego okna po kompletną fasadę budynku.",
};

export const aboutContent = {
  pageTitle: text(aboutRaw.pageTitle) || "O nas",
  headline: text(aboutRaw.headline),
  headlineAccent: text(aboutRaw.headlineAccent),
  /* Akapity rozdzielone pustą linią w polu tekstowym panelu. */
  body: text(aboutRaw.body)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean),
  scope: text(aboutRaw.scope),
};
