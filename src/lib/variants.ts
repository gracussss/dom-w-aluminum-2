import { EASE_OUT } from "./motion";

/** Element wewnątrz RevealGroup — dziedziczy stagger z rodzica. */
export const revealItem = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: EASE_OUT },
  },
};
