import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal, RevealGroup } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ArrowButton } from "../components/ui/ArrowButton";
import { revealItem } from "../lib/variants";
import { DATA_DISCLAIMER, countByCategory, useSystems, useTaxonomy } from "../catalog";
import { positions } from "../lib/plural";

/** Liczebniki żeńskie — nagłówek ma się zgadzać z zawartością katalogu. */
const NUMERALS = [
  "Zero",
  "Jedna",
  "Dwie",
  "Trzy",
  "Cztery",
  "Pięć",
  "Sześć",
  "Siedem",
  "Osiem",
  "Dziewięć",
  "Dziesięć",
];

function categoriesHeadline(n: number): string {
  const numeral = NUMERALS[n] ?? String(n);
  const noun = n === 1 ? "kategoria" : n < 5 ? "kategorie" : "kategorii";
  return `${numeral} ${noun}`;
}

export function SystemsPreview() {
  const { data: taxonomy } = useTaxonomy();
  const { data: list } = useSystems();

  if (!taxonomy || !list) return null;

  const counts = countByCategory(list.items, taxonomy);
  const entries = taxonomy.categories.map((category, i) => ({
    category,
    order: i,
    no: String(i + 1).padStart(2, "0"),
    count: counts.get(category.id) ?? 0,
  }));

  /**
   * Hierarchia zamiast równości: trzy najliczniejsze kategorie dostają duże
   * pole, reszta zostaje wierszem w spisie. Osiem jednakowych kafli nie mówi
   * nic o tym, gdzie naprawdę jest oferta.
   */
  const majorIds = new Set(
    [...entries]
      .sort((a, b) => b.count - a.count || a.order - b.order)
      .slice(0, 3)
      .map((c) => c.category.id)
  );
  const major = entries.filter((c) => majorIds.has(c.category.id));
  const minor = entries.filter((c) => !majorIds.has(c.category.id));

  return (
    <section className="relative bg-plaster py-24 text-void md:py-32">
      <div className="container-edge">
        <SectionHeading
          index="06"
          eyebrow="Katalog systemów"
          tone="dark"
          variant="split"
          lines={[categoriesHeadline(taxonomy.categories.length), "systemów aluminiowych"]}
          description="Katalog z filtrowaniem po producencie, kategorii, zastosowaniu i typie konstrukcji — gotowy na kolejne pozycje."
        />

        {/* Kategorie wiodące */}
        <RevealGroup
          className="mt-14 grid grid-cols-1 gap-px border border-void/12 bg-void/12 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.06}
        >
          {major.map(({ category, no, count }) => (
            <motion.div key={category.id} variants={revealItem} className="bg-plaster">
              <Link
                to={`/systemy/kategoria/${category.slug}`}
                className="group flex h-full min-h-[230px] flex-col justify-between p-7 transition-colors duration-500 hover:bg-void md:min-h-[280px] md:p-9"
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="label text-void/70 transition-colors duration-500 group-hover:text-bronze-light">
                    {no}
                  </span>
                  <div className="text-right">
                    {/* Liczba pozycji jest treścią, nie ozdobą — przy `void/25` kontrast
                        na tle `plaster` spadał do 1,7:1 i cyfra znikała. */}
                    <span className="display block text-5xl leading-none text-void/50 transition-colors duration-500 group-hover:text-bronze-light md:text-6xl">
                      {count}
                    </span>
                    <span className="label-sm mt-2 block text-void/70 transition-colors duration-500 group-hover:text-limestone/60">
                      {positions(count)}
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <h3 className="display text-3xl leading-none tracking-[-0.04em] transition-colors duration-500 group-hover:text-limestone md:text-[34px]">
                    {category.name}
                  </h3>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-void/60 transition-all duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-bronze-light"
                    strokeWidth={1.3}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </RevealGroup>

        {/* Pozostałe kategorie — spis, nie kafle */}
        <Reveal delay={0.08} className="mt-10">
          <ul className="border-t border-void/12">
            {minor.map(({ category, no, count }) => (
              <li key={category.id}>
                <Link
                  to={`/systemy/kategoria/${category.slug}`}
                  className="group flex items-center gap-5 border-b border-void/12 py-5 md:gap-8"
                >
                  <span className="label w-7 shrink-0 text-void/70 transition-colors duration-500 group-hover:text-bronze">
                    {no}
                  </span>
                  <h3 className="flex-1 text-lg font-semibold tracking-[-0.02em] text-void/85 transition-colors duration-500 group-hover:text-void md:text-xl">
                    {category.name}
                  </h3>
                  <span className="label-sm shrink-0 text-void/70">
                    {count} {positions(count)}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-void/60 transition-all duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-bronze"
                    strokeWidth={1.4}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Producenci */}
        <Reveal
          delay={0.1}
          className="mt-14 flex flex-col gap-6 border-t border-void/12 pt-10 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <span className="label text-void/70">Systemy producentów</span>
            {taxonomy.manufacturers.map((m) => (
              <Link
                key={m.id}
                to={`/systemy/producent/${m.slug}`}
                className="text-lg font-semibold tracking-[-0.02em] text-void/70 transition-colors hover:text-bronze md:text-xl"
              >
                {m.name}
              </Link>
            ))}
          </div>
          <ArrowButton href="/systemy" variant="solid" tone="light">
            Przeglądaj katalog
          </ArrowButton>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-8 max-w-2xl text-xs leading-relaxed text-void/60">{DATA_DISCLAIMER}</p>
        </Reveal>
      </div>
    </section>
  );
}
