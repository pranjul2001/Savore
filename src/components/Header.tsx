import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { ArrowUpRight, ShoppingBag, X } from "lucide-react";
import type { Navigate, Page } from "../types";
import { asset } from "../lib/utils";
import { useOverlay } from "../lib/useOverlay";
import { ease } from "./motion";

const links: { page: Page; label: string }[] = [
  { page: "menu", label: "The menu" },
  { page: "story", label: "Our story" },
  { page: "visit", label: "Visit us" },
];

export function Header({ page, itemCount, onNavigate, onOpenBag }: { page: Page; itemCount: number; onNavigate: Navigate; onOpenBag: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  function go(next: Page) {
    setOpen(false);
    onNavigate(next);
  }

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="header-inner">
        <button className="wordmark" onClick={() => go("home")} aria-label="Savorê by Pallavi, home">
          <img src={asset("savor-logo-clean.png")} alt="" width="1100" height="250" />
        </button>

        <nav className="main-nav" aria-label="Main">
          <ul>
            {links.map((link) => (
              <li key={link.page}>
                <button className={page === link.page ? "active" : ""} aria-current={page === link.page ? "page" : undefined} onClick={() => go(link.page)}>
                  {link.label}
                  {page === link.page && <motion.span className="nav-underline" layoutId="nav-underline" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <motion.button className="bag-button" onClick={onOpenBag} whileTap={{ scale: 0.94 }}>
            <ShoppingBag size={18} strokeWidth={1.8} aria-hidden="true" />
            <span className="bag-label">Bag</span><span className="visually-hidden">, </span>
            <motion.span
              key={itemCount}
              className={`bag-count ${itemCount > 0 ? "has-items" : ""}`}
              initial={reduce || itemCount === 0 ? false : { scale: 1.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {itemCount}
            </motion.span>
            <span className="visually-hidden"> {itemCount === 1 ? "item" : "items"}</span>
          </motion.button>
          <button className="menu-toggle" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-nav">
            <span className="menu-toggle-lines" aria-hidden="true"><i /><i /></span>
            <span>Menu</span>
          </button>
        </div>
      </div>

      <AnimatePresence>{open && <MobileNav page={page} onGo={go} onClose={() => setOpen(false)} />}</AnimatePresence>
    </header>
  );
}

function MobileNav({ page, onGo, onClose }: { page: Page; onGo: (page: Page) => void; onClose: () => void }) {
  const ref = useOverlay<HTMLDivElement>(onClose);
  const all: { page: Page; label: string }[] = [{ page: "home", label: "Home" }, ...links];
  return (
    <motion.div
      ref={ref}
      id="mobile-nav"
      className="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.55, ease }}
    >
      <div className="mobile-nav-top">
        <img src={asset("savor-logo-clean.png")} alt="" className="mobile-nav-logo" />
        <button className="icon-button" onClick={onClose} aria-label="Close navigation"><X aria-hidden="true" /></button>
      </div>
      <nav aria-label="Mobile">
        <ul>
          {all.map((link, index) => (
            <motion.li key={link.page} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + index * 0.06, duration: 0.6, ease }}>
              <button aria-current={page === link.page ? "page" : undefined} onClick={() => onGo(link.page)}>
                <span className="mobile-nav-index">0{index + 1}</span>
                {link.label}
                <ArrowUpRight aria-hidden="true" />
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>
      <p className="mobile-nav-foot">Freshly made · 100% eggless · Preservative-free</p>
    </motion.div>
  );
}
