import raw from "../content/firma.json";
import { httpsUrl, optionalText, text } from "../lib/content";

/* Dane firmy edytuje klient w panelu (/admin → „Dane firmy”), plik:
   src/content/firma.json. Tu powstaje z nich obiekt, którego używają
   komponenty — z polami pochodnymi (link tel:, godziny w schema.org),
   żeby w panelu nie trzeba było wpisywać tej samej rzeczy dwa razy. */

interface HoursRange {
  from?: unknown;
  to?: unknown;
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

const weekdays = range(raw.hoursWeekdays);
const saturday = range(raw.hoursSaturday);

/** Godziny w formie do wyświetlenia: „pon.–pt. 6:00–16:00, sob. 8:00–12:00”. */
function hoursLabel(): string {
  const parts: string[] = [];
  if (weekdays) parts.push(`pon.–pt. ${weekdays.from}–${weekdays.to}`);
  if (saturday) parts.push(`sob. ${saturday.from}–${saturday.to}`);
  return parts.join(", ");
}

/**
 * Godziny dla wyszukiwarki. Godzina w złym formacie wypada ze schema.org
 * zamiast trafić tam jako nieprawdziwa deklaracja — na stronie nadal widać
 * ją tak, jak została wpisana.
 */
function hoursSchema(): string[] {
  const out: string[] = [];
  for (const [days, hours] of [
    ["Mo-Fr", weekdays],
    ["Sa", saturday],
  ] as const) {
    if (!hours) continue;
    const from = schemaTime(hours.from);
    const to = schemaTime(hours.to);
    if (from && to) out.push(`${days} ${from}-${to}`);
  }
  return out;
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

const phone = text(raw.phone);
const email = optionalText(raw.email);

/**
 * Zweryfikowane dane firmy. NIE dodawaj tu żadnych informacji,
 * które nie zostały jawnie podane przez klienta.
 */
export const company = {
  legalName: text(raw.legalName),
  brandName: "Alukoncept",
  address: {
    street: text(raw.street),
    postalCode: text(raw.postalCode),
    city: text(raw.city),
  },
  phone: {
    display: phone,
    href: phoneHref(phone),
  },
  /** Adres e-mail — `null`, dopóki klient go nie poda; wtedy nigdzie się nie wyświetla. */
  email: email && /^\S+@\S+\.\S+$/.test(email) ? email : null,
  hours: hoursLabel(),
  /** Te same godziny w formacie schema.org (`openingHours`). */
  openingHours: hoursSchema(),
};

export const fullAddress = `${company.address.street}, ${company.address.postalCode} ${company.address.city}`;

/** Link do wyszukiwania adresu w Google Maps — do podmiany na osadzoną mapę, gdy będzie potrzebna. */
export const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${company.legalName}, ${fullAddress}`
)}`;

/**
 * Profile społecznościowe. `null` = adres jeszcze nieustawiony — ikona
 * rysuje się normalnie, ale nigdzie nie prowadzi i jest opisana jako
 * „profil w przygotowaniu”. Wpisanie w panelu prawdziwego adresu zamienia
 * ją w zwykły odnośnik otwierany w nowej karcie.
 */
export const socialLinks: Record<"instagram" | "facebook", string | null> = {
  instagram: httpsUrl(raw.instagram),
  facebook: httpsUrl(raw.facebook),
};
