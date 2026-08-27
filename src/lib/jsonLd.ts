import type { Crumb } from "../components/ui/Breadcrumbs";
import { company } from "../data/company";
import { absoluteUrl, SITE_NAME } from "./seo";

/* ------------------------------------------------------------------
   DANE STRUKTURALNE (schema.org)

   ZASADA NADRZĘDNA: w danych strukturalnych może znaleźć się wyłącznie
   informacja potwierdzona. Wyszukiwarka czyta je jako oświadczenie firmy,
   więc nie ma tu miejsca na ceny, oceny, certyfikaty, lata działalności
   ani godziny otwarcia, dopóki nie zostaną podane przez klienta.
   ------------------------------------------------------------------ */

/**
 * Dane strukturalne ścieżki nawigacyjnej (schema.org BreadcrumbList).
 * Do przekazania w propie `jsonLd` komponentu Seo.
 */
export function breadcrumbJsonLd(items: Crumb[], origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.to ? { item: origin + item.to } : {}),
    })),
  };
}

/**
 * Wizytówka firmy. Wyłącznie dane potwierdzone przez klienta:
 * nazwa, adres i telefon. Bez NIP-u, godzin otwarcia, obszaru działania
 * i profili społecznościowych — te pola dopiszemy, gdy będą znane.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": absoluteUrl("/#firma"),
    name: company.legalName,
    alternateName: SITE_NAME,
    url: absoluteUrl("/"),
    telephone: company.phone.href.replace("tel:", ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressCountry: "PL",
    },
  };
}

/**
 * Lista pozycji katalogu (kategoria, producent). Podajemy nazwę i adres —
 * bez marki, parametrów i cen, bo część pozycji ma nazwy robocze.
 */
export function itemListJsonLd(items: { name: string; path: string }[], listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}
