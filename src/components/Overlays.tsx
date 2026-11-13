import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check, Cookie, Plus, ShoppingBag, X } from "lucide-react";
import type { CartLine, Product } from "../types";
import { asset, money } from "../lib/utils";
import { artFor } from "../lib/art";
import { useOverlay } from "../lib/useOverlay";
import { QuantityStepper } from "./Product";
import { Eyebrow, Sparkle, ease } from "./motion";

const backdrop = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } };

export function ProductDialog({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (id: string, delta: number, option?: string) => void }) {
  const [selectedOption, setSelectedOption] = useState("");
  const ref = useOverlay<HTMLElement>(onClose);
  const art = artFor(product.category);
  return (
    <motion.div className="modal-backdrop" {...backdrop} onClick={onClose}>
      <motion.section
        ref={ref}
        className="product-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.45, ease }}
      >
        <button className="icon-button dialog-close" onClick={onClose} aria-label="Close dish details"><X aria-hidden="true" /></button>
        <div className="product-dialog-art">
          <motion.img src={art.src} alt="" initial={{ rotate: -20, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 0.9, ease }} />
          <span className="art-badge">Illustration</span>
        </div>
        <div className="dialog-copy">
          <p className="product-tag">{product.category}</p>
          <h2 id="dialog-title">{product.name}</h2>
          <p>{product.note || "Freshly made, 100% eggless, and preservative-free."}</p>
          {product.options && (
            <label className="field option-select">
              <span>Choose a patty</span>
              <select data-autofocus value={selectedOption} onChange={(event) => setSelectedOption(event.target.value)}>
                <option value="">Select one option</option>
                {product.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          )}
          <p className="dialog-description">Prepared fresh · Prices in INR</p>
          <div className="dialog-buy">
            <strong className="dialog-price">{money(product.price)}</strong>
            <motion.button
              className="button button-primary"
              whileTap={{ scale: 0.96 }}
              disabled={Boolean(product.options) && !selectedOption}
              onClick={() => { onAdd(product.id, 1, selectedOption || undefined); onClose(); }}
            >
              Add to bag <Plus size={16} aria-hidden="true" />
            </motion.button>
          </div>
          <span className="sample-note">Listed menu price · ordering is a preview</span>
        </div>
      </motion.section>
    </motion.div>
  );
}

export function CartDrawer({ products, subtotal, onClose, onQuantity, onCheckout, onBrowse }: { products: CartLine[]; subtotal: number; onClose: () => void; onQuantity: (id: string, delta: number) => void; onCheckout: () => void; onBrowse: () => void }) {
  const ref = useOverlay<HTMLElement>(onClose);
  const reduce = useReducedMotion();
  return (
    <motion.div className="modal-backdrop drawer-backdrop" {...backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.aside
        ref={ref}
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="drawer-heading">
          <div>
            <Eyebrow>Your menu picks</Eyebrow>
            <h2 id="cart-title">The bag</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close bag"><X aria-hidden="true" /></button>
        </div>
        {products.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={36} strokeWidth={1.4} aria-hidden="true" />
            <p>Your bag is waiting for something good.</p>
            <button className="button button-ghost" onClick={onBrowse}>Explore the menu <ArrowRight size={16} aria-hidden="true" /></button>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              <AnimatePresence initial={false}>
                {products.map((product) => (
                  <motion.li
                    className="cart-line"
                    key={product.cartKey}
                    layout={!reduce}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, transition: { duration: 0.2 } }}
                  >
                    <img className="cart-line-art" src={artFor(product.category).src} alt="" />
                    <div className="cart-line-copy">
                      <span className="cart-line-category">{product.category}</span>
                      <strong>{product.name}</strong>
                      {product.selectedOption && <span>{product.selectedOption}</span>}
                      <span>{money(product.price)} each</span>
                      <QuantityStepper name={product.name} quantity={product.quantity} onRemove={() => onQuantity(product.cartKey, -1)} onAdd={() => onQuantity(product.cartKey, 1)} size="sm" />
                    </div>
                    <strong className="line-total">{money(product.price * product.quantity)}</strong>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="drawer-bottom">
              <div className="summary-total"><span>Item subtotal</span><strong>{money(subtotal)}</strong></div>
              <p>Prices in INR. Delivery charges, if applicable, are set by the ordering platform.</p>
              <motion.button className="button button-primary button-block" whileTap={{ scale: 0.97 }} onClick={onCheckout}>Continue to details <ArrowRight size={16} aria-hidden="true" /></motion.button>
            </div>
          </>
        )}
      </motion.aside>
    </motion.div>
  );
}

export function IntroOverlay({ onDismiss }: { onDismiss: () => void }) {
  const ref = useOverlay<HTMLDivElement>(onDismiss);
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 2000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);
  return (
    <motion.div
      ref={ref}
      className="intro-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Savorê by Pallavi"
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.8, ease }}
    >
      <div className="intro-content">
        <motion.img
          className="intro-logo"
          src={asset("savor-logo-clean.png")}
          alt=""
          initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
          animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
          transition={{ duration: 1.1, ease }}
        />
        <motion.p className="intro-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
          <Sparkle /> A little goodness is being prepared
        </motion.p>
        <motion.button className="button button-primary intro-enter" onClick={onDismiss} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          Come on in <ArrowRight size={16} aria-hidden="true" />
        </motion.button>
      </div>
      <button className="intro-skip" onClick={onDismiss}>Skip intro <ArrowUpRight size={14} aria-hidden="true" /></button>
    </motion.div>
  );
}

export function CookieNotice({ onAccept, onReject, onManage }: { onAccept: () => void; onReject: () => void; onManage: () => void }) {
  return (
    <motion.aside className="cookie-notice" aria-label="Cookie preferences" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.5, ease, delay: 0.4 }}>
      <div className="cookie-icon" aria-hidden="true"><Cookie size={18} /></div>
      <div className="cookie-copy">
        <strong>A little choice, before the crumbs.</strong>
        <p>Essential storage keeps your bag and preferences working. This preview does not load analytics or advertising trackers.</p>
        <button className="cookie-manage" onClick={onManage}>Manage choices</button>
      </div>
      <div className="cookie-actions">
        <button className="button button-ghost button-small" onClick={onReject}>Essential only</button>
        <button className="button button-primary button-small" onClick={onAccept}>Save preference</button>
      </div>
    </motion.aside>
  );
}

export function CookieSettings({ allowed, onChange, onSave, onReject, onClose }: { allowed: boolean; onChange: (value: boolean) => void; onSave: () => void; onReject: () => void; onClose: () => void }) {
  const ref = useOverlay<HTMLElement>(onClose);
  return (
    <motion.div className="modal-backdrop" {...backdrop} onClick={onClose}>
      <motion.section
        ref={ref}
        className="cookie-settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease }}
      >
        <button className="icon-button dialog-close" onClick={onClose} aria-label="Close privacy settings"><X aria-hidden="true" /></button>
        <Eyebrow>Your privacy, your call</Eyebrow>
        <h2 id="privacy-title">Cookie choices</h2>
        <p>Essential storage supports the bag and privacy setting. Optional analytics are not active in this preview; no analytics or advertising trackers are loaded.</p>
        <div className="consent-row"><div><strong>Essential</strong><span>Always on · bag and preferences</span></div><span className="always-on">On</span></div>
        <label className="consent-row">
          <div><strong>Analytics</strong><span>Preference only · no tracker is active</span></div>
          <input className="switch" type="checkbox" checked={allowed} onChange={(event) => onChange(event.target.checked)} />
        </label>
        <div className="consent-actions">
          <button className="button button-ghost" onClick={onReject}>Reject optional</button>
          <button className="button button-primary" onClick={onSave}>Save choices <Check size={16} aria-hidden="true" /></button>
        </div>
      </motion.section>
    </motion.div>
  );
}
