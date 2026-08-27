import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject } from "react";
import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import type { CrossSectionRef, ModelType } from "../../catalog";
import { MONO, SchematicDefs, SideLabels } from "./palette";
import { getSchematic } from "./schematics";
import type { SchematicDefinition } from "./types";
import { useZoomPan } from "./useZoomPan";
import { lockScroll, unlockScroll } from "../../lib/scroll";

/* ------------------------------------------------------------------
   WIDOK PRZEKROJU

   Dwa tryby:
   1. `drawings` zawiera rysunek producenta — pokazujemy go z zoomem
      i przełącznikiem między przekrojami (poziomy / pionowy / próg).
   2. brak rysunku — pokazujemy WŁASNY schemat poglądowy dobrany do typu
      konstrukcji, z interaktywną legendą.

   Legenda działa na klik (dotyk), na najechanie i z klawiatury —
   sam hover wykluczał połowę użytkowników.
   ------------------------------------------------------------------ */

const BRONZE = "#c3a175";
const VOID = "#0b0c0d";
const LIMESTONE = "#ece8e1";
const RULE = "#9ba1a6";

/** Co łapie fokus wewnątrz warstwy pełnoekranowej. */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface StageProps {
  children: ReactNode;
  /** Etykieta w lewym górnym rogu — „Schemat poglądowy” albo „Rysunek producenta”. */
  badge: string;
  /** Zmiana wartości resetuje przybliżenie. */
  resetKey: string;
  className?: string;
  onFullscreen?: () => void;
  /** Do niego wraca fokus po zamknięciu pełnego ekranu. */
  onFullscreenRef?: RefObject<HTMLButtonElement | null>;
  onExitFullscreen?: () => void;
  /** Na pełnym ekranie nie ma czego przewijać — kółko zawsze przybliża. */
  alwaysZoomOnWheel?: boolean;
}

/** Kadr z rysunkiem: przybliżanie, przesuwanie i sterowanie. */
function Stage({
  children,
  badge,
  resetKey,
  className = "",
  onFullscreen,
  onFullscreenRef,
  onExitFullscreen,
  alwaysZoomOnWheel,
}: StageProps) {
  const frame = useRef<HTMLDivElement>(null);
  const zoom = useZoomPan(frame, resetKey, { alwaysZoomOnWheel });

  const button =
    "flex h-9 w-9 items-center justify-center border border-limestone/20 bg-void/80 text-limestone/80 backdrop-blur transition-colors hover:border-bronze-light hover:text-bronze-light disabled:cursor-not-allowed disabled:border-limestone/10 disabled:text-limestone/25 disabled:hover:border-limestone/10 disabled:hover:text-limestone/25";

  return (
    <div className={`relative overflow-hidden border border-limestone/12 bg-anthracite ${className}`}>
      <div className="blueprint-grid absolute inset-0 opacity-50" aria-hidden />

      {/* data-lenis-prevent tylko wtedy, gdy kółko faktycznie przybliża —
          inaczej płynny scroll strony zatrzymywałby się nad rysunkiem */}
      <div
        ref={frame}
        data-lenis-prevent={zoom.wheelZooms ? "" : undefined}
        className={`relative h-full w-full touch-none select-none overflow-hidden ${
          zoom.isPanning ? "cursor-grabbing" : zoom.canZoomOut ? "cursor-grab" : "cursor-zoom-in"
        }`}
        {...zoom.handlers}
      >
        <div className="h-full w-full" style={zoom.style}>
          {children}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
        <button onClick={zoom.zoomOut} disabled={!zoom.canZoomOut} aria-label="Pomniejsz" className={button}>
          <Minus className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button onClick={zoom.zoomIn} disabled={!zoom.canZoomIn} aria-label="Powiększ" className={button}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button onClick={zoom.reset} disabled={!zoom.canZoomOut} aria-label="Resetuj widok" className={button}>
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
        {onFullscreen && (
          <button
            ref={onFullscreenRef}
            onClick={onFullscreen}
            aria-label="Otwórz na pełnym ekranie"
            className={button}
          >
            <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
        {onExitFullscreen && (
          <button onClick={onExitFullscreen} aria-label="Zamknij pełny ekran" className={button}>
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <span className="label-sm absolute bottom-4 left-4 text-limestone/55">
        {badge} · {Math.round(zoom.scale * 100)}%
      </span>
    </div>
  );
}

/**
 * Rysunek powstaje przy pierwszym wejściu w kadr — jednorazowo, bez wiązania
 * ze scrollem. Wraca `true` i zostaje przy tej wartości.
 */
function useDrawIn(ref: RefObject<SVGSVGElement | null>) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setDrawn(true);
        io.disconnect();
      },
      { rootMargin: "-8% 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return drawn;
}

interface SchematicDrawingProps {
  schematic: SchematicDefinition;
  active: string | null;
  pinned: string | null;
  onHover: (id: string | null) => void;
  onToggle: (id: string) => void;
  idPrefix: string;
}

/** Rysunek schematu wraz z numerami odniesienia. */
function SchematicDrawing({
  schematic,
  active,
  pinned,
  onHover,
  onToggle,
  idPrefix,
}: SchematicDrawingProps) {
  const dim = (id: string) => (active && active !== id ? 0.18 : 1);

  const svgRef = useRef<SVGSVGElement>(null);
  const drawn = useDrawIn(svgRef);

  // Rysunek odsłania się od strony zewnętrznej ku wewnętrznej — w tym samym
  // kierunku, w którym czyta się przekrój.
  const [, , vbW, vbH] = schematic.viewBox.split(/\s+/).map(Number);

  const onMarkerKeyDown = (event: ReactKeyboardEvent<SVGGElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle(id);
    }
  };

  return (
    <svg
      ref={svgRef}
      viewBox={schematic.viewBox}
      className="h-full w-full"
      role="img"
      aria-label={`Schemat poglądowy: ${schematic.label}`}
    >
      <SchematicDefs />

      <g
        style={{
          clipPath: drawn ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
          transition: "clip-path 1.15s var(--ease-frame)",
        }}
      >
        <schematic.Drawing dim={dim} />
      </g>

      {/* Linia prowadząca odsłonięcie — ołówek po kalce technicznej */}
      <g
        style={{
          transform: `translateX(${drawn ? vbW : 0}px)`,
          opacity: drawn ? 0 : 0.85,
          transition: "transform 1.15s var(--ease-frame), opacity .3s 1.05s",
        }}
      >
        <line x1="0" y1="0" x2="0" y2={vbH} stroke={BRONZE} strokeWidth="2" />
      </g>

      {/* Numery wchodzą dopiero za linią — najpierw rysunek, potem opis */}
      <g
        style={{
          opacity: drawn ? 1 : 0,
          pointerEvents: drawn ? "auto" : "none",
          transition: "opacity .5s .9s",
        }}
      >
        {schematic.markers.map((marker) => {
          const on = active === marker.id;
          return (
            <g
              key={marker.id}
              role="button"
              tabIndex={0}
              aria-pressed={pinned === marker.id}
              aria-label={schematic.parts.find((p) => p.id === marker.id)?.label ?? marker.id}
              aria-describedby={`${idPrefix}-part-${marker.id}`}
              opacity={dim(marker.id)}
              style={{ transition: "opacity .35s", cursor: "pointer" }}
              onMouseEnter={() => onHover(marker.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(marker.id)}
              onBlur={() => onHover(null)}
              onClick={() => onToggle(marker.id)}
              onKeyDown={(event) => onMarkerKeyDown(event, marker.id)}
            >
              {/* Linia odniesienia — numer stoi z boku, wskazuje na element */}
              {marker.to && (
                <line
                  x1={marker.x}
                  y1={marker.y}
                  x2={marker.to.x}
                  y2={marker.to.y}
                  stroke={on ? BRONZE : RULE}
                  strokeWidth="1.2"
                  opacity={on ? 0.9 : 0.45}
                />
              )}
              {/* Pierścień przypięcia — widać, że element został wybrany na stałe */}
              {pinned === marker.id && (
                <circle cx={marker.x} cy={marker.y} r="23" fill="none" stroke={BRONZE} strokeWidth="1.5" opacity="0.5" />
              )}
              <circle
                cx={marker.x}
                cy={marker.y}
                r="17"
                fill={on ? BRONZE : VOID}
                stroke={on ? BRONZE : RULE}
                strokeWidth="1.5"
              />
              <text
                x={marker.x}
                y={marker.y + 5}
                textAnchor="middle"
                fontFamily={MONO}
                fontSize="15"
                fill={on ? VOID : LIMESTONE}
              >
                {marker.no}
              </text>
            </g>
          );
        })}
      </g>

      <SideLabels outside={schematic.outsideLabel} inside={schematic.insideLabel} />
    </svg>
  );
}

interface LegendProps {
  schematic: SchematicDefinition;
  active: string | null;
  pinned: string | null;
  onHover: (id: string | null) => void;
  onToggle: (id: string) => void;
  idPrefix: string;
}

function Legend({ schematic, active, pinned, onHover, onToggle, idPrefix }: LegendProps) {
  return (
    <>
      <p className="label text-bronze-light">Legenda</p>
      <ul className="mt-5 divide-y divide-limestone/10 border-y border-limestone/10">
        {schematic.parts.map((part) => (
          <li key={part.id}>
            <button
              type="button"
              aria-pressed={pinned === part.id}
              onClick={() => onToggle(part.id)}
              onMouseEnter={() => onHover(part.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(part.id)}
              onBlur={() => onHover(null)}
              className={`flex w-full items-start gap-4 py-4 text-left transition-colors ${
                active === part.id ? "text-limestone" : "text-limestone/60"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border font-mono text-[11px] transition-colors ${
                  active === part.id
                    ? "border-bronze-light bg-bronze-light text-void"
                    : "border-limestone/25 text-limestone/60"
                }`}
              >
                {part.no}
              </span>
              <span id={`${idPrefix}-part-${part.id}`}>
                <span className="block text-sm font-medium leading-snug">{part.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-limestone/55">{part.desc}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export interface CrossSectionProps {
  className?: string;
  /** Rysunki producenta. Pusta lista = schemat poglądowy. */
  drawings?: CrossSectionRef[];
  /** Typ konstrukcji — decyduje, który schemat poglądowy pokazujemy. */
  type?: ModelType;
  /** Czego dotyczy rysunek, np. „ALUPROF · MB-86N”. */
  subject?: string;
}

export function CrossSection({ className = "", drawings = [], type = "okno", subject }: CrossSectionProps) {
  const idPrefix = useId();
  const schematic = getSchematic(type);

  /* Tylko rysunki, które faktycznie mają plik. */
  const available = drawings.filter((d) => d.imageSrc);
  const isReal = available.length > 0;

  const [viewIndex, setViewIndex] = useState(0);
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  /** Przycisk, który otworzył pełny ekran — tam wraca fokus po zamknięciu. */
  const openerRef = useRef<HTMLButtonElement>(null);

  /* Najechanie tylko podgląda; kliknięcie przypina, więc na dotyku też działa. */
  const active = hovered ?? pinned;
  const toggle = useCallback((id: string) => setPinned((current) => (current === id ? null : id)), []);

  const current = available[Math.min(viewIndex, available.length - 1)];
  const resetKey = isReal ? (current?.id ?? "") : (schematic?.id ?? "");

  /**
   * Pełny ekran to modal: Escape zamyka, a Tab krąży wewnątrz warstwy.
   * Bez tego fokus schodził na stronę pod spodem, której nie widać.
   */
  useEffect(() => {
    if (!fullscreen) return;

    /* Przycisk zapamiętany na wejściu, nie odczytywany przy sprzątaniu —
       do czasu zamknięcia ref mógłby już wskazywać co innego. */
    const opener = openerRef.current;

    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const panel = fullscreenRef.current;
      if (!panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockScroll();
      // Fokus wraca tam, skąd wyszedł — inaczej ląduje na początku strony.
      opener?.focus();
    };
  }, [fullscreen]);

  /* Ani rysunku, ani sensownego schematu (np. akcesoria) — nie zmyślamy przekroju. */
  if (!isReal && !schematic) return null;

  const badge = isReal ? "Przekrój systemu" : "Schemat poglądowy";

  const drawingContent = isReal ? (
    <img
      src={current!.imageSrc as string}
      alt={`${subject ?? ""} — ${current!.label}`}
      className="h-full w-full object-contain"
      draggable={false}
      loading="lazy"
    />
  ) : (
    <SchematicDrawing
      schematic={schematic!}
      active={active}
      pinned={pinned}
      onHover={setHovered}
      onToggle={toggle}
      idPrefix={idPrefix}
    />
  );

  const hint =
    "Podwójne kliknięcie lub przycisk przybliża rysunek. Po przybliżeniu kółko myszy zmienia powiększenie, a przeciągnięcie przesuwa. Na dotyku działa szczypanie.";

  return (
    <>
      <div className={`grid gap-8 lg:grid-cols-12 lg:gap-10 ${className}`}>
        <div className="lg:col-span-8">
          {/* Przełącznik przekrojów — pojawia się dopiero przy kilku rysunkach */}
          {available.length > 1 && (
            /* Świadomie `group` + `aria-pressed`, nie `tablist`: nie ma tu
               osobnych paneli ani nawigacji strzałkami, więc pełny wzorzec
               kart byłby obietnicą, której komponent nie dotrzymuje. */
            <div role="group" aria-label="Rodzaj przekroju" className="mb-3 flex flex-wrap gap-2">
              {available.map((drawing, index) => (
                <button
                  key={drawing.id}
                  type="button"
                  aria-pressed={index === viewIndex}
                  onClick={() => setViewIndex(index)}
                  className={`border px-4 py-2 label transition-colors duration-300 ${
                    index === viewIndex
                      ? "border-limestone bg-limestone text-void"
                      : "border-limestone/20 text-limestone/60 hover:border-limestone/50 hover:text-limestone"
                  }`}
                >
                  {drawing.label}
                </button>
              ))}
            </div>
          )}

          <Stage
            badge={badge}
            resetKey={resetKey}
            className="aspect-[10/6.2] w-full"
            onFullscreen={() => setFullscreen(true)}
            onFullscreenRef={openerRef}
          >
            {drawingContent}
          </Stage>
        </div>

        {/* Legenda / opis */}
        <div className="lg:col-span-4">
          {isReal ? (
            <>
              <p className="label text-bronze-light">Rysunek producenta</p>
              <p className="mt-5 text-sm leading-relaxed text-limestone/60">
                {subject ? `${subject} — ${current!.label}` : current!.label}
              </p>
              {current!.source && (
                <p className="mt-3 text-xs leading-relaxed text-limestone/55">
                  Źródło: {current!.source.label}
                  {current!.source.accessedAt ? `, ${current!.source.accessedAt}` : ""}
                </p>
              )}
              <p className="mt-4 text-xs leading-relaxed text-limestone/55">{hint}</p>
            </>
          ) : (
            <>
              <Legend
                schematic={schematic!}
                active={active}
                pinned={pinned}
                onHover={setHovered}
                onToggle={toggle}
                idPrefix={idPrefix}
              />
              <p className="mt-5 text-xs leading-relaxed text-limestone/55">{schematic!.description}</p>
              <p className="mt-3 text-xs leading-relaxed text-limestone/55">
                <span className="text-limestone/70">Rysunek własny, bez skali i bez wymiarów.</span>{" "}
                Pokazuje zasadę budowy, nie geometrię konkretnego systemu. Realny przekrój podmienimy
                po otrzymaniu dokumentacji producenta.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-limestone/55">{hint}</p>
            </>
          )}
        </div>
      </div>

      {/* Pełny ekran — przez portal, bo sekcje są animowane transformacjami
          i `position: fixed` wewnątrz nich zostałoby przycięte. */}
      {fullscreen &&
        createPortal(
          <div
            ref={fullscreenRef}
            role="dialog"
            aria-modal="true"
            aria-label={isReal ? `${subject ?? "Przekrój"} — ${current!.label}` : schematic!.label}
            data-lenis-prevent
            className="fixed inset-0 z-[100] flex flex-col bg-void/97 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-6 border-b border-limestone/12 px-5 py-4 md:px-8">
              <div>
                <p className="label text-bronze-light">{badge}</p>
                <p className="mt-1.5 text-sm text-limestone/70">
                  {isReal ? `${subject ?? ""} — ${current!.label}` : schematic!.label}
                </p>
              </div>
              <button
                autoFocus
                onClick={() => setFullscreen(false)}
                aria-label="Zamknij pełny ekran"
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-limestone/20 text-limestone/80 transition-colors hover:border-bronze-light hover:text-bronze-light"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Legenda obok rysunku dopiero od szerokich ekranów — wcześniej
                zabierałaby rysunkowi szerokość, a to on jest tu treścią */}
            <div className="flex min-h-0 flex-1 flex-col gap-4 p-5 lg:flex-row lg:gap-6 lg:p-8">
              <Stage
                badge={badge}
                resetKey={`${resetKey}-fs`}
                /* W układzie pionowym rysunek dostaje stałą część ekranu,
                   a legenda przewija się w reszcie — inaczej długa legenda
                   spłaszczałaby rysunek do paska. */
                className="min-h-[46vh] shrink-0 lg:min-h-0 lg:flex-1"
                alwaysZoomOnWheel
                onExitFullscreen={() => setFullscreen(false)}
              >
                {drawingContent}
              </Stage>

              {!isReal && (
                <div className="min-h-0 w-full flex-1 overflow-y-auto lg:w-[360px] lg:flex-none">
                  <Legend
                    schematic={schematic!}
                    active={active}
                    pinned={pinned}
                    onHover={setHovered}
                    onToggle={toggle}
                    idPrefix={`${idPrefix}-fs`}
                  />
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
