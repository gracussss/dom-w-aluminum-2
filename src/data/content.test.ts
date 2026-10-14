import config from "../../public/admin/config.yml?raw";
import { describe, expect, it } from "vitest";
import { categories } from "../catalog/taxonomy";
import { slugify, uniqueSlugs } from "../lib/content";
import { responsiveSrcSet } from "../lib/responsiveImage";
import { company } from "./company";
import { images } from "./images";
import { offerAreas, offerAreasCount } from "./products";
import { realizations } from "./realizations";

/* ------------------------------------------------------------------
   TREŚCI Z PANELU (src/content/*.json)

   Panel zapisuje pliki sam, bez przeglądu kodu. Te testy pilnują styku
   panelu i strony: że formularze w public/admin/config.yml wskazują
   istniejące pliki i kategorie, że zdjęcia, na które wskazuje treść,
   leżą w repozytorium, i że pola pochodne (adresy, link tel:, godziny
   dla Google) liczą się poprawnie.
   ------------------------------------------------------------------ */

/* Lista plików przez import.meta.glob, a nie node:fs — testy przechodzą
   przez ten sam typecheck co aplikacja, która typów Node nie ma. */
const contentFiles = new Set(Object.keys(import.meta.glob("/src/content/*.json")));
const uploads = new Set(Object.keys(import.meta.glob("/public/uploads/*")));

describe("panel ↔ strona", () => {
  it("każdy plik edytowany w panelu istnieje", () => {
    const files = [...config.matchAll(/^\s+file: (\S+)$/gm)].map((m) => m[1]);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) expect(contentFiles.has(`/${file}`), file).toBe(true);
  });

  it("lista kategorii w panelu (Zakres prac) = kategorie katalogu", () => {
    const options = [...config.matchAll(/\{ label: [^,]+, value: ([a-z-]+) \}/g)].map((m) => m[1]);
    expect(options.sort()).toEqual(categories.map((c) => c.id).sort());
  });

  it("zdjęcia wgrane przez panel leżą w public/uploads", () => {
    const used = [
      images.heroBg,
      images.about,
      images.contact,
      ...offerAreas.map((a) => a.image),
      ...realizations.flatMap((r) => [r.cover, ...r.gallery]),
    ].filter((src) => src.startsWith("/uploads/"));
    for (const src of used) expect(uploads.has(`/public${src}`), src).toBe(true);
  });
});

describe("normalizacja treści", () => {
  it("adresy realizacji są unikalne i bez polskich znaków", () => {
    const slugs = realizations.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("slugify zamienia polskie litery, także „ł”", () => {
    expect(slugify("Dom w Będzinie")).toBe("dom-w-bedzinie");
    expect(slugify("Łódź – fasada (2026)")).toBe("lodz-fasada-2026");
  });

  it("powtórzony tytuł dostaje końcówkę zamiast zdublowanego adresu", () => {
    expect(uniqueSlugs(["a", "b", "a", "a"], (x) => x)).toEqual(["a", "b", "a-2", "a-3"]);
  });

  it("obszary oferty wskazują istniejące kategorie", () => {
    const known = new Set(categories.map((c) => c.id));
    for (const area of offerAreas) expect(known.has(area.categoryId), area.name).toBe(true);
  });

  it("liczba obszarów w nagłówku odmienia się po polsku", () => {
    expect(offerAreasCount(1)).toBe("Jeden obszar");
    expect(offerAreasCount(4)).toBe("Cztery obszary");
    expect(offerAreasCount(7)).toBe("Siedem obszarów");
    expect(offerAreasCount(12)).toBe("12 obszarów");
  });
});

describe("dane firmy", () => {
  it("link tel: powstaje z numeru wpisanego ze spacjami", () => {
    expect(company.phone.href).toMatch(/^tel:\+48\d{9}$/);
  });

  it("godziny dla Google w formacie schema.org", () => {
    for (const entry of company.openingHours) expect(entry).toMatch(/^(Mo-Fr|Sa) \d{2}:\d{2}-\d{2}:\d{2}$/);
  });
});

describe("zdjęcia z panelu", () => {
  it("na Netlify dostają warianty z Image CDN, lokalnie – samo src", () => {
    expect(responsiveSrcSet("/uploads/dom.jpg", false)).toBeUndefined();
    const srcSet = responsiveSrcSet("/uploads/dom.jpg", true);
    expect(srcSet).toContain("/.netlify/images?url=%2Fuploads%2Fdom.jpg&w=640 640w");
    expect(srcSet).toContain("w=2400 2400w");
  });
});
