import { motion } from "framer-motion";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Reveal, RevealGroup, RevealText } from "../components/ui/Reveal";
import { revealItem } from "../lib/variants";

const principles = [
  {
    no: "01",
    title: "Projekt przed produkcją",
    body: "Każdą konstrukcję rozrysowujemy pod konkretny otwór i konkretny budynek, zanim trafi na produkcję.",
  },
  {
    no: "02",
    title: "Systemy, nie improwizacja",
    body: "Pracujemy na sprawdzonych systemach profili aluminiowych — dobieranych do wymagań inwestycji.",
  },
  {
    no: "03",
    title: "Detal decyduje",
    body: "Uszczelnienie, przekładka i sposób osadzenia decydują o tym, jak konstrukcja zachowa się po latach.",
  },
];

export function Manifest() {
  return (
    <section className="relative bg-limestone py-24 text-void md:py-36">
      <div className="container-edge">
        <Reveal>
          <Eyebrow index="01" label="Podejście" tone="dark" />
        </Reveal>

        {/* Nagłówek i akapit stoją obok siebie, wyrównane do wspólnej linii
            dolnej. Wcześniej akapit (`max-w-xl`) leżał pod nagłówkiem przy
            lewej krawędzi i zostawiał obok siebie ~60% pustego wiersza —
            pustka bez funkcji, nie oddech kompozycji. */}
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h2 className="display display-tight text-[8.5vw] leading-[0.94] sm:text-5xl md:text-6xl lg:col-span-8 lg:text-[4.6rem]">
            <RevealText>Aluminium daje architekturze</RevealText>
            <RevealText delay={0.08}>
              <span className="editorial text-sand-deep">smukłość, której nie da</span>
            </RevealText>
            <RevealText delay={0.16}>żaden inny materiał.</RevealText>
          </h2>

          <Reveal delay={0.2} className="lg:col-span-4">
            <p className="max-w-xl text-pretty text-base leading-relaxed text-void/60 md:text-lg lg:max-w-none">
              Wąska rama, duża tafla szkła i konstrukcja, która utrzymuje swoją
              geometrię przez dziesięciolecia. Naszym zadaniem jest sprawić,
              żeby stolarka zniknęła — a został widok.
            </p>
          </Reveal>
        </div>

        {/* Skrajne kolumny bez wcięcia od zewnątrz — inaczej pierwsza zasada
            zaczynała się 32 px w prawo od nagłówka sekcji i cały blok wyglądał
            na przesunięty względem reszty strony. */}
        <RevealGroup className="mt-14 grid gap-px border-y border-void/12 bg-void/12 md:mt-20 md:grid-cols-3" stagger={0.1}>
          {principles.map((p, i) => (
            <motion.div
              key={p.no}
              variants={revealItem}
              className={`bg-limestone py-10 md:px-8 ${i === 0 ? "md:pl-0" : ""} ${
                i === principles.length - 1 ? "md:pr-0" : ""
              }`}
            >
              <span className="label text-bronze">{p.no}</span>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] md:text-[26px]">{p.title}</h3>
              <p className="mt-3.5 max-w-xs text-sm leading-relaxed text-void/60">{p.body}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
