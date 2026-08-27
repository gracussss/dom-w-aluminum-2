/**
 * Zweryfikowane dane firmy. NIE dodawaj tu żadnych informacji,
 * które nie zostały jawnie podane przez klienta.
 */
export const company = {
  legalName: "Alukoncept Sp. z o.o.",
  brandName: "Dom w Aluminium",
  address: {
    street: "Stanisława Mikołajczyka 59 A",
    postalCode: "41-400",
    city: "Sosnowiec",
  },
  phone: {
    display: "695 704 228",
    href: "tel:+48695704228",
  },
} as const;

export const fullAddress = `${company.address.street}, ${company.address.postalCode} ${company.address.city}`;

/** Link do wyszukiwania adresu w Google Maps — do podmiany na osadzoną mapę, gdy będzie potrzebna. */
export const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${company.legalName}, ${fullAddress}`
)}`;

/**
 * Profile społecznościowe. `null` = adres jeszcze nieustawiony — ikona
 * rysuje się normalnie, ale nigdzie nie prowadzi i jest opisana jako
 * „profil w przygotowaniu”. Wpisanie tu prawdziwego adresu zamienia ją
 * w zwykły odnośnik otwierany w nowej karcie. Nic więcej nie trzeba zmieniać.
 */
export const socialLinks: Record<"instagram" | "facebook", string | null> = {
  instagram: null,
  facebook: null,
};
