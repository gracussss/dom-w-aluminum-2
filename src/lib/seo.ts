import { company, fullAddress } from "../data/company";

/* ------------------------------------------------------------------
   USTAWIENIA SEO — JEDNO MIEJSCE

   Wszystko, co powtarza się w meta tagach, kanonicznych adresach
   i danych strukturalnych. Podstrony podają wyłącznie to, co je
   odróżnia: tytuł, opis i ewentualne dane strukturalne.
   ------------------------------------------------------------------ */

/** Nazwa marki doklejana do tytułu podstrony. */
/* Alukoncept zamiast roboczego „Dom w Aluminium” – decyzja klienta
   (październik 2026), spójnie z logo firmy. */
export const SITE_NAME = "Alukoncept";

/**
 * Adres produkcyjny. Domeny nie zmyślamy — dopóki nie jest ustawiona
 * w `VITE_SITE_URL`, kanoniczny adres bierzemy z przeglądarki (jest wtedy
 * poprawny na każdym środowisku), a sitemapa nie powstaje w ogóle.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

/**
 * Obraz do podglądu przy udostępnianiu (Open Graph / Twitter).
 * PLACEHOLDER: plik wektorowy 1200×630. Przed startem produkcyjnym
 * podmienić na eksport PNG — patrz SEO.md, sekcja „Przed publikacją".
 */
export const OG_IMAGE = "/og-default.svg";
export const OG_IMAGE_ALT = `${company.legalName} – stolarka aluminiowa`;

/** Origin bieżącego środowiska: konfiguracja ma pierwszeństwo przed przeglądarką. */
export function siteOrigin(): string {
  if (SITE_URL) return SITE_URL;
  return typeof window === "undefined" ? "" : window.location.origin;
}

/** Adres bezwzględny dla ścieżki wewnętrznej — do canonicala i danych strukturalnych. */
export function absoluteUrl(path: string): string {
  const origin = siteOrigin();
  if (!path.startsWith("/")) return origin + "/" + path;
  return origin + path;
}

/**
 * Tytuł zakładki. Strona główna nie powtarza marki dwa razy —
 * na pozostałych podstronach marka stoi na końcu, po myślniku.
 */
export function buildTitle(title: string): string {
  return title === SITE_NAME ? title : `${title} – ${SITE_NAME}`;
}

/** Krótka nota adresowa do opisów meta — bez powtarzania pełnych danych firmy. */
export const LOCATION_NOTE = `${company.address.city}, ${fullAddress}`;
