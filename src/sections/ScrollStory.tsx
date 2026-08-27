import { useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Eyebrow } from "../components/ui/Eyebrow";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { Reveal } from "../components/ui/Reveal";
import { prefersReducedMotion } from "../lib/motion";
import { loadScrollAnimation } from "../lib/scrollAnimation";
import { images } from "../data/images";
import { SIZES_HALF, responsiveSrcSet } from "../lib/responsiveImage";

const steps = [
  {
    no: "01",
    label: "Budynek",
    title: "Zaczyna się od bryły",
    body: "Stolarka nie jest dodatkiem. Wielkość otworów, podziały i sposób otwierania wynikają wprost z projektu architektonicznego.",
    image: images.storyBuilding,
  },
  {
    no: "02",
    label: "Otwór",
    title: "Każdy otwór ma swoje warunki",
    body: "Wymiar, obciążenie wiatrem, ekspozycja na słońce i sposób osadzenia w murze — to one decydują o doborze systemu.",
    image: images.storyOpening,
  },
  {
    no: "03",
    label: "Profil",
    title: "Rama, która ma zniknąć",
    body: "Im węższy profil w widoku, tym więcej szkła. Granicę wyznacza statyka konstrukcji i masa skrzydła.",
    image: images.storyProfile,
  },
  {
    no: "04",
    label: "Przekrój",
    title: "Wnętrze profilu",
    body: "Dwie powłoki aluminium rozdzielone przekładką termiczną, komory usztywniające i uszczelnienia przylgowe.",
    image: images.storySection,
  },
  {
    no: "05",
    label: "Konstrukcja",
    title: "Wszystko wraca do całości",
    body: "Zmontowana konstrukcja trafia na budowę jako jeden, sprawdzony element koperty budynku.",
    image: images.storyAssembly,
  },
];

export function ScrollStory() {
  const wrap = useRef<HTMLElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    loadScrollAnimation().then(({ gsap }) => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        const total = steps.length;

        // Stan początkowy: widoczna tylko pierwsza warstwa.
        layers.current.forEach((el, i) => {
          if (!el) return;
          gsap.set(el, { opacity: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 1.12 });
        });
        texts.current.forEach((el, i) => {
          if (!el) return;
          gsap.set(el, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 26 });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
            onUpdate: (self) => {
              const idx = Math.min(total - 1, Math.floor(self.progress * total));
              // Stan tylko przy zmianie kroku - inaczej render przy kazdej klatce scrolla.
              setActiveStep((prev) => (prev === idx ? prev : idx));
            },
          },
        });

        // Każde przejście: bieżąca warstwa oddala się, kolejna dojeżdża do skali 1.
        for (let i = 1; i < total; i++) {
          tl.to(layers.current[i - 1], { opacity: 0, scale: 1.06, duration: 1 }, i - 1)
            .to(layers.current[i], { opacity: 1, scale: 1, duration: 1 }, i - 1)
            .to(texts.current[i - 1], { opacity: 0, y: -22, duration: 0.55 }, i - 1)
            .to(texts.current[i], { opacity: 1, y: 0, duration: 0.55 }, i - 1 + 0.4);
        }
      }, wrap);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  // Bez animacji scrollem: zwykła lista etapów zamiast pinowanej sceny.
  if (reduced) {
    return (
      <section className="bg-anthracite py-24 text-limestone md:py-32" aria-label="Jak powstaje konstrukcja aluminiowa">
        <div className="container-edge">
          <Eyebrow index="03" label="Jak powstaje konstrukcja" tone="light" />
          <div className="mt-14 space-y-16">
            {steps.map((s) => (
              <Reveal key={s.no} className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
                <div className="relative aspect-[16/10] overflow-hidden lg:col-span-6">
                  <img
                    src={s.image}
                    srcSet={responsiveSrcSet(s.image)}
                    sizes={SIZES_HALF}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <PlaceholderTag className="absolute right-3 top-3" />
                </div>
                <div className="lg:col-span-5">
                  <span className="label text-bronze-light">
                    {s.no} — {s.label}
                  </span>
                  <h3 className="display display-tight mt-4 text-3xl sm:text-4xl">{s.title}</h3>
                  <p className="mt-4 text-pretty leading-relaxed text-limestone/60">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={wrap}
      className="relative bg-anthracite text-limestone"
      /* 0,8 ekranu na krok — patrz ten sam zabieg w wariancie 3D. */
      style={{ height: `${steps.length * 80}svh` }}
      aria-label="Jak powstaje konstrukcja aluminiowa"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Warstwy zdjęć */}
        {steps.map((s, i) => (
          <div
            key={s.no}
            ref={(el) => {
              layers.current[i] = el;
            }}
            className="absolute inset-0"
          >
            <img
              src={s.image}
              srcSet={responsiveSrcSet(s.image)}
              sizes="100vw"
              alt=""
              /* Sekcja leży głęboko pod pierwszym ekranem — żadna z warstw nie
                 może konkurować o pasmo z tłem hero, które jest tu LCP. */
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-void/80 via-transparent to-transparent" />
        <div className="grain absolute inset-0" />

        {/* Treść */}
        <div className="container-edge relative flex h-full flex-col justify-between py-24 md:py-28">
          <div className="pt-6">
            <Eyebrow index="03" label="Jak powstaje konstrukcja" tone="light" />
          </div>

          <div className="relative h-[270px] max-w-2xl sm:h-[250px]">
            {steps.map((s, i) => (
              <div
                key={s.no}
                ref={(el) => {
                  texts.current[i] = el;
                }}
                /* Wszystkie kroki są w drzewie naraz, widoczny jest jeden.
                   Bez tego czytnik ekranu odczytywał pięć nagłówków pod rząd
                   — wariant 3D robi to poprawnie od początku. */
                aria-hidden={i !== activeStep}
                className="absolute inset-x-0 bottom-0"
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

          {/* Wskaźnik postępu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {steps.map((s, i) => (
              <div key={s.no} className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`h-px transition-all duration-500 ${
                    i === activeStep ? "w-7 bg-bronze-light sm:w-12" : "w-3.5 bg-limestone/25 sm:w-6"
                  }`}
                />
                <span
                  className={`label-sm transition-colors duration-500 ${
                    i === activeStep ? "text-limestone" : "text-limestone/55"
                  }`}
                >
                  {s.no}
                </span>
              </div>
            ))}
          </div>
        </div>

        <PlaceholderTag className="absolute right-5 top-24 md:right-10" />
      </div>
    </section>
  );
}
