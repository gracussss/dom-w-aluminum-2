import seoRaw from "../content/seo.json";
import homeRaw from "../content/strony/strona-glowna.json";
import { headingLines, objectList, text } from "../lib/content";
import type { HeadingLine } from "../lib/content";

/* ------------------------------------------------------------------
   TEKSTY PODSTRON Z PANELU

   Tytuły i opisy dla wyszukiwarki (src/content/seo.json) oraz teksty stron
   (src/content/strony/*.json). Panel pilnuje pól wymaganych; gdy mimo to
   pole jest puste (np. plik poprawiony ręcznie), element znika ze strony
   zamiast pokazać pusty nagłówek. Wartości zapasowe mają tylko tytuły —
   podstrona bez tytułu w Google albo bez <h1> to błąd, nie brak treści.

   Każdy plik ma funkcję `build…`, bo ten sam kod składa podgląd na żywo
   w panelu z danych, których jeszcze nie zapisano.

   Tu tylko SEO i strona główna — jadą w paczce pierwszego ekranu. Teksty
   pozostałych podstron są w `subpages.ts` i ładują się razem z podstroną.
   ------------------------------------------------------------------ */

type Raw = Record<string, unknown> | undefined;

export function obj(value: unknown): Raw {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

/* ------------------------------ SEO ------------------------------ */

interface PageSeo {
  title: string;
  description: string;
}

export type SeoKey = "home" | "oferta" | "systemy" | "realizacje" | "oNas" | "kontakt" | "aktualnosci";

const SEO_FALLBACK: Record<SeoKey, PageSeo> = {
  home: { title: "Okna, drzwi i fasady aluminiowe", description: "Projektujemy i wykonujemy stolarkę aluminiową: okna, drzwi, systemy przesuwne i fasady." },
  oferta: { title: "Oferta", description: "Zakres prac: okna i drzwi aluminiowe, systemy przesuwne, fasady i konstrukcje indywidualne." },
  systemy: { title: "Katalog systemów aluminiowych", description: "Katalog systemów aluminiowych z wyszukiwarką, filtrami i kartą techniczną każdego systemu." },
  realizacje: { title: "Realizacje", description: "Przegląd obiektów w podziale na typ inwestycji i zakres prac." },
  oNas: { title: "O nas", description: "Projektowanie i wykonawstwo stolarki aluminiowej." },
  kontakt: { title: "Kontakt i wycena", description: "Zapytaj o wycenę okien, drzwi, systemów przesuwnych i fasad aluminiowych." },
  aktualnosci: { title: "Aktualności", description: "Zakończone realizacje, nowe rozwiązania i informacje z firmy." },
};

export function buildPageSeo(raw: unknown, key: SeoKey): PageSeo {
  const entry = obj(obj(raw)?.[key]);
  return {
    title: text(entry?.title) || SEO_FALLBACK[key].title,
    description: text(entry?.description) || SEO_FALLBACK[key].description,
  };
}

export function pageSeo(key: SeoKey): PageSeo {
  return buildPageSeo(seoRaw, key);
}

/* --------------------------- WSPÓLNE --------------------------- */

export interface PageHeroContent {
  eyebrow: string;
  title: string;
  description: string;
}

export function buildHero(raw: unknown, fallback: Pick<PageHeroContent, "eyebrow" | "title">): PageHeroContent {
  const hero = obj(raw);
  return {
    eyebrow: text(hero?.eyebrow) || fallback.eyebrow,
    title: text(hero?.title) || fallback.title,
    description: text(hero?.description),
  };
}

export interface TextItem {
  title: string;
  body: string;
}

/** Punkty listy (etapy, zasady, czynniki wyceny) — bez tytułu pozycja wypada. */
export function textItems(value: unknown): TextItem[] {
  return objectList<{ title: unknown; body: unknown }>(value)
    .map((item) => ({ title: text(item.title), body: text(item.body) }))
    .filter((item) => item.title);
}

/** Podstawia „{liczba}” — np. „Sześć etapów” liczone z listy w panelu. */
export function withCount(template: string, phrase: string): string {
  return template.replace(/\{liczba\}/g, phrase);
}

/* ------------------------- STRONA GŁÓWNA ------------------------- */

export interface StoryStep {
  label: string;
  title: string;
  body: string;
}

/* Sekwencja 3D ma sześć ujęć kamery na sztywno (całość, profil, skrzydło,
   warstwy, przekrój, powrót) — tekst idzie za ujęciem. Panel pozwala na
   dokładnie sześć kroków; tu pilnujemy tego samego przy pliku zmienionym
   ręcznie, żeby tekst nie rozjechał się z kamerą. */
export const STORY_STEPS = 6;

export interface HomeContent {
  hero: { eyebrow: string; title: HeadingLine[]; lead: string };
  offer: { eyebrow: string; title: HeadingLine[]; description: string };
  story: { eyebrow: string; steps: StoryStep[] };
  approach: { eyebrow: string; title: HeadingLine[]; lead: string; principles: TextItem[] };
  process: { eyebrow: string; title: HeadingLine[]; description: string; stages: TextItem[] };
  contact: { eyebrow: string; title: HeadingLine[]; lead: string };
}

export function buildHomeContent(raw: unknown): HomeContent {
  const data = obj(raw);
  const hero = obj(data?.hero);
  const offer = obj(data?.offer);
  const story = obj(data?.story);
  const approach = obj(data?.approach);
  const process = obj(data?.process);
  const contact = obj(data?.contact);

  const steps = objectList<StoryStep>(story?.steps)
    .slice(0, STORY_STEPS)
    .map((s) => ({ label: text(s.label), title: text(s.title), body: text(s.body) }));
  while (steps.length < STORY_STEPS) steps.push({ label: "", title: "", body: "" });

  const heroTitle = headingLines(hero?.title);

  return {
    hero: {
      eyebrow: text(hero?.eyebrow),
      title: heroTitle.length > 0 ? heroTitle : [{ text: "Stolarka aluminiowa", accent: false }],
      lead: text(hero?.lead),
    },
    offer: { eyebrow: text(offer?.eyebrow), title: headingLines(offer?.title), description: text(offer?.description) },
    story: { eyebrow: text(story?.eyebrow), steps },
    approach: {
      eyebrow: text(approach?.eyebrow),
      title: headingLines(approach?.title),
      lead: text(approach?.lead),
      principles: textItems(approach?.principles),
    },
    process: {
      eyebrow: text(process?.eyebrow),
      title: headingLines(process?.title),
      description: text(process?.description),
      stages: textItems(process?.stages),
    },
    contact: { eyebrow: text(contact?.eyebrow), title: headingLines(contact?.title), lead: text(contact?.lead) },
  };
}

export const homeContent = buildHomeContent(homeRaw);

