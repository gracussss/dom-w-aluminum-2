import { useEffect } from "react";
import { OG_IMAGE, OG_IMAGE_ALT, SITE_NAME, absoluteUrl, buildTitle } from "../lib/seo";

interface SeoProps {
  title: string;
  description: string;
  /**
   * Ścieżka kanoniczna, gdy różni się od bieżącego adresu — np. katalog
   * z filtrami w zapytaniu (`/systemy?producent=…`) wskazuje na `/systemy`.
   * Domyślnie: ścieżka bieżąca bez parametrów.
   */
  canonicalPath?: string;
  /**
   * Wyłączenie indeksowania podstrony (404, karty systemów o niepotwierdzonych
   * danych). Odnośniki nadal są śledzone — `noindex, follow`.
   *
   * UWAGA: gdy `false`, komponent NIE zapisuje meta robots. Blokada demo
   * z `index.html` musi zostać nienaruszona — inaczej podstrony wypisywałyby
   * „index" mimo że cała witryna ma być poza wyszukiwarką.
   */
  noindex?: boolean;
  /** Obraz podglądu przy udostępnianiu — ścieżka wewnętrzna lub pełny adres. */
  image?: string;
  imageAlt?: string;
  /**
   * Dane strukturalne (schema.org). Wstrzykiwane jako <script type="application/ld+json">
   * i sprzątane przy zmianie podstrony.
   *
   * ZASADA: w danych strukturalnych podajemy wyłącznie to, co jest potwierdzone.
   * Nie umieszczamy tu cen, ocen ani marki systemu, którego oznaczenie
   * nie zostało potwierdzone u producenta — wyszukiwarka traktuje te dane
   * jako deklarację firmy.
   */
  jsonLd?: unknown;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

const JSON_LD_MARKER = "data-seo-jsonld";
const ROBOTS_MARKER = "data-seo-robots";

/** Ustawia title/meta/canonical/dane strukturalne per-podstrona (bez dodatkowej zależności). */
export function Seo({
  title,
  description,
  canonicalPath,
  noindex = false,
  image = OG_IMAGE,
  imageAlt = OG_IMAGE_ALT,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = buildTitle(title);
    const path = canonicalPath ?? (typeof window === "undefined" ? "/" : window.location.pathname);
    const canonical = absoluteUrl(path);
    const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

    document.title = fullTitle;
    setMeta("description", description);
    setLink("canonical", canonical);

    setMeta("og:type", "website", "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("og:locale", "pl_PL", "property");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", canonical, "property");
    setMeta("og:image", imageUrl, "property");
    setMeta("og:image:alt", imageAlt, "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", imageUrl);
  }, [title, description, canonicalPath, image, imageAlt]);

  /* Meta robots dopisujemy wyłącznie przy blokadzie — i zdejmujemy przy wyjściu
     z podstrony, żeby „noindex" karty systemu nie został na kolejnej. */
  useEffect(() => {
    if (!noindex) return;

    const tag = document.createElement("meta");
    tag.setAttribute("name", "robots");
    tag.setAttribute("content", "noindex, follow");
    tag.setAttribute(ROBOTS_MARKER, "");
    document.head.appendChild(tag);

    return () => tag.remove();
  }, [noindex]);

  /* Serializacja w zależnościach — obiekt literalny w propsie ma za każdym
     renderem nową tożsamość i bez tego skrypt przepinałby się bez końca. */
  const serialized = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    if (!serialized) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(JSON_LD_MARKER, "");
    script.textContent = serialized;
    document.head.appendChild(script);

    return () => script.remove();
  }, [serialized]);

  return null;
}
