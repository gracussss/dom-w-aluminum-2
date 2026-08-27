import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CookieConsent } from "./CookieConsent";
import { scrollToElement, scrollToTop, scrollToY } from "../../lib/scroll";
import { EASE_FRAME, EASE_OUT } from "../../lib/motion";

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

/**
 * Przejście między podstronami: w poprzek kadru przesuwa się profil —
 * ciemne pasmo z aluminiową krawędzią — a treść pod nim wchodzi rozjaśnieniem.
 *
 * Świadomie nie ma tu zasłonięcia całego ekranu ani czekania na wyjście starej
 * strony: nowa treść montuje się od razu, przejście tylko przykrywa moment
 * podmiany. Nawigacja nie może być wolniejsza od kliknięcia.
 */
function RouteSweep({ pathname }: { pathname: string }) {
  const reduced = useReducedMotion();
  const previous = useRef(pathname);
  const [sweep, setSweep] = useState<string | null>(null);

  useEffect(() => {
    // Pierwsze wejście na stronę nie jest przejściem — tam pracuje ekran startowy.
    if (previous.current === pathname) return;
    previous.current = pathname;
    setSweep(pathname);
  }, [pathname]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {sweep && (
        <motion.div
          key={sweep}
          aria-hidden
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 0.62, ease: EASE_FRAME }}
          onAnimationComplete={() => setSweep(null)}
          className="pointer-events-none fixed inset-0 z-[70]"
        >
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 38%, rgba(11,12,13,0.85) 50%, transparent 62%)",
            }}
          />
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-aluminium/40" />
        </motion.div>
      )}
    </AnimatePresence>
  );
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
      <RouteSweep pathname={pathname} />
      <main id="tresc">
        {/* Tylko krycie — żaden transform, żeby nie tworzyć bloku zawierającego
            dla pinowanych i przyklejonych sekcji wewnątrz podstron. */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.06, ease: EASE_OUT }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
