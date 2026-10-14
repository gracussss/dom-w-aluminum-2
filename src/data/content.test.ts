import config from "../../public/admin/config.yml?raw";
import { describe, expect, it } from "vitest";
import { categories, constructionTypes, tags } from "../catalog/taxonomy";
import { systems } from "../catalog/dataset";
import { slugify, uniqueSlugs } from "../lib/content";
import { responsiveSrcSet } from "../lib/responsiveImage";
import { company } from "./company";
import { images } from "./images";
import { offerAreas, offerAreasCount } from "./products";
import { realizations } from "./realizations";
import { buildHomeContent, homeContent, STORY_STEPS } from "./pages";
import { buildCompany } from "./company";
import { headingLines } from "../lib/content";
import { countInWords } from "../lib/plural";

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
const contentFiles = new Set(Object.keys(import.meta.glob("/src/content/**/*.json")));
const uploads = new Set(Object.keys(import.meta.glob("/public/uploads/*")));

describe("panel ↔ strona", () => {
  it("każdy plik edytowany w panelu istnieje", () => {
    const files = [...config.matchAll(/^\s+file: (\S+)$/gm)].map((m) => m[1]);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) expect(contentFiles.has(`/${file}`), file).toBe(true);
  });

  /** Wartości listy wyboru zakotwiczonej w config.yml jako `&nazwa`. */
  function anchoredOptions(anchor: string): string[] {
    const start = config.indexOf(`&${anchor}`);
    expect(start, anchor).toBeGreaterThan(-1);
    const block = config.slice(start).split("\n").slice(1);
    const values: string[] = [];
    for (const line of block) {
      const match = /^\s+- \{ label: [^,]+, value: ([a-z-]+) \}$/.exec(line);
      if (!match) break;
      values.push(match[1]);
    }
    return values.sort();
  }

  it("listy wyboru w panelu = taksonomia katalogu", () => {
    expect(anchoredOptions("categoryOptions")).toEqual(categories.map((c) => c.id).sort());
    expect(anchoredOptions("constructionOptions")).toEqual(constructionTypes.map((c) => c.id).sort());
    expect(anchoredOptions("tagOptions")).toEqual(tags.map((t) => t.id).sort());
  });

  it("każdy system z panelu wskazuje istniejące kategorie, typ i cechy", () => {
    const known = {
      categories: new Set(categories.map((c) => c.id)),
      types: new Set(constructionTypes.map((c) => c.id)),
      tags: new Set(tags.map((t) => t.id)),
    };
    for (const system of systems) {
      for (const id of system.categoryIds) expect(known.categories.has(id), `${system.id}: ${id}`).toBe(true);
      expect(known.types.has(system.constructionTypeId), system.id).toBe(true);
      for (const id of system.tagIds) expect(known.tags.has(id), `${system.id}: ${id}`).toBe(true);
    }
  });

  it("zdjęcia wgrane przez panel leżą w public/uploads", () => {
    const used = [
      images.heroBg,
      images.about,
      images.contact,
      ...offerAreas.map((a) => a.image),
      ...realizations.flatMap((r) => [r.cover, ...r.gallery]),
      ...systems.map((s) => s.media.hero.src),
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

describe("teksty stron", () => {
  it("nagłówek z panelu: wiersz = linia, gwiazdki = kursywa", () => {
    expect(headingLines("Aluminium daje\n*smukłość*\n\n  materiał. ")).toEqual([
      { text: "Aluminium daje", accent: false },
      { text: "smukłość", accent: true },
      { text: "materiał.", accent: false },
    ]);
  });

  it("sekwencja 3D ma zawsze tyle kroków, ile ujęć kamery", () => {
    expect(homeContent.story.steps).toHaveLength(STORY_STEPS);
    expect(buildHomeContent({ story: { steps: [{ title: "Jeden" }] } }).story.steps).toHaveLength(STORY_STEPS);
    expect(buildHomeContent({}).hero.title.length).toBeGreaterThan(0);
  });

  it("liczba etapów słownie", () => {
    expect(countInWords(6, "etap", "etapy", "etapów")).toBe("Sześć etapów");
    expect(countInWords(3, "etap", "etapy", "etapów")).toBe("Trzy etapy");
  });
});

describe("dane prawne", () => {
  it("puste pola rejestrowe = null (placeholder w polityce), wypełnione — przechodzą", () => {
    expect(buildCompany({}).legal).toEqual({ nip: null, regon: null, krs: null, privacyEmail: null });
    expect(buildCompany({ nip: "644-123-45-67", privacyEmail: "rodo@firma.pl" }).legal.nip).toBe("644-123-45-67");
    expect(buildCompany({ privacyEmail: "zly-adres" }).legal.privacyEmail).toBeNull();
  });
});
