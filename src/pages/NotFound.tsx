import { Seo } from "../components/Seo";
import { ArrowButton } from "../components/ui/ArrowButton";
import { Eyebrow } from "../components/ui/Eyebrow";

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
      <section className="grain relative flex min-h-[80svh] flex-col items-center justify-center overflow-hidden bg-void px-6 pt-24 text-center text-limestone">
        <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative flex flex-col items-center">
          <Eyebrow label="Błąd 404" tone="light" />
          <h1 className="display display-tight mt-9 text-[16vw] leading-none sm:text-7xl md:text-8xl">
            Nie znaleziono strony
          </h1>
          <p className="mt-7 max-w-md text-pretty text-limestone/55">
            Strona, której szukasz, nie istnieje lub została przeniesiona.
          </p>
          <ArrowButton href="/" variant="outline" tone="dark" className="mt-11">
            Wróć na stronę główną
          </ArrowButton>
        </div>
      </section>
    </>
  );
}
