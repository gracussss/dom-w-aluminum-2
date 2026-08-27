export const navItems = [
  { label: "Oferta", href: "/oferta" },
  { label: "Systemy", href: "/systemy" },
  { label: "Realizacje", href: "/realizacje" },
  { label: "O nas", href: "/o-nas" },
  { label: "Kontakt", href: "/kontakt" },
] as const;

export const footerNav = {
  firma: [
    { label: "O nas", href: "/o-nas" },
    { label: "Realizacje", href: "/realizacje" },
    { label: "Kontakt", href: "/kontakt" },
  ],
  /* Odnośniki do stron kategorii, nie do kotwic na stronie oferty —
     to są docelowe adresy dla wyszukiwarki i dla użytkownika. */
  oferta: [
    { label: "Okna aluminiowe", href: "/systemy/kategoria/okna" },
    { label: "Drzwi aluminiowe", href: "/systemy/kategoria/drzwi" },
    { label: "Fasady", href: "/systemy/kategoria/fasady" },
    { label: "Katalog systemów", href: "/systemy" },
  ],
  legal: [
    { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
    { label: "Cookies", href: "/cookies" },
  ],
} as const;
