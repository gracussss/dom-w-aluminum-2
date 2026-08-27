export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_FRAME = [0.65, 0, 0.35, 1] as const;

/** Czy użytkownik prosi o ograniczenie animacji (poza Reactem — do GSAP/Three). */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Zgrubna ocena, czy urządzenie udźwignie scenę 3D.
 * Używane do wyboru między WebGL a statycznym fallbackiem.
 */
export function canRunWebGL() {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;

  // Bardzo słabe urządzenia — nie ryzykujemy płynności.
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores > 0 && cores <= 2) return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}
