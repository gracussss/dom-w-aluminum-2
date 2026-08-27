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
  hidden: { y: "108%" },
  visible: { y: "0%" },
};

/**
 * Nagłówek wjeżdżający zza krawędzi — maska zamiast zwykłego fade.
 *
 * Obserwowana jest MASKA, nie sam tekst. Tekst startuje przesunięty o 108%
 * swojej wysokości, czyli całkowicie poza obszar przycięcia rodzica —
 * IntersectionObserver nigdy nie uznałby go za widoczny i nagłówek zostałby
 * schowany na zawsze.
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
      className="block overflow-hidden"
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
