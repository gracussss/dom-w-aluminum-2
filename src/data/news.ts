import { entriesFromGlob } from "../lib/content";
import { normalizePosts } from "./newsModel";

export { formatPostDate, normalizePost } from "./newsModel";
export type { NewsPost } from "./newsModel";

/* Aktualności z panelu: jeden plik na wpis w src/content/aktualnosci/.
   Moduł ładują wyłącznie podstrony aktualności (leniwe trasy) — treści
   wpisów nie jadą w paczce pierwszego ekranu. */
export const posts = normalizePosts(
  entriesFromGlob(import.meta.glob("../content/aktualnosci/*.json", { eager: true, import: "default" }))
);
