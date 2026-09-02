import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageHero } from "../components/ui/PageHero";
import { LegalPlaceholder } from "../components/ui/LegalPlaceholder";
import { company, fullAddress } from "../data/company";

const sections: { title: string; body: ReactNode }[] = [
  {
    title: "1. Administrator danych",
    body: (
      <>
        <p>
          Administratorem danych osobowych jest {company.legalName},{" "}
          {fullAddress}.
        </p>
        <LegalPlaceholder>
          Miejsce na numer NIP / REGON / KRS oraz dane kontaktowe do spraw
          związanych z ochroną danych osobowych — do uzupełnienia przez
          klienta.
        </LegalPlaceholder>
      </>
    ),
  },
  {
    title: "2. Jakie dane przetwarzamy",
    body: (
      <p>
        W związku z korzystaniem z formularza kontaktowego przetwarzamy dane
        podane dobrowolnie przez użytkownika (np. imię i nazwisko, telefon,
        adres e-mail, treść wiadomości).
      </p>
    ),
  },
  {
    title: "3. Cel i podstawa prawna przetwarzania",
    body: (
      <>
        <p>
          Dane przetwarzane są w celu udzielenia odpowiedzi na zapytanie oraz
          przygotowania wyceny.
        </p>
        <LegalPlaceholder>
          Miejsce na dokładne wskazanie podstaw prawnych przetwarzania
          (np. art. 6 ust. 1 RODO) — do potwierdzenia z klientem / prawnikiem.
        </LegalPlaceholder>
      </>
    ),
  },
  {
    title: "4. Okres przechowywania danych",
    body: (
      <LegalPlaceholder>
        Miejsce na wskazanie okresu przechowywania danych — do uzupełnienia.
      </LegalPlaceholder>
    ),
  },
  {
    title: "5. Prawa użytkownika",
    body: (
      <p>
        Użytkownikowi przysługuje prawo dostępu do danych, ich sprostowania,
        usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz
        wniesienia sprzeciwu, a także prawo wniesienia skargi do organu
        nadzorczego.
      </p>
    ),
  },
  {
    title: "6. Pliki cookies",
    body: (
      <p>
        Zasady dotyczące plików cookies opisane są w{" "}
        <Link to="/cookies" className="underline underline-offset-2 hover:text-bronze">
          polityce cookies
        </Link>
        .
      </p>
    ),
  },
  {
    title: "7. Kontakt",
    body: <p>W sprawach związanych z ochroną danych osobowych prosimy o kontakt telefoniczny — {company.phone.display}.</p>,
  },
];

export function PolitykaPrywatnosci() {
  return (
    <>
      <Seo
        title="Polityka prywatności"
        description="Zasady przetwarzania danych osobowych przez Alukoncept Sp. z o.o. — zakres danych, cele, podstawy prawne i prawa osoby, której dane dotyczą."
      />
      <PageHero
        eyebrow="Dokument"
        title="Polityka prywatności"
        description="Poniższy dokument ma charakter roboczy — treści oznaczone jako placeholder wymagają uzupełnienia przed publikacją produkcyjną."
        variant="quiet"
      />

      <section className="bg-limestone py-16 text-void md:py-20">
        <div className="container-edge max-w-3xl space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="display text-2xl">{s.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-void/65">{s.body}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
