interface PlaceholderTagProps {
  className?: string;
  label?: string;
  /**
   * Tło, na którym stoi etykieta.
   * "photo" — na zdjęciu lub w ciemnej sekcji (domyślne),
   * "light" — w jasnej sekcji, jako przypis obok treści.
   */
  tone?: "photo" | "light";
}

/**
 * Dyskretna etykieta materiału tymczasowego — placeholder nigdy nie może
 * być odebrany jako informacja potwierdzona.
 *
 * Wariant wybieramy propsem, NIE nadpisaniem klas przez `className`.
 * Przy nadpisywaniu o zwycięzcy decyduje kolejność reguł w arkuszu, a nie
 * kolejność klas w atrybucie: `bg-transparent` przegrywało z `bg-void/80`,
 * podczas gdy `text-void/70` wygrywało z `text-limestone/80`. Efektem był
 * ciemny tekst na ciemnej podkładce — etykieta w katalogu była nieczytelna.
 */
export function PlaceholderTag({
  className = "",
  label = "Zdjęcie poglądowe",
  tone = "photo",
}: PlaceholderTagProps) {
  /* Podkładka na zdjęciu musi być gęsta: etykieta ląduje i na jasnym,
     i na ciemnym kadrze — przy bg-void/55 kontrast spadał do 2.9:1. */
  const styles =
    tone === "photo"
      ? "border-limestone/15 bg-void/80 text-limestone/80 backdrop-blur-sm"
      : "border-void/20 text-void/70";

  return (
    <span
      className={`label-sm pointer-events-none inline-flex items-center border px-2 py-1 ${styles} ${className}`}
    >
      {label}
    </span>
  );
}
