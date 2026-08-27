import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Seo } from "../components/Seo";
import { PageHero } from "../components/ui/PageHero";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { Reveal } from "../components/ui/Reveal";
import { SystemRow } from "../components/catalog/SystemRow";
import {
  DATA_DISCLAIMER,
  DEFAULT_SORT,
  SORT_LABELS,
  countActiveFilters,
  groupByCategory,
  useSystems,
  useTaxonomy,
} from "../catalog";
import type { FacetOption, SortKey, SystemQuery } from "../catalog";

/* ------------------------------------------------------------------
   Stan katalogu żyje w adresie URL — komplet filtrów, fraza i sortowanie.
   Dzięki temu przefiltrowany widok da się wysłać linkiem, a powrót
   z karty systemu odtwarza dokładnie to, co użytkownik miał na ekranie.
   ------------------------------------------------------------------ */

const PARAM = {
  category: "kategoria",
  manufacturer: "producent",
  application: "zastosowanie",
  construction: "konstrukcja",
  tag: "cecha",
  search: "q",
  sort: "sort",
} as const;

const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[];

function positions(n: number) {
  if (n === 1) return "pozycja";
  return n < 5 ? "pozycje" : "pozycji";
}

function results(n: number) {
  if (n === 1) return "system";
  return n < 5 ? "systemy" : "systemów";
}

interface FilterRowProps {
  label: string;
  options: FacetOption[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

/**
 * Wiersz filtra. Każda opcja niesie liczbę wyników, jakie da po kliknięciu —
 * opcje prowadzące donikąd są wyłączone, więc nie da się kliknąć w pustkę.
 */
function FilterRow({ label, options, onToggle, onClear }: FilterRowProps) {
  const anySelected = options.some((o) => o.selected);

  return (
    <div
      role="group"
      aria-label={label}
      className="grid gap-3 border-b border-void/12 py-5 md:grid-cols-[150px_1fr] md:items-baseline md:gap-6"
    >
      <span className="label text-void/70" aria-hidden>
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onClear}
          aria-pressed={!anySelected}
          className={`border px-4 py-2 label transition-colors duration-300 ${
            anySelected
              ? "border-void/18 text-void/70 hover:border-void/50 hover:text-void"
              : "border-void bg-void text-limestone"
          }`}
        >
          Wszystkie
        </button>

        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            aria-pressed={option.selected}
            disabled={option.disabled && !option.selected}
            className={`border px-4 py-2 label transition-colors duration-300 ${
              option.selected
                ? "border-void bg-void text-limestone"
                : option.disabled
                  ? "cursor-not-allowed border-void/10 text-void/30"
                  : "border-void/18 text-void/70 hover:border-void/50 hover:text-void"
            }`}
          >
            {option.name}
            <span className={`ml-2 tabular-nums ${option.selected ? "text-limestone/70" : "text-void/70"}`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Systemy() {
  const [params, setParams] = useSearchParams();

  /* Zapytanie odczytane z adresu — jedyne źródło prawdy o stanie widoku. */
  const query = useMemo<SystemQuery>(() => {
    const sort = params.get(PARAM.sort);
    return {
      search: params.get(PARAM.search) ?? undefined,
      categoryIds: params.getAll(PARAM.category),
      manufacturerIds: params.getAll(PARAM.manufacturer),
      applicationIds: params.getAll(PARAM.application),
      constructionTypeIds: params.getAll(PARAM.construction),
      /* Bez tej linii filtr cech zapisywał się do adresu i nic nie robił —
         zapytanie nigdy go nie widziało. */
      tagIds: params.getAll(PARAM.tag),
      sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : DEFAULT_SORT,
    };
  }, [params]);

  const taxonomyState = useTaxonomy();
  const listState = useSystems(query);

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params);
      mutate(next);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const toggle = useCallback(
    (key: string, id: string) =>
      update((next) => {
        const current = next.getAll(key);
        next.delete(key);
        for (const value of current) {
          if (value !== id) next.append(key, value);
        }
        if (!current.includes(id)) next.append(key, id);
      }),
    [update]
  );

  const clear = useCallback((key: string) => update((next) => next.delete(key)), [update]);

  const setSearch = useCallback(
    (value: string) =>
      update((next) => {
        if (value) next.set(PARAM.search, value);
        else next.delete(PARAM.search);
      }),
    [update]
  );

  const setSort = useCallback(
    (value: SortKey) =>
      update((next) => {
        if (value === DEFAULT_SORT) next.delete(PARAM.sort);
        else next.set(PARAM.sort, value);
      }),
    [update]
  );

  const resetAll = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const taxonomy = taxonomyState.data;
  const list = listState.data;

  /**
   * Wyniki jako indeks techniczny: przy sortowaniu „wg kategorii” pozycje
   * grupują się nagłówkami, przy pozostałych układają się w jedną listę.
   * Numeracja jest ciągła przez cały zestaw wyników.
   */
  const sections = useMemo(() => {
    if (!list || !taxonomy) return [];

    if (query.sort === "category") {
      let n = 0;
      return groupByCategory(list.items, taxonomy).map(({ category, items }) => ({
        id: category.id,
        title: category.name,
        items: items.map((system) => ({ system, no: String(++n).padStart(2, "0") })),
      }));
    }

    return [
      {
        id: "all",
        title: SORT_LABELS[query.sort ?? DEFAULT_SORT],
        items: list.items.map((system, i) => ({
          system,
          no: String(i + 1).padStart(2, "0"),
        })),
      },
    ];
  }, [list, taxonomy, query.sort]);

  const activeCount = countActiveFilters(query);
  const searchParam = params.get(PARAM.search) ?? "";
  const total = list?.total ?? 0;

  /* ----------------------------------------------------------------
     Pole wyszukiwania pisze do adresu z opóźnieniem.

     Wcześniej każda litera przepisywała URL i przeliczała facety —
     „przesuwne" to dziesięć przeliczeń całego katalogu. Teraz w polu
     żyje własny stan, a adres (czyli to, co da się wysłać linkiem)
     dogania go po 250 ms ciszy.
     ---------------------------------------------------------------- */
  const [searchDraft, setSearchDraft] = useState(searchParam);
  /** Ostatnia fraza, którą brudnopis i adres miały wspólną. */
  const [syncedSearch, setSyncedSearch] = useState(searchParam);

  // Zmiana z zewnątrz („Wyczyść filtry", przycisk wstecz) wygrywa z brudnopisem.
  if (searchParam !== syncedSearch) {
    setSyncedSearch(searchParam);
    setSearchDraft(searchParam);
  }

  useEffect(() => {
    if (searchDraft === syncedSearch) return;
    const id = window.setTimeout(() => {
      setSyncedSearch(searchDraft);
      setSearch(searchDraft);
    }, 250);
    return () => window.clearTimeout(id);
  }, [searchDraft, syncedSearch, setSearch]);

  return (
    <>
      <Seo
        title="Katalog systemów aluminiowych"
        description="Systemy okienne, drzwiowe, przesuwne, fasadowe i przeciwpożarowe — z filtrowaniem po producencie, kategorii, zastosowaniu i typie konstrukcji."
        /* Filtry żyją w zapytaniu (?producent=…). Każde ich ustawienie to ten sam
           zbiór treści, więc kanoniczny pozostaje adres katalogu bez parametrów. */
        canonicalPath="/systemy"
      />
      <PageHero
        eyebrow="Katalog"
        title="Systemy aluminiowe"
        description="Zestawienie systemów w podziale na kategorie i zastosowania. Karty techniczne uzupełniamy w miarę potwierdzania danych u producentów."
      />

      <section className="bg-limestone py-14 text-void md:py-20">
        <div className="container-edge">
          {/* Wyszukiwarka */}
          <div className="flex items-center gap-3 border border-void/15 px-4 py-3.5 md:px-5">
            <Search className="h-4 w-4 shrink-0 text-void/60" strokeWidth={1.5} />
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Szukaj systemu…"
              aria-label="Szukaj systemu"
              className="w-full bg-transparent text-[15px] text-void outline-none placeholder:text-void/60"
            />
            {searchDraft && (
              <button
                onClick={() => setSearchDraft("")}
                aria-label="Wyczyść wyszukiwanie"
                className="-m-2 p-2 text-void/60 hover:text-void"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Filtry — budowane z facetów zwróconych przez repozytorium */}
          {taxonomy && list && (
            <div className="mt-8 border-t border-void/12">
              <FilterRow
                label="Kategoria"
                options={list.facets.categories}
                onToggle={(id) => toggle(PARAM.category, id)}
                onClear={() => clear(PARAM.category)}
              />
              <FilterRow
                label="Producent"
                options={list.facets.manufacturers}
                onToggle={(id) => toggle(PARAM.manufacturer, id)}
                onClear={() => clear(PARAM.manufacturer)}
              />
              <FilterRow
                label="Zastosowanie"
                options={list.facets.applications}
                onToggle={(id) => toggle(PARAM.application, id)}
                onClear={() => clear(PARAM.application)}
              />
              <FilterRow
                label="Typ konstrukcji"
                options={list.facets.constructionTypes}
                onToggle={(id) => toggle(PARAM.construction, id)}
                onClear={() => clear(PARAM.construction)}
              />
              {/* Filtr cech pojawi się, gdy taksonomia tagów zostanie uzupełniona */}
              {list.facets.tags.length > 0 && (
                <FilterRow
                  label="Cechy"
                  options={list.facets.tags}
                  onToggle={(id) => toggle(PARAM.tag, id)}
                  onClear={() => clear(PARAM.tag)}
                />
              )}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <p className="label text-void/70" role="status" aria-live="polite">
              {total} {results(total)}
              {activeCount > 0 && ` · filtry: ${activeCount}`}
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2.5">
                <span className="label text-void/70">Sortuj</span>
                <select
                  value={query.sort ?? DEFAULT_SORT}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="label border border-void/18 bg-transparent px-3 py-2 text-void/80 outline-none transition-colors hover:border-void/50 focus-visible:border-void"
                >
                  {SORT_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>

              {(activeCount > 0 || searchDraft) && (
                <button onClick={resetAll} className="label text-void/70 underline underline-offset-4 hover:text-void">
                  Wyczyść filtry
                </button>
              )}
              {/* Jedna etykieta na całą listę zamiast znacznika przy każdej pozycji */}
              <PlaceholderTag
                label="Zdjęcia poglądowe"
                className="border-void/15 bg-transparent text-void/70 backdrop-blur-none"
              />
            </div>
          </div>

          {/* Wyniki — indeks techniczny, nie siatka kart */}
          {listState.error ? (
            <p className="mt-16 text-center text-void/70">
              Nie udało się wczytać katalogu. Odśwież stronę lub spróbuj ponownie później.
            </p>
          ) : listState.loading && !list ? (
            <p className="mt-16 text-center text-void/70">Wczytywanie katalogu…</p>
          ) : total === 0 ? (
            <p className="mt-16 text-center text-void/70">Brak systemów spełniających wybrane kryteria.</p>
          ) : (
            <div className="mt-12">
              {sections.map((section) => (
                <Reveal key={section.id} className="mt-16 first:mt-0">
                  {/* Nagłówek sekcji — znacznik w monospace, nie tytuł
                      konkurujący z nazwami systemów. Hierarchia: marker → pozycje. */}
                  {/* Nagłówek dla czytnika mówi, czym jest lista; na ekranie
                      zostaje sam marker, żeby nie konkurował z nazwami systemów. */}
                  <h2 className="sr-only">
                    {query.sort === "category"
                      ? `Kategoria: ${section.title}`
                      : `Wyniki — ${section.title}`}
                  </h2>
                  <div className="flex items-baseline justify-between gap-6 border-b border-void/30 pb-3.5">
                    <p className="label text-[13px] text-void" aria-hidden>
                      {section.title}
                    </p>
                    <span className="label text-void/70">
                      {section.items.length} {positions(section.items.length)}
                    </span>
                  </div>

                  <ul>
                    {section.items.map(({ system, no }) => (
                      <SystemRow key={system.id} system={system} no={no} taxonomy={taxonomy!} />
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          )}

          <p className="mt-14 max-w-3xl text-xs leading-relaxed text-void/70">{DATA_DISCLAIMER}</p>
        </div>
      </section>
    </>
  );
}
