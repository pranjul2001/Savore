import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import type { AddToCart, Cart, Product } from "../types";
import { money, quantityInCart } from "../lib/utils";

/** Animated −/count/+ control. `onAdd` for items with options opens the chooser instead. */
export function QuantityStepper({ name, quantity, onRemove, onAdd, addLabel, size = "md" }: { name: string; quantity: number; onRemove: () => void; onAdd: () => void; addLabel?: string; size?: "sm" | "md" }) {
  const reduce = useReducedMotion();
  return (
    <div className={`stepper stepper-${size} ${quantity > 0 ? "has-quantity" : ""}`}>
      <motion.button type="button" className="stepper-button" onClick={onRemove} disabled={quantity === 0} whileTap={{ scale: 0.85 }} aria-label={`Remove one ${name}`}>
        <Minus size={15} aria-hidden="true" />
      </motion.button>
      <span className="stepper-value" aria-live="polite" aria-atomic="true">
        <span className="visually-hidden">{name}: </span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={quantity}
            initial={reduce ? false : { y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: 14, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {quantity}
          </motion.span>
        </AnimatePresence>
        <span className="visually-hidden"> in bag</span>
      </span>
      <motion.button type="button" className="stepper-button stepper-add" onClick={onAdd} whileTap={{ scale: 0.85 }} aria-label={addLabel ?? `Add one ${name}`}>
        <Plus size={16} aria-hidden="true" />
      </motion.button>
    </div>
  );
}

/** One line of the menu board: name, dotted leader, price, and the bag stepper. */
export function ProductRow({ product, cart, onSelect, onAdd }: { product: Product; cart: Cart; onSelect: (product: Product) => void; onAdd: AddToCart }) {
  const quantity = quantityInCart(cart, product.id);
  return (
    <article className={`menu-row ${quantity > 0 ? "in-bag" : ""}`}>
      <div className="menu-row-main">
        <h3 className="menu-row-title">
          <button className="menu-row-name" onClick={() => onSelect(product)}>
            {product.name}
            <span className="visually-hidden">, view details</span>
          </button>
          <span className="menu-row-leader" aria-hidden="true" />
          <span className="menu-row-price">{money(product.price)}</span>
        </h3>
        {product.note && <p className="menu-row-note">{product.note}</p>}
      </div>
      <QuantityStepper
        name={product.name}
        quantity={quantity}
        onRemove={() => onAdd(product.id, -1)}
        onAdd={() => (product.options ? onSelect(product) : onAdd(product.id, 1))}
        addLabel={product.options ? `Choose a patty for ${product.name}` : undefined}
        size="sm"
      />
    </article>
  );
}
