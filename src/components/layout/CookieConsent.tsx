import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getStoredConsent,
  OPEN_SETTINGS_EVENT,
  storeConsent,
} from "../../lib/cookieConsent";
import type { ConsentState } from "../../lib/cookieConsent";

/**
 * Baner zgody na cookies.
 *
 * ZASADA: panel ustawień zawsze pokazuje decyzję, która JEST ZAPISANA.
 * Wcześniej startował z odznaczonymi polami niezależnie od stanu zgody —
 * użytkownik, który wcześniej zgodził się na wszystko, po wejściu
 * w ustawienia i kliknięciu „Zapisz" cofał zgodę, o którą nikt go nie pytał.
 */
export function CookieConsent() {
  /* Zapisana decyzja odczytywana przy inicjalizacji stanu, nie w efekcie —
     baner nie mruga wtedy przez jedną klatkę u kogoś, kto już wybrał. */
  const [stored] = useState(() => (typeof window === "undefined" ? null : getStoredConsent()));

  const [visible, setVisible] = useState(() => !stored);
  const [settingsOpen, setSettingsOpen] = useState(false);
  /** Czy decyzja już zapadła — od tego zależy, czy Escape może zamknąć baner. */
  const [decided, setDecided] = useState(() => Boolean(stored));
  const [analytics, setAnalytics] = useState(() => stored?.analytics ?? false);
  const [marketing, setMarketing] = useState(() => stored?.marketing ?? false);
  const panelRef = useRef<HTMLDivElement>(null);

  /** Przepisuje zapisaną zgodę na stan pól. Brak zapisu = wszystko wyłączone. */
  const syncFromStorage = useCallback((stored: ConsentState | null) => {
    setAnalytics(stored?.analytics ?? false);
    setMarketing(stored?.marketing ?? false);
  }, []);

  useEffect(() => {
    const openSettings = () => {
      // Stan czytany w chwili otwarcia, nie przy montowaniu — decyzja mogła
      // zapaść w innej karcie przeglądarki.
      const current = getStoredConsent();
      syncFromStorage(current);
      setDecided(Boolean(current));
      setVisible(true);
      setSettingsOpen(true);
    };

    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
  }, [syncFromStorage]);

  /* Escape zamyka baner tylko wtedy, gdy decyzja już zapadła — przy pierwszej
     wizycie zamknięcie bez wyboru byłoby zgodą przez milczenie. */
  useEffect(() => {
    if (!visible || !decided) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, decided]);

  /* Panel otwarty świadomie z /cookies przejmuje fokus — inaczej użytkownik
     klawiatury zostaje na przycisku, a ustawienia otwierają się poza jego zasięgiem. */
  useEffect(() => {
    if (visible && settingsOpen) panelRef.current?.focus();
  }, [visible, settingsOpen]);

  function save(next: { analytics: boolean; marketing: boolean }) {
    storeConsent(next);
    syncFromStorage({ necessary: true, decidedAt: "", ...next });
    setDecided(true);
    setVisible(false);
    setSettingsOpen(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[70] p-4 md:p-6"
        >
          <div className="container-edge">
            <div
              ref={panelRef}
              role="dialog"
              aria-labelledby="cookie-consent-title"
              aria-describedby="cookie-consent-desc"
              tabIndex={-1}
              className="mx-auto max-w-3xl border border-limestone/10 bg-anthracite/95 p-6 shadow-2xl backdrop-blur-md outline-none md:p-8"
            >
              <p id="cookie-consent-title" className="label text-bronze-light">
                Pliki cookies
              </p>
              <p id="cookie-consent-desc" className="mt-3 text-sm leading-relaxed text-limestone/70">
                Używamy plików cookies niezbędnych do działania strony oraz —
                za Twoją zgodą — analitycznych i marketingowych. Szczegóły
                znajdziesz w{" "}
                <Link to="/cookies" className="underline underline-offset-2 hover:text-limestone">
                  polityce cookies
                </Link>
                .
              </p>

              {settingsOpen && (
                <div className="mt-5 space-y-3 border-t border-limestone/10 pt-5">
                  <label className="flex items-center justify-between gap-4 py-1 text-sm text-limestone/70">
                    <span>Niezbędne — zawsze aktywne</span>
                    <input type="checkbox" checked disabled className="h-4 w-4 accent-bronze" />
                  </label>
                  <label className="flex items-center justify-between gap-4 py-1 text-sm text-limestone/70">
                    <span>Analityczne (np. Google Analytics)</span>
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="h-4 w-4 accent-bronze"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4 py-1 text-sm text-limestone/70">
                    <span>Marketingowe (np. Meta Pixel)</span>
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="h-4 w-4 accent-bronze"
                    />
                  </label>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => save({ analytics: true, marketing: true })}
                  className="bg-limestone px-6 py-3 label text-xs uppercase text-void transition-colors hover:bg-bronze-light"
                >
                  Akceptuj wszystkie
                </button>
                {settingsOpen ? (
                  <button
                    onClick={() => save({ analytics, marketing })}
                    className="border border-limestone/35 px-6 py-3 label text-xs uppercase text-limestone transition-colors hover:border-limestone"
                  >
                    Zapisz ustawienia
                  </button>
                ) : (
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="border border-limestone/35 px-6 py-3 label text-xs uppercase text-limestone transition-colors hover:border-limestone"
                  >
                    Ustawienia
                  </button>
                )}
                <button
                  onClick={() => save({ analytics: false, marketing: false })}
                  className="px-6 py-3 label text-xs uppercase text-limestone/55 transition-colors hover:text-limestone"
                >
                  Odrzuć niekonieczne
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
