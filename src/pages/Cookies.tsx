import { Seo } from "../components/Seo";
import { PageHero } from "../components/ui/PageHero";
import { openCookieSettings } from "../lib/cookieConsent";

/* ------------------------------------------------------------------
   WYKAZ PRZECHOWYWANYCH DANYCH

   Tabela opisuje STAN FAKTYCZNY, nie plan. Dopóki na stronie nie działa
   Google Analytics ani Meta Pixel, nie wolno ich tu wymieniać jako
   używanych — to samo zobowiązanie, co przy parametrach systemów.

   Po podpięciu narzędzi: dopisać wiersze z prawdziwymi nazwami plików,
   czasem życia i podmiotem, który je ustawia.
   ------------------------------------------------------------------ */

interface StorageEntry {
  name: string;
  kind: string;
  purpose: string;
  ttl: string;
  owner: string;
}

const entries: StorageEntry[] = [
  {
    name: "cookie-consent",
    kind: "Pamięć lokalna przeglądarki (localStorage)",
    purpose: "Zapamiętanie Twojej decyzji o zgodach, żeby baner nie wracał przy każdej wizycie.",
    ttl: "Do czasu wyczyszczenia danych strony w przeglądarce",
    owner: "Dom w Aluminium (podmiot prowadzący stronę)",
  },
  {
    name: "dwa:intro-seen",
    kind: "Pamięć sesji przeglądarki (sessionStorage)",
    purpose: "Informacja, że ekran startowy został już wyświetlony — nie powtarza się w tej samej sesji.",
    ttl: "Do zamknięcia karty przeglądarki",
    owner: "Dom w Aluminium",
  },
];

const thirdParty = [
  {
    name: "Google Maps",
    purpose:
      "Mapa z lokalizacją firmy na stronie kontaktu. Ładuje się dopiero po kliknięciu „Pokaż mapę” albo po wyrażeniu zgody marketingowej — nie wcześniej.",
    owner: "Google Ireland Limited",
  },
];

export function Cookies() {
  return (
    <>
      <Seo
        title="Polityka cookies"
        description="Jakich plików cookies używamy na stronie Dom w Aluminium, do czego służą i jak zarządzać zgodą w przeglądarce."
      />
      <PageHero
        eyebrow="Dokument"
        title="Polityka cookies"
        description="Poniżej opisujemy, co dokładnie zapisujemy w Twojej przeglądarce i jak zarządzać zgodą."
        variant="quiet"
      />

      <section className="bg-limestone py-16 text-void md:py-20">
        <div className="container-edge max-w-3xl space-y-10">
          <div>
            <h2 className="display text-2xl">Czym są pliki cookies</h2>
            <p className="mt-3 text-sm leading-relaxed text-void/65">
              Pliki cookies to niewielkie pliki tekstowe zapisywane w
              przeglądarce. Obok nich strony korzystają z pamięci lokalnej
              (localStorage) i sesyjnej (sessionStorage), które działają
              podobnie — dlatego opisujemy je tu razem.
            </p>
          </div>

          <div>
            <h2 className="display text-2xl">Co zapisujemy</h2>
            <p className="mt-3 text-sm leading-relaxed text-void/65">
              Wyłącznie dwie pozycje, obie niezbędne do działania strony. Nie
              używamy ich do profilowania ani do śledzenia Cię poza tą witryną.
            </p>

            {/* Szeroka tabela przewija się we własnym kadrze — strona nigdy w poziomie. */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Dane zapisywane przez stronę Dom w Aluminium w przeglądarce użytkownika
                </caption>
                <thead>
                  <tr className="border-y border-void/15">
                    <th scope="col" className="label py-3 pr-4 text-void/70">Nazwa</th>
                    <th scope="col" className="label py-3 pr-4 text-void/70">Rodzaj</th>
                    <th scope="col" className="label py-3 pr-4 text-void/70">Cel</th>
                    <th scope="col" className="label py-3 text-void/70">Czas przechowywania</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.name} className="border-b border-void/10 align-top">
                      <td className="py-4 pr-4 font-mono text-[13px] text-void">{entry.name}</td>
                      <td className="py-4 pr-4 text-[13px] leading-relaxed text-void/65">{entry.kind}</td>
                      <td className="py-4 pr-4 text-[13px] leading-relaxed text-void/65">{entry.purpose}</td>
                      <td className="py-4 text-[13px] leading-relaxed text-void/65">{entry.ttl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-void/60">
              Administratorem obu pozycji jest {entries[0].owner}.
            </p>
          </div>

          <div>
            <h2 className="display text-2xl">Treści osadzone z innych serwisów</h2>
            <ul className="mt-4 divide-y divide-void/10 border-y border-void/10">
              {thirdParty.map((item) => (
                <li key={item.name} className="py-5">
                  <p className="label text-xs uppercase text-bronze">{item.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-void/65">{item.purpose}</p>
                  <p className="mt-1.5 text-xs text-void/60">Dostawca: {item.owner}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="display text-2xl">Cookies analityczne i marketingowe</h2>
            <p className="mt-3 text-sm leading-relaxed text-void/65">
              Na tę chwilę <strong className="font-semibold text-void">nie działają</strong> na
              stronie żadne narzędzia analityczne ani marketingowe — nie ładujemy
              Google Analytics, Google Tag Managera ani Meta Pixela. Baner zgód
              obsługuje te kategorie, żeby po ich uruchomieniu Twoja decyzja
              obowiązywała od pierwszej sekundy, a nie została dopisana później.
              Wykaz w tym dokumencie uzupełnimy w tym samym momencie.
            </p>
          </div>

          <div>
            <h2 className="display text-2xl">Zarządzanie zgodą</h2>
            <p className="mt-3 text-sm leading-relaxed text-void/65">
              Swoje preferencje możesz zmienić w dowolnym momencie. Panel
              otwiera się z aktualnie zapisaną decyzją.
            </p>
            <button
              onClick={openCookieSettings}
              className="mt-5 border border-void/30 px-6 py-3 label text-xs uppercase text-void transition-colors hover:border-void"
            >
              Zmień ustawienia cookies
            </button>
          </div>

          <div>
            <h2 className="display text-2xl">Ustawienia przeglądarki</h2>
            <p className="mt-3 text-sm leading-relaxed text-void/65">
              Możesz również zarządzać plikami cookies bezpośrednio w
              ustawieniach swojej przeglądarki internetowej, w tym zablokować
              lub usunąć zapisane pliki. Wyczyszczenie danych strony usuwa także
              zapamiętaną decyzję — baner pojawi się wtedy ponownie.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
