import { useEffect, useMemo, useState } from "react";
import { useCatalogRepository } from "./context";
import type { AluSystem, SystemListResult, SystemQuery, Taxonomy } from "./types";

/* ------------------------------------------------------------------
   HOOKI KATALOGU

   Jedyny sposób, w jaki widoki sięgają po dane. Zawsze zwracają
   ten sam kształt: { data, loading, error }. Widok napisany raz
   działa i na danych lokalnych, i na zdalnych.
   ------------------------------------------------------------------ */

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function resolved<T>(data: T): AsyncState<T> {
  return { data, loading: false, error: null };
}

function pending<T>(previous: T | null = null): AsyncState<T> {
  return { data: previous, loading: true, error: null };
}

function toError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}

/**
 * Wspólny szkielet: jeśli źródło potrafi odpowiedzieć synchronicznie
 * (`peek`), bierzemy wynik od razu i nie pokazujemy stanu ładowania.
 * W przeciwnym razie klasyczny cykl z anulowaniem po odmontowaniu.
 */
function useAsync<T>(
  peek: () => T | undefined,
  load: () => Promise<T>,
  deps: unknown[]
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>(() => {
    const immediate = peek();
    return immediate === undefined ? pending<T>() : resolved(immediate);
  });

  /* Lista zależności przychodzi z zewnątrz — linter nie potrafi jej odczytać
     w wywołaniu generycznym, a każdy hook przekazuje tu komplet swoich. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const immediate = peek();
    if (immediate !== undefined) {
      setState(resolved(immediate));
      return;
    }

    let cancelled = false;
    setState((previous) => pending(previous.data));

    load()
      .then((data) => {
        if (!cancelled) setState(resolved(data));
      })
      .catch((cause: unknown) => {
        if (!cancelled) setState({ data: null, loading: false, error: toError(cause) });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function useTaxonomy(): AsyncState<Taxonomy> {
  const repository = useCatalogRepository();
  return useAsync(
    () => repository.peekTaxonomy?.(),
    () => repository.getTaxonomy(),
    [repository]
  );
}

const EMPTY_QUERY: SystemQuery = {};

/**
 * Lista systemów wraz z facetami. Zapytanie identyfikowane przez swoją
 * treść, nie przez tożsamość obiektu — dzięki temu wywołanie
 * `useSystems({ categoryIds: ["okna"] })` nie zapętla efektu.
 */
export function useSystems(query: SystemQuery = EMPTY_QUERY): AsyncState<SystemListResult> {
  const repository = useCatalogRepository();
  const key = useMemo(() => JSON.stringify(query), [query]);

  return useAsync(
    () => repository.peekSystems?.(query),
    () => repository.listSystems(query),
    [repository, key]
  );
}

export interface SystemState extends AsyncState<AluSystem> {
  /** true dopiero wtedy, gdy źródło odpowiedziało i systemu nie ma. */
  notFound: boolean;
}

export function useSystem(slug: string | undefined): SystemState {
  const repository = useCatalogRepository();

  const state = useAsync<AluSystem | null>(
    () => (slug ? repository.peekSystemBySlug?.(slug) : null),
    () => (slug ? repository.getSystemBySlug(slug) : Promise.resolve(null)),
    [repository, slug]
  );

  return {
    data: state.data ?? null,
    loading: state.loading,
    error: state.error,
    notFound: !state.loading && !state.error && state.data === null,
  };
}

export function useRelatedSystems(id: string | undefined): AsyncState<AluSystem[]> {
  const repository = useCatalogRepository();

  return useAsync(
    () => (id ? repository.peekRelatedSystems?.(id) : []),
    () => (id ? repository.getRelatedSystems(id) : Promise.resolve([])),
    [repository, id]
  );
}
