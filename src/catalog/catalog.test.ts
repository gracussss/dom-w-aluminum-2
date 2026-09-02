import { describe, expect, it } from "vitest";
import { systems } from "./dataset";
import { taxonomy } from "./taxonomy";
import { countActiveFilters, selectSystems } from "./query";
import { explainSpec, explainSpecs } from "./glossary";
import { validateSource } from "./repository";
import type { AluSystem, SystemSpec } from "./types";

/* ------------------------------------------------------------------
   TESTY WARSTWY KATALOGU

   Testujemy to, co jest czyste i co niesie reguły biznesowe: silnik
   zapytań i walidator zbioru danych. Widoków nie testujemy — one tylko
   rysują to, co dostaną, a ich kształt zmienia się przy każdej iteracji
   projektu i testy stałyby się hamulcem zamiast siatką bezpieczeństwa.

   Najważniejszy test to ten pierwszy: pilnuje zasady, na której stoi
   cały projekt — żadnej wartości technicznej bez źródła.
   ------------------------------------------------------------------ */

describe("zbiór danych", () => {
  it("jest spójny — bez duplikatów, wiszących odnośników i wartości bez źródła", () => {
    expect(validateSource({ systems, taxonomy })).toEqual([]);
  });

  it("wyłapuje parametr wpisany bez podania źródła", () => {
    const broken: AluSystem = {
      ...systems[0],
      id: "test-bez-zrodla",
      slug: "test-bez-zrodla",
      relatedSystemIds: [],
      specs: [{ id: "uf", label: "Izolacyjność termiczna Uf", value: "0,9 W/(m²·K)", standard: null, source: null }],
    };

    const problems = validateSource({ systems: [broken], taxonomy });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("wartość bez źródła");
  });

  it("wyłapuje nieznanego producenta", () => {
    const broken: AluSystem = {
      ...systems[0],
      id: "test-obcy-producent",
      slug: "test-obcy-producent",
      relatedSystemIds: [],
      manufacturerId: "nie-istnieje",
    };

    expect(validateSource({ systems: [broken], taxonomy }).join(" ")).toContain("nieznany producent");
  });
});

describe("silnik zapytań", () => {
  it("bez filtrów zwraca cały katalog", () => {
    const result = selectSystems(systems, {}, taxonomy);
    expect(result.total).toBe(systems.length);
    expect(result.items).toHaveLength(systems.length);
  });

  it("filtruje po kategorii", () => {
    const result = selectSystems(systems, { categoryIds: ["okna"] }, taxonomy);
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((s) => s.categoryIds.includes("okna"))).toBe(true);
  });

  it("łączy filtry z różnych wymiarów przez koniunkcję", () => {
    const result = selectSystems(systems, { categoryIds: ["okna"], manufacturerIds: ["aluprof"] }, taxonomy);
    expect(result.items.every((s) => s.categoryIds.includes("okna") && s.manufacturerId === "aluprof")).toBe(true);
  });

  /* System bywa w kilku kategoriach naraz (MB-79N to okna i drzwi), więc
     alternatywa daje SUMĘ ZBIORÓW, a nie sumę liczników. Test pilnuje obu
     stron tej własności — i tego, że część systemów faktycznie się pokrywa. */
  it("łączy wartości w obrębie jednego wymiaru przez alternatywę", () => {
    const okna = selectSystems(systems, { categoryIds: ["okna"] }, taxonomy);
    const drzwi = selectSystems(systems, { categoryIds: ["drzwi"] }, taxonomy);
    const razem = selectSystems(systems, { categoryIds: ["okna", "drzwi"] }, taxonomy);

    const suma = new Set([...okna.items, ...drzwi.items].map((s) => s.id));
    expect(razem.total).toBe(suma.size);
    expect(razem.total).toBeLessThan(okna.total + drzwi.total);
    expect(razem.total).toBeGreaterThanOrEqual(Math.max(okna.total, drzwi.total));
  });

  it("szuka bez względu na wielkość liter i polskie znaki", () => {
    const wzorzec = selectSystems(systems, { search: "przesuwne" }, taxonomy).total;
    expect(selectSystems(systems, { search: "PRZESUWNE" }, taxonomy).total).toBe(wzorzec);
    expect(selectSystems(systems, { search: "przesuwné" }, taxonomy).total).toBe(wzorzec);
  });

  it("znajduje system po oznaczeniu producenta", () => {
    const result = selectSystems(systems, { search: "mb-86" }, taxonomy);
    expect(result.items.some((s) => s.slug === "mb-86n")).toBe(true);
  });

  it("liczby przy opcjach filtra pokazują wynik PO kliknięciu, nie stan bieżący", () => {
    const query = { categoryIds: ["okna"] };
    const facets = selectSystems(systems, query, taxonomy).facets;

    for (const option of facets.categories) {
      const afterClick = selectSystems(systems, { categoryIds: [option.id] }, taxonomy).total;
      expect(option.count).toBe(afterClick);
    }
  });

  it("wyłącza opcje, które nie dałyby żadnego wyniku", () => {
    const facets = selectSystems(systems, { manufacturerIds: ["aluprof"] }, taxonomy).facets;
    for (const option of facets.categories) {
      expect(option.disabled).toBe(option.count === 0);
    }
  });

  it("sortowanie „wg kategorii” trzyma porządek taksonomii, nie alfabet", () => {
    const items = selectSystems(systems, { sort: "category" }, taxonomy).items;
    const order = new Map(taxonomy.categories.map((c, i) => [c.id, i]));
    const positions = items.map((s) => order.get(s.categoryIds[0]) ?? -1);
    expect([...positions]).toEqual([...positions].sort((a, b) => a - b));
  });

  it("stronicowanie tnie wyniki, ale nie zmienia sumy", () => {
    const page = selectSystems(systems, { page: 2, pageSize: 5 }, taxonomy);
    expect(page.total).toBe(systems.length);
    expect(page.items).toHaveLength(Math.min(5, Math.max(0, systems.length - 5)));
  });

  it("liczy aktywne filtry ze wszystkich wymiarów, także po cechach", () => {
    expect(countActiveFilters({})).toBe(0);
    expect(
      countActiveFilters({ categoryIds: ["okna"], manufacturerIds: ["aluprof"], tagIds: ["rc2"] })
    ).toBe(3);
  });
});

describe("słownik parametrów", () => {
  const spec = (over: Partial<SystemSpec>): SystemSpec => ({
    id: "p1",
    label: "Parametr",
    value: null,
    standard: null,
    source: null,
    ...over,
  });

  it("rozpoznaje wielkość po numerze normy, niezależnie od zapisu producenta", () => {
    const zapisy = ["PN-EN 12208", "EN 12208", "PN-EN 12208:2001"];
    for (const standard of zapisy) {
      expect(explainSpec(spec({ standard }))?.id).toBe("watertightness");
    }
  });

  it("rozdziela Uf, Uw i Ud — to trzy różne wielkości, nie synonimy", () => {
    expect(explainSpec(spec({ value: "Uf > 0,83 W/(m2K)" }))?.id).toBe("uf");
    expect(explainSpec(spec({ value: "Uw od 0,62 W(m2K)" }))?.id).toBe("uw");
    expect(explainSpec(spec({ value: "UD od 1,1 W/(m2K)" }))?.id).toBe("ud");
  });

  it("milczy, gdy nie rozpoznaje parametru pewnie", () => {
    expect(explainSpec(spec({ label: "Maksymalny ciężar skrzydła", value: "160 kg" }))).toBeNull();
    /* Sama nazwa parametru nie wystarcza: ta sama wielkość występuje w zbiorze
       pod kilkoma nazwami, więc dopasowanie po tekście trafiałoby na oślep. */
    expect(explainSpec(spec({ label: "Wodoszczelność okien", value: "E 1950" }))).toBeNull();
  });

  it("nie powtarza wpisu, gdy karta podaje wielkość kilka razy", () => {
    const entries = explainSpecs([
      spec({ id: "p1", standard: "PN-EN 12207" }),
      spec({ id: "p2", standard: "EN 12207:2001" }),
      spec({ id: "p3", value: "Uw od 0,9" }),
    ]);

    expect(entries.map((e) => e.id)).toEqual(["air-permeability", "uw"]);
  });

  it("nie podaje skali klas, dopóki nie ma dla niej źródła", () => {
    const entry = explainSpec(spec({ standard: "PN-EN 12210" }));
    expect(entry?.scale).toBeNull();
  });
});
