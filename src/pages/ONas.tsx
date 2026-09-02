import { Seo } from "../components/Seo";
import { PageHero } from "../components/ui/PageHero";
import { ParallaxImage } from "../components/ui/ParallaxImage";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { Reveal, RevealText } from "../components/ui/Reveal";
import { images } from "../data/images";
import { company, fullAddress } from "../data/company";

export function ONas() {
  return (
    <>
      <Seo
        title="O nas · Alukoncept Sp. z o.o."
        description="Alukoncept Sp. z o.o. z Sosnowca — projektowanie i wykonawstwo stolarki aluminiowej: okna, drzwi, systemy przesuwne i fasady."
      />
      <PageHero eyebrow="O nas" title="Aluminium traktujemy poważnie." />

      <section className="bg-limestone py-16 text-void md:py-24">
        <div className="container-edge grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="relative lg:col-span-5">
            <ParallaxImage
              src={images.about}
              alt="Precyzja wykonania — zdjęcie poglądowe"
              /* 4/5 ma sens w kolumnie 5/12 na desktopie. Na pełnej szerokości
                 kontenera dawało przy 941 px kadr 887 x 1108 px — jeden ekran
                 zdjęcia przed pierwszym zdaniem o firmie. */
              className="aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-[4/5]"
            />
            <PlaceholderTag className="absolute right-3 top-3" />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="display display-tight text-[8vw] leading-[0.96] sm:text-4xl md:text-5xl">
              <RevealText>Projektujemy i wykonujemy</RevealText>
              <RevealText delay={0.08}>
                <span className="editorial text-sand-deep">konstrukcje aluminiowe</span>
              </RevealText>
            </h2>

            <Reveal delay={0.14}>
              <p className="mt-9 max-w-xl text-pretty leading-relaxed text-void/60 md:text-lg">
                Zajmujemy się oknami, drzwiami, systemami przesuwnymi
                i fasadami aluminiowymi. Każdy projekt traktujemy
                indywidualnie — od pojedynczego otworu po kompletną kopertę
                budynku. Pracujemy w oparciu o sprawdzone systemy profili
                i dbamy o to, żeby konstrukcja pasowała zarówno do budynku,
                jak i do oczekiwań inwestora.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <dl className="mt-12 divide-y divide-void/12 border-y border-void/12">
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
                  <dt className="label text-void/70">Zakres prac</dt>
                  <dd className="text-[15px] text-void/75">
                    Okna · drzwi · systemy przesuwne · fasady · konstrukcje indywidualne
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
