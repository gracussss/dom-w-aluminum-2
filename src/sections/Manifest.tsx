import { motion } from "framer-motion";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Reveal, RevealGroup, RevealText } from "../components/ui/Reveal";
import { revealItem } from "../lib/variants";
import { homeContent } from "../data/pages";
import type { HomeContent } from "../data/pages";

/* Liczba kolumn idzie za liczbą zasad z panelu (2–4). Stałe trzy kolumny
   przy czterech pozycjach zostawiały w drugim rzędzie dwie puste komórki —
   przy liniach rysowanych odstępem widać je jako dziury w siatce. */
const COLUMNS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

export function Manifest({ content = homeContent.approach }: { content?: HomeContent["approach"] }) {
  const principles = content.principles;

  /* Krótsze dolne pole: zaraz pod spodem jest „Proces” na tym samym
     jasnym tle, a jego treść i tak stoi wyśrodkowana w pełnym ekranie.
     Przy pełnym polu obu sekcji między nimi zostawało ~300 px pustki. */
  return (
    <section className="relative bg-limestone pb-8 pt-20 text-void md:pb-10 md:pt-28">
      <div className="container-edge">
        <Reveal>
          <Eyebrow index="03" label={content.eyebrow} tone="dark" />
        </Reveal>

        {/* Nagłówek i akapit stoją obok siebie. Wcześniej akapit (`max-w-xl`)
            leżał pod nagłówkiem przy lewej krawędzi i zostawiał obok siebie
            ~60% pustego wiersza — pustka bez funkcji, nie oddech kompozycji.
            Akapit jest wyśrodkowany w pionie względem nagłówka, nie dosunięty
            do jego dolnej linii, a nagłówek zszedł z 74 px — uwagi klientki:
            „tekst ma być na środku tego, co obok”, „nagłówek za duży”. */}
        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <h2 className="display display-tight text-[8vw] leading-[0.98] sm:text-4xl md:text-5xl lg:col-span-8 lg:text-[3.5rem]">
            {content.title.map((line, i) => (
              <RevealText key={i} delay={i * 0.08}>
                {line.accent ? <span className="editorial text-sand-deep">{line.text}</span> : line.text}
              </RevealText>
            ))}
          </h2>

          <Reveal delay={0.2} className="lg:col-span-4">
            <p className="max-w-xl text-pretty text-lg leading-relaxed text-void/65 md:text-xl lg:max-w-none">
              {content.lead}
            </p>
          </Reveal>
        </div>

        {/* Skrajne kolumny bez wcięcia od zewnątrz — inaczej pierwsza zasada
            zaczynała się 32 px w prawo od nagłówka sekcji i cały blok wyglądał
            na przesunięty względem reszty strony. */}
        <RevealGroup className={`mt-12 grid gap-px border-y border-void/12 bg-void/12 md:mt-16 ${COLUMNS[principles.length] ?? "md:grid-cols-3"}`} stagger={0.1}>
          {principles.map((p, i) => (
            <motion.div
              key={i}
              variants={revealItem}
              className={`bg-limestone py-10 md:px-8 ${i === 0 ? "md:pl-0" : ""} ${
                i === principles.length - 1 ? "md:pr-0" : ""
              }`}
            >
              <span className="label text-bronze">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] md:text-[26px]">{p.title}</h3>
              <p className="mt-3.5 max-w-xs text-sm leading-relaxed text-void/60">{p.body}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
