import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowUpRight, CheckCircle2, ChevronDown, MapPin, Phone, X } from "lucide-react";
import { Seo } from "../components/Seo";
import { organizationJsonLd } from "../lib/jsonLd";
import { PageHero } from "../components/ui/PageHero";
import { SocialIcons } from "../components/ui/SocialIcons";
import { MapEmbed } from "../components/ui/MapEmbed";
import { Reveal } from "../components/ui/Reveal";
import { findManufacturer, primaryCategory, useSystem, useTaxonomy } from "../catalog";
import { company, fullAddress, googleMapsSearchUrl } from "../data/company";

const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
  `${company.legalName}, ${fullAddress}`
)}&output=embed`;

/**
 * Adres, pod ktory idzie zapytanie z formularza.
 *
 * Dopoki nie jest ustawiony, formularz dziala w trybie demonstracyjnym
 * i mowi o tym wprost — zamiast udawac wysylke. Podpiecie skrzynki firmy
 * albo CRM to jedna zmienna srodowiskowa, bez zmian w kodzie:
 *
 *   VITE_CONTACT_ENDPOINT=https://.../kontakt
 */
const CONTACT_ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined)?.trim() || "";

/** Numer telefonu w zapisie krajowym lub miedzynarodowym, ze spacjami lub bez. */
const PHONE_PATTERN = "[+()0-9 \\-]{9,20}";

type FormStatus = "idle" | "sending" | "sent" | "error";

/* Rozdzielone, bo pole wyboru siedzi w kontenerze rysującym własną strzałkę:
   odstęp musi wtedy trafić na kontener, nie na sam `select` — inaczej margines
   zbiega się z rodzicem i strzałka przestaje stać w osi pola. */
const fieldBase =
  "w-full border border-void/20 bg-transparent px-4 py-3.5 text-[15px] text-void outline-none transition-colors focus:border-void";

const field = `mt-2 ${fieldBase}`;

export function Kontakt() {
  const [status, setStatus] = useState<FormStatus>("idle");
  /* Formularz znika po wyslaniu — bez przeniesienia fokusu czytnik ekranu
     zostaje na elemencie, ktorego juz nie ma, i nie oglasza potwierdzenia. */
  const confirmationRef = useRef<HTMLDivElement>(null);
  const [params, setParams] = useSearchParams();

  /* Kontekst z karty systemu: /kontakt?system=mb-86n.
     Dzieki temu "Zapytaj o wycene" nie gubi tego, czego zapytanie dotyczy. */
  const systemSlug = params.get("system") ?? undefined;
  const { data: system } = useSystem(systemSlug);
  const { data: taxonomy } = useTaxonomy();

  const manufacturer = system && taxonomy ? findManufacturer(taxonomy, system.manufacturerId) : undefined;
  const category = system && taxonomy ? primaryCategory(taxonomy, system) : undefined;

  /* Temat ustawia sie na kategorie systemu, ale zostaje do zmiany przez uzytkownika. */
  const [topic, setTopic] = useState(() => system?.categoryIds[0] ?? "okna");
  const [lastSystemId, setLastSystemId] = useState(system?.id ?? null);
  if (system && system.id !== lastSystemId) {
    setLastSystemId(system.id);
    setTopic(system.categoryIds[0]);
  }

  const clearSystem = () => {
    const next = new URLSearchParams(params);
    next.delete("system");
    setParams(next, { replace: true });
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    /* Pulapka na boty: pole niewidoczne dla czlowieka. Wypelnione = automat.
       Udajemy powodzenie, zeby nie podpowiadac, ze zgloszenie odrzucono. */
    if (String(data.get("firma") ?? "").length > 0) {
      setStatus("sent");
      return;
    }

    if (!CONTACT_ENDPOINT) {
      // Tryb demonstracyjny — brak backendu, komunikat mowi o tym wprost.
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (status === "sent") confirmationRef.current?.focus();
  }, [status]);

  const sending = status === "sending";

  return (
    <>
      <Seo
        title="Kontakt i wycena"
        description="Zapytaj o wycenę okien, drzwi, systemów przesuwnych i fasad aluminiowych. Alukoncept Sp. z o.o., Stanisława Mikołajczyka 59 A, Sosnowiec, tel. 695 704 228."
        canonicalPath="/kontakt"
        jsonLd={organizationJsonLd()}
      />
      <PageHero
        eyebrow="Kontakt"
        title="Zapytaj o wycenę"
        description="Opisz projekt — wrócimy z konkretną propozycją i realnym terminem realizacji."
      />

      <section className="bg-limestone py-16 text-void md:py-24">
        <div className="container-edge grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Formularz — pierwszy w kolejności, także na telefonie: to jest
              główna czynność tej strony. */}
          <div className="lg:col-span-6">
            {status === "sent" ? (
              <Reveal className="h-full">
                <div
                  ref={confirmationRef}
                  role="status"
                  tabIndex={-1}
                  className="flex h-full flex-col items-start justify-center gap-5 border border-void/12 p-10"
                >
                  <CheckCircle2 className="h-9 w-9 text-bronze" strokeWidth={1.4} />
                  <h2 className="display text-3xl tracking-[-0.03em] md:text-4xl">
                    Dziękujemy za wiadomość
                  </h2>
                  <p className="max-w-md leading-relaxed text-void/60">
                    {CONTACT_ENDPOINT
                      ? `Zgłoszenie${system ? ` dotyczące systemu ${system.name}` : ""} trafiło do zespołu ${company.legalName}. Odezwiemy się pod podany numer telefonu.`
                      : `Zgłoszenie${system ? ` dotyczące systemu ${system.name}` : ""} zostało przygotowane. W wersji produkcyjnej trafi bezpośrednio do zespołu ${company.legalName}.`}
                  </p>
                </div>
              </Reveal>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Kontekst systemu — widoczny, usuwalny i przekazywany dalej */}
                {system && (
                  <div className="border border-void/15 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="label text-bronze">Zapytanie dotyczy systemu</p>
                        <Link
                          to={`/systemy/${system.slug}`}
                          className="group mt-2.5 inline-flex items-baseline gap-2 text-xl font-semibold tracking-[-0.02em] text-void transition-colors hover:text-bronze"
                        >
                          {system.name}
                          <ArrowUpRight
                            className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            strokeWidth={1.5}
                          />
                        </Link>
                        <p className="label-sm mt-2 text-void/70">
                          {[manufacturer?.name, category?.name].filter(Boolean).join("  ·  ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearSystem}
                        aria-label="Usuń kontekst systemu z zapytania"
                        className="-m-2 shrink-0 p-2 text-void/50 transition-colors hover:text-void"
                      >
                        <X className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <input type="hidden" name="system" value={system.slug} />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="label text-void/70">Imię i nazwisko</span>
                    <input
                      required
                      type="text"
                      name="name"
                      autoComplete="name"
                      minLength={3}
                      className={field}
                    />
                  </label>
                  <label className="block">
                    <span className="label text-void/70">Telefon</span>
                    <input
                      required
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      pattern={PHONE_PATTERN}
                      title="Numer telefonu, np. 695 704 228 lub +48 695 704 228"
                      className={field}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="label text-void/70">E-mail</span>
                  <input type="email" name="email" autoComplete="email" className={field} />
                </label>

                <label className="block">
                  <span className="label text-void/70">Czego dotyczy zapytanie?</span>
                  {/* Lista tematów wprost z taksonomii katalogu — nowa kategoria
                      pojawi się tu bez dotykania formularza */}
                  {/* Jak przy sortowaniu w katalogu: zdejmujemy chromę
                      przeglądarki, żeby pole nie odstawało od reszty formularza. */}
                  <span className="relative mt-2 block">
                    <select
                      name="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className={`${fieldBase} appearance-none pr-12`}
                    >
                      {taxonomy?.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                      <option value="indywidualne">Konstrukcja indywidualna</option>
                    </select>
                    <ChevronDown
                      aria-hidden
                      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-void/60"
                      strokeWidth={1.5}
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="label text-void/70">Wiadomość</span>
                  <textarea
                    required
                    name="message"
                    rows={6}
                    minLength={10}
                    className={`${field} resize-none`}
                  />
                </label>

                {/* Pułapka na boty — poza układem i poza kolejnością fokusu.
                    Świadomie NIE `display: none`: część automatów pomija pola ukryte. */}
                <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
                  <label>
                    Nazwa firmy
                    <input type="text" name="firma" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                {status === "error" && (
                  <p
                    role="alert"
                    className="flex items-start gap-3 border border-bronze/40 bg-bronze/5 px-4 py-3 text-sm leading-relaxed text-void/75"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.5} />
                    <span>
                      Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę albo zadzwoń:{" "}
                      <a href={company.phone.href} className="underline underline-offset-2">
                        {company.phone.display}
                      </a>
                      .
                    </span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="group inline-flex items-center gap-3 bg-void px-8 py-4 label text-limestone transition-colors hover:bg-bronze hover:text-void disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-void disabled:hover:text-limestone"
                >
                  {sending ? "Wysyłanie…" : "Wyślij zapytanie"}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.5}
                  />
                </button>

                {/* Obowiązek informacyjny (art. 13 RODO). Podstawą przetwarzania
                    jest odpowiedź na zapytanie, nie zgoda — dlatego nie ma tu
                    pola wyboru, którego kliknięcie i tak niczego by nie zmieniało. */}
                <p className="max-w-xl text-xs leading-relaxed text-void/60">
                  Administratorem Twoich danych jest {company.legalName}, {fullAddress}.
                  Dane podane w formularzu przetwarzamy wyłącznie w celu udzielenia
                  odpowiedzi na zapytanie i przygotowania wyceny. Podanie danych jest
                  dobrowolne, ale niezbędne do kontaktu. Masz prawo dostępu do swoich
                  danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz
                  wniesienia sprzeciwu i skargi do organu nadzorczego. Szczegóły znajdziesz
                  w{" "}
                  <Link
                    to="/polityka-prywatnosci"
                    className="underline underline-offset-2 hover:text-bronze"
                  >
                    polityce prywatności
                  </Link>
                  .
                </p>

                {!CONTACT_ENDPOINT && (
                  <p className="text-xs leading-relaxed text-void/60">
                    Formularz demonstracyjny — w tej wersji wiadomość nie jest
                    nigdzie wysyłana.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Dane + mapa — po prawej, formularz po lewej (uwaga klientki:
              „zamieniłabym stronami”). Nazwa firmy jest nagłówkiem bloku,
              a adres i telefon mają jeden krój i stopień, bez pogrubienia —
              wcześniej telefon w 30 px bold był najgłośniejszym elementem strony. */}
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal>
              <p className="text-2xl font-semibold tracking-[-0.02em] text-void md:text-[28px]">
                {company.legalName}
              </p>

              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="group mt-5 flex items-start gap-3 py-1 text-lg leading-snug text-void/75 transition-colors hover:text-bronze"
              >
                <MapPin className="mt-1 h-[18px] w-[18px] shrink-0" strokeWidth={1.4} />
                <span>
                  {company.address.street}
                  <br />
                  {company.address.postalCode} {company.address.city}
                </span>
              </a>

              <a
                href={company.phone.href}
                className="mt-3 flex items-center gap-3 py-1 text-lg leading-snug text-void/75 transition-colors hover:text-bronze"
              >
                <Phone className="h-[18px] w-[18px] shrink-0" strokeWidth={1.4} />
                <span>{company.phone.display}</span>
              </a>
            </Reveal>

            <Reveal delay={0.1} className="mt-8">
              <MapEmbed
                src={mapEmbedSrc}
                title="Mapa — lokalizacja firmy"
                externalHref={googleMapsSearchUrl}
                caption={fullAddress}
                className="aspect-[4/3] w-full"
              />
            </Reveal>

            {/* Pod mapą, wyśrodkowane względem jej kadru i większe — ikony
                44 px obok mapy o szerokości kolumny wyglądały na przypadkowe. */}
            <SocialIcons className="mt-8" tone="light" heading="Śledź nas" align="center" size="lg" />
          </div>
        </div>
      </section>
    </>
  );
}
