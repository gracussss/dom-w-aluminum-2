function img(id: string, params = "w=1600&q=80&auto=format&fit=crop") {
  return `https://images.unsplash.com/${id}?${params}`;
}

export interface OfferArea {
  id: string;
  /** Kotwica / filtr w katalogu systemów. */
  categoryId: string;
  name: string;
  short: string;
  description: string;
  image: string;
}

/**
 * Obszary oferty prezentowane na stronie głównej.
 * Zdjęcia tymczasowe — do podmiany na dokumentację własną firmy.
 */
export const offerAreas: OfferArea[] = [
  {
    id: "okna",
    categoryId: "okna",
    name: "Okna aluminiowe",
    short: "Wąskie ramy, maksimum światła",
    description:
      "Konstrukcje okienne o smukłych profilach — od pojedynczych otworów po przeszklenia wielkoformatowe.",
    image: img("photo-1783125127082-3fb6c1bccd72"),
  },
  {
    id: "drzwi",
    categoryId: "drzwi",
    name: "Drzwi aluminiowe",
    short: "Wejścia zewnętrzne i wewnętrzne",
    description:
      "Drzwi wejściowe, techniczne i wewnętrzne — spójne wizualnie z pozostałą stolarką w budynku.",
    image: img("photo-1762134768304-88c5d735d611"),
  },
  {
    id: "przesuwne",
    categoryId: "przesuwne",
    name: "Drzwi przesuwne",
    short: "Wyjścia na taras w dużym formacie",
    description:
      "Systemy podnoszono-przesuwne i przesuwne o zredukowanej szerokości profili w widoku.",
    image: img("photo-1702724758750-9ff8d50f02e5"),
  },
  {
    id: "fasady",
    categoryId: "fasady",
    name: "Fasady i ściany osłonowe",
    short: "Pełna koperta budynku",
    description:
      "Fasady słupowo-ryglowe, strukturalne i elementowe dla obiektów komercyjnych i wielorodzinnych.",
    image: img("photo-1523477593243-78bbf626fd3b"),
  },
  {
    id: "ppoz",
    categoryId: "ppoz",
    name: "Systemy przeciwpożarowe",
    short: "Drzwi i przegrody oddzielenia pożarowego",
    description:
      "Konstrukcje o określonej odporności ogniowej — klasyfikacja potwierdzana dokumentami producenta.",
    image: img("photo-1556621266-45150d1e9f4b"),
  },
  {
    id: "specjalne",
    categoryId: "specjalne",
    name: "Ogrody zimowe i pergole",
    short: "Zabudowy i zadaszenia",
    description:
      "Przeszklone zabudowy przy budynku, świetliki dachowe oraz zadaszenia stref zewnętrznych.",
    image: img("photo-1768396856060-0e1feac4084e"),
  },
  {
    id: "indywidualne",
    categoryId: "specjalne",
    name: "Konstrukcje indywidualne",
    short: "Nietypowe wymiary i kształty",
    description:
      "Rozwiązania projektowane pod konkretne wymagania inwestycji, poza standardowym katalogiem.",
    image: img("photo-1760304879576-81565137ff2e"),
  },
];
