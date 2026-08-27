import { onLenis } from "./scroll";

/* ------------------------------------------------------------------
   GSAP + SCROLLTRIGGER — DOCIĄGANE NA ŻĄDANIE

   GSAP ze ScrollTriggerem waży ~40 kB po kompresji i pracuje w trzech
   sekcjach, z których żadna nie jest widoczna na pierwszym ekranie.
   Wcześniej leżał w pliku startowym, bo importował go komponent płynnego
   scrolla — czyli coś, co uruchamia się natychmiast.

   Teraz: Lenis kręci własnym `requestAnimationFrame`, a GSAP przyjeżdża
   dopiero wtedy, gdy któraś sekcja faktycznie o niego poprosi. Most do
   Lenisa (wspólna klatka dla scrolla i pozycji ScrollTriggera) zakładamy
   raz, przy pierwszym załadowaniu.
   ------------------------------------------------------------------ */

type Gsap = (typeof import("gsap"))["gsap"];
type ScrollTriggerType = (typeof import("gsap/ScrollTrigger"))["ScrollTrigger"];

export interface ScrollAnimation {
  gsap: Gsap;
  ScrollTrigger: ScrollTriggerType;
}

let loading: Promise<ScrollAnimation> | null = null;
let loaded: ScrollAnimation | null = null;

/**
 * Zwraca GSAP-a spiętego ze ScrollTriggerem i z Lenisem. Kolejne wywołania
 * dostają tę samą instancję — plugin rejestruje się dokładnie raz.
 */
export function loadScrollAnimation(): Promise<ScrollAnimation> {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);

      /* ScrollTrigger musi liczyć pozycje na tej samej klatce, na której
         Lenis przesuwa stronę — inaczej pinowane sekcje dryfują. */
      onLenis((lenis) => {
        if (!lenis) return;
        lenis.on("scroll", ScrollTrigger.update);
      });

      loaded = { gsap, ScrollTrigger };
      return loaded;
    }
  );

  return loading;
}

/** Przelicza pozycje, ale tylko jeśli ScrollTrigger w ogóle został wczytany. */
export function refreshScrollTriggers() {
  loaded?.ScrollTrigger.refresh();
}
