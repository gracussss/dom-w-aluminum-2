import { Suspense, lazy, useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { EASE_OUT } from "../../lib/motion";
import type { SceneMode } from "./models";
import type { ModelType } from "../../catalog";
import { MODEL_TYPE_LABEL } from "../../catalog";
import { canRunWebGL } from "../../lib/motion";
import { SIZES_HALF, responsiveSrcSet } from "../../lib/responsiveImage";

// Three.js ładowany dopiero, gdy sekcja wchodzi w widok.
const SystemScene = lazy(() => import("./SystemScene"));

const OPEN_LABEL: Record<string, { label: string; hint: string }> = {
  okno: { label: "Otwarcie skrzydła", hint: "Skrzydło rozwierne" },
  drzwi: { label: "Otwarcie skrzydła", hint: "Skrzydło drzwiowe" },
  przesuwne: { label: "Przesunięcie skrzydła", hint: "Skrzydło na szynie" },
};

function buildModes(type: ModelType): { id: SceneMode; label: string; hint: string }[] {
  const modes: { id: SceneMode; label: string; hint: string }[] = [
    { id: "full", label: "Konstrukcja", hint: "Widok zamknięty" },
  ];
  const open = OPEN_LABEL[type ?? "okno"];
  // Fasada nie ma części otwieranej — pomijamy ten tryb.
  if (open) modes.push({ id: "open", ...open });
  modes.push({ id: "exploded", label: "Widok rozstrzelony", hint: "Warstwy konstrukcji" });
  return modes;
}

function Placeholder({ label, image }: { label: string; image?: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-anthracite">
      {image && (
        <img
          src={image}
          srcSet={responsiveSrcSet(image)}
          sizes={SIZES_HALF}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="lazy"
        />
      )}
      <p className="label relative z-10 text-limestone/60">{label}</p>
    </div>
  );
}

/**
 * Kolorystyka kolumny opisowej. Kadr ze sceną zawsze zostaje ciemny — to
 * własne tło płótna — ale lista trybów i opisy leżą wprost na tle sekcji,
 * więc muszą iść za nim. Konwencja jak w SectionHeading: `light` = jasny
 * tekst na ciemnej sekcji, `dark` = ciemny tekst na jasnej.
 */
type Tone = "light" | "dark";

const TONE = {
  light: {
    accent: "text-bronze-light",
    body: "text-limestone/55",
    strong: "text-limestone",
    idle: "text-limestone/55 hover:text-limestone/80",
    rule: "divide-limestone/10 border-limestone/10",
    badge: "border-limestone/25",
    marker: "bg-bronze-light",
  },
  dark: {
    accent: "text-bronze",
    body: "text-void/70",
    strong: "text-void",
    idle: "text-void/70 hover:text-void",
    rule: "divide-void/12 border-void/12",
    badge: "border-void/25",
    marker: "bg-bronze",
  },
} as const satisfies Record<Tone, Record<string, string>>;

interface SystemViewerProps {
  modelType: ModelType;
  modelUrl?: string | null;
  /** Zdjęcie zapasowe dla urządzeń bez WebGL. */
  fallbackImage?: string;
  /** Krótszy opis pod listą trybów. */
  description?: string;
  /** Jasność tła sekcji, w której stoi podgląd. Domyślnie sekcja ciemna. */
  tone?: Tone;
}

export function SystemViewer({
  modelType,
  modelUrl,
  fallbackImage,
  description,
  tone = "light",
}: SystemViewerProps) {
  const c = TONE[tone];
  const viewerId = useId();
  const modes = useMemo(() => buildModes(modelType), [modelType]);
  const [mode, setMode] = useState<SceneMode>("full");
  /** Scena raz zamontowana zostaje — ponowne tworzenie kontekstu WebGL jest drogie. */
  const [mounted, setMounted] = useState(false);
  /** Czy scena ma w ogóle liczyć klatki — poza ekranem nie ma czego renderować. */
  const [active, setActive] = useState(false);
  /* Test WebGL raz, przy pierwszym renderze — tworzy kontekst próbny,
     więc nie ma po co powtarzać go przy każdej zmianie stanu. */
  const [webgl] = useState<boolean | null>(() =>
    typeof window === "undefined" ? null : canRunWebGL()
  );
  const ref = useRef<HTMLDivElement>(null);

  // Zmiana systemu może zmienić dostępne tryby — wracamy do bezpiecznego.
  const [lastModelType, setLastModelType] = useState(modelType);
  if (modelType !== lastModelType) {
    setLastModelType(modelType);
    setMode("full");
  }

  // Obserwator zostaje podłączony na stałe: pierwsze wejście montuje scenę,
  // każde kolejne przecięcie włącza i wyłącza renderowanie klatek.
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

  const showScene = webgl === true && mounted;
  const isRealModel = Boolean(modelUrl);

  return (
    <div ref={ref} className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-limestone/12 sm:aspect-[16/11] lg:col-span-8 lg:aspect-auto lg:min-h-[560px]">
        {showScene ? (
          <Suspense fallback={<Placeholder label="Wczytywanie modelu…" image={fallbackImage} />}>
            <SystemScene
              mode={mode}
              modelType={modelType}
              modelUrl={modelUrl}
              active={active}
              label={`Model 3D: ${modelType ? MODEL_TYPE_LABEL[modelType] : "konstrukcja aluminiowa"}. Przeciągnij w bok, aby obrócić.`}
            />
          </Suspense>
        ) : webgl === false ? (
          <Placeholder label="Podgląd statyczny" image={fallbackImage} />
        ) : (
          <Placeholder label="Model 3D" image={fallbackImage} />
        )}

        {showScene && (
          <span className="label-sm pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 text-limestone/55">
            <RotateCw className="h-3 w-3" strokeWidth={1.5} />
            Przeciągnij w bok, aby obrócić
          </span>
        )}

        <span className="label-sm pointer-events-none absolute right-4 top-4 text-limestone/55">
          {isRealModel ? "Model producenta" : "Model poglądowy"}
        </span>
      </div>

      <div className="lg:col-span-4">
        <p className={`label ${c.accent}`}>
          {modelType ? MODEL_TYPE_LABEL[modelType] : "Model"}
        </p>

        {isRealModel ? (
          <p className={`mt-6 text-sm leading-relaxed ${c.body}`}>
            Model dostarczony przez producenta. Obróć i przybliż, aby obejrzeć
            konstrukcję.
          </p>
        ) : (
          <div className={`mt-5 divide-y border-y ${c.rule}`}>
            {modes.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`group relative flex w-full items-center gap-4 py-5 text-left transition-colors ${
                  mode === m.id ? c.strong : c.idle
                }`}
              >
                {/* Znacznik aktywnego trybu przejeżdża między pozycjami,
                    zamiast gasnąć i zapalać się w nowym miejscu. */}
                {mode === m.id && (
                  <motion.span
                    layoutId={`${viewerId}-mode`}
                    transition={{ duration: 0.42, ease: EASE_OUT }}
                    className={`absolute inset-y-1 -left-4 w-px ${c.marker}`}
                  />
                )}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[11px] transition-colors ${
                    mode === m.id ? "border-bronze-light bg-bronze-light text-void" : c.badge
                  }`}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[15px] font-medium leading-snug">{m.label}</span>
                  <span className={`mt-0.5 block text-xs ${c.body}`}>{m.hint}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {description && <p className={`mt-6 text-sm leading-relaxed ${c.body}`}>{description}</p>}

        {!isRealModel && (
          <p className={`mt-4 text-xs leading-relaxed ${c.body}`}>
            Model parametryczny, poglądowy – odwzorowuje typ konstrukcji,
            nie rzeczywistą geometrię profili. Po otrzymaniu plików od
            producenta zostanie zastąpiony modelem systemu.
          </p>
        )}
      </div>
    </div>
  );
}
