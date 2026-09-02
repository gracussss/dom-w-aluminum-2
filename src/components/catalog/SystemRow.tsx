import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { responsiveSrcSet } from "../../lib/responsiveImage";
import { ConstructionGlyph } from "../ui/ConstructionGlyph";
import { findApplications, findConstructionType, findManufacturer } from "../../catalog";
import type { AluSystem, Taxonomy } from "../../catalog";

/**
 * Wiersz metryki technicznej — etykieta w monospace, wartość obok.
 * Na wąskich ekranach pary układają się w linii i zawijają, żeby wiersz
 * katalogu nie urósł do wysokości pół ekranu.
 *
 * Brak wartości = brak pary. Etykieta z samym myślnikiem, powtórzona przy
 * każdej z osiemdziesięciu kilku pozycji, zajmowała wiersz i nie mówiła nic
 * ponad to, co i tak stoi w zastrzeżeniu pod listą.
 */
function Meta({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;

  return (
    <div className="flex items-baseline gap-2.5 lg:gap-3">
      <dt className="label-sm shrink-0 text-void/70 lg:w-[94px]">{label}</dt>
      <dd className="text-[13px] leading-snug text-void/85">{value}</dd>
    </div>
  );
}

interface SystemRowProps {
  system: AluSystem;
  /** Numer pozycji w zestawieniu, np. „03”. */
  no: string;
  taxonomy: Taxonomy;
  /** Producent bywa oczywisty z kontekstu (strona producenta) — wtedy go pomijamy. */
  showManufacturer?: boolean;
}

/**
 * Pozycja katalogu jako wiersz indeksu technicznego, nie karta produktu.
 * Ten sam komponent obsługuje katalog, stronę kategorii i stronę producenta,
 * żeby lista wszędzie czytała się identycznie.
 */
export function SystemRow({ system, no, taxonomy, showManufacturer = true }: SystemRowProps) {
  const construction = findConstructionType(taxonomy, system.constructionTypeId);
  const applications = findApplications(taxonomy, system.applicationIds)
    .map((a) => a.short)
    .join(" · ");

  return (
    <li>
      <Link
        to={`/systemy/${system.slug}`}
        className="group relative grid grid-cols-1 items-start gap-x-8 gap-y-5 border-b border-void/12 py-8 lg:grid-cols-12 lg:items-center lg:py-9"
      >
        {/* Pionowa linia brązu — wysuwa się przy najechaniu na wiersz */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-5 top-0 hidden h-full w-px origin-top scale-y-0 bg-bronze transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-y-100 lg:block"
        />

        {/* Numer pozycji + symbol typu konstrukcji */}
        <div className="flex items-center gap-4 lg:col-span-1 lg:flex-col lg:items-start lg:gap-3.5">
          <span className="label tabular-nums text-void/70 transition-colors duration-500 group-hover:text-bronze">
            {no}
          </span>
          <ConstructionGlyph
            type={system.constructionTypeId}
            className="h-7 w-7 shrink-0 text-void/45 transition-colors duration-500 group-hover:text-bronze"
          />
        </div>

        {/* Nazwa systemu + wykonania */}
        <div className="lg:col-span-4">
          <h3 className="display text-3xl leading-[1.02] tracking-[-0.04em] text-void/90 transition-colors duration-500 group-hover:text-void sm:text-4xl lg:text-[38px]">
            {system.name}
          </h3>
          {/* Zastrzeżenie stoi przy nazwie, której dotyczy */}
          {system.dataStatus.name === "working-title" && (
            <span className="label-sm mt-3 inline-block border border-void/20 px-2 py-0.5 text-void/70">
              Nazwa robocza
            </span>
          )}
          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-void/70">{system.summary}</p>
          <p className="label-sm mt-4 max-w-md leading-relaxed text-void/70">
            {system.variants.map((v) => v.name).join("  ·  ")}
          </p>
        </div>

        {/* Metryka techniczna */}
        <dl className="flex flex-wrap gap-x-6 gap-y-2 lg:col-span-4 lg:flex-col lg:gap-2.5">
          {showManufacturer && (
            <Meta label="Producent" value={findManufacturer(taxonomy, system.manufacturerId)?.name} />
          )}
          <Meta label="Konstrukcja" value={construction?.name} />
          <Meta label="Zastosowanie" value={applications} />
          {/* Na stronie producenta miejsce po producencie zajmuje stan danych */}
          {!showManufacturer && (
            <Meta
              label="Parametry"
              value={system.dataStatus.specs === "missing" ? "Do uzupełnienia" : "Częściowo potwierdzone"}
            />
          )}
        </dl>

        {/* Zdjęcie — wyciszone, ożywa dopiero przy najechaniu */}
        <div className="relative hidden aspect-[4/3] overflow-hidden lg:col-span-2 lg:block">
          <img
            src={system.media.hero.src}
            srcSet={responsiveSrcSet(system.media.hero.src)}
            /* Kadr widoczny dopiero od lg i nigdy szerszy niż 1/5 okna. */
            sizes="20vw"
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-65 grayscale transition-all duration-[900ms] ease-[var(--ease-premium)] group-hover:scale-[1.04] group-hover:opacity-100 group-hover:grayscale-0"
          />
        </div>

        <div className="absolute right-0 top-8 lg:static lg:col-span-1 lg:flex lg:justify-end">
          <ArrowUpRight
            className="h-5 w-5 text-void/60 transition-all duration-500 ease-[var(--ease-premium)] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-bronze lg:h-6 lg:w-6"
            strokeWidth={1.3}
          />
        </div>
      </Link>
    </li>
  );
}
