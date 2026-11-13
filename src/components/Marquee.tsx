import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { Sparkle } from "./motion";

const phrases = ["Freshly made", "100% eggless", "Preservative-free", "Fresh bowls", "Comfort plates"];

/** Scrolling ticker. Pausable (WCAG 2.2.2) and static under prefers-reduced-motion. */
export function Marquee({ tone = "kokum" }: { tone?: "kokum" | "saffron" }) {
  const [paused, setPaused] = useState(false);
  const row = (hidden: boolean) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {phrases.map((phrase) => <li key={phrase}>{phrase}<Sparkle /></li>)}
    </ul>
  );
  return (
    <section className={`marquee marquee-${tone} ${paused ? "is-paused" : ""}`} aria-label="Our promise">
      <div className="marquee-track">{row(false)}{row(true)}{row(true)}</div>
      <button className="marquee-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? "Play scrolling text" : "Pause scrolling text"} aria-pressed={paused}>
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      </button>
    </section>
  );
}
