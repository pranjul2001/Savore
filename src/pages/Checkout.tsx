import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, Building2, Check, CreditCard, QrCode, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import type { CartLine, CompletedOrder, CustomerDetails, Navigate, PaymentMethod } from "../types";
import { money } from "../lib/utils";
import { artFor } from "../lib/art";
import { downloadInvoice, notificationLabel, notificationMessage, printInvoice } from "../lib/invoice";
import { QuantityStepper } from "../components/Product";
import { Eyebrow, SplitHeading, ease } from "../components/motion";

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Details", "Payment", "Done"];
  return (
    <ol className="checkout-steps" aria-label="Checkout progress">
      {steps.map((label, index) => (
        <li key={label} className={index + 1 < current ? "is-done" : index + 1 === current ? "is-current" : ""} aria-current={index + 1 === current ? "step" : undefined}>
          <span className="checkout-step-dot" aria-hidden="true">{index + 1 < current ? <Check size={12} /> : index + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}

export function CheckoutPage({ cartProducts, subtotal, onQuantity, onSubmit, onBack, onBrowse }: { cartProducts: CartLine[]; subtotal: number; onQuantity: (id: string, delta: number) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onBack: () => void; onBrowse: () => void }) {
  return (
    <section className="flow-page checkout-page" aria-labelledby="checkout-title">
      <div className="flow-top">
        <button className="back-link" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Back to bag</button>
        <Steps current={1} />
      </div>
      <div className="checkout-layout">
        <div className="checkout-main">
          <Eyebrow>Checkout · step 1 of 2</Eyebrow>
          <SplitHeading as="h1" id="checkout-title" immediate lines={["Let's get the", <em key="e">details right.</em>]} />
          <p className="draft-label">Demo checkout · no real payment or order submission</p>
          {cartProducts.length === 0 ? (
            <div className="empty-checkout">
              <p>Your bag is waiting for something good.</p>
              <button className="button button-primary" type="button" onClick={onBrowse}>Browse the menu <ArrowRight size={16} aria-hidden="true" /></button>
            </div>
          ) : (
            <form className="checkout-form" onSubmit={onSubmit}>
              <fieldset>
                <legend>Who should we prepare this for?</legend>
                <label className="field"><span>Your name</span><input name="name" autoComplete="name" required placeholder="Name" /></label>
                <label className="field"><span>Email address</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
                <label className="field"><span>Mobile number for SMS</span><input name="phone" type="tel" autoComplete="tel" required /></label>
              </fieldset>
              <fieldset>
                <legend>Pickup preference</legend>
                <label className="field"><span>Preferred date</span><input name="date" type="date" required /></label>
                <label className="field"><span>Anything we should know? <span className="optional">optional</span></span><textarea name="notes" rows={3} placeholder="A note for the restaurant" /></label>
              </fieldset>
              <motion.button className="button button-primary button-large submit-button" type="submit" whileTap={{ scale: 0.97 }}>Continue to payment <ArrowRight size={16} aria-hidden="true" /></motion.button>
              <p className="checkout-disclaimer">Your contact details stay in this browser session for this demo. No order is sent to the restaurant. SMS and email will only be previewed, not sent.</p>
            </form>
          )}
        </div>
        <aside className="order-summary" aria-labelledby="summary-title">
          <h2 id="summary-title">Your bag</h2>
          <ul className="summary-lines">
            {cartProducts.map((product) => (
              <li className="summary-line" key={product.cartKey}>
                <img className="summary-art" src={artFor(product.category).src} alt="" />
                <div className="summary-line-copy">
                  <strong>{product.name}</strong>
                  {product.selectedOption && <span>{product.selectedOption}</span>}
                  <span>{money(product.price)} each</span>
                  <QuantityStepper name={product.name} quantity={product.quantity} onRemove={() => onQuantity(product.cartKey, -1)} onAdd={() => onQuantity(product.cartKey, 1)} size="sm" />
                </div>
                <span className="summary-price">{money(product.price * product.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-total"><span>Item subtotal</span><strong>{money(subtotal)}</strong></div>
          <p className="summary-foot">Prices in INR. Delivery charges, if applicable, are set by the ordering platform.</p>
        </aside>
      </div>
    </section>
  );
}

const paymentMethods: { id: PaymentMethod; label: string; detail: string; icon: typeof Smartphone }[] = [
  { id: "upi", label: "UPI", detail: "Scan with a UPI app", icon: Smartphone },
  { id: "card", label: "Cards", detail: "Credit or debit card", icon: CreditCard },
  { id: "netbanking", label: "Net banking", detail: "Choose your bank", icon: Building2 },
  { id: "wallet", label: "Wallets", detail: "Popular digital wallets", icon: Wallet },
];

export function PaymentPage({ customer, cartProducts, subtotal, onBack, onPay }: { customer: CustomerDetails; cartProducts: CartLine[]; subtotal: number; onBack: () => void; onPay: (method: PaymentMethod) => Promise<void> }) {
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const SelectedIcon = paymentMethods.find((item) => item.id === method)?.icon || Smartphone;

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing) return;
    setProcessing(true);
    try {
      await onPay(method);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <section className="flow-page payment-page" aria-labelledby="payment-title">
      <div className="flow-top">
        <button className="back-link" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Back to details</button>
        <Steps current={2} />
      </div>
      <div className="payment-heading">
        <Eyebrow>Checkout · step 2 of 2</Eyebrow>
        <SplitHeading as="h1" id="payment-title" immediate lines={["Choose how", <>to <em>pay.</em></>]} />
        <p>Payment gateway preview</p>
      </div>
      <div className="demo-payment-banner" role="note"><ShieldCheck size={20} aria-hidden="true" /><div><strong>Simulation only</strong><p>Do not enter real card, bank, wallet, or UPI credentials. Nothing is transmitted, charged, or stored.</p></div></div>
      <div className="payment-layout">
        <form className="payment-methods" onSubmit={handlePayment}>
          <fieldset>
            <legend>Payment method</legend>
            <div className="payment-method-list">
              {paymentMethods.map(({ id, label, detail, icon: Icon }) => (
                <label className={`payment-method ${method === id ? "selected" : ""}`} key={id}>
                  <input type="radio" name="payment-method" value={id} checked={method === id} onChange={() => setMethod(id)} />
                  <span className="payment-method-icon" aria-hidden="true"><Icon size={20} /></span>
                  <span className="payment-method-copy"><strong>{label}</strong><small>{detail}</small></span>
                  <span className="payment-radio" aria-hidden="true" />
                </label>
              ))}
            </div>
          </fieldset>
          <motion.div className="payment-detail-panel" key={method} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}>
            <div className="payment-detail-heading"><SelectedIcon size={18} aria-hidden="true" /><strong>{paymentMethods.find((item) => item.id === method)?.label} details</strong><span>DEMO</span></div>
            {method === "upi" && <div className="upi-setup-notice"><div className="upi-qr-placeholder" aria-hidden="true"><QrCode size={30} /></div><div><strong>UPI QR not configured</strong><p>A scannable, amount-specific QR needs the restaurant's merchant UPI ID and display name. This demo cannot verify payments.</p></div></div>}
            {method === "card" && <div className="card-fields"><label className="field"><span>Name on card</span><input name="card-name" autoComplete="off" required placeholder="Demo cardholder" /></label><label className="field"><span>Card number</span><input name="card-number" inputMode="numeric" autoComplete="off" required minLength={12} maxLength={19} placeholder="4242 4242 4242 4242" /></label><div className="card-field-row"><label className="field"><span>Expiry</span><input name="card-expiry" autoComplete="off" required placeholder="MM / YY" /></label><label className="field"><span>CVV</span><input name="card-cvv" inputMode="numeric" autoComplete="off" required minLength={3} maxLength={4} placeholder="123" /></label></div></div>}
            {method === "netbanking" && <label className="field"><span>Select a demo bank</span><select name="bank" required defaultValue=""><option value="" disabled>Choose a bank</option><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra Bank</option></select></label>}
            {method === "wallet" && <label className="field"><span>Select a demo wallet</span><select name="wallet" required defaultValue=""><option value="" disabled>Choose a wallet</option><option>Paytm (demo)</option><option>PhonePe (demo)</option><option>Amazon Pay (demo)</option><option>Other wallet (demo)</option></select></label>}
          </motion.div>
          <motion.button className="button button-primary button-large payment-submit" type="submit" disabled={processing} aria-busy={processing} whileTap={{ scale: 0.97 }}>
            {processing ? "Sending test confirmations…" : `Pay ${money(subtotal)} (demo)`} <ArrowRight size={16} aria-hidden="true" />
          </motion.button>
          <p className="payment-privacy"><ShieldCheck size={14} aria-hidden="true" /> Demo fields are discarded when you leave this step.</p>
        </form>
        <aside className="payment-summary" aria-label="Order summary">
          <div className="payment-summary-heading"><span>Order summary</span><span>{cartProducts.reduce((sum, item) => sum + item.quantity, 0)} items</span></div>
          {cartProducts.map((item) => <div className="payment-summary-line" key={item.cartKey}><div><strong>{item.quantity} × {item.name}</strong>{item.selectedOption && <small>{item.selectedOption}</small>}</div><span>{money(item.price * item.quantity)}</span></div>)}
          <div className="summary-total"><span>Item subtotal</span><strong>{money(subtotal)}</strong></div>
          <p className="payment-customer"><strong>Pickup for</strong><br />{customer.name}<br />{customer.date}</p>
          <p className="payment-summary-foot">No taxes or delivery fees have been added.</p>
        </aside>
      </div>
    </section>
  );
}

export function SuccessPage({ order, onNavigate }: { order: CompletedOrder; onNavigate: Navigate }) {
  const reduce = useReducedMotion();
  const paymentLabel = order.method.toUpperCase();
  return (
    <section className="flow-page success-page" aria-labelledby="success-title">
      <Steps current={3} />
      <motion.div className="success-stamp" aria-hidden="true" initial={reduce ? false : { scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}>
        <Check size={36} />
      </motion.div>
      <Eyebrow>Demo order complete</Eyebrow>
      <h1 id="success-title">Thanks, {order.customer.name}.</h1>
      <p className="success-lede">Your demo checkout is complete. No payment was collected and the restaurant has not received this order.</p>
      <div className="confirmation-card">
        <div className="confirmation-id"><span>Demo order number</span><strong>{order.id}</strong></div>
        <div className="confirmation-row"><span>Amount</span><strong>{money(order.subtotal)}</strong></div>
        <div className="confirmation-row"><span>Method</span><strong>{paymentLabel} · demo</strong></div>
        <div className="confirmation-row"><span>Pickup date</span><strong>{order.customer.date}</strong></div>
      </div>
      <div className="invoice-actions">
        <button className="button button-primary" onClick={() => downloadInvoice(order)}>Download invoice <ArrowDown size={16} aria-hidden="true" /></button>
        <button className="button button-ghost" onClick={() => printInvoice(order)}>Print / Save PDF</button>
      </div>
      <div className="notification-previews">
        <h2>Test notification delivery</h2>
        <article className={`notification is-${order.notifications.sms.status}`}><Smartphone size={18} aria-hidden="true" /><div><strong>SMS · {notificationLabel(order.notifications.sms)}</strong><p>To: {order.customer.phone}</p><p>{notificationMessage(order.notifications.sms, "sms")}</p></div></article>
        <article className={`notification is-${order.notifications.email.status}`}><span className="email-glyph" aria-hidden="true">@</span><div><strong>Email · {notificationLabel(order.notifications.email)}</strong><p>To: {order.customer.email}</p><p>Subject: [TEST · UNPAID] Savorê order {order.id}</p><p>{notificationMessage(order.notifications.email, "email")}</p></div></article>
      </div>
      <button className="text-link success-home-link" onClick={() => onNavigate("menu")}>Back to the menu <ArrowRight size={16} aria-hidden="true" /></button>
    </section>
  );
}
