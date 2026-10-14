import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { Seo } from "../components/Seo";
import { ArrowButton } from "../components/ui/ArrowButton";
import { Eyebrow } from "../components/ui/Eyebrow";
import { company } from "../data/company";
import { navItems } from "../data/nav";

export function NotFound() {
  return (
    <>
      {/* Strona błędu nie ma czego wnieść do wyników wyszukiwania —
          odnośniki zostają śledzone, sama strona nie jest indeksowana. */}
      <Seo
        title="Strona nie znaleziona"
        description="Pod tym adresem nie ma strony. Przejdź do katalogu systemów, oferty lub kontaktu."
        noindex
      />
      <section className="grain relative flex min-h-[80svh] flex-col items-center justify-center overflow-hidden bg-void px-6 pb-20 pt-32 text-center text-limestone">
        <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative flex flex-col items-center">
          <Eyebrow label="Błąd 404" tone="light" />
          <h1 className="display display-tight mt-7 text-[13vw] leading-none sm:text-6xl md:text-7xl">
            Nie znaleziono strony
          </h1>
          <p className="mt-6 max-w-md text-pretty text-lg text-limestone/65">
            Strona, której szukasz, nie istnieje lub została przeniesiona. Może
            szukasz jednej z tych?
          </p>

          {/* Najczęstsze cele zamiast jednego przycisku „wróć” – z błędnego
              adresu (stary link, literówka) trafia się zwykle po konkretną
              rzecz, nie po stronę główną. */}
          <nav aria-label="Przydatne strony" className="mt-9 flex flex-wrap justify-center gap-x-7 gap-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="label text-[13px] text-limestone/75 underline-offset-8 transition-colors hover:text-bronze-light hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-11 flex flex-wrap justify-center gap-4">
            <ArrowButton href="/" variant="outline" tone="dark">
              Wróć na stronę główną
            </ArrowButton>
            <a
              href={company.phone.href}
              className="inline-flex items-center gap-3 border border-limestone/25 px-7 py-4 label text-limestone transition-colors hover:border-limestone/60"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
              Zadzwoń: {company.phone.display}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
