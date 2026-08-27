import type Lenis from "lenis";

/* ------------------------------------------------------------------
   STEROWANIE PRZEWIJANIEM — WARSTWA BEZ REACTA

   Tu mieszka referencja do działającej instancji Lenis i wszystko, co
   reszta aplikacji chce z przewijaniem zrobić: przeskok do elementu,
   powrót na górę, blokada na czas modala.

   Świadomie osobno od komponentu `SmoothScroll`: ten plik nie importuje
   ani Reacta, ani GSAP-a, więc mogą po niego sięgać zarówno widoki, jak
   i leniwie doładowywany most do ScrollTriggera — bez cyklu importów.
   ------------------------------------------------------------------ */

let lenisInstance: Lenis | null = null;

type LenisListener = (lenis: Lenis | null) => void;
const listeners = new Set<LenisListener>();

/** Rejestruje instancję i powiadamia tych, którzy na nią czekali. */
export function setLenis(instance: Lenis | null) {
  lenisInstance = instance;
  for (const listener of listeners) listener(instance);
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Nasłuch na pojawienie się instancji. Wywołuje się od razu, jeśli Lenis
 * już działa — most do ScrollTriggera potrafi doładować się w dowolnej
 * chwili, także przed i po starcie płynnego scrolla.
 */
export function onLenis(listener: LenisListener): () => void {
  listeners.add(listener);
  if (lenisInstance) listener(lenisInstance);
  return () => listeners.delete(listener);
}

/** Pozwala przewinąć do elementu z zachowaniem płynnego scrolla. */
export function scrollToElement(target: string | HTMLElement, offset = 0) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ block: "start" });
}

/** Skok pod konkretną współrzędną — do odtwarzania pozycji przy cofaniu. */
export function scrollToY(y: number) {
  if (lenisInstance) {
    lenisInstance.scrollTo(y, { immediate: true });
    return;
  }
  window.scrollTo(0, y);
}

export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate: true });
    return;
  }
  window.scrollTo(0, 0);
}

/* ------------------------------------------------------------------
   BLOKADA PRZEWIJANIA NA CZAS MODALA

   Samo `overflow: hidden` na body nie wystarcza, kiedy działa Lenis:
   płynny scroll przewija stronę PROGRAMOWO (`window.scrollTo`), a tego
   `overflow` nie zatrzymuje. Efekt był taki, że przy otwartym menu albo
   pełnym ekranie przekroju tło uciekało pod kółkiem myszy.

   Blokady liczymy, bo warstwy potrafią się nakładać — np. ekran startowy
   i baner cookies — a wyjście z jednej nie może odblokować pozostałych.
   ------------------------------------------------------------------ */
let scrollLocks = 0;

export function lockScroll() {
  scrollLocks += 1;
  if (scrollLocks > 1) return;
  document.body.style.overflow = "hidden";
  lenisInstance?.stop();
}

export function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks > 0) return;
  document.body.style.overflow = "";
  lenisInstance?.start();
}

/** Ile blokad jest w tej chwili aktywnych — świeża instancja Lenis musi je przejąć. */
export function activeScrollLocks() {
  return scrollLocks;
}
