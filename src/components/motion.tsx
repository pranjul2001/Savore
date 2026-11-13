import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

export const ease = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ children, className, delay = 0, as = "div", y = 32 }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" | "article" | "aside"; y?: number }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </Tag>
  );
}

const lineParent: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const lineChild: Variants = {
  hidden: { y: "105%", rotate: 2 },
  show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease } },
};

/** Headline whose lines slide up from behind a mask. Each entry of `lines` renders on its own line. */
export function SplitHeading({ lines, as = "h2", className, immediate = false, id }: { lines: ReactNode[]; as?: "h1" | "h2"; className?: string; immediate?: boolean; id?: string }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.4 } };
  return (
    <Tag id={id} className={`split-heading ${className ?? ""}`} variants={lineParent} initial={reduce ? false : "hidden"} {...trigger}>
      {lines.map((line, index) => (
        <span className="line-mask" key={index}>
          <motion.span className="line" variants={lineChild}>{line}</motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function Eyebrow({ children, tone }: { children: ReactNode; tone?: "light" }) {
  return <p className={`eyebrow ${tone === "light" ? "eyebrow-light" : ""}`}><Sparkle />{children}</p>;
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={`sparkle ${className ?? ""}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 1.5c.6 5.4 2.9 8.1 10.5 10.5-7.6 2.4-9.9 5.1-10.5 10.5-.6-5.4-2.9-8.1-10.5-10.5C9.1 9.6 11.4 6.9 12 1.5Z" fill="currentColor" />
    </svg>
  );
}

/** The ribbon bow from the Savorê logo, used as a small divider. */
export function Bow({ className }: { className?: string }) {
  return (
    <svg className={`bow ${className ?? ""}`} viewBox="0 0 120 28" aria-hidden="true" focusable="false">
      <path d="M2 14h40M78 14h40" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M60 14c-6-9-16-11-16-4s10 6 16 4Zm0 0c6-9 16-11 16-4s-10 6-16 4Zm0 0-7 12m7-12 7 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Scalloped edge, like a cake doily or bakery box, in the colour of the section above. */
export function Scallop({ color, flip = false }: { color: string; flip?: boolean }) {
  return <div className={`scallop ${flip ? "scallop-flip" : ""}`} style={{ "--scallop": color } as CSSProperties} aria-hidden="true" />;
}
