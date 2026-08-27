/* ------------------------------------------------------------------
   PUBLICZNE WEJŚCIE DO KATALOGU

   Komponenty importują wyłącznie stąd:
       import { useSystems, findCategory } from "../catalog";

   Import z src/catalog/dataset.ts w widoku jest błędem — omija warstwę
   repozytorium i przywiązuje widok do lokalnego źródła danych.
   ------------------------------------------------------------------ */

export type {
  AluSystem,
  Application,
  ConstructionType,
  CrossSectionKind,
  CrossSectionRef,
  DataSource,
  DocumentKind,
  Facets,
  FacetOption,
  ImageRef,
  Manufacturer,
  ModelType,
  Pricing,
  SortKey,
  SystemCategory,
  SystemCta,
  SystemDataStatus,
  SystemDocument,
  SystemListResult,
  SystemQuery,
  SystemSpec,
  SystemVariant,
  Tag,
  Taxonomy,
  Verification,
} from "./types";

export type { SystemGeometry } from "./geometry";
export { hasMeasuredGeometry, parseMillimetres, systemGeometry } from "./geometry";

export type { CatalogRepository, LocalSource } from "./repository";
export { createHttpRepository, createLocalRepository, validateSource } from "./repository";

export { CatalogProvider } from "./provider";
export { useCatalogRepository } from "./context";
export { defaultRepository, localSource } from "./source";

export type { AsyncState, SystemState } from "./hooks";
export { useRelatedSystems, useSystem, useSystems, useTaxonomy } from "./hooks";

export { DEFAULT_SORT, SORT_LABELS, countActiveFilters, selectSystems } from "./query";

export {
  countByCategory,
  findApplications,
  findCategory,
  findCategoryBySlug,
  findConstructionType,
  findManufacturer,
  findManufacturerBySlug,
  groupByCategory,
} from "./lookup";

export {
  DATA_DISCLAIMER,
  DOCUMENT_KIND_LABEL,
  MODEL_TYPE_LABEL,
  NAME_STATUS_LABEL,
  TBD,
  hasManufacturerCrossSection,
  nameStatusNote,
  sourceNote,
  specsStatusNote,
} from "./messages";
