import { useEffect } from "react";
import Lenis from "lenis";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion } from "./motion";
import { activeScrollLocks, setLenis } from "./scroll";
import { refreshScrollTriggers } from "./scrollAnimation";

/**
 * Płynny scroll (Lenis) na własnej pętli `requestAnimationFrame`.
 *
 * Wcześniej pętlę prowadził ticker GSAP-a — przez co GSAP ze ScrollTriggerem
 * (~40 kB po kompresji) ładował się na starcie, choć pracuje wyłącznie
 * w sekcjach leżących kilka ekranów niżej. Teraz spięcie z ScrollTriggerem
 * zakłada się samo w chwili, gdy któraś z nich go dociągnie
 * (patrz `lib/scrollAnimation.ts`).
 *
 * Przy prefers-reduced-motion Lenis w ogóle nie startuje.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Na dotyku zostawiamy natywny scroll — jest płynniejszy i oszczędza baterię.
      syncTouch: false,
    });

    /* Efekty dzieci ruszają przed tym — ekran startowy zdążył już założyć
       blokadę, zanim Lenis w ogóle powstał. Świeża instancja musi ją przejąć. */
    if (activeScrollLocks() > 0) lenis.stop();

    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  // Po zmianie podstrony wysokości się zmieniają — przeliczamy pozycje.
  // Triggery sprzątają same siebie przez gsap.context w komponentach,
  // więc NIE kasujemy ich tutaj (efekty dzieci uruchamiają się wcześniej).
  useEffect(() => {
    const id = window.setTimeout(refreshScrollTriggers, 180);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}
