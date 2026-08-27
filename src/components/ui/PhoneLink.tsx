import { Phone } from "lucide-react";
import { company } from "../../data/company";

interface PhoneLinkProps {
  className?: string;
  showIcon?: boolean;
}

/** Numer telefonu — zawsze klikalny (`tel:`), także na desktopie. */
export function PhoneLink({ className = "", showIcon = false }: PhoneLinkProps) {
  return (
    <a href={company.phone.href} className={`inline-flex items-center gap-2 ${className}`}>
      {showIcon && <Phone className="h-4 w-4" strokeWidth={1.5} />}
      {company.phone.display}
    </a>
  );
}
