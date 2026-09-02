import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Search, X } from "lucide-react";
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
import type { AluSystem, FacetOption, SortKey, SystemQuery, Taxonomy } from "../catalog";
import { positions, systemsWord } from "../lib/plural";

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

/** Ile pozycji pokazujemy na start i o ile dokłada przycisk. */
const PAGE = 24;

interface FilterRowProps {
  label: string;
  options: FacetOption[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

/**
 * Wiersz filtra. Każda opcja niesie liczbę wyników, jakie da po kliknięciu —
 * opcje prowadzące donikąd są wyłączone, więc nie da się kliknąć w pustkę.
 *
 * Cały wiersz znika, gdy nie ma czym filtrować: jedna opcja niczego nie
 * zawęża, a same zera znaczą, że danych po prostu jeszcze nie ma.
 */
function FilterRow({ label, options, onToggle, onClear }: FilterRowProps) {
  const anySelected = options.some((o) => o.selected);
  const usable = options.length > 1 && options.some((o) => o.count > 0);
  if (!usable) return null;

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
            <span className={`ml-2 tabular-nums ${option.selected ? "text-limestone/60" : "text-void/45"}`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Kategorie jako nawigacja, nie jako filtr. Przy siedmiu kategoriach
 * i osiemdziesięciu kilku systemach to one są pierwszym krokiem —
 * prowadzą na własne adresy, które da się podlinkować i zaindeksować.
 *
 * Siedem jednakowych kafli nie mówiło nic o tym, gdzie naprawdę jest oferta:
 * najliczniejsza kategoria ma pięć razy więcej pozycji niż najmniejsza,
 * a wyglądały tak samo. Trzy wiodące dostają duże pole z liczbą pozycji jako
 * numerałem, reszta zostaje kompaktowym rzędem. Podział wynika z danych,
 * nie z kolejności w taksonomii — po dołożeniu systemów sam się przestawi.
 *
 * Przy okazji oba rzędy wypełniają się na dużym ekranie równo (3 i 4
 * kolumny), czego siedem kafli w czterech kolumnach nie robiło.
 */
function CategoryNav({ taxonomy, counts }: { taxonomy: Taxonomy; counts: Map<string, number> }) {
  const entries = taxonomy.categories.map((category, order) => ({
    category,
    order,
    no: String(order + 1).padStart(2, "0"),
    count: counts.get(category.id) ?? 0,
  }));

  /* Remis rozstrzyga kolejność w taksonomii, żeby układ był powtarzalny. */
  const leadingIds = new Set(
    [...entries]
      .sort((a, b) => b.count - a.count || a.order - b.order)
      .slice(0, 3)
      .map((entry) => entry.category.id)
  );
  const leading = entries.filter((entry) => leadingIds.has(entry.category.id));
  const rest = entries.filter((entry) => !leadingIds.has(entry.category.id));

  /* Siatka na obramowaniach, nie na tle z odstępami: brakująca komórka
     w ostatnim rzędzie nie zostawia wtedy pustego szarego prostokąta. */
  const cell =
    "group flex flex-col justify-between border-b border-r border-void/12 transition-colors duration-500 hover:bg-void";

  return (
    <nav aria-label="Kategorie systemów">
      {/* Kategorie wiodące */}
      <div className="grid grid-cols-1 border-l border-t border-void/12 sm:grid-cols-2 lg:grid-cols-3">
        {leading.map(({ category, no, count }) => (
          <Link
            key={category.id}
            to={`/systemy/kategoria/${category.slug}`}
            /* Na telefonie kafle stoją jeden pod drugim — pełna wysokość
               zostawiałaby w środku martwe pole i spychała resztę kategorii
               poza ekran. Waga typograficzna niesie hierarchię i bez niej. */
            className={`${cell} min-h-[148px] p-5 sm:min-h-[190px] md:min-h-[220px] md:p-6`}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="label text-void/60 transition-colors duration-500 group-hover:text-bronze-light">
                {no}
              </span>
              <div className="text-right">
                <span className="display block text-4xl leading-none text-void/50 transition-colors duration-500 group-hover:text-bronze-light md:text-5xl">
                  {count}
                </span>
                <span className="label-sm mt-1.5 block text-void/60 transition-colors duration-500 group-hover:text-limestone/60">
                  {positions(count)}
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-4">
              <h3 className="display text-2xl leading-none tracking-[-0.03em] text-void transition-colors duration-500 group-hover:text-limestone md:text-[28px]">
                {category.name}
              </h3>
              <ArrowUpRight
                className="h-5 w-5 shrink-0 text-void/40 transition-all duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-bronze-light"
                strokeWidth={1.3}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Pozostałe — ten sam kafel, mniejsza waga */}
      <div className="grid grid-cols-1 border-l border-void/12 sm:grid-cols-2 lg:grid-cols-4">
        {rest.map(({ category, no, count }) => (
          <Link
            key={category.id}
            to={`/systemy/kategoria/${category.slug}`}
            className={`${cell} min-h-[132px] p-5 md:p-6`}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="label text-void/60 transition-colors duration-500 group-hover:text-bronze-light">
                {no}
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-void/40 transition-all duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-bronze-light"
                strokeWidth={1.4}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-tight tracking-[-0.02em] text-void transition-colors duration-500 group-hover:text-limestone">
                {category.name}
              </h3>
              <span className="label-sm mt-1.5 block text-void/60 transition-colors duration-500 group-hover:text-limestone/60">
                {count} {positions(count)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
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
      tagIds: params.getAll(PARAM.tag),
      sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : DEFAULT_SORT,
    };
  }, [params]);

  const taxonomyState = useTaxonomy();
  const listState = useSystems(query);

  /* Liczniki przy nawigacji mają pokazywać zawartość kategorii, a nie
     zawartość kategorii po nałożeniu filtrów — stąd osobne zapytanie. */
  const allState = useSystems();

  /* Doładowywanie: nowy zestaw filtrów zaczyna od pierwszej porcji. */
  const key = JSON.stringify(query);
  const [visible, setVisible] = useState(PAGE);
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setVisible(PAGE);
  }

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params);
      mutate(next);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const toggle = useCallback(
    (key2: string, id: string) =>
      update((next) => {
        const current = next.getAll(key2);
        next.delete(key2);
        for (const value of current) {
          if (value !== id) next.append(key2, value);
        }
        if (!current.includes(id)) next.append(key2, id);
      }),
    [update]
  );

  const clear = useCallback((key2: string) => update((next) => next.delete(key2)), [update]);

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

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const option of allState.data?.facets.categories ?? []) counts.set(option.id, option.count);
    return counts;
  }, [allState.data]);

  /* Widoczna porcja wyników — reszta czeka na przycisk. */
  const shown: AluSystem[] = useMemo(() => (list ? list.items.slice(0, visible) : []), [list, visible]);

  /**
   * Nagłówki kategorii mają sens tylko wtedy, gdy patrzymy na cały katalog.
   * Przy aktywnym filtrze kategorii lista idzie płasko — system bywa
   * przypisany do kilku kategorii i nagłówek „Okna” nad wynikiem
   * filtrowania po drzwiach wprowadzałby w błąd.
   */
  const grouped = query.sort === "category" && (query.categoryIds ?? []).length === 0;

  const sections = useMemo(() => {
    if (!taxonomy) return [];

    if (grouped) {
      let n = 0;
      return groupByCategory(shown, taxonomy)
        .map(({ category, items }) => ({
          id: category.id,
          title: category.name,
          /* Grupujemy po kategorii wiodącej, żeby system nie powtórzył się
             w dwóch sekcjach i numeracja zgadzała się z licznikiem. */
          items: items
            .filter((s) => s.categoryIds[0] === category.id)
            .map((system) => ({ system, no: String(++n).padStart(2, "0") })),
        }))
        .filter((section) => section.items.length > 0);
    }

    return [
      {
        id: "all",
        title: "Wyniki",
        items: shown.map((system, i) => ({ system, no: String(i + 1).padStart(2, "0") })),
      },
    ];
  }, [shown, taxonomy, grouped]);

  const activeCount = countActiveFilters(query);
  const searchValue = params.get(PARAM.search) ?? "";
  const total = list?.total ?? 0;
  const manyManufacturers = (taxonomy?.manufacturers.length ?? 0) > 1;

  return (
    <>
      <Seo
        title="Katalog systemów aluminiowych ALUPROF"
        description="Okna, drzwi, konstrukcje przesuwne, fasady, ściany wewnętrzne i systemy przeciwpożarowe ALUPROF. Katalog z wyszukiwarką, filtrami i kartą techniczną każdego systemu."
        canonicalPath="/systemy"
      />
      <PageHero
        eyebrow="Katalog"
        title="Systemy aluminiowe"
        description="Systemy ALUPROF w podziale na kategorie oferty producenta. Parametry pochodzą z kart systemów — przy każdej wartości podajemy źródło."
        variant="index"
      />

      <section className="bg-limestone py-14 text-void md:py-20">
        <div className="container-edge">
          {/* Kategorie — pierwszy krok, przed filtrami */}
          {taxonomy && <CategoryNav taxonomy={taxonomy} counts={categoryCounts} />}

          {/* Wyszukiwarka */}
          <div className="mt-12 flex items-center gap-3 border border-void/15 px-4 py-3.5 md:px-5">
            <Search className="h-4 w-4 shrink-0 text-void/60" strokeWidth={1.5} />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj systemu — np. MB-86N, przesuwne, przeciwpożarowe…"
              aria-label="Szukaj systemu"
              className="w-full bg-transparent text-[15px] text-void outline-none placeholder:text-void/60"
            />
            {searchValue && (
              <button onClick={() => setSearch("")} aria-label="Wyczyść" className="text-void/60 hover:text-void">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Filtry — budowane z facetów; puste wymiary same się chowają */}
          {taxonomy && list && (
            <div className="mt-8 border-t border-void/12">
              <FilterRow
                label="Kategoria"
                options={list.facets.categories}
                onToggle={(id) => toggle(PARAM.category, id)}
                onClear={() => clear(PARAM.category)}
              />
              {manyManufacturers && (
                <FilterRow
                  label="Producent"
                  options={list.facets.manufacturers}
                  onToggle={(id) => toggle(PARAM.manufacturer, id)}
                  onClear={() => clear(PARAM.manufacturer)}
                />
              )}
              <FilterRow
                label="Typ konstrukcji"
                options={list.facets.constructionTypes}
                onToggle={(id) => toggle(PARAM.construction, id)}
                onClear={() => clear(PARAM.construction)}
              />
              <FilterRow
                label="Cechy"
                options={list.facets.tags}
                onToggle={(id) => toggle(PARAM.tag, id)}
                onClear={() => clear(PARAM.tag)}
              />
              <FilterRow
                label="Zastosowanie"
                options={list.facets.applications}
                onToggle={(id) => toggle(PARAM.application, id)}
                onClear={() => clear(PARAM.application)}
              />
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <p className="label text-void/70" role="status" aria-live="polite">
              {total} {systemsWord(total)}
              {activeCount > 0 && ` · filtry: ${activeCount}`}
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2.5">
                <span className="label text-void/70">Sortuj</span>
                {/* `appearance-none` zdejmuje własną chromę przeglądarki.
                    Bez tego Chrome rysował jasnoszare pole ze swoją strzałką —
                    jedyny element na stronie w obcej konwencji, stojący tuż
                    obok pigułek filtrów. Strzałkę rysujemy sami. */}
                <span className="relative inline-flex items-center">
                  <select
                    value={query.sort ?? DEFAULT_SORT}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="label appearance-none border border-void/18 bg-transparent py-2 pl-3 pr-9 text-void/80 outline-none transition-colors hover:border-void/50 focus-visible:border-void"
                  >
                    {SORT_KEYS.filter((k) => k !== "manufacturer" || manyManufacturers).map((key2) => (
                      <option key={key2} value={key2}>
                        {SORT_LABELS[key2]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden
                    className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-void/60"
                    strokeWidth={1.6}
                  />
                </span>
              </label>

              {(activeCount > 0 || searchValue) && (
                <button onClick={resetAll} className="label text-void/70 underline underline-offset-4 hover:text-void">
                  Wyczyść filtry
                </button>
              )}
              <PlaceholderTag label="Zdjęcia poglądowe" tone="light" />
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
            <>
              <div className="mt-12">
                {sections.map((section) => (
                  <Reveal key={section.id} className="mt-16 first:mt-0">
                    <div className="flex items-baseline justify-between gap-6 border-b border-void/30 pb-3.5">
                      <h2 className="label text-[13px] text-void">{section.title}</h2>
                      <span className="label text-void/70">
                        {section.items.length} {positions(section.items.length)}
                      </span>
                    </div>

                    <ul>
                      {section.items.map(({ system, no }) => (
                        <SystemRow
                          key={system.id}
                          system={system}
                          no={no}
                          taxonomy={taxonomy!}
                          showManufacturer={manyManufacturers}
                        />
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>

              {visible < total && (
                <div className="mt-12 flex flex-col items-center gap-3">
                  <button
                    onClick={() => setVisible((v) => v + PAGE)}
                    className="border border-void px-8 py-4 label text-void transition-colors hover:bg-void hover:text-limestone"
                  >
                    Pokaż kolejne systemy
                  </button>
                  <span className="label-sm text-void/60">
                    {Math.min(visible, total)} z {total}
                  </span>
                </div>
              )}
            </>
          )}

          <p className="mt-14 max-w-3xl text-xs leading-relaxed text-void/70">{DATA_DISCLAIMER}</p>
        </div>
      </section>
    </>
  );
}
