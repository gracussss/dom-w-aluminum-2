import { StrictMode } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import "../index.css";
import { StaticMotionContext } from "../lib/staticMotion";
import { Hero } from "../sections/Hero";
import { OfferAreas } from "../sections/OfferAreas";
import { Manifest } from "../sections/Manifest";
import { Process } from "../sections/Process";
import { ContactSection } from "../sections/ContactSection";
import { PageHero } from "../components/ui/PageHero";
import { FaqSection } from "../components/ui/FaqSection";
import { OfferQuote } from "../pages/Oferta";
import { AboutView } from "../pages/ONas";
import { RealizationView } from "../pages/RealizacjaDetail";
import { ArticleView } from "../pages/AktualnoscDetail";
import { buildHomeContent, buildPageSeo } from "../data/pages";
import { PAGE_HERO_FALLBACK, buildAboutContent, buildOfferPageContent, buildPageHero } from "../data/subpages";
import type { HomeContent, SeoKey } from "../data/pages";
import { buildOfferAreas } from "../data/products";
import { buildFaq } from "../data/faq";
import { buildCompany } from "../data/company";
import { normalizeRealization } from "../data/realizationModel";
import { normalizePost } from "../data/newsModel";
import { imageAlts, images } from "../data/images";
import { buildTitle } from "../lib/seo";

/* ------------------------------------------------------------------
   PODGLĄD NA ŻYWO W PANELU (/admin)

   Panel rysuje podgląd obok formularza w ramce. Zamiast domyślnej listy
   pól — prawdziwe sekcje strony, te same komponenty i ten sam arkusz
   stylów, z danymi, których jeszcze nie zapisano.

   Ten plik buduje się osobno (vite.config.ts, `adminPreview`) do
   /admin/preview/ i nie trafia do paczki strony.

   MOST MIĘDZY REACTAMI: Decap ma własną kopię Reacta i oczekuje szablonu
   jako swojego komponentu. Szablon tutaj to pusty <div> w drzewie Decapa,
   do którego montujemy osobne drzewo z NASZYM Reactem. Dwa drzewa się nie
   mieszają, więc dwie kopie Reacta sobie nie przeszkadzają.

   Animacje wejścia są wyłączone (StaticMotionContext) — w ramce nie ma
   przewijania, na które czekają.
   ------------------------------------------------------------------ */

interface ImmutableLike {
  getIn(path: string[]): { toJS(): unknown } | undefined;
}

interface DecapPreviewProps {
  entry: ImmutableLike;
  getAsset: (path: string) => unknown;
}

interface BridgeInstance {
  props: DecapPreviewProps;
  el: HTMLElement | null;
  root: Root | null;
  paint(): void;
}

interface DecapGlobals {
  CMS?: {
    registerPreviewTemplate(name: string, component: unknown): void;
    registerPreviewStyle(url: string): void;
  };
  createClass?: (spec: Record<string, unknown>) => unknown;
  h?: (type: string, props: Record<string, unknown>) => unknown;
}

type Asset = (src: string) => string;

/* ------------------------------ MOST ------------------------------ */

function PreviewShell({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <StaticMotionContext.Provider value={true}>
        <MotionConfig reducedMotion="always">
          {/* Linki w podglądzie nigdzie nie prowadzą — router w pamięci
              tylko po to, żeby komponenty z <Link> się wyrenderowały. */}
          <MemoryRouter>{children}</MemoryRouter>
        </MotionConfig>
      </StaticMotionContext.Provider>
    </StrictMode>
  );
}

/**
 * Ścieżki zdjęć z formularza → adresy do wyświetlenia. Zdjęcie wgrane przed
 * zapisem jeszcze nie leży na serwerze — panel trzyma je w pamięci i oddaje
 * przez `getAsset` jako adres `blob:`.
 */
function assetResolver(getAsset: DecapPreviewProps["getAsset"]): Asset {
  return (src) => {
    if (!src || /^https?:\/\//.test(src)) return src;
    const asset = getAsset(src);
    return asset ? String(asset) : src;
  };
}

function bridge(decap: Required<DecapGlobals>, render: (data: unknown, asset: Asset) => ReactNode) {
  const paint = function (this: BridgeInstance) {
    if (!this.el) return;
    this.root ??= createRoot(this.el);
    const data = this.props.entry.getIn(["data"])?.toJS() ?? {};
    this.root.render(<PreviewShell>{render(data, assetResolver(this.props.getAsset))}</PreviewShell>);
  };

  return decap.createClass({
    paint,
    componentDidMount(this: BridgeInstance) {
      this.paint();
    },
    componentDidUpdate(this: BridgeInstance) {
      this.paint();
    },
    componentWillUnmount(this: BridgeInstance) {
      /* Odmontowanie po bieżącym renderze Decapa — synchroniczne w trakcie
         jego renderu React zgłasza ostrzeżenie o wyścigu. */
      const root = this.root;
      this.root = null;
      setTimeout(() => root?.unmount());
    },
    render(this: BridgeInstance) {
      return decap.h("div", {
        ref: (el: HTMLElement | null) => {
          this.el = el;
        },
      });
    },
  });
}

/* --------------------------- SZABLONY --------------------------- */

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Krótka informacja nad podglądem — co pokazuje i czego nie. */
function Note({ children }: { children: ReactNode }) {
  return <p className="label bg-void px-5 py-3 text-[11px] text-limestone/70">{children}</p>;
}

/** Sekwencja 3D bez sceny 3D — w podglądzie wystarczy sprawdzić teksty kroków. */
function StoryPreview({ content }: { content: HomeContent["story"] }) {
  return (
    <section className="grain relative bg-anthracite py-16 text-limestone">
      <div className="container-edge">
        <p className="label text-sm text-limestone/80">02 &nbsp; {content.eyebrow}</p>
        <ol className="mt-8 space-y-8">
          {content.steps.map((step, i) => (
            <li key={i} className="border-t border-limestone/12 pt-6">
              <span className="label text-bronze-light">
                {String(i + 1).padStart(2, "0")} – {step.label}
              </span>
              <h3 className="display display-tight mt-3 text-3xl leading-[0.98]">{step.title}</h3>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-limestone/65">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const SEO_PAGES: { key: SeoKey; label: string; path: string }[] = [
  { key: "home", label: "Strona główna", path: "" },
  { key: "oferta", label: "Oferta", path: "/oferta" },
  { key: "systemy", label: "Systemy", path: "/systemy" },
  { key: "realizacje", label: "Realizacje", path: "/realizacje" },
  { key: "aktualnosci", label: "Aktualności", path: "/aktualnosci" },
  { key: "oNas", label: "O nas", path: "/o-nas" },
  { key: "kontakt", label: "Kontakt", path: "/kontakt" },
];

/** Tak mniej więcej wygląda wynik w Google — tytuł z dopiskiem marki i opis. */
function SeoPreview({ data }: { data: unknown }) {
  return (
    <div className="min-h-svh bg-white px-6 py-8 font-sans text-[#202124]">
      <p className="mb-6 text-sm text-[#5f6368]">Podgląd wyników w Google (w przybliżeniu)</p>
      <div className="space-y-7">
        {SEO_PAGES.map(({ key, label, path }) => {
          const seo = buildPageSeo(data, key);
          const title = buildTitle(seo.title);
          return (
            <div key={key} className="max-w-[600px]">
              <p className="text-xs text-[#5f6368]">{label}</p>
              <p className="mt-1 text-sm text-[#4d5156]">domwaluminum.netlify.app{path && ` › ${path.slice(1)}`}</p>
              <p className="mt-0.5 truncate text-xl leading-snug text-[#1a0dab]">{title}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#4d5156]">{seo.description}</p>
              <p className="mt-1 text-xs text-[#5f6368]">
                Tytuł: {title.length} znaków · opis: {seo.description.length} znaków
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FirmPreview({ data }: { data: unknown }) {
  const firm = buildCompany(data);
  const legal = [
    ["NIP", firm.legal.nip],
    ["REGON", firm.legal.regon],
    ["KRS", firm.legal.krs],
    ["E-mail RODO", firm.legal.privacyEmail],
  ] as const;

  return (
    <>
      <Note>Sekcja kontaktowa ze strony głównej — dane firmy pojawiają się też w stopce i na stronie Kontakt</Note>
      <ContactSection firm={firm} />
      <section className="bg-limestone px-6 py-10 text-void">
        <p className="label text-void/60">Polityka prywatności i dane dla Google</p>
        <dl className="mt-4 divide-y divide-void/12 border-y border-void/12">
          {legal.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[140px_1fr] gap-4 py-3 text-[15px]">
              <dt className="text-void/60">{label}</dt>
              <dd className={value ? "text-void" : "text-void/45"}>{value ?? "do uzupełnienia"}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

function pageHeroTemplate(fallback: { eyebrow: string; title: string }) {
  return (data: unknown) => {
    const hero = buildPageHero(data, fallback);
    return <PageHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} />;
  };
}

const templates: Record<string, (data: unknown, asset: Asset) => ReactNode> = {
  realizacje: (data, asset) => {
    const item = normalizeRealization(data, "podglad");
    return (
      <RealizationView
        item={{ ...item, cover: asset(item.cover), gallery: item.gallery.map(asset) }}
      />
    );
  },

  aktualnosci: (data, asset) => {
    const post = normalizePost(data, "podglad");
    /* Zdjęcia w treści wpisu wgrane przed zapisem — też przez getAsset. */
    const body = post.body.replace(/\]\((\/uploads\/[^)\s]+)/g, (_m, src: string) => `](${asset(src)}`);
    return <ArticleView post={{ ...post, cover: asset(post.cover), body }} />;
  },

  "strona-glowna": (data) => {
    const content = buildHomeContent(data);
    return (
      <>
        <Hero content={content.hero} />
        <OfferAreas content={content.offer} />
        <StoryPreview content={content.story} />
        <Manifest content={content.approach} />
        <Process content={content.process} />
        <ContactSection content={content.contact} />
      </>
    );
  },

  "strona-oferta": (data) => {
    const content = buildOfferPageContent(data);
    return (
      <>
        <PageHero eyebrow={content.hero.eyebrow} title={content.hero.title} description={content.hero.description} />
        <OfferQuote content={content.quote} />
      </>
    );
  },

  "strona-systemy": pageHeroTemplate(PAGE_HERO_FALLBACK.systemy),
  "strona-realizacje": pageHeroTemplate(PAGE_HERO_FALLBACK.realizacje),
  "strona-aktualnosci": pageHeroTemplate(PAGE_HERO_FALLBACK.aktualnosci),
  "strona-kontakt": pageHeroTemplate(PAGE_HERO_FALLBACK.kontakt),

  "strona-o-nas": (data) => <AboutView content={buildAboutContent(data)} />,

  oferta: (data, asset) => {
    const areas = buildOfferAreas(data).map((area) => ({ ...area, image: asset(area.image) }));
    return (
      <>
        <Note>Miniatury pojawiają się po najechaniu na wiersz (na telefonie widać je od razu)</Note>
        <OfferAreas areas={areas} />
      </>
    );
  },

  faq: (data) => {
    const content = buildFaq(data);
    return content.items.length > 0 ? (
      <FaqSection content={content} />
    ) : (
      <Note>Sekcja pojawi się na stronie Oferta, gdy dodasz pierwsze pytanie</Note>
    );
  },

  zdjecia: (data, asset) => {
    const hero = obj(obj(data).hero);
    const about = obj(obj(data).about);
    const contact = obj(obj(data).contact);
    return (
      <>
        <Hero image={{ src: asset(str(hero.src)) || images.heroBg, alt: str(hero.alt) || imageAlts.hero }} />
        <AboutView image={{ src: asset(str(about.src)) || images.about, alt: str(about.alt) || imageAlts.about }} />
        <ContactSection background={asset(str(contact.src)) || images.contact} />
      </>
    );
  },

  seo: (data) => <SeoPreview data={data} />,
  firma: (data) => <FirmPreview data={data} />,
};

/* --------------------------- REJESTRACJA --------------------------- */

const decap = window as unknown as DecapGlobals;

if (decap.CMS && decap.createClass && decap.h) {
  const globals = decap as Required<DecapGlobals>;
  /* Arkusz strony w ramce podglądu — ten sam plik, który zbudował się
     razem z tym skryptem (vite.config.ts, `adminPreview`). */
  globals.CMS.registerPreviewStyle("/admin/preview/preview.css");
  for (const [name, render] of Object.entries(templates)) {
    globals.CMS.registerPreviewTemplate(name, bridge(globals, render));
  }
}
