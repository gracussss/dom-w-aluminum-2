import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Phone } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { images } from "../data/images";
import { company } from "../data/company";
import { PlaceholderTag } from "../components/ui/PlaceholderTag";
import { EASE_OUT } from "../lib/motion";
import { SIZES_FULL, responsiveSrcSet } from "../lib/responsiveImage";

const ticker = [
  "OKNA",
  "DRZWI",
  "DRZWI PRZESUWNE",
  "FASADY",
  "SYSTEMY WEWNĘTRZNE",
  "SYSTEMY PPOŻ.",
  "OGRODY ZIMOWE",
  "KONSTRUKCJE INDYWIDUALNE",
];

/* Warianty wejścia — odgrywane raz, zaraz po zamontowaniu strony.
   130%, nie 108%: maski niżej mają poszerzony obszar przycięcia
   (patrz RevealText), więc ukryta linia musi startować pod jego
   dolną krawędzią — inaczej wystaje przed animacją. */
const rise = { out: { y: "130%" }, in: { y: "0%" } };
const fadeUp = { out: { opacity: 0, y: 14 }, in: { opacity: 1, y: 0 } };
const fadeUpFar = { out: { opacity: 0, y: 18 }, in: { opacity: 1, y: 0 } };
const settle = { out: { scale: 1.14 }, in: { scale: 1 } };

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "34%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative flex h-[100svh] min-h-[640px] w-full flex-col overflow-hidden bg-void">
      {/* Tło architektoniczne */}
      <motion.div style={{ y: imgY }} className="absolute inset-0 -bottom-[18%]">
        <motion.img
          src={images.heroBg}
          srcSet={responsiveSrcSet(images.heroBg)}
          sizes={SIZES_FULL}
          alt="Nowoczesna architektura – konstrukcja ze szkła i aluminium"
          variants={settle}
          initial="out"
          animate="in"
          transition={{ duration: 2.2, ease: EASE_OUT }}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </motion.div>

      {/* Warstwy tonalne — czytelność typografii bez „przyciemnienia na czarno” */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/45 to-void/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-void/85 via-void/10 to-transparent" />
      <div className="grain absolute inset-0" />

      {/* Znaczniki techniczne */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-full lg:block">
        <span className="absolute left-8 top-32 h-14 w-14 border-l border-t border-limestone/20" />
        <span className="absolute bottom-32 right-8 h-14 w-14 border-b border-r border-limestone/20" />
      </div>

      <motion.div
        style={{ y: contentY, opacity: fade }}
        /* Treść wyśrodkowana w pionie, nie dosunięta do dołu. Uwaga klientki:
           nad nagłówkiem zostawała pusta połowa ekranu, a pas zgody na
           cookies przy pierwszej wizycie zasłaniał dolną linię napisu.
           Dolne pole większe od górnego o wysokość paska oferty — środek
           liczony jest wtedy względem widocznej części zdjęcia. */
        className="container-edge relative z-10 flex flex-1 flex-col justify-center pb-16 pt-28 md:pb-20 lg:pb-24"
      >
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          {/* Blok nagłówka bierze całą wolną szerokość zamiast twardego
              `max-w-4xl`. Przy 1440 px ograniczenie do 896 px łamało linię
              kursywy na dwie, przez co człon podrzędny („dla nowoczesnej
              architektury") zajmował połowę nagłówka i zrównywał się wagą
              z głównym zdaniem. */}
          <div className="max-w-4xl lg:max-w-none lg:flex-1">
            <motion.div
              variants={fadeUp}
              initial="out"
              animate="in"
              transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT }}
              className="mb-8"
            >
              {/* Bez kreski — tak jak etykiety wszystkich sekcji (`Eyebrow`). */}
              <span className="label text-sm text-limestone/80 md:text-base">Producent stolarki aluminiowej</span>
            </motion.div>

            {/* Maski linii: `overflow-clip` z marginesem zamiast `overflow-hidden`.
                Przy interlinii 0.88 line-box jest niższy niż tusz kroju i ogonki
                „j" w „nowoczesnej" oraz „y" w „architektury" były ścinane płasko. */}
            <h1 className="display display-tight text-[13.5vw] leading-[0.88] text-limestone sm:text-[9vw] lg:text-[6.2rem] xl:text-[6.9rem] 2xl:text-[7.4rem]">
              <span className="block overflow-clip [overflow-clip-margin:0.18em]">
                <motion.span
                  variants={rise}
                  initial="out"
                  animate="in"
                  transition={{ duration: 1.05, delay: 0.1, ease: EASE_OUT }}
                  className="block"
                >
                  STOLARKA
                </motion.span>
              </span>
              <span className="block overflow-clip [overflow-clip-margin:0.18em]">
                <motion.span
                  variants={rise}
                  initial="out"
                  animate="in"
                  transition={{ duration: 1.05, delay: 0.19, ease: EASE_OUT }}
                  className="block"
                >
                  ALUMINIOWA
                </motion.span>
              </span>
              <span className="block overflow-clip [overflow-clip-margin:0.18em]">
                <motion.span
                  variants={rise}
                  initial="out"
                  animate="in"
                  transition={{ duration: 1.05, delay: 0.28, ease: EASE_OUT }}
                  className="editorial block text-[0.78em] tracking-[-0.02em] text-aluminium-light"
                >
                  dla nowoczesnej architektury
                </motion.span>
              </span>
            </h1>
          </div>

          <motion.div
            variants={fadeUpFar}
            initial="out"
            animate="in"
            transition={{ duration: 0.85, delay: 0.6, ease: EASE_OUT }}
            className="w-full shrink-0 lg:w-[380px]"
          >
            {/* Większy stopień, prawie pełna biel i miękki cień pod literami.
                Akapit stoi po prawej, nad jasnym fragmentem zdjęcia, gdzie
                lewy gradient już nie sięga — przy 15 px i 60% krycia klientka
                oceniła go jako „średnio widoczny”. */}
            <p className="text-pretty text-lg leading-relaxed text-limestone/90 [text-shadow:0_1px_14px_rgb(11_12_13/0.75)] md:text-xl">
              Projektujemy i wykonujemy konstrukcje aluminiowe – od
              pojedynczego okna po kompletną fasadę budynku.
            </p>

            {/* „Opisz projekt”, nie „Zapytaj o wycenę”: ten drugi przycisk stoi
                w headerze i na pierwszym ekranie byłby widoczny dwa razy z tym
                samym napisem. Etykieta mówi też, czego naprawdę potrzebujemy,
                żeby wycenić — opisu, nie samego zapytania. */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/kontakt"
                className="group inline-flex items-center gap-2.5 bg-limestone px-6 py-3.5 label text-void transition-colors duration-300 hover:bg-bronze-light"
              >
                Opisz projekt
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.5}
                />
              </Link>
              <a
                href={company.phone.href}
                className="inline-flex items-center gap-2.5 border border-limestone/25 px-6 py-3.5 label text-limestone transition-colors duration-300 hover:border-limestone/60"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                {company.phone.display}
              </a>
            </div>
          </motion.div>
        </div>

        <PlaceholderTag className="mt-8 self-start lg:absolute lg:bottom-14 lg:right-0 lg:mt-0" />
      </motion.div>

      {/* Pasek zakresu oferty */}
      <div className="relative z-10 overflow-hidden border-t border-limestone/12 bg-void/60 py-3.5 backdrop-blur-sm">
        {/* Ruch w pętli zatrzymany przy prefers-reduced-motion (WCAG 2.2.2).
            Reguła CSS tego nie łapie — framer-motion animuje transformem w JS. */}
        <motion.div
          animate={reduced ? { x: "0%" } : { x: ["0%", "-50%"] }}
          transition={reduced ? { duration: 0 } : { duration: 42, repeat: Infinity, ease: "linear" }}
          className="flex w-max items-center gap-8 whitespace-nowrap"
        >
          {[...ticker, ...ticker].map((item, i) => (
            <span key={i} className="flex items-center gap-8 label text-limestone/55">
              {item}
              <span className="text-bronze-light/70">◦</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
