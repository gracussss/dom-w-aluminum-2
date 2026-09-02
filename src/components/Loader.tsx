import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { images } from "../data/images";
import { IntroContext } from "../lib/intro";
import { EASE_FRAME, EASE_OUT } from "../lib/motion";
import { lockScroll, unlockScroll } from "../lib/scroll";
import { SIZES_FULL, responsiveSrcSet } from "../lib/responsiveImage";

/** Profil aluminiowy — wspólne właściwości animacji „wysuwania” elementu ramy. */
const profile = {
  hidden: { scaleY: 0, scaleX: 0 },
  shown: { scaleY: 1, scaleX: 1 },
};

/**
 * Wstępne pobranie tła hero. Rozstrzyga się, gdy obraz jest zdekodowany
 * albo gdy minie `timeout` — intro nigdy nie czeka w nieskończoność,
 * nawet przy zerwanym połączeniu.
 */
function heroImageReady(timeout: number) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, timeout);
    const finish = () => {
      window.clearTimeout(timer);
      resolve();
    };
    const img = new Image();
    /* Ten sam zestaw źródeł co w hero — inaczej wstępne pobranie ściągałoby
       największy kadr, a strona i tak sięgnęłaby po wariant pod swój ekran. */
    const srcSet = responsiveSrcSet(images.heroBg);
    if (srcSet) {
      img.srcset = srcSet;
      img.sizes = SIZES_FULL;
    }
    img.src = images.heroBg;
    // decode() odrzuca m.in. przy błędzie sieci — wtedy też otwieramy ramę.
    img.decode().then(finish, finish);
  });
}

interface LoaderProps {
  /** Rama zaczyna się rozsuwać — treść pod spodem może ruszyć ze swoją animacją. */
  onOpen: () => void;
  /** Rama zeszła z ekranu — loader można odmontować. */
  onDone: () => void;
}

/**
 * Ekran startowy: z profili składa się okno aluminiowe, pojawia się szyba
 * z refleksem światła, a następnie rama rozsuwa się jak drzwi, odsłaniając stronę.
 *
 * Rama otwiera się, gdy spełnione są dwa warunki: minął czas potrzebny na
 * pokazanie animacji marki (HOLD) i tło hero jest zdekodowane (najwyżej
 * MAX_WAIT). Dzięki temu za skrzydłami nie odsłania się pusty kadr.
 *
 * Całość da się pominąć — animacja marki nie może stać między
 * użytkownikiem a treścią.
 */
export function Loader({ onOpen, onDone }: LoaderProps) {
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);

  /* Sekwencja: budowa ramy → szyba → refleks → nazwa → otwarcie.

     Czasy skrócone (2026-08-31) po pomiarze PageSpeed: ekran startowy jest
     pierwszym malowaniem treści, więc jego długość wchodzi wprost w FCP i LCP
     — przy poprzednich wartościach (HOLD 1300, MAX_WAIT 2200) obie metryki
     lądowały na profilu mobilnym w czerwonym.

     Choreografia została w całości: TEMPO skaluje wszystkie opóźnienia
     i czasy animacji znaku, więc rama nadal składa się z profili, szyba
     dostaje refleks, a nazwa wjeżdża — tylko szybciej.

     Dobór dwóch liczb, które muszą do siebie pasować:
     sekwencja znaku trwa (0.88 + 0.4) × TEMPO = 0.70 s, a HOLD = 0.8 s.
     HOLD **musi** być większy — inaczej skrzydła ruszają w połowie animacji
     marki. Nadwyżka 100 ms to celowy oddech na złożonym znaku; przy zerowej
     różnicy otwarcie deptało po ostatniej klatce i całość wyglądała na
     pośpiech. Zmieniając jedno, przelicz drugie. */
  const TEMPO = 0.55;
  const HOLD = reduced ? 250 : 800;
  const MAX_WAIT = reduced ? 400 : 1600;
  const OPEN = reduced ? 200 : 620;

  const opened = useRef(false);
  const doneTimer = useRef(0);

  /**
   * Callbacki trzymamy w refie, a nie w zależnościach.
   *
   * `onOpen` zmienia stan rodzica, więc po jego wywołaniu przychodzą nowe,
   * inne funkcje. Gdyby wchodziły do zależności `open`, efekt niżej byłby
   * uruchamiany od nowa, a jego sprzątanie kasowałoby timer domknięcia —
   * loader zostawał w drzewie i przykrywał stronę.
   */
  const cb = useRef({ onOpen, onDone });

  useEffect(() => {
    cb.current = { onOpen, onDone };
  });

  /** Rozsunięcie skrzydeł — wywoływane raz, przez timer albo przez pominięcie. */
  const open = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    setOpening(true);
    cb.current.onOpen();
    doneTimer.current = window.setTimeout(() => cb.current.onDone(), OPEN);
  }, [OPEN]);

  useEffect(() => {
    let cancelled = false;
    let openTimer = 0;
    const start = performance.now();

    heroImageReady(MAX_WAIT).then(() => {
      if (cancelled) return;
      // Obraz gotowy szybciej niż animacja ramy — dopłacamy resztę czasu.
      const rest = Math.max(0, HOLD - (performance.now() - start));
      openTimer = window.setTimeout(open, rest);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(openTimer);
      window.clearTimeout(doneTimer.current);
    };
  }, [HOLD, MAX_WAIT, open]);

  // Dowolny klawisz przerywa intro — bez szukania przycisku.
  useEffect(() => {
    const onKey = () => open();
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const d = reduced ? 0 : TEMPO;

  return (
    /* Od chwili rozsunięcia skrzydeł ekran startowy przestaje przechwytywać
       wskaźnik — nawet gdyby jego odmontowanie się opóźniło, strona pod
       spodem pozostaje klikalna. */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ekran startowy"
      className={`fixed inset-0 z-[200] overflow-hidden ${opening ? "pointer-events-none" : ""}`}
    >
      {/* Skrzydła — rozsuwają się jak drzwi przesuwne */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: opening ? "-101%" : 0 }}
        transition={{ duration: OPEN / 1000, ease: EASE_FRAME }}
        className="grain absolute inset-y-0 left-0 w-1/2 bg-void"
      />
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: opening ? "101%" : 0 }}
        transition={{ duration: OPEN / 1000, ease: EASE_FRAME }}
        className="grain absolute inset-y-0 right-0 w-1/2 bg-void"
      />

      {/* Cienka linia styku skrzydeł */}
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: opening ? 0 : 0.5 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-aluminium/20"
      />

      <motion.div
        aria-hidden
        animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.06 : 1 }}
        transition={{ duration: 0.55, ease: EASE_OUT }}
        className="absolute inset-0 flex flex-col items-center justify-center gap-9 px-6"
      >
        <motion.svg
          viewBox="0 0 260 340"
          className="h-[46vh] max-h-[380px] w-auto"
          initial="hidden"
          animate="shown"
        >
          <defs>
            <linearGradient id="ldAluV" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6e7479" />
              <stop offset="35%" stopColor="#c4c9cd" />
              <stop offset="62%" stopColor="#878d92" />
              <stop offset="100%" stopColor="#5c6165" />
            </linearGradient>
            <linearGradient id="ldAluH" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c4c9cd" />
              <stop offset="45%" stopColor="#878d92" />
              <stop offset="100%" stopColor="#5c6165" />
            </linearGradient>
            <linearGradient id="ldGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7d9a92" stopOpacity="0.20" />
              <stop offset="55%" stopColor="#9ba1a6" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#7d9a92" stopOpacity="0.16" />
            </linearGradient>
            <linearGradient id="ldSheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <clipPath id="ldGlassClip">
              <rect x="14" y="14" width="232" height="312" />
            </clipPath>
          </defs>

          {/* 1–2. profile pionowe wysuwają się z dołu */}
          <motion.rect
            x="0" y="0" width="14" height="340" fill="url(#ldAluV)"
            variants={profile}
            transition={{ duration: 0.4 * d, delay: 0.02 * d, ease: EASE_FRAME }}
            style={{ transformBox: "fill-box", transformOrigin: "bottom", scaleX: 1 }}
          />
          <motion.rect
            x="246" y="0" width="14" height="340" fill="url(#ldAluV)"
            variants={profile}
            transition={{ duration: 0.4 * d, delay: 0.09 * d, ease: EASE_FRAME }}
            style={{ transformBox: "fill-box", transformOrigin: "bottom", scaleX: 1 }}
          />

          {/* 3. profile poziome domykają ramę */}
          <motion.rect
            x="0" y="0" width="260" height="14" fill="url(#ldAluH)"
            variants={profile}
            transition={{ duration: 0.35 * d, delay: 0.26 * d, ease: EASE_FRAME }}
            style={{ transformBox: "fill-box", transformOrigin: "left", scaleY: 1 }}
          />
          <motion.rect
            x="0" y="326" width="260" height="14" fill="url(#ldAluH)"
            variants={profile}
            transition={{ duration: 0.35 * d, delay: 0.32 * d, ease: EASE_FRAME }}
            style={{ transformBox: "fill-box", transformOrigin: "right", scaleY: 1 }}
          />

          {/* 4. szyba */}
          <motion.rect
            x="14" y="14" width="232" height="312"
            fill="url(#ldGlass)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 * d, delay: 0.55 * d, ease: "easeOut" }}
          />

          {/* 5. słupek */}
          <motion.rect
            x="123" y="14" width="14" height="312" fill="url(#ldAluV)"
            variants={profile}
            transition={{ duration: 0.3 * d, delay: 0.46 * d, ease: EASE_FRAME }}
            style={{ transformBox: "fill-box", transformOrigin: "top", scaleX: 1 }}
          />

          {/* 6. refleks światła przechodzący po szybie */}
          <g clipPath="url(#ldGlassClip)">
            <motion.rect
              x="-140" y="-60" width="120" height="460"
              fill="url(#ldSheen)"
              transform="rotate(18)"
              initial={{ x: -180 }}
              animate={{ x: 420 }}
              transition={{ duration: 0.62 * d, delay: 0.58 * d, ease: [0.4, 0, 0.2, 1] }}
            />
          </g>

          {/* krawędź przylgi */}
          <motion.rect
            x="14" y="14" width="232" height="312"
            fill="none" stroke="#0b0c0d" strokeOpacity="0.5" strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 * d, delay: 0.6 * d }}
          />
        </motion.svg>

        {/* 7. nazwa */}
        <div className="overflow-hidden">
          <motion.p
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.52 * d, delay: 0.7 * d, ease: EASE_OUT }}
            className="display text-center text-[7vw] leading-none text-limestone sm:text-3xl md:text-4xl"
          >
            DOM W ALUMINIUM
          </motion.p>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.4 * d, delay: 0.88 * d }}
          className="label -mt-4 text-aluminium"
        >
          Stolarka aluminiowa
        </motion.p>
      </motion.div>

      <motion.button
        type="button"
        onClick={open}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="label-sm absolute bottom-8 right-6 z-10 text-limestone/55 transition-colors hover:text-limestone md:bottom-10 md:right-10"
      >
        Pomiń
      </motion.button>
    </div>
  );
}

const INTRO_KEY = "dwa:intro-seen";

/** Bezpieczny odczyt — prywatne okno i zablokowane storage rzucają wyjątkiem. */
function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Steruje pokazaniem loadera przy pełnym wczytaniu strony (nie przy nawigacji SPA).
 * Intro leci raz na sesję — przy powrocie na stronę użytkownik ma je już za sobą.
 *
 * Dwa stany, nie jeden: `revealed` zapala się w chwili, gdy skrzydła RUSZAJĄ
 * (treść zaczyna wtedy swoją animację i wjeżdża w rozsuwającą się ramę),
 * `done` dopiero po zejściu ramy z ekranu — wtedy loader znika z drzewa.
 */
export function LoaderGate({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(introSeen);
  const [done, setDone] = useState(introSeen);

  const handleOpen = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => setDone(true), []);

  useEffect(() => {
    if (done) {
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {
        /* brak storage — intro pokaże się przy następnym wejściu */
      }
      return;
    }
    lockScroll();
    return unlockScroll;
  }, [done]);

  return (
    <IntroContext.Provider value={revealed}>
      <AnimatePresence>
        {!done && <Loader key="loader" onOpen={handleOpen} onDone={handleDone} />}
      </AnimatePresence>
      {/* Dopóki rama zasłania ekran, treść pod nią nie może łapać Tab ani
          trafiać do czytnika — inaczej fokus wędruje po niewidocznej stronie. */}
      <div inert={done ? undefined : true}>{children}</div>
    </IntroContext.Provider>
  );
}
