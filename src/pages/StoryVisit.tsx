import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Cookie, Leaf } from "lucide-react";
import type { Navigate } from "../types";
import { menuCategories } from "../menu";
import { categoryArt, tablescapeArt } from "../lib/art";
import { Bow, Eyebrow, Reveal, Scallop, SplitHeading, ease } from "../components/motion";

export function StoryPage({ onNavigate }: { onNavigate: Navigate }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);
  return (
    <section className="editorial-page" aria-labelledby="story-title">
      <div className="editorial-heading">
        <Eyebrow>Savorê by Pallavi</Eyebrow>
        <SplitHeading as="h1" id="story-title" immediate lines={["Good food.", <em key="e">Good feeling.</em>]} />
        <Reveal y={16}><p className="lede">Freshly made, 100% eggless, and preservative-free. Bright flavours and thoughtful ingredients in every bite.</p></Reveal>
      </div>
      <motion.div ref={ref} className="editorial-image" initial={reduce ? false : { clipPath: "inset(10% 10% 10% 10% round 40px)" }} animate={{ clipPath: "inset(0% 0% 0% 0% round 28px)" }} transition={{ duration: 1.2, ease, delay: 0.2 }}>
        <motion.img src={tablescapeArt.src} alt={tablescapeArt.alt} style={{ y, scale: 1.18 }} />
      </motion.div>
      <div className="editorial-body">
        <Reveal className="editorial-columns">
          <p className="drop-cap">Savorê by Pallavi brings together fresh bowls, comfort plates, familiar favourites, and protein-powered goodness. The supplied menu spans salads, smoothie bowls, thali, Chinese favourites, pasta, snacks, beverages, South Indian dishes, quick bites, and desserts.</p>
          <p>All menu items are described as freshly made, 100% eggless, and preservative-free.</p>
        </Reveal>
        <Bow className="editorial-bow" />
        <ul className="story-plates" aria-label="Menu categories">
          {menuCategories.map((category, index) => (
            <Reveal as="li" key={category.name} delay={(index % 4) * 0.06}>
              <img src={categoryArt[category.name].src} alt="" loading="lazy" />
              <span>{category.name}</span>
            </Reveal>
          ))}
        </ul>
        <motion.button className="button button-primary button-large" whileTap={{ scale: 0.97 }} onClick={() => onNavigate("menu")}>Explore the full menu <ArrowRight size={18} aria-hidden="true" /></motion.button>
      </div>
    </section>
  );
}

export function VisitPage({ onNavigate }: { onNavigate: Navigate }) {
  const reduce = useReducedMotion();
  return (
    <section className="visit-page" aria-labelledby="visit-title">
      <div className="visit-hero">
        <div className="visit-hero-copy">
          <Eyebrow>Find Savorê</Eyebrow>
          <SplitHeading as="h1" id="visit-title" immediate lines={["Fresh food,", <em key="e">made for you.</em>]} />
          <Reveal y={16}>
            <p>The supplied menu lists Savorê on Swiggy and Zomato. Restaurant listing links, location, hours, and contact details are not included yet.</p>
            <motion.button className="button button-primary button-large" whileTap={{ scale: 0.97 }} onClick={() => onNavigate("menu")}>Browse the menu <ArrowRight size={18} aria-hidden="true" /></motion.button>
          </Reveal>
        </div>
        <div className="visit-photo">
          <motion.img src={categoryArt.Thali.src} alt={categoryArt.Thali.alt} initial={reduce ? false : { rotate: -45, scale: 0.8, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease }} />
        </div>
      </div>
      <div className="visit-info">
        <Scallop color="var(--flour)" />
        <ul className="visit-info-grid">
          <Reveal as="li"><Leaf size={22} aria-hidden="true" /><h2>Freshly made</h2><p>The menu describes its food as freshly prepared.</p></Reveal>
          <Reveal as="li" delay={0.1}><Cookie size={22} aria-hidden="true" /><h2>100% eggless</h2><p>Preservative-free, as stated on the supplied menu.</p></Reveal>
          <Reveal as="li" delay={0.2}>
            <button className="visit-cta-card" onClick={() => onNavigate("menu")}>See all 59 dishes <ArrowRight size={20} aria-hidden="true" /></button>
          </Reveal>
        </ul>
      </div>
    </section>
  );
}
