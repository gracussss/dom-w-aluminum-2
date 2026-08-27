import { useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { openCookieSettings, useConsent } from "../../lib/cookieConsent";

interface MapEmbedProps {
  src: string;
  title: string;
  /** Adres do otwarcia mapy w nowej karcie — alternatywa bez osadzania. */
  externalHref: string;
  /** Podpis nad przyciskiem, np. pełny adres firmy. */
  caption: string;
  className?: string;
}

/**
 * Mapa Google osadzana DOPIERO za zgodą.
 *
 * Sam `<iframe>` z google.com/maps pobiera zasoby z serwerów Google i zapisuje
 * identyfikatory, zanim użytkownik cokolwiek kliknie. Wcześniej ładował się
 * bezwarunkowo — strona łamała własną politykę cookies już na wejściu.
 *
 * Kolejność: zgoda marketingowa zapisana → mapa od razu. Bez zgody → kafelek
 * z jawną informacją, co się stanie po kliknięciu. Kliknięcie ładuje mapę
 * jednorazowo, na tę wizytę, i niczego nie zapisuje w imieniu użytkownika.
 */
export function MapEmbed({ src, title, externalHref, caption, className = "" }: MapEmbedProps) {
  const consent = useConsent();
  const [allowedOnce, setAllowedOnce] = useState(false);
  const show = allowedOnce || consent?.marketing === true;

  if (show) {
    return (
      <div className={`overflow-hidden border border-void/12 ${className}`}>
        <iframe
          title={title}
          src={src}
          className="h-full w-full grayscale"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return (
    <div
      className={`blueprint-grid flex flex-col items-start justify-center gap-4 border border-void/12 bg-void/[0.035] p-6 text-left md:p-8 ${className}`}
    >
      <MapPin className="h-6 w-6 text-bronze" strokeWidth={1.4} />
      <p className="text-base font-semibold tracking-[-0.02em] text-void">{caption}</p>
      <p className="max-w-sm text-sm leading-relaxed text-void/65">
        Mapa pochodzi z serwisu Google. Jej wyświetlenie łączy Twoją przeglądarkę
        z serwerami Google i zapisuje pliki cookies, dlatego nie ładujemy jej
        bez Twojej zgody.
      </p>
      <div className="mt-1 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setAllowedOnce(true)}
          className="border border-void/30 px-5 py-3 label text-xs uppercase text-void transition-colors hover:border-void hover:bg-void hover:text-limestone"
        >
          Pokaż mapę
        </button>
        <a
          href={externalHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 border border-void/15 px-5 py-3 label text-xs uppercase text-void/70 transition-colors hover:border-void/40 hover:text-void"
        >
          Otwórz w Google Maps
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
        </a>
      </div>
      <button
        type="button"
        onClick={openCookieSettings}
        className="label-sm mt-1 text-void/60 underline underline-offset-4 transition-colors hover:text-void"
      >
        Ustawienia cookies
      </button>
    </div>
  );
}
