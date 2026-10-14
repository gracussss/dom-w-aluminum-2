import { Seo } from "../components/Seo";
import { PageHero } from "../components/ui/PageHero";
import { ParallaxImage } from "../components/ui/ParallaxImage";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { Reveal, RevealText } from "../components/ui/Reveal";
import { imageAlts, images } from "../data/images";
import { aboutContent, pageSeo } from "../data/pages";
import { isPlaceholderImage } from "../lib/responsiveImage";
import { company, fullAddress } from "../data/company";

export function ONas() {
  const seo = pageSeo("oNas");
  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
      />
      <PageHero eyebrow="O nas" title={aboutContent.pageTitle} />

      <section className="bg-limestone py-16 text-void md:py-24">
        {/* Na desktopie zdjęcie ma dokładnie wysokość kolumny tekstu (wiersz
            siatki rozciąga obie kolumny), zamiast stałego kadru 4/5, który
            wystawał pod tabelą. Uwaga klientki: „żeby zdjęcie było wielkości
            tego tekstu”, „żeby nie było takie długie”. */}
        <div className="container-edge grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="relative lg:col-span-5">
            <ParallaxImage
              src={images.about}
              alt={imageAlts.about}
              /* Poniżej `lg` kolumny stoją jedna pod drugą, więc kadr musi mieć
                 własną proporcję — pełna szerokość z 4/5 dawała przy 941 px
                 zdjęcie 887 x 1108 px, cały ekran przed pierwszym zdaniem. */
              className="aspect-[4/3] w-full sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
            />
            {isPlaceholderImage(images.about) && <PlaceholderTag className="absolute right-3 top-3" />}
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {/* Interlinia 1.08 zamiast 0.92 – klientka: odstęp „między
                wierszami jest taki mały, dałabym troszkę większy”. Z `!`,
                bo `.display` ustawia interlinię i stoi w arkuszu za
                klasami Tailwinda – bez tego `leading-*` nic nie zmieniało. */}
            <h2 className="display display-tight text-[8vw] leading-[1.08]! sm:text-4xl md:text-5xl">
              {aboutContent.headline && <RevealText>{aboutContent.headline}</RevealText>}
              {aboutContent.headlineAccent && (
                <RevealText delay={0.08}>
                  <span className="editorial text-sand-deep">{aboutContent.headlineAccent}</span>
                </RevealText>
              )}
            </h2>

            <Reveal delay={0.14}>
              {aboutContent.body.map((paragraph, i) => (
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
                  <dd className="text-[15px] text-void/75">{company.legalName}</dd>
                </div>
                <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                  <dt className="label text-void/70">Siedziba</dt>
                  <dd className="text-[15px] text-void/75">{fullAddress}</dd>
                </div>
                <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                  <dt className="label text-void/70">Telefon</dt>
                  <dd>
                    <a href={company.phone.href} className="text-[15px] text-void/75 hover:text-bronze">
                      {company.phone.display}
                    </a>
                  </dd>
                </div>
                <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                  <dt className="label text-void/70">Godziny pracy</dt>
                  <dd className="text-[15px] text-void/75">{company.hours}</dd>
                </div>
                {aboutContent.scope && (
                  <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr]">
                    <dt className="label text-void/70">Zakres prac</dt>
                    <dd className="text-[15px] text-void/75">{aboutContent.scope}</dd>
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
