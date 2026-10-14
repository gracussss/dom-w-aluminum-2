import { Plus } from "lucide-react";
import { faq as defaultFaq } from "../../data/faq";
import type { FaqContent } from "../../data/faq";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { headingNodes } from "./headingNodes";

/**
 * Pytania i odpowiedzi jako <details>/<summary>: rozwijanie działa bez
 * JavaScriptu, z klawiatury i w czytnikach ekranu, a treść odpowiedzi
 * jest w HTML-u od początku — wyszukiwarka ją widzi także zwiniętą.
 */
export function FaqSection({ content = defaultFaq }: { content?: FaqContent }) {
  if (content.items.length === 0) return null;

  return (
    <section className="bg-limestone py-20 text-void md:py-28">
      <div className="container-edge">
        <SectionHeading
          eyebrow={content.eyebrow}
          tone="dark"
          variant="split"
          lines={headingNodes(content.title, "text-sand-deep")}
        />

        <Reveal delay={0.1} className="mt-12 border-t border-void/12">
          {content.items.map((item, i) => (
            <details key={i} className="group border-b border-void/12">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg font-semibold tracking-[-0.02em] transition-colors hover:text-bronze md:text-xl [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus
                  className="h-5 w-5 shrink-0 text-bronze transition-transform duration-300 group-open:rotate-45"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </summary>
              <div className="max-w-3xl space-y-3 pb-7 text-[15px] leading-relaxed text-void/70 md:text-base">
                {item.answer.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
