import aboutRaw from "../content/strony/o-nas.json";
import offerPageRaw from "../content/strony/oferta.json";
import systemsPageRaw from "../content/strony/systemy.json";
import realizationsPageRaw from "../content/strony/realizacje.json";
import contactPageRaw from "../content/strony/kontakt.json";
import newsPageRaw from "../content/strony/aktualnosci.json";
import { headingLines, paragraphs, text } from "../lib/content";
import type { HeadingLine } from "../lib/content";
import { buildHero, obj, textItems } from "./pages";
import type { PageHeroContent, TextItem } from "./pages";

/* Teksty podstron z panelu (src/content/strony/*.json) poza stroną główną.
   Osobny moduł, żeby nie jechały w paczce pierwszego ekranu — importują go
   wyłącznie podstrony (leniwe trasy) i podgląd w panelu. */

/* ------------------------------ O NAS ------------------------------ */

export interface AboutContent {
  hero: PageHeroContent;
  headline: HeadingLine[];
  body: string[];
  scope: string;
}

export function buildAboutContent(raw: unknown): AboutContent {
  const data = obj(raw);
  return {
    hero: buildHero(data?.hero, { eyebrow: "O nas", title: "O nas" }),
    headline: headingLines(data?.headline),
    body: paragraphs(data?.body),
    scope: text(data?.scope),
  };
}

export const aboutContent = buildAboutContent(aboutRaw);

/* ------------------------------ OFERTA ------------------------------ */

export interface OfferPageContent {
  hero: PageHeroContent;
  quote: { eyebrow: string; title: HeadingLine[]; description: string; factors: TextItem[]; note: string };
}

export function buildOfferPageContent(raw: unknown): OfferPageContent {
  const data = obj(raw);
  const quote = obj(data?.quote);
  return {
    hero: buildHero(data?.hero, { eyebrow: "Oferta", title: "Zakres prac" }),
    quote: {
      eyebrow: text(quote?.eyebrow),
      title: headingLines(quote?.title),
      description: text(quote?.description),
      factors: textItems(quote?.factors),
      note: text(quote?.note),
    },
  };
}

export const offerPageContent = buildOfferPageContent(offerPageRaw);

/* ------------------------ POZOSTAŁE PODSTRONY ------------------------ */

export function buildPageHero(raw: unknown, fallback: Pick<PageHeroContent, "eyebrow" | "title">): PageHeroContent {
  return buildHero(obj(raw)?.hero, fallback);
}

export const PAGE_HERO_FALLBACK = {
  systemy: { eyebrow: "Katalog", title: "Systemy aluminiowe" },
  realizacje: { eyebrow: "Realizacje", title: "Realizacje" },
  kontakt: { eyebrow: "Kontakt", title: "Kontakt" },
  aktualnosci: { eyebrow: "Aktualności", title: "Aktualności" },
} as const;

export const pageHeroes = {
  systemy: buildPageHero(systemsPageRaw, PAGE_HERO_FALLBACK.systemy),
  realizacje: buildPageHero(realizationsPageRaw, PAGE_HERO_FALLBACK.realizacje),
  kontakt: buildPageHero(contactPageRaw, PAGE_HERO_FALLBACK.kontakt),
  aktualnosci: buildPageHero(newsPageRaw, PAGE_HERO_FALLBACK.aktualnosci),
};
