interface PlaceholderTagProps {
  className?: string;
  label?: string;
}

/**
 * Dyskretna etykieta materiału tymczasowego — placeholder nigdy nie może
 * być odebrany jako informacja potwierdzona.
 */
export function PlaceholderTag({ className = "", label = "Zdjęcie poglądowe" }: PlaceholderTagProps) {
  return (
    <span
      /* Podkładka musi być gęsta: etykieta ląduje i na ciemnym zdjęciu,
         i na jasnej sekcji — przy bg-void/55 kontrast spadał do 2.9:1. */
      className={`label-sm pointer-events-none inline-flex items-center border border-limestone/15 bg-void/80 px-2 py-1 text-limestone/80 backdrop-blur-sm ${className}`}
    >
      {label}
    </span>
  );
}
