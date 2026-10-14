import raw from "../content/firma.json";
import { httpsUrl, optionalText, text } from "../lib/content";

/* Dane firmy edytuje klient w panelu (/admin → „Dane firmy”), plik:
   src/content/firma.json. Tu powstaje z nich obiekt, którego używają
   komponenty — z polami pochodnymi (link tel:, godziny w schema.org),
   żeby w panelu nie trzeba było wpisywać tej samej rzeczy dwa razy.

   `buildCompany` jest osobno od gotowego `company`, bo podgląd na żywo
   w panelu składa te same pola z danych jeszcze niezapisanych. */

interface HoursRange {
  from?: unknown;
  to?: unknown;
}

interface RawCompany {
  legalName?: unknown;
  street?: unknown;
  postalCode?: unknown;
  city?: unknown;
  phone?: unknown;
  email?: unknown;
  hoursWeekdays?: HoursRange;
  hoursSaturday?: HoursRange;
  facebook?: unknown;
  instagram?: unknown;
  nip?: unknown;
  regon?: unknown;
  krs?: unknown;
  privacyEmail?: unknown;
}

const TIME = /^(\d{1,2}):(\d{2})$/;

/** „6:00” → „06:00” — format, którego wymaga schema.org. */
function schemaTime(value: string): string | null {
  const match = TIME.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${match[2]}`;
}

function range(input: HoursRange | undefined) {
  const from = text(input?.from);
  const to = text(input?.to);
  return from && to ? { from, to } : null;
}

/**
 * Numer do linku `tel:`. Klient wpisuje numer tak, jak ma wyglądać na
 * stronie („695 704 228”); dziewięć cyfr bez kierunkowego to numer polski.
 */
function phoneHref(display: string): string {
  const digits = display.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("00")) return `tel:+${digits.slice(2)}`;
  if (digits.length === 9) return `tel:+48${digits}`;
  return `tel:${digits}`;
}

function emailOrNull(value: unknown): string | null {
  const email = optionalText(value);
  return email && /^\S+@\S+\.\S+$/.test(email) ? email : null;
}

export function buildCompany(input: unknown) {
  const data = (input ?? {}) as RawCompany;
  const weekdays = range(data.hoursWeekdays);
  const saturday = range(data.hoursSaturday);
  const phone = text(data.phone);

  /** Godziny w formie do wyświetlenia: „pon.–pt. 6:00–16:00, sob. 8:00–12:00”. */
  const hours = [
    weekdays && `pon.–pt. ${weekdays.from}–${weekdays.to}`,
    saturday && `sob. ${saturday.from}–${saturday.to}`,
  ]
    .filter(Boolean)
    .join(", ");

  /* Godziny dla wyszukiwarki. Godzina w złym formacie wypada ze schema.org
     zamiast trafić tam jako nieprawdziwa deklaracja — na stronie nadal widać
     ją tak, jak została wpisana. */
  const openingHours: string[] = [];
  for (const [days, h] of [
    ["Mo-Fr", weekdays],
    ["Sa", saturday],
  ] as const) {
    if (!h) continue;
    const from = schemaTime(h.from);
    const to = schemaTime(h.to);
    if (from && to) openingHours.push(`${days} ${from}-${to}`);
  }

  return {
    legalName: text(data.legalName),
    brandName: "Alukoncept",
    address: {
      street: text(data.street),
      postalCode: text(data.postalCode),
      city: text(data.city),
    },
    phone: { display: phone, href: phoneHref(phone) },
    /** Adres e-mail — `null`, dopóki klient go nie poda; wtedy nigdzie się nie wyświetla. */
    email: emailOrNull(data.email),
    hours,
    /** Te same godziny w formacie schema.org (`openingHours`). */
    openingHours,
    /**
     * Dane rejestrowe. `null` = niepodane: polityka prywatności pokazuje
     * wtedy placeholder, a schema.org nie dostaje pola. Numerów nie
     * zgadujemy ani nie szukamy w rejestrach za klienta.
     */
    legal: {
      nip: optionalText(data.nip),
      regon: optionalText(data.regon),
      krs: optionalText(data.krs),
      /** Adres do spraw danych osobowych; pusty = ogólny e-mail firmy (jeśli jest). */
      privacyEmail: emailOrNull(data.privacyEmail),
    },
    social: {
      instagram: httpsUrl(data.instagram),
      facebook: httpsUrl(data.facebook),
    } as Record<"instagram" | "facebook", string | null>,
  };
}

export type Company = ReturnType<typeof buildCompany>;

export function addressLine(firm: Company): string {
  return `${firm.address.street}, ${firm.address.postalCode} ${firm.address.city}`;
}

/** Link do wyszukiwania adresu w Google Maps. */
export function mapsSearchUrl(firm: Company): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${firm.legalName}, ${addressLine(firm)}`
  )}`;
}

/**
 * Zweryfikowane dane firmy. NIE dodawaj tu żadnych informacji,
 * które nie zostały jawnie podane przez klienta.
 */
export const company = buildCompany(raw);

export const fullAddress = addressLine(company);

export const googleMapsSearchUrl = mapsSearchUrl(company);

/**
 * Profile społecznościowe. `null` = adres jeszcze nieustawiony — ikona
 * rysuje się normalnie, ale nigdzie nie prowadzi i jest opisana jako
 * „profil w przygotowaniu”. Wpisanie w panelu prawdziwego adresu zamienia
 * ją w zwykły odnośnik otwierany w nowej karcie.
 */
export const socialLinks = company.social;
