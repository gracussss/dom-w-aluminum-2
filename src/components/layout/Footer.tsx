import { Link } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { company, googleMapsSearchUrl } from "../../data/company";
import { footerNav } from "../../data/nav";
import { SocialIcons } from "../ui/SocialIcons";
import { LogoMark } from "../ui/Logo";

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-void pt-20 text-limestone md:pt-28">
      <div className="blueprint-grid absolute inset-0 opacity-30" aria-hidden />

      <div className="container-edge relative">
        <div className="grid gap-14 border-t border-limestone/10 pb-16 pt-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr]">
          <div>
            <span className="flex items-center gap-3">
              <LogoMark className="h-8 w-8 text-limestone" accent="var(--color-bronze-light)" />
              <span className="text-lg font-semibold tracking-[-0.02em]">DOM W ALUMINIUM</span>
            </span>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-limestone/55">
              Okna, drzwi, systemy i fasady aluminiowe. Projektujemy
              i wykonujemy konstrukcje dopasowane do konkretnego budynku.
            </p>
            <SocialIcons className="mt-7" tone="dark" />
          </div>

          <div>
            <p className="label text-limestone/55">Firma</p>
            <ul className="mt-6 space-y-3.5 text-sm">
              {footerNav.firma.map((item) => (
                <li key={item.href}>
                  {/* `inline-block` + pionowa wyściółka: cel dotykowy rośnie
                      do 27 px, ujemny margines zdejmuje zmianę z układu. */}
                  <Link
                    to={item.href}
                    className="inline-block py-1.5 -my-1.5 text-limestone/65 transition-colors hover:text-bronze-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-limestone/55">Oferta</p>
            <ul className="mt-6 space-y-3.5 text-sm">
              {footerNav.oferta.map((item) => (
                <li key={item.href}>
                  {/* `inline-block` + pionowa wyściółka: cel dotykowy rośnie
                      do 27 px, ujemny margines zdejmuje zmianę z układu. */}
                  <Link
                    to={item.href}
                    className="inline-block py-1.5 -my-1.5 text-limestone/65 transition-colors hover:text-bronze-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-limestone/55">Kontakt</p>
            <ul className="mt-6 space-y-4 text-sm">
              <li className="text-limestone/55">{company.legalName}</li>
              <li>
                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-2.5 text-limestone/65 transition-colors hover:text-bronze-light"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.4} />
                  <span>
                    {company.address.street}
                    <br />
                    {company.address.postalCode} {company.address.city}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={company.phone.href}
                  className="flex items-center gap-2.5 text-limestone transition-colors hover:text-bronze-light"
                >
                  <Phone className="h-4 w-4 shrink-0" strokeWidth={1.4} />
                  <span className="text-base">{company.phone.display}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-limestone/10 py-8 text-xs text-limestone/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legalName}. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-7">
            {footerNav.legal.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="inline-block py-2 -my-2 transition-colors hover:text-limestone/70"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
