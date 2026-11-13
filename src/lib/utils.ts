import type { Cart } from "../types";

export const money = (amount: number) => `Rs. ${amount.toLocaleString("en-IN")}`;

/** Resolves a file in /public against the deploy base path (e.g. /Savore/ on GitHub Pages). */
export const asset = (file: string) => `${import.meta.env.BASE_URL}${file.replace(/^\//, "")}`;

export function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readConsent() {
  try {
    return localStorage.getItem("savor.consent") || "";
  } catch {
    return "";
  }
}

export function writeStored(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* The storefront remains usable without persistence. */ }
}

/** Total quantity of a product in the bag, across all of its options. */
export function quantityInCart(cart: Cart, productId: string) {
  return Object.entries(cart).reduce((total, [key, count]) => total + (key === productId || key.startsWith(`${productId}::`) ? count : 0), 0);
}
