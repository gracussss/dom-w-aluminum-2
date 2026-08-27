import { describe, expect, it } from "vitest";
import { systems } from "./dataset";
import { taxonomy } from "./taxonomy";
import { countActiveFilters, selectSystems } from "./query";
import { hasMeasuredGeometry, parseMillimetres, systemGeometry } from "./geometry";
import { validateSource } from "./repository";
import type { AluSystem } from "./types";

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
    expect(result.items.every((s) => s.categoryId === "okna")).toBe(true);
  });

  it("łączy filtry z różnych wymiarów przez koniunkcję", () => {
    const result = selectSystems(systems, { categoryIds: ["okna"], manufacturerIds: ["aluprof"] }, taxonomy);
    expect(result.items.every((s) => s.categoryId === "okna" && s.manufacturerId === "aluprof")).toBe(true);
  });

  it("łączy wartości w obrębie jednego wymiaru przez alternatywę", () => {
    const okna = selectSystems(systems, { categoryIds: ["okna"] }, taxonomy).total;
    const drzwi = selectSystems(systems, { categoryIds: ["drzwi"] }, taxonomy).total;
    const razem = selectSystems(systems, { categoryIds: ["okna", "drzwi"] }, taxonomy).total;
    expect(razem).toBe(okna + drzwi);
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
    const positions = items.map((s) => order.get(s.categoryId) ?? -1);
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

/* ------------------------------------------------------------------
   GEOMETRIA DLA SCENY 3D

   Prezentacja produktu pokazuje wymiar tylko wtedy, gdy producent podał
   go jednoznacznie i ze źródłem. Te testy pilnują, żeby do sceny nie
   przeciekła wartość brzegowa, zakres ani liczba bez źródła.
   ------------------------------------------------------------------ */

describe("geometria z parametrów", () => {
  it("czyta jednoznaczny wymiar w milimetrach", () => {
    expect(parseMillimetres("86 mm")).toBeCloseTo(0.086);
    expect(parseMillimetres("104,5 mm")).toBeCloseTo(0.1045);
  });

  it("odrzuca zakresy, wartości brzegowe i inne jednostki", () => {
    for (const value of ["od 62 mm", "62-86 mm", "> 83 mm", "86", "8,6 cm", "", null]) {
      expect(parseMillimetres(value)).toBeNull();
    }
  });

  it("MB-86N ma głębokość zabudowy gotową do zbudowania modelu", () => {
    const mb86 = systems.find((s) => s.id === "mb-86n");
    const geometry = systemGeometry(mb86!);

    expect(geometry.depth).toBeCloseTo(0.086);
    expect(geometry.depthLabel).toBe("86 mm");
    expect(geometry.depthSource?.url).toContain("aluprof.com");
  });

  it("nie buduje wymiaru z parametru bez źródła", () => {
    const broken = {
      ...systems[0],
      specs: [{ id: "depth", label: "Głębokość zabudowy", value: "86 mm", standard: null, source: null }],
    };

    expect(systemGeometry(broken).depth).toBeNull();
    expect(hasMeasuredGeometry(broken)).toBe(false);
  });

  it("system bez podanej głębokości nie dostaje prezentacji z wymiarem", () => {
    const mb104 = systems.find((s) => s.id === "mb-104-passive");
    expect(hasMeasuredGeometry(mb104!)).toBe(false);
  });
});
