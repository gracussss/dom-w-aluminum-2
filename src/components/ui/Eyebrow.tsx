interface EyebrowProps {
  index?: string;
  label: string;
  tone?: "light" | "dark";
  className?: string;
}

/* Bez kreski między numerem a nazwą. Uwaga klientki (wrzesień 2026): kreska
   stała przy jednych etykietach, a przy innych nie, i czytała się jak
   przypadek. Większy stopień niż `.label` — przy 11 px etykieta sekcji
   ginęła pod wielkim nagłówkiem („za małe”). */
export function Eyebrow({ index, label, tone = "light", className = "" }: EyebrowProps) {
  const text = tone === "light" ? "text-limestone/60" : "text-void/65";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {index && <span className={`label text-[13px] ${text}`}>{index}</span>}
      <span className={`label text-[13px] ${text}`}>{label}</span>
    </div>
  );
}
