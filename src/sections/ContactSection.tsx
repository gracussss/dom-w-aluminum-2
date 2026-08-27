import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Reveal, RevealText } from "../components/ui/Reveal";
import { company, fullAddress, googleMapsSearchUrl } from "../data/company";
import { images } from "../data/images";
import { SIZES_FULL, responsiveSrcSet } from "../lib/responsiveImage";

export function ContactSection() {
  return (
    <section id="kontakt" className="grain relative overflow-hidden bg-void py-28 text-limestone md:py-40">
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
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow index="05" label="Kontakt" tone="light" />
            </Reveal>

            <h2 className="display display-tight mt-9 text-[11vw] leading-[0.92] sm:text-6xl md:text-7xl lg:text-[5.4rem]">
              <RevealText>Porozmawiajmy</RevealText>
              <RevealText delay={0.08}>
                <span className="editorial text-aluminium">o Twojej konstrukcji</span>
              </RevealText>
            </h2>

            <Reveal delay={0.16}>
              <p className="mt-9 max-w-lg text-pretty text-base leading-relaxed text-limestone/55 md:text-lg">
                Pojedyncze okno, kompletna stolarka domu czy fasada budynku —
                opisz projekt, a wrócimy z konkretną propozycją i realnym
                terminem realizacji.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-11 flex flex-wrap gap-4">
                <Link
                  to="/kontakt"
                  className="group inline-flex items-center gap-3 bg-limestone px-8 py-4.5 label text-void transition-colors duration-300 hover:bg-bronze-light"
                >
                  Zapytaj o wycenę
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

          {/* Dane firmy — jedyne w pełni potwierdzone informacje na stronie */}
          <Reveal delay={0.2} className="lg:col-span-4 lg:col-start-9">
            <div className="border-t border-limestone/15 pt-8">
              <p className="label text-limestone/55">Dane firmy</p>

              <p className="mt-6 text-xl font-semibold tracking-[-0.02em]">{company.legalName}</p>

              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="group mt-5 flex items-start gap-3 text-limestone/65 transition-colors hover:text-bronze-light"
              >
                <MapPin className="mt-1 h-4 w-4 shrink-0" strokeWidth={1.4} />
                <span className="leading-relaxed">{fullAddress}</span>
              </a>

              <a
                href={company.phone.href}
                className="mt-4 flex items-center gap-3 text-limestone transition-colors hover:text-bronze-light"
              >
                <Phone className="h-4 w-4 shrink-0" strokeWidth={1.4} />
                <span className="text-2xl font-semibold tracking-[-0.02em]">{company.phone.display}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
