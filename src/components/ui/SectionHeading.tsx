import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";
import { Reveal, RevealText } from "./Reveal";

type Tone = "light" | "dark";

/**
 * Warianty wejścia w sekcję. Ten sam nagłówek powtórzony w każdej sekcji
 * usypia czytelnika — po trzeciej przestaje go czytać. Trzy układy rozdane
 * po stronie utrzymują rytm, nie zmieniając treści.
 *
 * split   — tytuł po lewej, akapit po prawej, wyśrodkowane względem siebie
 * stacked — tytuł pełną szerokością, akapit zrzucony niżej do prawej kolumny
 * inset   — eyebrow nad linią pełnej szerokości, tytuł wcięty do prawej połowy
 */
export type SectionHeadingVariant = "split" | "stacked" | "inset";

interface SectionHeadingProps {
  index?: string;
  eyebrow: string;
  /** Kolejne linie nagłówka — każda wjeżdża osobno zza krawędzi. */
  lines: ReactNode[];
  description?: ReactNode;
  tone?: Tone;
  variant?: SectionHeadingVariant;
  titleClassName?: string;
  className?: string;
}

/* Stopień o krok niższy niż pierwotne 60 px, akapit o krok wyższy. Klientka
   przy każdej sekcji powtarzała to samo: „nagłówek za duży, tekst obok za
   mały”. Różnica 60 px do 14 px robiła z akapitu przypis. */
const DEFAULT_TITLE = "text-[8vw] leading-[0.98] sm:text-4xl md:text-5xl";

export function SectionHeading({
  index,
  eyebrow,
  lines,
  description,
  tone = "light",
  variant = "split",
  titleClassName = DEFAULT_TITLE,
  className = "",
}: SectionHeadingProps) {
  const bodyText = tone === "light" ? "text-limestone/60" : "text-void/70";
  const rule = tone === "light" ? "border-limestone/12" : "border-void/15";

  const title = (
    <h2 className={`display display-tight ${titleClassName}`}>
      {lines.map((line, i) => (
        <RevealText key={i} delay={i * 0.08}>
          {line}
        </RevealText>
      ))}
    </h2>
  );

  if (variant === "stacked") {
    return (
      <div className={className}>
        <Reveal>
          <Eyebrow index={index} label={eyebrow} tone={tone} />
        </Reveal>
        <div className="mt-9">{title}</div>
        {description && (
          <Reveal delay={0.12} className="mt-10 grid lg:grid-cols-12">
            {/* Poniżej `lg` kolumna znika i akapit rozlałby się na całą
                szerokość kontenera — miara wiersza dochodziła do 95 znaków. */}
            {/* Kolumny 9–12, czyli równo z prawą krawędzią kontenera.
                Przy `col-start-8` akapit kończył się na kolumnie 11 i zostawiał
                173 px luzu do krawędzi — nie trafiał ani w nagłówek po lewej,
                ani w krawędź po prawej, więc wyglądał na zawieszony w środku
                wiersza. Widoczne w sekcji „Proces" i na stronie Oferty. */}
            <p
              className={`max-w-xl text-pretty text-sm leading-relaxed md:text-base lg:col-span-4 lg:col-start-9 lg:max-w-none ${bodyText}`}
            >
              {description}
            </p>
          </Reveal>
        )}
      </div>
    );
  }

  if (variant === "inset") {
    return (
      <div className={className}>
        <Reveal>
          <div className={`flex items-center justify-between gap-6 border-b pb-5 ${rule}`}>
            <Eyebrow index={index} label={eyebrow} tone={tone} />
          </div>
        </Reveal>
        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-5">{title}</div>
          {description && (
            <Reveal delay={0.12} className="lg:col-span-3 lg:col-start-5">
              <p className={`text-pretty text-sm leading-relaxed md:text-base ${bodyText}`}>
                {description}
              </p>
            </Reveal>
          )}
        </div>
      </div>
    );
  }

  /* Etykieta nad całym wierszem, a akapit wyśrodkowany w pionie względem
     samego tytułu. Wcześniej akapit był dociśnięty do dolnej krawędzi bloku
     „etykieta + tytuł”, więc przy jednowierszowym tytule wisiał pod nim
     i nie należał ani do tytułu, ani do treści poniżej. */
  return (
    <div className={className}>
      <Reveal>
        <Eyebrow index={index} label={eyebrow} tone={tone} />
      </Reveal>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-12">
        {title}
        {description && (
          <Reveal delay={0.12} className="md:max-w-sm lg:max-w-md">
            <p className={`text-pretty text-base leading-relaxed md:text-lg ${bodyText}`}>{description}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}
