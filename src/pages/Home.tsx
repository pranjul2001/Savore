import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Leaf } from "lucide-react";
import type { AddToCart, Cart, Navigate, Product } from "../types";
import { menuCategories, menuItems } from "../menu";
import { artFor, heroArt, tablescapeArt } from "../lib/art";
import { asset, money, quantityInCart } from "../lib/utils";
import { Marquee } from "../components/Marquee";
import { QuantityStepper } from "../components/Product";
import { Bow, Eyebrow, Reveal, Scallop, Sparkle, SplitHeading, ease } from "../components/motion";

const featuredIds = ["italian-pasta-salad", "high-protein-burger", "chocolate-mousse"];

export function Home({ cart, onNavigate, onSelect, onAdd }: { cart: Cart; onNavigate: Navigate; onSelect: (product: Product) => void; onAdd: AddToCart }) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <Marquee />
      <CategoryRail onNavigate={onNavigate} />
      <Featured cart={cart} onNavigate={onNavigate} onSelect={onSelect} onAdd={onAdd} />
      <StoryBand onNavigate={onNavigate} />
      <PromiseStrip />
      <VisitCta onNavigate={onNavigate} />
    </>
  );
}

function Hero({ onNavigate }: { onNavigate: Navigate }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 50]);
  const lift = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const sunScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.25]);

  return (
    <section className="hero" ref={ref} aria-labelledby="hero-title">
      <div className="hero-copy">
        <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
          <Eyebrow>Freshly made · 100% eggless</Eyebrow>
        </motion.div>
        <SplitHeading as="h1" id="hero-title" immediate className="hero-title" lines={["Fresh bowls.", <>Comfort <em>made</em></>, "for you."]} />
        <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.45 }}>
          <p className="hero-intro">Bright flavours, thoughtful ingredients, and feel-good food from Savorê by Pallavi.</p>
          <div className="hero-actions">
            <motion.button className="button button-primary button-large" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate("menu")}>
              Explore all 59 dishes <ArrowUpRight size={18} aria-hidden="true" />
            </motion.button>
            <a className="text-link" href={asset("savore-menu.pdf")} target="_blank" rel="noreferrer">
              Open the menu PDF <ArrowUpRight size={16} aria-hidden="true" /><span className="visually-hidden">(opens in a new tab)</span>
            </a>
          </div>
          <dl className="hero-facts">
            <div><dt>Dishes</dt><dd>59</dd></div>
            <div><dt>Categories</dt><dd>11</dd></div>
            <div><dt>Eggless</dt><dd>100%</dd></div>
          </dl>
        </motion.div>
      </div>

      <div className="hero-visual">
        <motion.div className="hero-sun" style={{ scale: sunScale }} aria-hidden="true" />
        <motion.div className="hero-plate" style={{ y: lift }}>
          <motion.img
            src={heroArt.src}
            alt={heroArt.alt}
            style={{ rotate }}
            initial={reduce ? false : { scale: 0.8, opacity: 0, rotate: -40 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.3, ease, delay: 0.15 }}
          />
        </motion.div>
        <RotatingBadge />
        <motion.p className="hero-note" initial={reduce ? false : { opacity: 0, rotate: 0 }} animate={{ opacity: 1, rotate: -6 }} transition={{ delay: 1, duration: 0.6 }}>
          A little <em>goodness</em> in every bite
        </motion.p>
      </div>

      <button className="scroll-cue" onClick={() => document.querySelector("#categories")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })}>
        <ArrowDown size={16} aria-hidden="true" /> Scroll for the good stuff
      </button>
    </section>
  );
}

function RotatingBadge() {
  const text = "Eggless · Preservative-free · Freshly made · ";
  return (
    <div className="hero-badge" aria-hidden="true">
      <svg className="hero-badge-ring" viewBox="0 0 200 200">
        <defs><path id="badge-circle" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0" /></defs>
        <text><textPath href="#badge-circle">{text}</textPath></text>
      </svg>
      <Sparkle className="hero-badge-mark" />
    </div>
  );
}

function CategoryRail({ onNavigate }: { onNavigate: Navigate }) {
  const railRef = useRef<HTMLUListElement>(null);
  const counts = (name: string) => menuItems.filter((item) => item.category === name).length;
  const scrollBy = (direction: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <section className="categories" id="categories" aria-labelledby="categories-title">
      <div className="section-head">
        <div>
          <Eyebrow>From the menu</Eyebrow>
          <SplitHeading id="categories-title" lines={[<>Good food, <em>no fuss.</em></>]} />
        </div>
        <div className="rail-controls">
          <button className="icon-button icon-button-outline" onClick={() => scrollBy(-1)} aria-label="Scroll categories left"><ArrowLeft aria-hidden="true" /></button>
          <button className="icon-button icon-button-outline" onClick={() => scrollBy(1)} aria-label="Scroll categories right"><ArrowRight aria-hidden="true" /></button>
        </div>
      </div>
      <p className="draft-label">59 menu items · prices in INR</p>
      <ul className="category-rail" ref={railRef}>
        {menuCategories.map((category, index) => (
          <Reveal as="li" key={category.name} delay={Math.min(index, 4) * 0.07}>
            <button className="category-card" onClick={() => onNavigate("menu", { category: category.name })}>
              <span className="category-card-art"><img src={artFor(category.name).src} alt="" loading="lazy" /></span>
              <span className="category-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="category-card-name">{category.name}</span>
              <span className="category-card-desc">{category.description}</span>
              <span className="category-card-count">{counts(category.name)} {counts(category.name) === 1 ? "dish" : "dishes"} <ArrowUpRight size={14} aria-hidden="true" /></span>
            </button>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function Featured({ cart, onNavigate, onSelect, onAdd }: { cart: Cart; onNavigate: Navigate; onSelect: (product: Product) => void; onAdd: AddToCart }) {
  const items = featuredIds.map((id) => menuItems.find((item) => item.id === id)!);
  return (
    <section className="featured" aria-labelledby="featured-title">
      <Scallop color="var(--flour)" />
      <div className="section-head">
        <div>
          <Eyebrow>House favourites</Eyebrow>
          <SplitHeading id="featured-title" lines={["Fresh bowls &", <em key="e">comfort plates.</em>]} />
        </div>
        <button className="text-link" onClick={() => onNavigate("menu")}>Browse the full menu <ArrowRight size={16} aria-hidden="true" /></button>
      </div>
      <ol className="featured-list">
        {items.map((product, index) => <FeaturedItem key={product.id} product={product} index={index} quantity={quantityInCart(cart, product.id)} onSelect={onSelect} onAdd={onAdd} />)}
      </ol>
    </section>
  );
}

function FeaturedItem({ product, index, quantity, onSelect, onAdd }: { product: Product; index: number; quantity: number; onSelect: (product: Product) => void; onAdd: AddToCart }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["12%", "-12%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-18, 18]);
  const art = artFor(product.category);
  return (
    <li className={`featured-item ${index % 2 ? "is-flipped" : ""}`} ref={ref}>
      <motion.div className="featured-art" style={{ y }}>
        <motion.img src={art.src} alt="" loading="lazy" style={{ rotate }} />
      </motion.div>
      <Reveal className="featured-copy">
        <span className="featured-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <p className="product-tag">{product.category}</p>
        <h3>
          <button className="featured-name" onClick={() => onSelect(product)}>{product.name}<span className="visually-hidden">, view details</span></button>
        </h3>
        <p className="featured-desc">{product.note || menuCategories.find((c) => c.name === product.category)?.description} Freshly made · eggless.</p>
        <div className="featured-buy">
          <span className="featured-price">{money(product.price)}</span>
          <QuantityStepper
            name={product.name}
            quantity={quantity}
            onRemove={() => onAdd(product.id, -1)}
            onAdd={() => (product.options ? onSelect(product) : onAdd(product.id, 1))}
            addLabel={product.options ? `Choose a patty for ${product.name}` : undefined}
          />
        </div>
      </Reveal>
    </li>
  );
}

function StoryBand({ onNavigate }: { onNavigate: Navigate }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const clip = useTransform(scrollYProgress, [0, 1], reduce ? ["inset(0% 0% 0% 0% round 28px)", "inset(0% 0% 0% 0% round 28px)"] : ["inset(14% 10% 14% 10% round 200px)", "inset(0% 0% 0% 0% round 28px)"]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.2, 1]);
  return (
    <section className="story-band" ref={ref} aria-labelledby="story-band-title">
      <motion.div className="story-band-image" style={{ clipPath: clip }}>
        <motion.img src={tablescapeArt.src} alt={tablescapeArt.alt} loading="lazy" style={{ scale }} />
      </motion.div>
      <div className="story-band-copy">
        <Eyebrow tone="light">From Pallavi's kitchen</Eyebrow>
        <SplitHeading id="story-band-title" lines={["Good food.", <em key="e">Good feeling.</em>]} />
        <Reveal>
          <p>Freshly made, 100% eggless, and preservative-free. Bright flavours and thoughtful ingredients in every bite.</p>
          <div className="story-band-actions">
            <motion.button className="button button-saffron" whileTap={{ scale: 0.97 }} onClick={() => onNavigate("menu")}>Explore the full menu <ArrowRight size={16} aria-hidden="true" /></motion.button>
            <button className="text-link text-link-light" onClick={() => onNavigate("story")}>Read our story <ArrowUpRight size={16} aria-hidden="true" /></button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PromiseStrip() {
  const pillars = [
    { title: "Freshly made", text: "Every dish on the menu is prepared fresh.", icon: <Sparkle /> },
    { title: "100% eggless", text: "The whole menu is eggless, desserts included.", icon: <Leaf aria-hidden="true" /> },
    { title: "Preservative-free", text: "Thoughtful ingredients, nothing to keep it on a shelf.", icon: <Bow /> },
  ];
  return (
    <section className="promise" aria-label="Our promise">
      <ul>
        {pillars.map((pillar, index) => (
          <Reveal as="li" key={pillar.title} delay={index * 0.1}>
            <span className="promise-icon" aria-hidden="true">{pillar.icon}</span>
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function VisitCta({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <section className="visit-cta" aria-labelledby="visit-cta-title">
      <Scallop color="var(--dough)" />
      <div className="visit-cta-inner">
        <div>
          <Eyebrow tone="light">Find us on Swiggy &amp; Zomato</Eyebrow>
          <SplitHeading id="visit-cta-title" lines={["A little goodness", <>in every <em>bite.</em></>]} />
        </div>
        <Reveal className="visit-cta-details">
          <p>Order through your favourite food delivery app.</p>
          <p><strong>Fresh bowls &amp; comfort plates</strong><br />Prices in INR · menu prepared fresh</p>
          <div className="visit-cta-actions">
            <motion.button className="button button-cream button-large" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate("menu")}>Start your order <ArrowRight size={18} aria-hidden="true" /></motion.button>
            <button className="text-link text-link-light" onClick={() => onNavigate("visit")}>Visit Savorê <ArrowUpRight size={16} aria-hidden="true" /></button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
