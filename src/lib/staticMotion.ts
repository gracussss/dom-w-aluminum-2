import { createContext, useContext } from "react";

/* ------------------------------------------------------------------
   TRYB STATYCZNY — PODGLĄD NA ŻYWO W PANELU

   Podgląd w panelu rysuje prawdziwe sekcje strony w ramce obok formularza.
   Animacje wejścia czekają tam na przewinięcie (IntersectionObserver),
   którego w ramce podglądu nie ma komu wykonać — sekcja zostawała
   niewidoczna. W trybie statycznym prymitywy animacji (Reveal, RevealText,
   ParallaxImage) i sekcje z przewijaniem sterowanym skryptem (Proces)
   pokazują od razu stan końcowy. Na stronie kontekst jest zawsze `false`.
   ------------------------------------------------------------------ */
export const StaticMotionContext = createContext(false);

export function useStaticMotion(): boolean {
  return useContext(StaticMotionContext);
}
