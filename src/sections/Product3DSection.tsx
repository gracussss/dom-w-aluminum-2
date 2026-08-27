import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { SystemViewer } from "../components/product3d/SystemViewer";
import { images } from "../data/images";

export function Product3DSection() {
  return (
    <section className="relative bg-limestone py-24 text-void md:py-32">
      <div className="container-edge">
        <SectionHeading
          index="04"
          eyebrow="Model konstrukcji"
          tone="dark"
          variant="inset"
          lines={["Obejrzyj okno", "od środka"]}
          description="Obróć model, otwórz skrzydło i rozłóż konstrukcję na warstwy. Docelowo w tym miejscu może znaleźć się dowolny system z katalogu."
        />

        <Reveal delay={0.1} className="mt-14">
          <SystemViewer
            modelType="okno"
            /* Sekcja stoi na jasnym tle — kolumna opisowa musi iść za nim. */
            tone="dark"
            fallbackImage={images.systems}
            description="Model przedstawia zasadę budowy okna aluminiowego: dwie powłoki profilu rozdzielone przekładką termiczną, skrzydło oraz pakiet szybowy."
          />
        </Reveal>
      </div>
    </section>
  );
}
