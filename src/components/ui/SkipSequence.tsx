import type { RefObject } from "react";
import { ArrowDown } from "lucide-react";
import { scrollToY } from "../../lib/scroll";

interface SkipSequenceProps {
  /** Sekcja do pominięcia — skok ląduje tuż za jej dolną krawędzią. */
  section: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Wyjście z sekwencji prowadzonej scrollem.
 *
 * Sekcja „Jak powstaje konstrukcja” zajmuje kilka ekranów przewijania i nie
 * da się jej przejść inaczej niż krok po kroku — kto zna już temat albo
 * szuka konkretnej informacji, musiał przekręcić całość (uwaga klientki).
 *
 * Skok jest natychmiastowy, nie płynny: przewijanie przez cztery ekrany
 * z włączonym `scrub` przepuszczałoby po drodze całą sekwencję kamery, czyli
 * dokładnie to, czego ten przycisk ma oszczędzić — a na telefonie kosztowałoby
 * też sekundę renderowania sceny 3D.
 */
export function SkipSequence({ section, className = "" }: SkipSequenceProps) {
  const skip = () => {
    const el = section.current;
    if (!el) return;
    /* Dolna krawędź sekcji = górna krawędź następnej. Przyklejony kadr zajmuje
       ostatni ekran sekcji, więc dopiero ta wartość wyprowadza poza sekwencję. */
    scrollToY(el.offsetTop + el.offsetHeight);
  };

  return (
    <button
      type="button"
      onClick={skip}
      className={`label group pointer-events-auto inline-flex items-center gap-2.5 text-limestone/55 transition-colors duration-300 hover:text-limestone ${className}`}
    >
      Pomiń sekwencję
      <ArrowDown
        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
        strokeWidth={1.5}
      />
    </button>
  );
}
