import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { navItems } from "../../data/nav";
import { company } from "../../data/company";
import { LogoMark, Wordmark } from "../ui/Logo";
import { EASE_OUT } from "../../lib/motion";
import { lockScroll, unlockScroll } from "../../lib/scroll";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();
    return unlockScroll;
  }, [menuOpen]);

  /* Zmiana podstrony zamyka menu. Wyliczane w trakcie renderu zamiast
     w efekcie — panel znika w tej samej klatce, w której wchodzi nowa treść. */
  const [lastPath, setLastPath] = useState(location.pathname);
  if (location.pathname !== lastPath) {
    setLastPath(location.pathname);
    if (menuOpen) setMenuOpen(false);
  }

  /**
   * Menu mobilne to modal: Escape zamyka, a Tab krąży wewnątrz panelu.
   * Bez tego fokus ucieka na treść pod spodem, która jest zasłonięta.
   */
  useEffect(() => {
    if (!menuOpen) return;

    const panel = panelRef.current;
    const SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    panel?.querySelector<HTMLElement>(SELECTOR)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        openerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(SELECTOR)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled
            ? "border-b border-limestone/10 bg-void/85 backdrop-blur-xl"
            : "border-b border-transparent bg-gradient-to-b from-void/60 to-transparent"
        }`}
      >
        <div
          className={`container-edge flex items-center justify-between transition-[height] duration-500 ${
            scrolled ? "h-16 md:h-[70px]" : "h-20 md:h-28"
          }`}
        >
          <Link to="/" aria-label="Dom w Aluminium – strona główna" className="text-limestone">
            <Wordmark showLegal={!scrolled} />
          </Link>

          <nav aria-label="Nawigacja główna" className="hidden items-center gap-6 lg:flex xl:gap-10">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                /* Zakładki o dwa stopnie większe od numeru telefonu obok.
                   Przy jednym rozmiarze 11 px litery i cyfry zlewały się
                   w jeden pasek (uwaga klientki, październik 2026). */
                className={({ isActive }) =>
                  `group relative whitespace-nowrap py-2 label text-xs transition-colors xl:text-[13px] ${
                    isActive ? "text-limestone" : "text-limestone/70 hover:text-limestone"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-0 h-px bg-bronze-light transition-all duration-500 ease-[var(--ease-premium)] ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            {/* Numer w pasku dopiero od `xl`: przy 1024 px większe zakładki
                i telefon nie mieściły się w jednym wierszu i łamały się na
                dwie linie. Telefon zostaje w hero, w stopce i w kontakcie. */}
            <a
              href={company.phone.href}
              className="label hidden items-center gap-2 whitespace-nowrap py-2 text-[10px] text-limestone/50 transition-colors hover:text-limestone xl:flex"
            >
              <Phone className="h-3 w-3" strokeWidth={1.5} />
              {company.phone.display}
            </a>
            <Link
              to="/kontakt"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden whitespace-nowrap border border-limestone/25 px-5 py-3 label text-limestone transition-colors duration-500 hover:text-void"
            >
              <span
                className="absolute inset-0 origin-left scale-x-0 bg-bronze-light transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-x-100"
                aria-hidden
              />
              <span className="relative z-10">Zapytaj o wycenę</span>
              <ArrowUpRight
                className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>

          <button
            ref={openerRef}
            aria-label="Otwórz menu"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-2.5 text-limestone lg:hidden"
          >
            <span className="label hidden sm:inline">Menu</span>
            <Menu className="h-6 w-6" strokeWidth={1.4} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu główne"
            className="grain fixed inset-0 z-[60] flex flex-col bg-void lg:hidden"
          >
            <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden />

            <div className="container-edge relative flex h-20 items-center justify-between">
              <span className="flex items-center gap-2.5 text-limestone">
                <LogoMark className="h-5 w-5" accent="var(--color-bronze-light)" />
                <span className="text-sm font-semibold tracking-[-0.02em]">DOM W ALUMINIUM</span>
              </span>
              <button aria-label="Zamknij menu" onClick={() => setMenuOpen(false)} className="text-limestone">
                <X className="h-6 w-6" strokeWidth={1.4} />
              </button>
            </div>

            <nav className="container-edge relative flex flex-1 flex-col justify-center">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: EASE_OUT }}
                >
                  <Link
                    to={item.href}
                    className="group flex items-baseline gap-4 border-b border-limestone/10 py-5 text-limestone/85 transition-colors hover:text-bronze-light"
                  >
                    <span className="label-sm text-limestone/55">0{i + 1}</span>
                    <span className="display text-[10vw] leading-none sm:text-5xl">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="container-edge relative mb-10 flex flex-col gap-4"
            >
              <a
                href={company.phone.href}
                className="flex items-center justify-center gap-2.5 bg-limestone px-6 py-4 label text-void"
              >
                <Phone className="h-4 w-4" strokeWidth={1.5} />
                Zadzwoń: {company.phone.display}
              </a>
              <Link
                to="/kontakt"
                className="flex items-center justify-center gap-2.5 border border-limestone/25 px-6 py-4 label text-limestone"
              >
                Zapytaj o wycenę
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
