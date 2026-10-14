import type { Crumb } from "../components/ui/Breadcrumbs";
import { company, socialLinks } from "../data/company";
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
 * Wizytówka firmy. Wyłącznie dane potwierdzone przez klienta: nazwa, adres,
 * telefon, logo, profile społecznościowe, godziny pracy, e-mail i NIP —
 * wszystko z panelu („Dane firmy”). Puste pole w panelu znika też ze
 * schema.org. Bez obszaru działania, którego klient nie podał.
 */
export function organizationJsonLd() {
  const sameAs = Object.values(socialLinks).filter((url): url is string => Boolean(url));

  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": absoluteUrl("/#firma"),
    name: company.legalName,
    alternateName: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.png"),
    ...(company.openingHours.length > 0 ? { openingHours: company.openingHours } : {}),
    ...(company.email ? { email: company.email } : {}),
    /* Numery rejestrowe tylko podane przez klienta w panelu — puste pole
       nie trafia do danych strukturalnych. */
    ...(company.legal.nip ? { taxID: company.legal.nip } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
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

/**
 * Wpis w aktualnościach. Autorem i wydawcą jest firma — wpisy publikuje
 * klient w panelu, a nie podpisana osoba, więc nie wymyślamy autora.
 */
export function articleJsonLd(post: { title: string; date: string; excerpt: string; cover: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.cover ? { image: post.cover.startsWith("http") ? post.cover : absoluteUrl(post.cover) } : {}),
    mainEntityOfPage: absoluteUrl(post.path),
    author: { "@type": "Organization", name: company.legalName, url: absoluteUrl("/") },
    publisher: {
      "@type": "Organization",
      name: company.legalName,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
  };
}

/** Pytania i odpowiedzi z panelu — tylko to, co klient wpisał w FAQ. */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
