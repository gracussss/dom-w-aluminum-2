import type { ReactNode } from "react";
import { CatalogContext } from "./context";
import { defaultRepository } from "./source";
import type { CatalogRepository } from "./repository";

interface CatalogProviderProps {
  children: ReactNode;
  /** Podmiana źródła danych — np. adapter HTTP albo atrapa w testach. */
  repository?: CatalogRepository;
}

/**
 * Udostępnia repozytorium katalogu całemu drzewu. Bez propsa `repository`
 * używa źródła lokalnego, więc podpięcie API sprowadza się do jednej zmiany
 * tutaj albo w src/catalog/source.ts.
 */
export function CatalogProvider({ children, repository = defaultRepository }: CatalogProviderProps) {
  return <CatalogContext.Provider value={repository}>{children}</CatalogContext.Provider>;
}
