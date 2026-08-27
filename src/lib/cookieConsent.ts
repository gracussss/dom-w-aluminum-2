import { useEffect, useState } from "react";

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const STORAGE_KEY = "cookie-consent";
export const OPEN_SETTINGS_EVENT = "cookie-consent:open-settings";
/** Decyzja zapadła lub została zmieniona — nasłuchują tego treści osadzone. */
export const CONSENT_CHANGE_EVENT = "cookie-consent:changed";

export function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

export function storeConsent(partial: { analytics: boolean; marketing: boolean }) {
  const state: ConsentState = {
    necessary: true,
    analytics: partial.analytics,
    marketing: partial.marketing,
    decidedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* prywatne okno / zablokowany storage — zgoda działa do końca sesji */
  }

  // Miejsce na przyszłą inicjalizację skryptów zależnych od zgody,
  // np. Google Analytics / Google Tag Manager / Meta Pixel.
  // Świadomie NIE ładujemy tu żadnych identyfikatorów ani skryptów —
  // to zrobimy dopiero po dostarczeniu prawdziwych ID przez klienta.
  // if (state.analytics) { /* init GA4 / GTM */ }
  // if (state.marketing) { /* init Meta Pixel */ }

  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: state }));
  return state;
}

/** Otwiera panel ustawień cookies z dowolnego miejsca w aplikacji (np. z /cookies). */
export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT));
}

/**
 * Aktualna zgoda jako stan Reacta. `null` = decyzja jeszcze nie zapadła.
 * Treści osadzone (mapa, wideo) pytają o nią przed pobraniem czegokolwiek
 * z obcego serwera.
 */
export function useConsent(): ConsentState | null {
  const [consent, setConsent] = useState<ConsentState | null>(() =>
    typeof window === "undefined" ? null : getStoredConsent()
  );

  useEffect(() => {
    const onChange = () => setConsent(getStoredConsent());
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    // Decyzja podjęta w innej karcie tej samej domeny.
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return consent;
}
