import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, Clock, FileText, Phone } from "lucide-react";
import { Seo } from "../components/Seo";
import { Reveal, RevealText } from "../components/ui/Reveal";
import { Eyebrow } from "../components/ui/Eyebrow";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { breadcrumbJsonLd } from "../lib/jsonLd";
import { CrossSection, getSchematic } from "../components/crosssection";
import { SystemViewer } from "../components/product3d/SystemViewer";
import { SystemPresentation } from "../components/product3d/SystemPresentation";
import { SIZES_FULL, responsiveSrcSet } from "../lib/responsiveImage";
import { siteOrigin } from "../lib/seo";
import { NotFound } from "./NotFound";
import {
  DATA_DISCLAIMER,
  DOCUMENT_KIND_LABEL,
  MODEL_TYPE_LABEL,
  findApplications,
  primaryCategory,
  systemCategories,
  findConstructionType,
  findManufacturer,
  nameStatusNote,
  sourceNote,
  specsStatusNote,
  systemGeometry,
  useRelatedSystems,
  useSystem,
  useTaxonomy,
} from "../catalog";
import { company } from "../data/company";

export function SystemDetail() {
  const { slug } = useParams();
  const { data: system, loading, notFound } = useSystem(slug);
  const { data: taxonomy } = useTaxonomy();
  const { data: related } = useRelatedSystems(system?.id);

  if (notFound) return <NotFound />;
  if (!system || !taxonomy) {
    return <div className="min-h-[70svh] bg-void" aria-busy={loading} />;
  }

  const manufacturer = findManufacturer(taxonomy, system.manufacturerId);
  const category = primaryCategory(taxonomy, system);
  const allCategories = systemCategories(taxonomy, system);
  const construction = findConstructionType(taxonomy, system.constructionTypeId);
  const applications = findApplications(taxonomy, system.applicationIds);
  const modelType = system.model3d.type;

  /* Prezentacja krokowa wymaga wymiaru odczytanego z parametrów systemu.
     Bez niego model nie miałby czego odwzorować w skali i zostaje przy
     dotychczasowym podglądzie typu konstrukcji. Na razie tylko okna —
     pozostałe typy dostaną własną sekwencję, a nie kopię tej. */
  const geometry = systemGeometry(system);
  const presentation =
    modelType === "okno" && geometry.depth !== null && geometry.depthLabel !== null
      ? { ...geometry, depth: geometry.depth, depthLabel: geometry.depthLabel }
      : null;

  /* Rysunek producenta, jeśli jest — inaczej schemat poglądowy dla typu konstrukcji.
     Gdy nie ma ani jednego, ani drugiego (akcesoria), sekcja się nie pojawia:
     lepiej jej nie mieć niż pokazać przy klamce przekrój okna. */
  const hasDrawing = system.crossSections.some((c) => c.imageSrc !== null);
  const schematic = getSchematic(modelType);
  const showCrossSection = hasDrawing || Boolean(schematic);
  const schematicLabel = schematic ? MODEL_TYPE_LABEL[schematic.id].toLowerCase() : "";
  const specsSource = sourceNote(system);
  const quote = system.cta.find((c) => c.kind === "quote");

  const crumbs = [
    { label: "Systemy", to: "/systemy" },
    ...(category ? [{ label: category.name, to: `/systemy/kategoria/${category.slug}` }] : []),
    { label: system.name },
  ];

  /* Origin z konfiguracji, nie z przeglądarki — inaczej po ustawieniu
     VITE_SITE_URL canonical wskazywałby domenę produkcyjną, a adresy
     w danych strukturalnych zostawały na adresie środowiska. */
  const origin = siteOrigin();

  /**
   * Dane strukturalne. Ścieżkę podajemy zawsze, opis produktu — wyłącznie dla
   * systemów o potwierdzonym oznaczeniu. Przypisanie marki do nazwy roboczej
   * byłoby w oczach wyszukiwarki twierdzeniem firmy, a nie jest potwierdzone.
   *
   * Z tego samego powodu karta systemu o nazwie roboczej nie jest indeksowana
   * (`noindex, follow`) i nie trafia do sitemapy: to na razie zapowiedź pozycji,
   * a nie karta techniczna. Indeksowanie włącza się samo, gdy dane zostaną
   * potwierdzone w `dataset.ts`.
   */
  const confirmed = system.dataStatus.name === "confirmed";

  /* Tytuł i opis składane z części, które istnieją — przy braku kategorii
     wcześniejszy szablon zostawiał w opisie podwójną kropkę i pustkę. */
  /* Kropka rozdziela części tytułu, bo myślnik jest już zajęty przez sufiks
     marki („… — Dom w Aluminium”) i dwa myślniki w jednej linii się zlewają.
     Nazwy robocze same opisują konstrukcję, więc nic do nich nie doklejamy. */
  const seoTitle =
    confirmed && manufacturer ? `${system.name} · system aluminiowy ${manufacturer.name}` : system.name;

  const seoDescription = [
    `${system.name}: ${system.summary}`,
    category ? `Kategoria: ${category.name}` : null,
    "Karta systemu w katalogu Dom w Aluminium.",
  ]
    .filter(Boolean)
    .join(". ")
    .replace("..", ".");

  const jsonLd: unknown[] = [breadcrumbJsonLd(crumbs, origin)];
  if (confirmed && manufacturer) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: system.name,
      description: system.summary,
      category: category?.name,
      brand: { "@type": "Brand", name: manufacturer.name },
      url: `${origin}/systemy/${system.slug}`,
      additionalProperty: system.specs
        .filter((spec) => spec.value !== null)
        .map((spec) => ({
          "@type": "PropertyValue",
          name: spec.label,
          value: spec.value,
        })),
    });
  }

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath={`/systemy/${system.slug}`}
        noindex={!confirmed}
        jsonLd={jsonLd}
      />

      {/* SYSTEM */}
      <section className="grain relative overflow-hidden bg-void pb-16 pt-32 text-limestone md:pb-24 md:pt-44">
        <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="container-edge relative">
          <Breadcrumbs items={crumbs} tone="light" />

          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {manufacturer && (
                    <Link
                      to={`/systemy/producent/${manufacturer.slug}`}
                      className="label text-bronze-light transition-colors hover:text-limestone"
                    >
                      {manufacturer.name}
                    </Link>
                  )}
                  {/* Wszystkie kategorie, do których producent przypisał system —
                      MB-79N to jednocześnie okna i drzwi, i tak trzeba go pokazać */}
                  {allCategories.map((c) => (
                    <span key={c.id} className="flex items-center gap-x-4">
                      <span className="h-3 w-px bg-limestone/20" />
                      <Link
                        to={`/systemy/kategoria/${c.slug}`}
                        className="label text-limestone/55 transition-colors hover:text-limestone"
                      >
                        {c.name}
                      </Link>
                    </span>
                  ))}
                </div>
              </Reveal>

              <h1 className="display display-tight mt-6 text-[12vw] leading-[0.92] sm:text-6xl md:text-7xl">
                <RevealText>{system.name}</RevealText>
              </h1>

              <Reveal delay={0.12}>
                <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-limestone/55 md:text-lg">
                  {system.description}
                </p>
              </Reveal>
            </div>

            {/* Status danych czytany z modelu, nie wpisany ręcznie w widok */}
            <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
              <div className="border-t border-limestone/15 pt-7">
                <p className="label text-limestone/55">Status danych</p>
                <p className="mt-4 text-sm leading-relaxed text-limestone/55">{nameStatusNote(system)}</p>
                <p className="mt-3 text-sm leading-relaxed text-limestone/55">{specsStatusNote(system)}</p>
                {system.manufacturerUrl && (
                  <a
                    href={system.manufacturerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="label mt-5 inline-flex items-center gap-2 text-bronze-light transition-colors hover:text-limestone"
                  >
                    Strona systemu u producenta
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* DUŻY PRZEKRÓJ — schemat dobrany do typu konstrukcji tego systemu */}
      {showCrossSection && (
        <section className="bg-anthracite py-20 text-limestone md:py-28">
          <div className="container-edge">
            <Reveal>
              <Eyebrow index="01" label="Przekrój" tone="light" />
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display display-tight mt-8 max-w-2xl text-4xl sm:text-5xl">Budowa profilu</h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-limestone/55">
                {hasDrawing
                  ? `Przekrój systemu ${system.name} dostarczony przez producenta.`
                  : `Poniżej schemat poglądowy dla konstrukcji typu „${schematicLabel}”. Rysunek przekroju tego konkretnego systemu dodamy po otrzymaniu dokumentacji od producenta.`}
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-12">
              <CrossSection
                drawings={system.crossSections}
                type={modelType}
                subject={`${manufacturer?.name ?? ""} · ${system.name}`}
              />
            </Reveal>
          </div>
        </section>
      )}

      {/* MODEL 3D — tylko wtedy, gdy mamy co pokazać AKURAT dla tego systemu:
          plik modelu od producenta albo prezentację zbudowaną z jego własnych,
          udokumentowanych wymiarów. Sam parametryczny model typu konstrukcji
          jest ten sam dla dziesiątek systemów i podpisany nazwą konkretnego
          udawałby jego geometrię — dlatego nie wystarcza. */}
      {modelType && (system.model3d.url || presentation) && (
        <section className="grain bg-void py-20 text-limestone md:py-28">
          <div className="container-edge">
            <Reveal>
              <Eyebrow index="02" label="Model 3D" tone="light" />
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display display-tight mt-8 max-w-2xl text-4xl sm:text-5xl">
                {MODEL_TYPE_LABEL[modelType]}
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-12">
              {/* Prezentacja krokowa włącza się z danych, nie z listy nazw:
                  wymaga potwierdzonej głębokości zabudowy, bo to jedyny wymiar,
                  który model odwzorowuje w skali. Reszta katalogu bez zmian. */}
              {presentation ? (
                <SystemPresentation
                  system={system}
                  geometry={presentation}
                  fallbackImage={system.media.hero.src}
                />
              ) : (
                <SystemViewer
                  modelType={modelType}
                  modelUrl={system.model3d.url}
                  fallbackImage={system.media.hero.src}
                  description={`Model odpowiada typowi konstrukcji tego systemu (${MODEL_TYPE_LABEL[modelType].toLowerCase()}).`}
                />
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* ZASTOSOWANIE */}
      <section className="bg-limestone py-20 text-void md:py-28">
        <div className="container-edge grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Eyebrow index="03" label="Zastosowanie" tone="dark" />
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="display display-tight mt-8 text-4xl sm:text-5xl">Gdzie się sprawdza</h2>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-7">
            <dl className="divide-y divide-void/12 border-y border-void/12">
              <div className="grid gap-2 py-6 sm:grid-cols-[190px_1fr]">
                <dt className="label text-void/70">Kategoria</dt>
                <dd className="text-[15px] text-void/75">{category?.name}</dd>
              </div>
              <div className="grid gap-2 py-6 sm:grid-cols-[190px_1fr]">
                <dt className="label text-void/70">Typ konstrukcji</dt>
                <dd className="text-[15px] text-void/75">{construction?.name}</dd>
              </div>
              {applications.length > 0 && (
                <div className="grid gap-2 py-6 sm:grid-cols-[190px_1fr]">
                  <dt className="label text-void/70">Zastosowanie</dt>
                  <dd className="text-[15px] text-void/75">{applications.map((a) => a.name).join(" · ")}</dd>
                </div>
              )}
              {/* Wykonania systemu — producent nie wylicza ich na karcie
                  w formie nadającej się do przepisania, więc wiersz pojawia
                  się dopiero, gdy dane wpadną do zbioru. */}
              {system.variants.length > 0 && (
                <div className="grid gap-2 py-6 sm:grid-cols-[190px_1fr]">
                  <dt className="label text-void/70">Warianty</dt>
                  <dd className="flex flex-wrap gap-2">
                    {system.variants.map((variant) => (
                      <span key={variant.id} className="border border-void/18 px-3 py-1.5 text-xs text-void/65">
                        {variant.name}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* WIZUALIZACJA */}
      <section className="relative bg-void">
        <div className="relative h-[60svh] min-h-[420px] w-full overflow-hidden md:h-[75svh]">
          <img
            src={system.media.hero.src}
            srcSet={responsiveSrcSet(system.media.hero.src)}
            sizes={SIZES_FULL}
            alt={system.media.hero.alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
          {system.media.hero.placeholder && <PlaceholderTag className="absolute right-5 top-5 md:right-10" />}
        </div>
      </section>

      {/* PARAMETRY */}
      <section className="grain bg-void py-20 text-limestone md:py-28">
        <div className="container-edge">
          <Reveal>
            <Eyebrow index="04" label="Parametry" tone="light" />
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="display display-tight mt-8 max-w-2xl text-4xl sm:text-5xl">Dane techniczne</h2>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-12 grid grid-cols-1 gap-px border border-limestone/12 bg-limestone/12 sm:grid-cols-2 lg:grid-cols-3">
              {system.specs.map((spec) => (
                <div key={spec.id} className="bg-void p-6">
                  <p className="label text-limestone/55">{spec.label}</p>
                  {spec.value ? (
                    <>
                      <p className="mt-3 text-xl font-semibold tracking-[-0.02em]">{spec.value}</p>
                      {/* Norma stoi przy wartości, której dotyczy */}
                      {spec.standard && (
                        <p className="label-sm mt-2 text-limestone/55">{spec.standard}</p>
                      )}
                    </>
                  ) : (
                    <p className="mt-3 flex items-center gap-2 text-sm text-limestone/55">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-bronze-light/70" strokeWidth={1.5} />
                      Do uzupełnienia
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            {specsSource && (
              <p className="mt-6 text-xs leading-relaxed text-limestone/70">{specsSource}</p>
            )}
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-limestone/55">{DATA_DISCLAIMER}</p>
          </Reveal>

          {/* DOKUMENTACJA — także wtedy, gdy jej nie ma: brak trzeba wyjaśnić,
              inaczej wygląda jak niedokończona strona, a nie jak decyzja */}
          <Reveal delay={0.145}>
            <div className="mt-16 border-t border-limestone/12 pt-10">
              <p className="label text-limestone/55">Dokumentacja</p>

              {system.documents.length > 0 ? (
                <ul className="mt-5 divide-y divide-limestone/10 border-y border-limestone/10">
                  {system.documents.map((doc) => {
                    const available = Boolean(doc.url) && doc.publishable;
                    const meta = available
                      ? DOCUMENT_KIND_LABEL[doc.kind]
                      : `${DOCUMENT_KIND_LABEL[doc.kind]} · brak zgody na publikację`;

                    return (
                      <li key={doc.id}>
                        {available ? (
                          <a
                            href={doc.url as string}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-4 py-4 text-limestone/70 transition-colors hover:text-limestone"
                          >
                            <FileText className="h-4 w-4 shrink-0 text-bronze-light" strokeWidth={1.5} />
                            <span className="flex-1">
                              <span className="block text-sm font-medium leading-snug">{doc.label}</span>
                              <span className="label-sm mt-1 block text-limestone/55">{meta}</span>
                            </span>
                            <ArrowUpRight
                              className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              strokeWidth={1.4}
                            />
                          </a>
                        ) : (
                          <div className="flex items-center gap-4 py-4 text-limestone/60">
                            <FileText className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                            <span className="flex-1">
                              <span className="block text-sm leading-snug">{doc.label}</span>
                              <span className="label-sm mt-1 block">{meta}</span>
                            </span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-limestone/55">
                  Nie udostępniamy tu kart katalogowych, rysunków technicznych ani plików BIM.
                  Samo pobranie ich ze strony producenta nie jest zgodą na publikację na stronie
                  komercyjnej — dodamy je po uzyskaniu pisemnej zgody.
                </p>
              )}

              {system.manufacturerUrl && (
                <a
                  href={system.manufacturerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="label mt-6 inline-flex items-center gap-2 text-bronze-light transition-colors hover:text-limestone"
                >
                  Materiały producenta
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              )}
            </div>
          </Reveal>

          {/* POWIĄZANE SYSTEMY */}
          {related && related.length > 0 && (
            <Reveal delay={0.15}>
              <div className="mt-16 border-t border-limestone/12 pt-10">
                <p className="label text-limestone/55">Powiązane systemy</p>
                <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/systemy/${item.slug}`}
                        className="group inline-flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-limestone/70 transition-colors hover:text-limestone"
                      >
                        {item.name}
                        <ArrowUpRight
                          className="h-4 w-4 text-limestone/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-bronze-light"
                          strokeWidth={1.4}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {/* CTA */}
          <Reveal delay={0.16}>
            <div className="mt-16 flex flex-col gap-6 border-t border-limestone/12 pt-12 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="display text-3xl tracking-[-0.03em] md:text-4xl">Zapytaj o ten system</p>
                <p className="mt-3 text-sm text-limestone/55">
                  Dobierzemy rozwiązanie do wymiarów i wymagań Twojej inwestycji.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* Odnośnik niesie kontekst systemu — formularz będzie wiedział, czego dotyczy zapytanie */}
                <Link
                  to={quote?.href ?? "/kontakt"}
                  className="group inline-flex items-center gap-3 bg-limestone px-7 py-4 label text-void transition-colors hover:bg-bronze-light"
                >
                  {quote?.label ?? "Zapytaj o wycenę"}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.5}
                  />
                </Link>
                <a
                  href={company.phone.href}
                  className="inline-flex items-center gap-3 border border-limestone/25 px-7 py-4 label text-limestone transition-colors hover:border-limestone/60"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {company.phone.display}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
