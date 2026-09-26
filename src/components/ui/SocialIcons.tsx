import type { SVGProps } from "react";
import { socialLinks } from "../../data/company";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.3" cy="6.7" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Litera „f" zamknięta w tej samej ramce co znak Instagrama — bez niej
 * obie ikony stały obok siebie w dwóch różnych konwencjach rysunkowych.
 */
function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <path d="M14.9 8.3h-1.2a1.4 1.4 0 0 0-1.4 1.4v1.9h2.5" />
      <path d="M10.3 11.6h3.5" />
      <path d="M12.3 11.6v8.1" />
    </svg>
  );
}

const ALL = [
  { label: "Instagram", href: socialLinks.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: socialLinks.facebook, Icon: FacebookIcon },
];

interface SocialIconsProps {
  className?: string;
  tone?: "light" | "dark";
  /** Nagłówek nad ikonami. */
  heading?: string;
  /** Wyrównanie nagłówka i ikon w swoim bloku. */
  align?: "start" | "center";
  /** „lg” — przy mapie w kontakcie, gdzie 44 px ginęło obok kadru mapy. */
  size?: "md" | "lg";
}

/**
 * Profile społecznościowe.
 *
 * Ikony rysują się zawsze — są stałym elementem stopki, nie zależnym od tego,
 * czy konta są już założone. Dopóki w `socialLinks` nie ma adresu, kafel jest
 * przyciskiem oznaczonym jako „profil w przygotowaniu”: wygląda i zachowuje
 * się jak reszta interfejsu, da się na nim zatrzymać tabulatorem, ale nie
 * udaje działającego odnośnika. Po wpisaniu adresu staje się zwykłym linkiem.
 */
export function SocialIcons({
  className = "",
  tone = "dark",
  heading,
  align = "start",
  size = "md",
}: SocialIconsProps) {
  const border = tone === "dark" ? "border-limestone/15" : "border-void/15";
  const text = tone === "dark" ? "text-limestone/60" : "text-void/60";
  const headingText = tone === "dark" ? "text-limestone/55" : "text-void/70";

  const box = size === "lg" ? "h-14 w-14" : "h-11 w-11";
  const glyphSize = size === "lg" ? "h-6 w-6" : "h-[18px] w-[18px]";
  const centered = align === "center";

  const tile = `group relative flex ${box} items-center justify-center overflow-hidden border ${border} ${text} transition-colors duration-500 hover:text-void`;

  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {heading && <p className={`label ${headingText}`}>{heading}</p>}
      <div className={`flex items-center gap-2.5 ${centered ? "justify-center" : ""} ${heading ? "mt-4" : ""}`}>
        {ALL.map(({ label, href, Icon }) => {
          const fill = (
            <span
              className="absolute inset-0 origin-bottom scale-y-0 bg-bronze-light transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-y-100"
              aria-hidden
            />
          );
          const glyph = (
            <Icon
              className={`relative z-10 ${glyphSize} transition-transform duration-500 ease-[var(--ease-premium)] group-hover:-translate-y-px`}
              strokeWidth={1.4}
            />
          );

          if (!href) {
            return (
              <button
                key={label}
                type="button"
                aria-disabled="true"
                title={`${label} — profil w przygotowaniu`}
                aria-label={`${label} — profil w przygotowaniu`}
                onClick={(e) => e.preventDefault()}
                className={tile}
              >
                {fill}
                {glyph}
              </button>
            );
          }

          return (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${label} — profil firmy (otwiera się w nowej karcie)`}
              className={tile}
            >
              {fill}
              {glyph}
            </a>
          );
        })}
      </div>
    </div>
  );
}
