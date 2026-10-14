import raw from "../content/zdjecia.json";
import { text } from "../lib/content";
import { PHOTO_TONE } from "../lib/responsiveImage";

function img(id: string, params = "w=1800&q=80&auto=format&fit=crop") {
  return `https://images.unsplash.com/${id}?${params}&${PHOTO_TONE}`;
}

/* Kadry, które klient podmienia w panelu (/admin → „Zdjęcia na stronie”).
   Puste pole zostawia dotychczasowe zdjęcie — strona nie traci tła
   tylko dlatego, że ktoś usunął plik w formularzu. */
function fromPanel(value: unknown, fallback: string): string {
  return text(value) || fallback;
}

/**
 * Zdjęcia tymczasowe (Unsplash) — do podmiany na materiały własne firmy.
 *
 * To JEDYNE miejsce z adresami zdjęć poza kartami systemów i realizacjami.
 * Klucze nazywają MIEJSCE, w którym kadr stoi, nie jego treść — dzięki temu
 * podmiana pliku nie wymaga szukania, gdzie dany adres jest używany.
 * Klucz bez odbiorcy w kodzie jest błędem: klient dostałby do podmiany
 * zdjęcie, którego na stronie nie ma.
 */
export const images = {
  /** Tło pierwszego ekranu — największy element strony (LCP). */
  heroBg: fromPanel(raw.hero?.src, img("photo-1487958449943-2429e8be8625", "w=2400&q=80&auto=format&fit=crop")),

  /* Sekwencja „Jak powstaje konstrukcja" (wariant zdjęciowy ScrollStory). */
  storyBuilding: img("photo-1628012209120-d9db7abf7eab"),
  storyOpening: img("photo-1783125127082-3fb6c1bccd72"),
  storyProfile: img("photo-1759367973838-2ad5eabd1f28", "w=1200&q=80&auto=format&fit=crop"),
  storySection: img("photo-1759185301790-e079e2970809"),
  storyAssembly: img("photo-1523477593243-78bbf626fd3b"),

  /** Kadr przy tekście „O nas". */
  about: fromPanel(raw.about?.src, img("photo-1666634157070-6fd830fb5672")),
  /** Tło sekcji kontaktowej na stronie głównej. */
  contact: fromPanel(raw.contact?.src, img("photo-1759604218664-f4f714869555")),
  /** Podgląd zapasowy dla urządzeń bez WebGL w sekcji modelu 3D. */
  systems: img("photo-1783705093954-a4d64bb7bf69"),
} as const;

/** Opisy zdjęć (atrybut `alt`) — także z panelu, bo idą do wyszukiwarki. */
export const imageAlts = {
  hero: text(raw.hero?.alt) || "Nowoczesna architektura – konstrukcja ze szkła i aluminium",
  about: text(raw.about?.alt) || "Precyzja wykonania",
};
