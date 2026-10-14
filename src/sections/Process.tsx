import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { SectionHeading } from "../components/ui/SectionHeading";
import { prefersReducedMotion } from "../lib/motion";
import { loadScrollAnimation } from "../lib/scrollAnimation";

const stages = [
  {
    no: "01",
    title: "Rozmowa i zakres",
    body: "Ustalamy, czego dotyczy inwestycja: pojedyncze okno, komplet stolarki czy fasada. Zbieramy rysunki i wymagania.",
  },
  {
    no: "02",
    title: "Pomiar na budowie",
    body: "Otwory mierzymy na miejscu. To moment, w którym wychodzą różnice między projektem a stanem faktycznym.",
  },
  {
    no: "03",
    title: "Dobór systemu",
    body: "Do warunków otworu dobieramy system profili, rodzaj szklenia i sposób otwierania konstrukcji.",
  },
  {
    no: "04",
    title: "Rysunki warsztatowe",
    body: "Każda pozycja trafia na rysunek – z podziałami, kierunkami otwierania i sposobem osadzenia.",
  },
  {
    no: "05",
    title: "Produkcja",
    body: "Cięcie, obróbka i montaż konstrukcji. Przed wysyłką każda pozycja przechodzi kontrolę.",
  },
  {
    no: "06",
    title: "Montaż i odbiór",
    body: "Osadzenie, uszczelnienie i regulacja okuć. Odbiór potwierdza poprawność działania konstrukcji.",
  },
];

export function Process() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  /* GSAP dociągany na żądanie — sekcja leży kilka ekranów pod pierwszym
     kadrem, więc nie ma powodu, żeby jechał w pliku startowym. */
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    loadScrollAnimation().then(({ gsap }) => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        // Poziomy scroll tylko na dużych ekranach — na mobile zostaje pionowa lista.
        mm.add("(min-width: 1024px)", () => {
          const el = track.current;
          if (!el) return;

          const distance = () => Math.max(0, el.scrollWidth - window.innerWidth + 96);

          gsap.to(el, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: () => `+=${distance()}`,
              scrub: 0.8,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        });
      }, section);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={section}
      className={`relative overflow-hidden bg-limestone py-20 text-void md:py-28 ${reduced ? "" : "lg:py-0"}`}
    >
      <div className={reduced ? "" : "lg:flex lg:h-[100svh] lg:flex-col lg:justify-center"}>
        <div className="container-edge">
          {/* Tytuł i akapit w jednym wierszu — przy wariancie „stacked”
              akapit spadał pod tytuł do prawej kolumny i wisiał w pustym polu. */}
          <SectionHeading
            index="04"
            eyebrow="Proces"
            tone="dark"
            variant="split"
            lines={["Od rozmowy", "do odbioru"]}
            description="Sześć etapów, przez które przechodzi każda konstrukcja."
          />
        </div>

        {/* Tor — poziomo na desktopie, pionowo na mobile.
            Na wąskich ekranach to nie jest pomniejszony desktop: sześć
            jednakowych bloków zamienia się w oś czasu z ciągłą szyną,
            po której widać, że etapy następują po sobie.
            Przy ograniczonych animacjach zawsze pionowo, żeby wszystkie
            etapy pozostały osiągalne bez przewijania sterowanego skryptem. */}
        <div className={`mt-12 ${reduced ? "" : "lg:mt-14 lg:overflow-hidden"}`}>
          <div
            ref={track}
            className={`container-edge flex flex-col ${
              reduced ? "" : "lg:w-max lg:flex-row lg:pr-24"
            }`}
          >
            {stages.map((s, i) => (
              <div
                key={s.no}
                className={`flex gap-5 bg-limestone ${
                  reduced
                    ? ""
                    : "lg:block lg:w-[380px] lg:shrink-0 lg:border-r lg:border-void/12 lg:p-10 xl:w-[420px]"
                }`}
              >
                {/* Gutter mobilny — numer i szyna łącząca kolejne etapy */}
                <div className="flex w-9 shrink-0 flex-col items-center lg:hidden">
                  <span className="display text-2xl leading-none text-bronze">{s.no}</span>
                  {i < stages.length - 1 && <span className="mt-3 w-px flex-1 bg-void/15" />}
                </div>

                <div className="pb-10 lg:pb-0">
                  <span className="display hidden text-3xl leading-none text-bronze lg:block">{s.no}</span>
                  <h3 className="text-2xl font-semibold leading-tight tracking-[-0.03em] lg:mt-5">
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-void/70">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
