import { Fragment } from "react";
import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  /** Brak `to` = pozycja bieżąca, nieklikalna. */
  to?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Ścieżka nawigacyjna. Na karcie systemu zastępuje pojedynczy odnośnik
 * „wstecz” — pokazuje, gdzie w katalogu użytkownik się znajduje,
 * i daje wyjście na poziom kategorii, a nie tylko na całą listę.
 */
export function Breadcrumbs({ items, tone = "light", className = "" }: BreadcrumbsProps) {
  const base = tone === "light" ? "text-limestone/55" : "text-void/60";
  const hover = tone === "light" ? "hover:text-limestone" : "hover:text-void";
  const separator = tone === "light" ? "text-limestone/25" : "text-void/30";

  return (
    <nav aria-label="Ścieżka nawigacyjna" className={className}>
      <ol className={`label flex flex-wrap items-center gap-x-2.5 gap-y-1 ${base}`}>
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <li aria-hidden className={separator}>
                /
              </li>
            )}
            <li>
              {item.to ? (
                <Link to={item.to} className={`transition-colors ${hover}`}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page">{item.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
