import raw from "../content/faq.json";
import { headingLines, objectList, paragraphs, text } from "../lib/content";
import type { HeadingLine } from "../lib/content";

/* Pytania i odpowiedzi z panelu (/admin → „Pytania (FAQ)”).

   Lista startuje pusta: odpowiedzi o terminach, gwarancji czy montażu to
   oświadczenia firmy, więc pisze je klient, a nie wykonawca strony. Dopóki
   lista jest pusta, sekcja się nie wyświetla. */

export interface FaqItem {
  question: string;
  /** Akapity odpowiedzi — nowy akapit po pustej linii w panelu. */
  answer: string[];
}

export interface FaqContent {
  eyebrow: string;
  title: HeadingLine[];
  items: FaqItem[];
}

export function buildFaq(input: unknown): FaqContent {
  const data = (input ?? {}) as Record<string, unknown>;
  return {
    eyebrow: text(data.eyebrow) || "Pytania",
    title: headingLines(data.title),
    items: objectList<{ question: unknown; answer: unknown }>(data.items)
      .map((item) => ({ question: text(item.question), answer: paragraphs(item.answer) }))
      .filter((item) => item.question && item.answer.length > 0),
  };
}

export const faq = buildFaq(raw);
