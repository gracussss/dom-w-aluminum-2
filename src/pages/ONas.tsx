import { Seo } from "../components/Seo";
import { PageHero } from "../components/ui/PageHero";
import { ParallaxImage } from "../components/ui/ParallaxImage";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { Reveal, RevealText } from "../components/ui/Reveal";
import { imageAlts, images } from "../data/images";
import { pageSeo } from "../data/pages";
import { aboutContent } from "../data/subpages";
import { isPlaceholderImage } from "../lib/responsiveImage";
import { addressLine, company } from "../data/company";
import type { Company } from "../data/company";
import type { AboutContent } from "../data/subpages";

export function ONas() {
  const seo = pageSeo("oNas");
  return (
    <>
      <Seo title={seo.title} description={seo.description} />
      <AboutView />
    </>
  );
}

interface AboutViewProps {
  content?: AboutContent;
  firm?: Company;
  image?: { src: string; alt: string };
}

/** Treść „O nas” bez meta — tę samą część rysuje podgląd na żywo w panelu. */
export function AboutView({
  content = aboutContent,
  firm = company,
  image = { src: images.about, alt: imageAlts.about },
}: AboutViewProps) {
  return (
    <>
      <PageHero eyebrow={content.hero.eyebrow} title={content.hero.title} description={content.hero.description} />

      <section className="bg-limestone py-16 text-void md:py-24">
        {/* Na desktopie zdjęcie ma dokładnie wysokość kolumny tekstu (wiersz
            siatki rozciąga obie kolumny), zamiast stałego kadru 4/5, który
            wystawał pod tabelą. Uwaga klientki: „żeby zdjęcie było wielkości
            tego tekstu”, „żeby nie było takie długie”. */}
        <div className="container-edge grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="relative lg:col-span-5">
            <ParallaxImage
              src={image.src}
              alt={image.alt}
              /* Poniżej `lg` kolumny stoją jedna pod drugą, więc kadr musi mieć
                 własną proporcję — pełna szerokość z 4/5 dawała przy 941 px
                 zdjęcie 887 x 1108 px, cały ekran przed pierwszym zdaniem. */
              className="aspect-[4/3] w-full sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
            />
            {isPlaceholderImage(image.src) && <PlaceholderTag className="absolute right-3 top-3" />}
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {/* Interlinia 1.08 zamiast 0.92 – klientka: odstęp „między
                wierszami jest taki mały, dałabym troszkę większy”. Z `!`,
                bo `.display` ustawia interlinię i stoi w arkuszu za
                klasami Tailwinda – bez tego `leading-*` nic nie zmieniało. */}
            <h2 className="display display-tight text-[8vw] leading-[1.08]! sm:text-4xl md:text-5xl">
              {content.headline.map((line, i) => (
                <RevealText key={i} delay={i * 0.08}>
                  {line.accent ? <span className="editorial text-sand-deep">{line.text}</span> : line.text}
                </RevealText>
              ))}
            </h2>

            <Reveal delay={0.14}>
              {content.body.map((paragraph, i) => (
                <p
                  key={i}
                  className={`${i === 0 ? "mt-7" : "mt-5"} max-w-xl text-pretty leading-relaxed text-void/65 md:text-lg`}
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal delay={0.2}>
              <dl className="mt-10 divide-y divide-void/12 border-y border-void/12">
                <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                  <dt className="label text-void/70">Firma</dt>
                  <dd className="text-[15px] text-void/75">{firm.legalName}</dd>
                </div>
                <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                  <dt className="label text-void/70">Siedziba</dt>
                  <dd className="text-[15px] text-void/75">{addressLine(firm)}</dd>
                </div>
                <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                  <dt className="label text-void/70">Telefon</dt>
                  <dd>
                    <a href={firm.phone.href} className="text-[15px] text-void/75 hover:text-bronze">
                      {firm.phone.display}
                    </a>
                  </dd>
                </div>
                <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                  <dt className="label text-void/70">Godziny pracy</dt>
                  <dd className="text-[15px] text-void/75">{firm.hours}</dd>
                </div>
                {content.scope && (
                  <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                    <dt className="label text-void/70">Zakres prac</dt>
                    <dd className="text-[15px] text-void/75">{content.scope}</dd>
                  </div>
                )}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
