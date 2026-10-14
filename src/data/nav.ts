/* Czy są aktualności — z samej LISTY plików (glob bez `eager`), bez ich
   treści: nawigacja jedzie w paczce pierwszego ekranu, a wpisy z całą
   treścią ładuje dopiero podstrona aktualności. */
export const hasNews = Object.keys(import.meta.glob("../content/aktualnosci/*.json")).length > 0;

/* „Aktualności” w menu dopiero od pierwszego wpisu — pusta podstrona
   w nawigacji wyglądałaby jak porzucony blog. */
export const navItems: { label: string; href: string }[] = [
  { label: "Oferta", href: "/oferta" },
  { label: "Systemy", href: "/systemy" },
  { label: "Realizacje", href: "/realizacje" },
  ...(hasNews ? [{ label: "Aktualności", href: "/aktualnosci" }] : []),
  { label: "O nas", href: "/o-nas" },
  { label: "Kontakt", href: "/kontakt" },
];

export const footerNav = {
  firma: [
    { label: "O nas", href: "/o-nas" },
    { label: "Realizacje", href: "/realizacje" },
    ...(hasNews ? [{ label: "Aktualności", href: "/aktualnosci" }] : []),
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
};
