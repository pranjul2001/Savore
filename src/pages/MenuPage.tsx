import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { AddToCart, Cart, Product } from "../types";
import { menuCategories } from "../menu";
import { artFor } from "../lib/art";
import { asset } from "../lib/utils";
import { ProductRow } from "../components/Product";
import { Eyebrow, Reveal, SplitHeading, ease } from "../components/motion";

export const ALL_ITEMS = "All items";
const filters = [ALL_ITEMS, ...menuCategories.map((item) => item.name)];

export function MenuPage({ cart, category, setCategory, query, setQuery, items, onSelect, onAdd }: { cart: Cart; category: string; setCategory: (category: string) => void; query: string; setQuery: (query: string) => void; items: Product[]; onSelect: (product: Product) => void; onAdd: AddToCart }) {
  const reduce = useReducedMotion();
  const groups = menuCategories
    .map((group) => ({ ...group, items: items.filter((item) => item.category === group.name) }))
    .filter((group) => group.items.length > 0);

  function choose(next: string) {
    setCategory(next);
    // If the board's top has scrolled under the sticky header + filter bar, bring it back just below them.
    const board = document.querySelector<HTMLElement>("#menu-board");
    const controls = document.querySelector<HTMLElement>(".catalog-controls");
    if (!board || !controls) return;
    const stickyBottom = controls.getBoundingClientRect().bottom;
    const boardTop = board.getBoundingClientRect().top;
    if (boardTop < stickyBottom) window.scrollTo({ top: window.scrollY + boardTop - stickyBottom, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section className="catalog-page" aria-labelledby="menu-title">
      <div className="catalog-intro">
        <Eyebrow>Freshly made · 100% eggless · preservative-free</Eyebrow>
        <SplitHeading as="h1" id="menu-title" immediate lines={[<>Good food, <em>no fuss.</em></>]} />
        <Reveal y={16}>
          <p className="catalog-description">Explore all 59 dishes across salads, comfort plates, South Indian favourites, drinks, and more.</p>
          <a className="text-link" href={asset("savore-menu.pdf")} target="_blank" rel="noreferrer">View the four-page menu <ArrowUpRight size={16} aria-hidden="true" /><span className="visually-hidden">(opens in a new tab)</span></a>
        </Reveal>
      </div>

      <div className="catalog-controls">
        <div className="filter-row" role="group" aria-label="Filter by category">
          {filters.map((item) => (
            <button key={item} className={`filter-chip ${category === item ? "active" : ""}`} aria-pressed={category === item} onClick={() => choose(item)}>
              {category === item && <motion.span className="filter-chip-bg" layoutId="filter-chip" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
              <span className="filter-chip-label">{item}</span>
            </button>
          ))}
        </div>
        <div className="search-wrap">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <span className="visually-hidden">Search menu</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 59 dishes" />
            {query && <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} aria-hidden="true" /></button>}
          </label>
          <p className="result-count" role="status">{items.length} {items.length === 1 ? "dish" : "dishes"}{category !== ALL_ITEMS ? ` · ${category}` : " · across the full menu"}</p>
        </div>
      </div>

      <div className="menu-board" id="menu-board">
        {groups.map((group) => (
          <motion.section
            className="menu-group"
            key={group.name}
            aria-labelledby={`group-${slug(group.name)}`}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <header className="menu-group-head">
              <motion.img
                className="menu-group-art"
                src={artFor(group.name).src}
                alt=""
                loading="lazy"
                initial={reduce ? false : { rotate: -30, scale: 0.85 }}
                whileInView={{ rotate: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease }}
              />
              <div>
                <h2 id={`group-${slug(group.name)}`}>{group.name}</h2>
                <p>{group.description}</p>
              </div>
              <span className="menu-group-count">{group.items.length}</span>
            </header>
            <div className="menu-group-items">
              {group.items.map((product) => <ProductRow key={product.id} product={product} cart={cart} onSelect={onSelect} onAdd={onAdd} />)}
            </div>
          </motion.section>
        ))}
        {items.length === 0 && (
          <div className="empty-state">
            <p>No dishes match that search. Try another name or category.</p>
            <button className="button button-ghost" onClick={() => { setQuery(""); setCategory(ALL_ITEMS); }}>Show all dishes</button>
          </div>
        )}
      </div>
    </section>
  );
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
