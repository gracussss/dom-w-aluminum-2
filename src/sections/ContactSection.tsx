import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Reveal, RevealText } from "../components/ui/Reveal";
import { company, fullAddress, googleMapsSearchUrl } from "../data/company";
import { images } from "../data/images";
import { SIZES_FULL, responsiveSrcSet } from "../lib/responsiveImage";

export function ContactSection() {
  return (
    <section id="kontakt" className="grain relative overflow-hidden bg-void pb-14 pt-20 text-limestone md:pb-16 md:pt-28">
      <div className="absolute inset-0">
        <img
          src={images.contact}
          srcSet={responsiveSrcSet(images.contact)}
          sizes={SIZES_FULL}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-[0.18]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-void via-void/80 to-void" />
      <div className="blueprint-grid absolute inset-0 opacity-30" aria-hidden />

      <div className="container-edge relative">
        {/* Dane firmy wyśrodkowane w pionie względem bloku po lewej —
            uwaga klientki: „na wysokości środka tego, co obok”. */}
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow index="05" label="Kontakt" tone="light" />
            </Reveal>

            <h2 className="display display-tight mt-6 text-[10vw] leading-[0.96] sm:text-5xl md:text-6xl lg:text-[4rem]">
              <RevealText>Porozmawiajmy</RevealText>
              <RevealText delay={0.08}>
                <span className="editorial text-aluminium">o Twojej konstrukcji</span>
              </RevealText>
            </h2>

            <Reveal delay={0.16}>
              <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-limestone/65 md:text-xl">
                Pojedyncze okno, kompletna stolarka domu czy fasada budynku —
                opisz projekt, a wrócimy z konkretną propozycją i realnym
                terminem realizacji.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap gap-4">
                {/* Akapit obok mówi „opisz projekt, a wrócimy…” — przycisk
                    powtarza to samo słowo, żeby czynność i obietnica się zgadzały. */}
                <Link
                  to="/kontakt"
                  className="group inline-flex items-center gap-3 bg-limestone px-8 py-4.5 label text-void transition-colors duration-300 hover:bg-bronze-light"
                >
                  Opisz projekt
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.5}
                  />
                </Link>
                <a
                  href={company.phone.href}
                  className="inline-flex items-center gap-3 border border-limestone/25 px-8 py-4.5 label text-limestone transition-colors duration-300 hover:border-limestone/60"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Zadzwoń: {company.phone.display}
                </a>
              </div>
            </Reveal>
          </div>

          {/* Dane firmy — jedyne w pełni potwierdzone informacje na stronie.
              Bez kreski nad blokiem (klientka: „niepotrzebna”). */}
          <Reveal delay={0.2} className="lg:col-span-4 lg:col-start-9">
            <div>
              <p className="label text-[13px] text-limestone/60">Dane firmy</p>

              <p className="mt-6 text-xl font-semibold tracking-[-0.02em]">{company.legalName}</p>

              {/* Adres i telefon tym samym krojem i stopniem — telefon nie jest
                  już pogrubiony ani większy od adresu (uwaga klientki: „bez
                  pogrubiania, ta sama czcionka co to, może być większe”). */}
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="group mt-5 flex items-start gap-3 text-lg text-limestone/75 transition-colors hover:text-bronze-light"
              >
                <MapPin className="mt-1.5 h-4 w-4 shrink-0" strokeWidth={1.4} />
                <span className="leading-relaxed">{fullAddress}</span>
              </a>

              <a
                href={company.phone.href}
                className="mt-3 flex items-center gap-3 text-lg text-limestone/75 transition-colors hover:text-bronze-light"
              >
                <Phone className="h-4 w-4 shrink-0" strokeWidth={1.4} />
                <span className="leading-relaxed">{company.phone.display}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
