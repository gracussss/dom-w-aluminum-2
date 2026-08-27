import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import { SIZES_HALF, responsiveSrcSet } from "../../lib/responsiveImage";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  scaleRange?: [number, number];
  /** Jaką część okna zajmuje kadr — bez tego przeglądarka zakłada 100vw. */
  sizes?: string;
}

export function ParallaxImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  scaleRange = [1.18, 1],
  sizes = SIZES_HALF,
}: ParallaxImageProps) {
  const srcSet = useMemo(() => responsiveSrcSet(src), [src]);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  /* `useTransform` liczy wartość samodzielnie i nie przechodzi przez
     MotionConfig — przy ograniczonych animacjach kadr musi po prostu stać. */
  const range = reduced ? ([1, 1] as [number, number]) : scaleRange;
  const scale = useTransform(scrollYProgress, [0, 1], range);

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : { clipPath: "inset(6% 6% 6% 6%)", opacity: 0 }}
      whileInView={reduced ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
      viewport={{ once: true, margin: "-5% 0px -5% 0px" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        style={{ scale }}
        className={`h-full w-full object-cover ${imgClassName}`}
        loading="lazy"
      />
    </motion.div>
  );
}
