interface EyebrowProps {
  index?: string;
  label: string;
  tone?: "light" | "dark";
  className?: string;
}

/* Bez kreski między numerem a nazwą. Uwaga klientki (wrzesień 2026): kreska
   stała przy jednych etykietach, a przy innych nie, i czytała się jak
   przypadek.

   Stopień 14–16 px i numer w kolorze brązu. Przy 11, a potem 13 px etykieta
   nadal „gubiła się na stronie” (uwaga z października 2026) — pod wielkim
   nagłówkiem monospace w tym rozmiarze czyta się jak przypis. */
export function Eyebrow({ index, label, tone = "light", className = "" }: EyebrowProps) {
  const text = tone === "light" ? "text-limestone/80" : "text-void/75";
  const number = tone === "light" ? "text-bronze-light" : "text-bronze";

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {index && <span className={`label text-sm md:text-base ${number}`}>{index}</span>}
      <span className={`label text-sm md:text-base ${text}`}>{label}</span>
    </div>
  );
}
