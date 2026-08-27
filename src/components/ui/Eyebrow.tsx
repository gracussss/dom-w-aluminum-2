interface EyebrowProps {
  index?: string;
  label: string;
  tone?: "light" | "dark";
  className?: string;
}

export function Eyebrow({ index, label, tone = "light", className = "" }: EyebrowProps) {
  const line = tone === "light" ? "bg-limestone/25" : "bg-void/25";
  const text = tone === "light" ? "text-limestone/55" : "text-void/60";

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {index && <span className={`label ${text}`}>{index}</span>}
      <span className={`h-px w-8 ${line}`} />
      <span className={`label ${text}`}>{label}</span>
    </div>
  );
}
