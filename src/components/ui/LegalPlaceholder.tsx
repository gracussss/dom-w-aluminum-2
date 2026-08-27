import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

/** Jawnie oznaczone miejsce na treść prawną, która musi pochodzić od klienta / prawnika. */
export function LegalPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 flex items-start gap-3 border border-dashed border-void/20 bg-void/[0.035] px-4 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.5} />
      <p className="text-sm leading-relaxed text-void/60">{children}</p>
    </div>
  );
}
