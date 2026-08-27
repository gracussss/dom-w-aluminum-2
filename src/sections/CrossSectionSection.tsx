import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { CrossSection } from "../components/crosssection";

export function CrossSectionSection() {
  return (
    <section id="przekroj" className="grain relative overflow-hidden bg-void py-24 text-limestone md:py-32">
      <div className="container-edge relative">
        <SectionHeading
          index="05"
          eyebrow="Przekrój profilu"
          tone="light"
          variant="stacked"
          lines={["Z czego zbudowany", "jest profil"]}
          description="Najedź na element listy, żeby zobaczyć go na rysunku. Schemat można przybliżyć i przesunąć."
        />

        <Reveal delay={0.1} className="mt-14">
          <CrossSection />
        </Reveal>
      </div>
    </section>
  );
}
