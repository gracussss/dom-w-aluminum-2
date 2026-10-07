import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieConsent } from "./CookieConsent";
import { ErrorBoundary } from "../ErrorBoundary";
import { scrollToElement, scrollToTop, scrollToY } from "../../lib/scroll";

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

/* ------------------------------------------------------------------
   POZYCJE PRZEWINIĘCIA W HISTORII

   Przeglądarka ma to wyłączone (`scrollRestoration = "manual"`), bo przy
   płynnym scrollu i pinowanych sekcjach jej własne odtwarzanie skacze.
   Odtwarzamy więc sami — ale wyłącznie przy cofaniu (`POP`).

   Po co: z katalogu wchodzi się w kartę systemu i wraca. Bez tego powrót
   lądował na górze listy i użytkownik szukał od nowa miejsca, w którym był.

   Wpis historii jest identyfikowany przez `location.key`, nie przez adres —
   dwa wejścia na ten sam adres to dwa różne miejsca w historii.
   ------------------------------------------------------------------ */
const scrollPositions = new Map<string, number>();

/**
 * Podstrony dociągane są leniwie, więc w chwili cofnięcia dokument bywa
 * jeszcze za krótki i skok zostaje przycięty. Ponawiamy przez chwilę,
 * dopóki treść nie urośnie do zapamiętanej pozycji.
 */
function restoreScroll(y: number) {
  const deadline = performance.now() + 600;

  const attempt = () => {
    scrollToY(y);
    const reachable = document.documentElement.scrollHeight - window.innerHeight;
    if (reachable >= y - 2 || performance.now() > deadline) return;
    requestAnimationFrame(attempt);
  };

  requestAnimationFrame(attempt);
}

export function RootLayout() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const currentKey = useRef(key);

  /* Pozycja zapisywana na bieżąco — w chwili nawigacji jest już za późno,
     bo nowa treść potrafi przyciąć scroll, zanim zdążymy go odczytać. */
  useEffect(() => {
    const onScroll = () => scrollPositions.set(currentKey.current, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    currentKey.current = key;

    if (hash) {
      // Czekamy na wyrenderowanie docelowego elementu na nowej podstronie.
      const id = hash.slice(1);
      const raf = requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) scrollToElement(el, -100);
      });
      return () => cancelAnimationFrame(raf);
    }

    const remembered = scrollPositions.get(key);
    if (navigationType === "POP" && remembered) {
      restoreScroll(remembered);
      return;
    }

    scrollToTop();
  }, [pathname, hash, key, navigationType]);

  return (
    <div className="bg-void">
      {/* Pierwszy przystanek klawiatury: pominięcie nawigacji.
          Widoczny dopiero po sfokusowaniu — układ strony bez zmian. */}
      <a
        href="#tresc"
        className="label sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[80] focus:bg-limestone focus:px-5 focus:py-3 focus:text-void"
      >
        Przejdź do treści
      </a>
      <Header />
      {/* Podstrona wchodzi od razu, bez przejścia. Wcześniej w poprzek ekranu
          przesuwało się ciemne pasmo z pionową kreską, a treść rozjaśniała
          się od zera. Klientka odebrała to jako „przeskakiwanie” i „kreski”,
          a razem z dociąganiem podstrony — jako wolne ładowanie. */}
      <main id="tresc">
        {/* Klucz = adres: po przejściu na inną podstronę błąd z poprzedniej
            nie zostaje na ekranie – nagłówek działa, więc da się uciec. */}
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
