import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Eyebrow } from "../components/ui/Eyebrow";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { canRunWebGL } from "../lib/motion";
import { loadScrollAnimation } from "../lib/scrollAnimation";
import { ScrollStory } from "./ScrollStory";

// Three.js dociągany dopiero, gdy sekcja zbliża się do ekranu.
const StoryScene = lazy(() => import("../components/product3d/StoryScene"));

/** Poniżej tej szerokości zamiast sceny 3D pokazujemy wersję zdjęciową. */
const MIN_WIDTH_3D = 768;

const steps = [
  {
    no: "01",
    label: "Konstrukcja",
    title: "Zaczynamy od całości",
    body: "Ościeżnica osadzona w murze, skrzydło i pakiet szybowy. Trzy elementy, które muszą pracować jak jeden.",
  },
  {
    no: "02",
    label: "Profil",
    title: "Rama, która ma zniknąć",
    body: "Im węższy profil w widoku, tym więcej szkła. Granicę wyznacza statyka konstrukcji i masa skrzydła.",
  },
  {
    no: "03",
    label: "Skrzydło",
    title: "Ruch musi być powtarzalny",
    body: "Ciężar pakietu szybowego przenoszą okucia i naroża ramy — przy tym samym ruchu, tysiące razy.",
  },
  {
    no: "04",
    label: "Warstwy",
    title: "Konstrukcja rozłożona",
    body: "Powłoka zewnętrzna, przekładka termiczna, powłoka wewnętrzna, skrzydło i szyba. Każda warstwa odpowiada za co innego.",
  },
  {
    no: "05",
    label: "Przekrój",
    title: "Wnętrze profilu",
    body: "Dwie powłoki aluminium rozdzielone przekładką termiczną — to ona przerywa drogę ciepła między zewnętrzem a wnętrzem.",
  },
  {
    no: "06",
    label: "Realizacja",
    title: "Wszystko wraca do całości",
    body: "Zmontowana konstrukcja trafia na budowę jako jeden, sprawdzony element koperty budynku.",
  },
];

/**
 * Sekwencja produktowa prowadzona scrollem.
 *
 * Scroll nie przewija tu treści — steruje kamerą i stanem konstrukcji:
 * pełne okno → zbliżenie na profil → ruch skrzydła → rozłożenie na warstwy →
 * przekrój → powrót do całości.
 */
function Story3D() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  /** Postęp sekwencji poza stanem Reacta — scroll nie może wywoływać renderów. */
  const progress = useRef(0);
  const invalidate = useRef<(() => void) | null>(null);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  const bind = useCallback((fn: () => void) => {
    invalidate.current = fn;
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    loadScrollAnimation().then(({ gsap }) => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        // Postęp prowadzi tween, nie surowy `self.progress` — dzięki temu
        // `scrub` wygładza ruch kamery i po zatrzymaniu scrolla scena
        // spokojnie dojeżdża zamiast stawać w miejscu.
        const proxy = { p: 0 };

        gsap.to(proxy, {
          p: 1,
          ease: "none",
          onUpdate: () => {
            progress.current = proxy.p;
            invalidate.current?.();
          },
          scrollTrigger: {
            trigger: wrap.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => {
              const idx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
              // Stan tylko przy zmianie kroku — inaczej render przy każdej klatce scrolla.
              setStep((prev) => (prev === idx ? prev : idx));
            },
          },
        });
      }, wrap);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={wrap}
      className="relative bg-anthracite text-limestone"
      /* 0,75 ekranu na krok zamiast pełnego: sekwencja czyta się tak samo,
         a strona główna traci ~1,5 ekranu jałowego przewijania. */
      style={{ height: `${steps.length * 75}svh` }}
      aria-label="Budowa konstrukcji aluminiowej krok po kroku"
    >
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {mounted && (
            <Suspense fallback={null}>
              <StoryScene progress={progress} active={active} bind={bind} />
            </Suspense>
          )}
        </div>

        {/* Siatka rysunku technicznego pod sceną — widoczna, zanim model się pojawi */}
        <div className="blueprint-grid pointer-events-none absolute inset-0 -z-10 opacity-40" aria-hidden />

        {/* Warstwy tonalne pod typografię — mocne od lewej, gdzie stoi tekst,
            delikatne nad samą sceną, żeby aluminium nie zgasło. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/85 via-void/15 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void/90 via-void/10 to-transparent" />
        <div className="grain pointer-events-none absolute inset-0" />

        <div className="container-edge pointer-events-none relative flex h-full flex-col justify-between py-24 md:py-28">
          <div className="pt-6">
            <Eyebrow index="03" label="Jak powstaje konstrukcja" tone="light" />
          </div>

          <div className="relative h-[270px] max-w-2xl sm:h-[250px]">
            {steps.map((s, i) => (
              <div
                key={s.no}
                className="absolute inset-x-0 bottom-0 transition-all duration-500 ease-[var(--ease-premium)]"
                style={{
                  opacity: i === step ? 1 : 0,
                  transform: `translateY(${i === step ? 0 : i < step ? -22 : 22}px)`,
                }}
                aria-hidden={i !== step}
              >
                <span className="label text-bronze-light">
                  {s.no} — {s.label}
                </span>
                <h3 className="display display-tight mt-4 text-[8vw] leading-[0.95] sm:text-5xl md:text-6xl">
                  {s.title}
                </h3>
                <p className="mt-5 max-w-lg text-pretty text-sm leading-relaxed text-limestone/60 md:text-base">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* Wskaźnik postępu sekwencji */}
          <div className="flex items-center gap-2 sm:gap-3">
            {steps.map((s, i) => (
              <div key={s.no} className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`h-px transition-all duration-500 ${
                    i === step ? "w-7 bg-bronze-light sm:w-12" : "w-3.5 bg-limestone/25 sm:w-6"
                  }`}
                />
                <span
                  className={`label-sm transition-colors duration-500 ${
                    i === step ? "text-limestone" : "text-limestone/55"
                  }`}
                >
                  {s.no}
                </span>
              </div>
            ))}
          </div>
        </div>

        <PlaceholderTag label="Model poglądowy" className="absolute right-5 top-24 md:right-10" />
      </div>
    </section>
  );
}

/**
 * Wybór wariantu robiony raz, przy pierwszym renderze — przełączanie w locie
 * przestawiałoby ScrollTriggery w trakcie scrolla.
 *
 * Bez WebGL, przy prefers-reduced-motion i na wąskich ekranach zostaje wersja
 * zdjęciowa: to pełnoprawna sekcja, nie okrojona namiastka.
 */
export function ProductStory() {
  const [use3d] = useState(
    () => canRunWebGL() && typeof window !== "undefined" && window.innerWidth >= MIN_WIDTH_3D
  );

  return use3d ? <Story3D /> : <ScrollStory />;
}
