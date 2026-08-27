import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";

/* ------------------------------------------------------------------
   ZOOM I PRZESUWANIE RYSUNKU

   Wymagania, które odróżniają to od „przycisku plus”:
   - przybliżanie kółkiem myszy DO PUNKTU pod kursorem, a nie od środka,
     inaczej po powiększeniu trzeba szukać detalu przesuwaniem,
   - szczypanie dwoma palcami na dotyku,
   - ograniczenie przesuwu, żeby rysunek nie wyjechał poza kadr,
   - podwójne kliknięcie jako szybkie przybliżenie w miejscu.
   ------------------------------------------------------------------ */

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const STEP = 1.4;

/** Próg w pikselach, poniżej którego gest to jeszcze kliknięcie, nie przesuwanie. */
const DRAG_THRESHOLD = 5;

interface Point {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Trzyma rysunek w kadrze: przy powiększeniu ogranicza przesuw do krawędzi,
 * przy skali 1 ustawia go równo, więc nie da się „zgubić” rysunku.
 */
function clampOffset(offset: Point, scale: number, box: DOMRect | null): Point {
  if (!box) return offset;
  const scaledWidth = box.width * scale;
  const scaledHeight = box.height * scale;
  return {
    x: scaledWidth > box.width ? clamp(offset.x, box.width - scaledWidth, 0) : (box.width - scaledWidth) / 2,
    y:
      scaledHeight > box.height
        ? clamp(offset.y, box.height - scaledHeight, 0)
        : (box.height - scaledHeight) / 2,
  };
}

export interface ZoomPan {
  scale: number;
  /** true = kółko myszy należy teraz do rysunku, nie do strony. */
  wheelZooms: boolean;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isPanning: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  style: CSSProperties;
  handlers: {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
    onDoubleClick: (e: ReactMouseEvent<HTMLElement>) => void;
  };
}

export interface ZoomPanOptions {
  /**
   * Czy kółko myszy ma przybliżać zawsze. Domyślnie NIE: przy skali 1:1
   * kółko przewija stronę, bo inaczej duży rysunek na środku sekcji
   * łapałby scroll i użytkownik nie mógłby przejść dalej. Przybliżenie
   * włącza się przyciskiem, podwójnym kliknięciem albo szczypaniem —
   * i dopiero wtedy kółko należy do rysunku.
   */
  alwaysZoomOnWheel?: boolean;
}

export function useZoomPan(
  ref: RefObject<HTMLElement | null>,
  resetKey?: string,
  options: ZoomPanOptions = {}
): ZoomPan {
  const alwaysZoomOnWheel = options.alwaysZoomOnWheel ?? false;
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setPanning] = useState(false);

  /* Aktywne wskaźniki — jeden to przesuwanie, dwa to szczypanie. */
  const pointers = useRef(new Map<number, Point>());
  const dragStart = useRef<{ x: number; y: number; offset: Point } | null>(null);
  const dragging = useRef(false);
  const pinchDistance = useRef<number | null>(null);

  const box = () => ref.current?.getBoundingClientRect() ?? null;

  /** Skalowanie zakotwiczone w punkcie (współrzędne względem kadru). */
  const zoomAt = useCallback(
    (factor: number, anchor?: Point) => {
      const rect = box();
      setScale((current) => {
        const next = clamp(current * factor, MIN_SCALE, MAX_SCALE);
        if (next === current) return current;

        setOffset((currentOffset) => {
          const point = anchor ?? { x: (rect?.width ?? 0) / 2, y: (rect?.height ?? 0) / 2 };
          const ratio = next / current;
          return clampOffset(
            {
              x: point.x - (point.x - currentOffset.x) * ratio,
              y: point.y - (point.y - currentOffset.y) * ratio,
            },
            next,
            rect
          );
        });

        return next;
      });
    },
    [ref] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const zoomIn = useCallback(() => zoomAt(STEP), [zoomAt]);
  const zoomOut = useCallback(() => zoomAt(1 / STEP), [zoomAt]);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  /* Zmiana rysunku zaczyna oglądanie od nowa. Korekta w trakcie renderu,
     a nie w efekcie — nowy rysunek od razu rysuje się w skali 1:1,
     bez klatki z przybliżeniem poprzedniego. */
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  /**
   * Kółko myszy. Listener dodany ręcznie, bo React rejestruje `wheel`
   * jako pasywny — bez `preventDefault` strona przewijałaby się pod spodem.
   */
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onWheel = (event: WheelEvent) => {
      /* Przy 1:1 oddajemy kółko stronie — rysunek nie może blokować scrolla. */
      const zooms = alwaysZoomOnWheel || scale > 1 || event.ctrlKey || event.metaKey;
      if (!zooms) return;

      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      // Znormalizowany krok — gładziki dają dużo małych zdarzeń, mysz kilka dużych.
      const factor = Math.exp(-event.deltaY * 0.0016);
      zoomAt(factor, anchor);
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  /* `scale` w zależnościach: listener podpina się na nowo po zmianie
     powiększenia, bo od niej zależy, czy kółko należy do rysunku. */
  }, [ref, zoomAt, alwaysZoomOnWheel, scale]);

  /* Punkt względem kadru — działa dla zdarzeń myszy i wskaźnika. */
  const localPoint = (e: { clientX: number; clientY: number }): Point => {
    const rect = box();
    return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
  };

  /**
   * Wciśnięcie jeszcze niczego nie przesuwa i NIE przechwytuje wskaźnika —
   * przechwycenie na `pointerdown` zabierało kliknięcia numerom na rysunku,
   * więc legendy nie dało się obsłużyć dotykiem. Przesuwanie startuje
   * dopiero po realnym ruchu (patrz próg w `onPointerMove`).
   */
  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 1) {
        dragStart.current = { x: e.clientX, y: e.clientY, offset };
        dragging.current = false;
      } else {
        /* Drugi palec przerywa przesuwanie i zaczyna szczypanie. */
        dragStart.current = null;
        dragging.current = false;
        setPanning(false);
        pinchDistance.current = null;
      }
    },
    [offset]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size >= 2) {
        const [a, b] = [...pointers.current.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const rect = box();
        const anchor = {
          x: (a.x + b.x) / 2 - (rect?.left ?? 0),
          y: (a.y + b.y) / 2 - (rect?.top ?? 0),
        };
        if (pinchDistance.current !== null && pinchDistance.current > 0) {
          zoomAt(distance / pinchDistance.current, anchor);
        }
        pinchDistance.current = distance;
        return;
      }

      const start = dragStart.current;
      if (!start) return;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;

      if (!dragging.current) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        dragging.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setPanning(true);
      }

      setOffset(clampOffset({ x: start.offset.x + dx, y: start.offset.y + dy }, scale, box()));
    },
    [scale, zoomAt] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const endPointer = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    pointers.current.delete(e.pointerId);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (pointers.current.size < 2) pinchDistance.current = null;
    if (pointers.current.size === 0) {
      dragStart.current = null;
      dragging.current = false;
      setPanning(false);
    }
  }, []);

  const onDoubleClick = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      /* Podwójne kliknięcie przy pełnym powiększeniu wraca do całości rysunku. */
      if (scale >= MAX_SCALE - 0.01) {
        reset();
        return;
      }
      zoomAt(STEP * 1.4, localPoint(e));
    },
    [scale, reset, zoomAt] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /* Zmiana rozmiaru kadru może zostawić rysunek poza krawędzią. */
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      setOffset((current) => clampOffset(current, scale, element.getBoundingClientRect()));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, scale]);

  return {
    scale,
    wheelZooms: alwaysZoomOnWheel || scale > 1,
    canZoomIn: scale < MAX_SCALE - 0.01,
    canZoomOut: scale > MIN_SCALE + 0.01,
    isPanning,
    zoomIn,
    zoomOut,
    reset,
    style: {
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      transformOrigin: "0 0",
    },
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onDoubleClick,
    },
  };
}
