import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ArrowButtonProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  tone?: "light" | "dark";
  className?: string;
}

function isInternalRoute(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * `tone` opisuje TŁO, na którym stoi przycisk:
 * "light" = jasna sekcja, "dark" = ciemna sekcja.
 */
export function ArrowButton({
  href,
  children,
  variant = "outline",
  tone = "dark",
  className = "",
}: ArrowButtonProps) {
  const base =
    "group relative inline-flex items-center gap-3 overflow-hidden px-7 py-4 label transition-colors duration-500";

  const variants: Record<string, string> = {
    solid:
      tone === "dark"
        ? "bg-limestone text-void hover:text-void"
        : "bg-void text-limestone hover:text-void",
    outline:
      tone === "dark"
        ? "border border-limestone/25 text-limestone hover:text-void"
        : "border border-void/25 text-void hover:text-void",
    ghost: tone === "dark" ? "text-limestone hover:text-bronze-light" : "text-void hover:text-bronze",
  };

  const content = (
    <>
      {/* Wypełnienie NIE może mieć ujemnego z-index. Przycisk jest `relative`
          z `z-index: auto`, więc nie tworzy kontekstu układania — element
          z `-z-10` lądował pod tłem sekcji i był niewidoczny. Na ciemnym tle
          dawało to znikający przycisk: tekst przechodził na `text-void`,
          a brąz, który miał wjechać pod spód, nigdy się nie pokazywał.
          Treść jest nad wypełnieniem dzięki `relative z-10` poniżej. */}
      {variant !== "ghost" && (
        <span
          className="absolute inset-0 origin-left scale-x-0 bg-bronze-light transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-x-100"
          aria-hidden
        />
      )}
      <span className="relative z-10">{children}</span>
      <ArrowUpRight
        className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-1 group-hover:-translate-y-1"
        strokeWidth={1.5}
      />
    </>
  );

  const cls = `${base} ${variants[variant]} ${className}`;

  return isInternalRoute(href) ? (
    <Link to={href} className={cls}>
      {content}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {content}
    </a>
  );
}
