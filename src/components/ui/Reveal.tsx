import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT } from "../../lib/motion";

const VIEWPORT = { once: true, margin: "-8% 0px -8% 0px" } as const;

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, y = 26, className = "" }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

export function RevealGroup({ children, className = "", stagger = 0.1 }: RevealGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      transition={{ staggerChildren: stagger }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const maskedLine = {
  hidden: { y: "130%" },
  visible: { y: "0%" },
};

/**
 * Nagłówek wjeżdżający zza krawędzi — maska zamiast zwykłego fade.
 *
 * Obserwowana jest MASKA, nie sam tekst. Tekst startuje przesunięty poniżej
 * dolnej krawędzi przycięcia — IntersectionObserver nigdy nie uznałby go
 * za widoczny i nagłówek zostałby schowany na zawsze.
 *
 * DLACZEGO `overflow-clip` z marginesem, a nie `overflow-hidden`:
 * maska ma wysokość dokładnie jednego line-boxa, a `.display` składa się
 * interlinią 0.92. Przy takiej interlinii pod linią bazową zostaje ~0.12 em,
 * a descender potrzebuje 0.19 em (Archivo) i 0.22 em (Instrument Serif) —
 * ogonki „j y g p ą ę" były ścinane płasko, do 8,9 px przy 1920. Sam
 * `line-height` byłby nieszkodliwy; ucinało dopiero przycięcie.
 *
 * `overflow-clip-margin` poszerza OBSZAR PRZYCIĘCIA nie ruszając layoutu —
 * inaczej niż padding z ujemnym marginesem, który psuje rytm składu, bo
 * sąsiadujące ujemne marginesy się zlewają (bierze się najbardziej ujemny,
 * nie sumę). Przeglądarka bez wsparcia wraca do zachowania sprzed poprawki.
 *
 * Przesunięcie startowe MUSI być większe niż poszerzony obszar przycięcia:
 * 100% × (1 + 0.18/0.92) = 119,6%, stąd 130%. Przy 108% wierzchołek ukrytej
 * linii wystawałby spod maski przed animacją.
 */
export function RevealText({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className="block overflow-clip [overflow-clip-margin:0.18em]"
    >
      <motion.span
        variants={maskedLine}
        transition={{ duration: 1, delay, ease: EASE_OUT }}
        className={`block ${className}`}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
