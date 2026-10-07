import { describe, expect, it } from "vitest";
import { buildTitle, SITE_NAME } from "./seo";
import { SIZES_FULL, responsiveSrcSet } from "./responsiveImage";
import { breadcrumbJsonLd, itemListJsonLd } from "./jsonLd";

describe("tytuły podstron", () => {
  it("dokleja markę na końcu", () => {
    expect(buildTitle("Kontakt i wycena")).toBe(`Kontakt i wycena – ${SITE_NAME}`);
  });

  it("nie powtarza marki dwa razy na stronie głównej", () => {
    expect(buildTitle(SITE_NAME)).toBe(SITE_NAME);
  });

  it("mieści się w 60 znakach dla najdłuższego tytułu w mapie treści", () => {
    // Najdłuższy realny przypadek: karta systemu z potwierdzonym oznaczeniem.
    expect(buildTitle("MB-104 Passive · system aluminiowy ALUPROF").length).toBeLessThanOrEqual(60);
  });
});

describe("zdjęcia w kilku szerokościach", () => {
  const remote = "https://images.unsplash.com/photo-123?w=1600&q=80&auto=format&fit=crop";

  it("buduje srcSet dla materiału zdalnego", () => {
    const set = responsiveSrcSet(remote);
    expect(set).toBeDefined();
    expect(set).toContain("640w");
  });

  it("nie proponuje szerokości większej niż deklarowana w adresie", () => {
    const set = responsiveSrcSet(remote) ?? "";
    const widths = [...set.matchAll(/ (\d+)w/g)].map((m) => Number(m[1]));
    expect(Math.max(...widths)).toBeLessThanOrEqual(1600);
  });

  it("dla plików własnych firmy zwraca undefined – przeglądarka bierze samo src", () => {
    expect(responsiveSrcSet("/zdjecia/realizacja-01.webp")).toBeUndefined();
  });

  it("nie tworzy srcSet z jednej szerokości – taki wybór niczego nie wnosi", () => {
    expect(responsiveSrcSet("https://images.unsplash.com/photo-123?w=400")).toBeUndefined();
  });

  it("kadry pełnoekranowe deklarują 100vw", () => {
    expect(SIZES_FULL).toBe("100vw");
  });
});

describe("dane strukturalne", () => {
  const origin = "https://przyklad.pl";

  it("ścieżka nawigacyjna numeruje pozycje od 1 i pomija adres pozycji bieżącej", () => {
    const data = breadcrumbJsonLd(
      [{ label: "Systemy", to: "/systemy" }, { label: "Okna", to: "/systemy/kategoria/okna" }, { label: "MB-86N" }],
      origin
    );

    expect(data.itemListElement).toHaveLength(3);
    expect(data.itemListElement[0]).toMatchObject({ position: 1, item: `${origin}/systemy` });
    expect(data.itemListElement[2]).not.toHaveProperty("item");
  });

  it("lista pozycji podaje nazwę i adres, bez marki i parametrów", () => {
    const data = itemListJsonLd([{ name: "MB-86N", path: "/systemy/mb-86n" }], "Okna");
    expect(data.numberOfItems).toBe(1);
    expect(Object.keys(data.itemListElement[0])).toEqual(["@type", "position", "name", "url"]);
  });
});
