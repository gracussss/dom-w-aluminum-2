import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { AluSystem, SystemGeometry } from "../../catalog";
import { canRunWebGL } from "../../lib/motion";
import { PlaceholderTag } from "../ui/PlaceholderTag";
import { PRESENTATION_STEPS, stepBody } from "./presentation";

// Three.js dociągany dopiero, gdy sekcja zbliża się do ekranu.
const PresentationScene = lazy(() => import("./PresentationScene"));

/** Ile czekamy, zanim prezentacja sama pokaże drugi krok. */
const AUTOPLAY_DELAY = 1800;

interface SystemPresentationProps {
  system: AluSystem;
  /** Wymiary odczytane z parametrów systemu — bez nich nie ma prezentacji. */
  geometry: SystemGeometry & { depth: number; depthLabel: string };
  fallbackImage?: string;
}

/**
 * Prezentacja konstrukcji prowadzona krokami.
 *
 * Krokami, a nie scrollem: na karcie systemu scroll należy do czytania treści,
 * a pinowana sekcja na kilka ekranów odcinałaby użytkownika od tabeli parametrów.
 *
 * Autoplay pokazuje tylko drugi krok — tyle, żeby było widać, że to się rusza.
 * Pierwsza interakcja go kasuje i dalej prowadzi użytkownik.
 */
export function SystemPresentation({ system, geometry, fallbackImage }: SystemPresentationProps) {
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setWebgl(canRunWebGL()), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Ruch startuje dopiero, gdy prezentacja jest widoczna — nie w tle.
  useEffect(() => {
    if (!active || touched || step !== 0) return;
    const id = window.setTimeout(() => setStep(1), AUTOPLAY_DELAY);
    return () => window.clearTimeout(id);
  }, [active, touched, step]);

  const go = useCallback((next: number) => {
    setTouched(true);
    setStep(Math.max(0, Math.min(PRESENTATION_STEPS.length - 1, next)));
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      go(step + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      go(step - 1);
    }
  };

  const current = PRESENTATION_STEPS[step];
  const showScene = webgl === true && mounted;
  const source = geometry.depthSource;

  return (
    <div ref={ref} className="grid gap-8 lg:grid-cols-12 lg:gap-10" onKeyDown={onKeyDown}>
      {/* Kadr jest bezpośrednim dzieckiem siatki — opakowanie go w dodatkowy
          div odbierało płótnu wysokość (`height: 100%` bez określonej
          wysokości rodzica) i scena renderowała się w pasku 150 px.

          Wysokość jest ZAMKNIĘTA, nie minimalna: przy `min-h` siatka
          rozciągała kadr do wysokości listy kroków (blisko 900 px), model
          wychodził poza ekran i nie dało się zobaczyć całej konstrukcji. */}
      <div className="relative aspect-[4/5] w-full self-start overflow-hidden border border-limestone/12 sm:aspect-[16/11] lg:col-span-8 lg:aspect-auto lg:h-[560px] xl:h-[620px]">
          {showScene ? (
            <Suspense fallback={<Stage label="Wczytywanie modelu…" image={fallbackImage} />}>
              <PresentationScene
                depth={geometry.depth}
                depthLabel={geometry.depthLabel}
                step={step}
                active={active}
                label={`Model poglądowy konstrukcji w systemie ${system.name}, krok ${current.no}: ${current.title}`}
              />
            </Suspense>
          ) : webgl === false ? (
            <Stage label="Podgląd statyczny" image={fallbackImage} />
          ) : (
            <Stage label="Model 3D" image={fallbackImage} />
          )}

          <PlaceholderTag label="Model poglądowy" className="absolute right-4 top-4" />

          {showScene && (
            <span className="label-sm pointer-events-none absolute bottom-4 left-4 text-limestone/55">
              Krok {current.no} / {String(PRESENTATION_STEPS.length).padStart(2, "0")}
            </span>
          )}

          {showScene && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => go(step - 1)}
                disabled={step === 0}
                aria-label="Poprzedni krok prezentacji"
                className="flex h-9 w-9 items-center justify-center border border-limestone/20 bg-void/80 text-limestone/80 backdrop-blur transition-colors hover:border-bronze-light hover:text-bronze-light disabled:cursor-not-allowed disabled:border-limestone/10 disabled:text-limestone/25"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => go(step + 1)}
                disabled={step === PRESENTATION_STEPS.length - 1}
                aria-label="Następny krok prezentacji"
                className="flex h-9 w-9 items-center justify-center border border-limestone/20 bg-void/80 text-limestone/80 backdrop-blur transition-colors hover:border-bronze-light hover:text-bronze-light disabled:cursor-not-allowed disabled:border-limestone/10 disabled:text-limestone/25"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
      </div>

      <div className="lg:col-span-4">
        <p className="label text-bronze-light">
          {current.no} — {current.label}
        </p>
        <h3 className="display display-tight mt-4 text-2xl sm:text-3xl">{current.title}</h3>
        <p aria-live="polite" className="mt-4 text-sm leading-relaxed text-limestone/60">
          {stepBody(current, geometry.depthLabel)}
        </p>

        <ol className="mt-7 divide-y divide-limestone/10 border-y border-limestone/10">
          {PRESENTATION_STEPS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === step ? "step" : undefined}
                className={`flex w-full items-center gap-4 py-3.5 text-left transition-colors ${
                  i === step ? "text-limestone" : "text-limestone/50 hover:text-limestone/80"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center border font-mono text-[10px] transition-colors ${
                    i === step ? "border-bronze-light bg-bronze-light text-void" : "border-limestone/25"
                  }`}
                >
                  {s.no}
                </span>
                <span className="text-[14px] leading-snug">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>

        {/* Rozdzielenie warstw wiarygodności — to jest sedno tego modelu.
            Bez tego panelu schemat udawałby dokumentację techniczną. */}
        <div className="mt-8 border border-limestone/12 p-5">
          <p className="label-sm text-bronze-light">Z danych producenta</p>
          <p className="mt-2.5 text-sm text-limestone/80">
            {geometry.depthLabel} — głębokość zabudowy, odwzorowana w modelu w skali 1:1.
          </p>
          {source && (
            <p className="mt-1.5 text-xs text-limestone/50">
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-2 transition-colors hover:text-bronze-light"
                >
                  {source.label}
                </a>
              ) : (
                source.label
              )}
              {source.accessedAt && ` · dostęp ${source.accessedAt}`}
            </p>
          )}

          <p className="label-sm mt-6 text-limestone/55">Poglądowe w tym modelu</p>
          <p className="mt-2.5 text-xs leading-relaxed text-limestone/55">
            Wymiar otworu, szerokości profili w widoku, podział głębokości między powłoki
            i przekładkę, okucia i uszczelnienia. Producent nie publikuje tych danych,
            więc model ich nie podpisuje i nie wymiaruje.
          </p>

          <p className="mt-5 text-xs leading-relaxed text-limestone/55">
            Model 3D producenta: brak. Po jego otrzymaniu zastąpi model poglądowy w tym
            samym miejscu.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stage({ label, image }: { label: string; image?: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-anthracite">
      {image && (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="lazy" />
      )}
      <p className="label relative z-10 text-limestone/60">{label}</p>
    </div>
  );
}
