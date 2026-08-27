import { createContext, useContext } from "react";
import type { CatalogRepository } from "./repository";
import { defaultRepository } from "./source";

/**
 * Repozytorium katalogu dostępne dla drzewa komponentów.
 * Domyślnie źródło lokalne — dzięki temu komponenty działają też
 * poza providerem (np. w testach), a produkcyjnie provider pozwala
 * podmienić źródło bez dotykania widoków.
 */
export const CatalogContext = createContext<CatalogRepository>(defaultRepository);

export function useCatalogRepository(): CatalogRepository {
  return useContext(CatalogContext);
}
