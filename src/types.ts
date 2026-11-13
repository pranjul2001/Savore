import type { MenuItem } from "./menu";

export type Page = "home" | "menu" | "story" | "visit" | "checkout" | "payment" | "success";
export type Product = MenuItem;
export type CartLine = Product & { cartKey: string; quantity: number; selectedOption?: string };
export type Cart = Record<string, number>;
export type CustomerDetails = { name: string; email: string; phone: string; date: string; notes: string };
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";
export type NotificationResult = { status: "sent" | "not_configured" | "failed"; detail?: string; providerState?: string };
export type CompletedOrder = {
  id: string;
  createdAt: string;
  customer: CustomerDetails;
  items: CartLine[];
  subtotal: number;
  method: PaymentMethod;
  paymentReference: string;
  notifications: { email: NotificationResult; sms: NotificationResult };
};

export type AddToCart = (id: string, delta: number, option?: string) => void;
export type Navigate = (page: Page, options?: { category?: string }) => void;
