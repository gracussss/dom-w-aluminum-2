import { createContext, useContext } from "react";

/**
 * Czy ekran startowy zszedł już z drogi.
 *
 * Treść strony montuje się RÓWNOLEGLE z loaderem (żeby obrazy zdążyły się
 * pobrać), więc bez tej flagi animacje wejścia lecą za zasłoniętą ramą
 * i użytkownik widzi po otwarciu gotowy, statyczny kadr.
 *
 * Domyślnie `true` — komponenty renderowane poza `LoaderGate` (podstrony,
 * powrót w tej samej sesji) animują się normalnie, od razu po zamontowaniu.
 */
export const IntroContext = createContext(true);

export function useIntroReady() {
  return useContext(IntroContext);
}
