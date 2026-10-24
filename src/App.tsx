import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Cookie,
  CreditCard,
  Leaf,
  Minus,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  X,
  Wallet,
} from "lucide-react";
import { menuCategories, menuItems, type MenuItem } from "./menu";


type Page = "home" | "menu" | "story" | "visit" | "checkout" | "payment" | "success";
type Product = MenuItem;
type CartLine = Product & { cartKey: string; quantity: number; selectedOption?: string };
type CustomerDetails = { name: string; email: string; phone: string; date: string; notes: string };
type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";
type NotificationResult = { status: "sent" | "not_configured" | "failed"; detail?: string; providerState?: string };
type CompletedOrder = {
  id: string;
  createdAt: string;
  customer: CustomerDetails;
  items: CartLine[];
  subtotal: number;
  method: PaymentMethod;
  paymentReference: string;
  notifications: { email: NotificationResult; sms: NotificationResult };
};

const categories = ["All items", ...menuCategories.map((item) => item.name)];
const money = (amount: number) => `Rs. ${amount.toLocaleString("en-IN")}`;

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readConsent() {
  try {
    return localStorage.getItem("savor.consent") || "";
  } catch {
    return "";
  }
}

function writeStored(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* The storefront remains usable without persistence. */ }
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow"><span className="eyebrow-dot" />{children}</p>;
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const [category, setCategory] = useState("All items");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>(() => {
    const stored = readStored<Record<string, number>>("savor.cart", {});
    return Object.fromEntries(Object.entries(stored).filter(([key, quantity]) => menuItems.some((item) => item.id === key.split("::")[0]) && Number.isSafeInteger(quantity) && quantity > 0));
  });
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem("savor.introSeen") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });
  const [consent, setConsent] = useState(readConsent);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(() => readConsent() === "all");
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  const itemCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  const cartProducts = Object.entries(cart).flatMap(([cartKey, quantity]) => {
    const [productId, selectedOption] = cartKey.split("::");
    const product = menuItems.find((item) => item.id === productId);
    return product ? [{ ...product, cartKey, quantity, selectedOption }] : [];
  });
  const subtotal = cartProducts.reduce((total, line) => total + line.price * line.quantity, 0);
  const visibleProducts = menuItems.filter((product) => {
    const matchesCategory = category === "All items" || product.category === category;
    const matchesQuery = `${product.name} ${product.category} ${product.note || ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  useEffect(() => {
    writeStored("savor.cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (showIntro) {
      const timer = window.setTimeout(() => dismissIntro(), 2200);
      return () => window.clearTimeout(timer);
    }
  }, [showIntro]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [page, category, query]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", Boolean(selected || cartOpen || showCookieSettings));
    return () => document.body.classList.remove("no-scroll");
  }, [selected, cartOpen, showCookieSettings]);

  function dismissIntro() {
    try { sessionStorage.setItem("savor.introSeen", "1"); } catch { /* Storage can be disabled. */ }
    setShowIntro(false);
  }

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setSelected(null);
    setCartOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateCart(productId: string, delta: number, selectedOption?: string) {
    setCart((current) => {
      let cartKey = selectedOption ? `${productId}::${selectedOption}` : productId;
      if (delta < 0 && !selectedOption && !current[cartKey]) {
        cartKey = Object.keys(current).find((key) => key.startsWith(`${productId}::`) && current[key] > 0) || cartKey;
      }
      const nextQuantity = (current[cartKey] || 0) + delta;
      const next = { ...current };
      if (nextQuantity <= 0) delete next[cartKey];
      else next[cartKey] = nextQuantity;
      return next;
    });
  }

  function saveConsent(value: string, analytics = false) {
    writeStored("savor.consent", value);
    setConsent(value);
    setAnalyticsAllowed(analytics);
    setShowCookieSettings(false);
  }

  function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setCustomerDetails({
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      date: String(formData.get("date") || ""),
      notes: String(formData.get("notes") || ""),
    });
    navigate("payment");
  }

  async function completeMockPayment(method: PaymentMethod) {
    if (!customerDetails || cartProducts.length === 0) return;
    const now = new Date();
    const orderId = `SVR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const orderItems = cartProducts.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price, selectedOption: item.selectedOption }));
    let notifications: CompletedOrder["notifications"] = {
      email: { status: "not_configured", detail: "Notification server is unavailable." },
      sms: { status: "not_configured", detail: "Notification server is unavailable." },
    };
    try {
      const response = await fetch("/api/test-order-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: { id: orderId, customer: customerDetails, items: orderItems, amount: subtotal, method } }),
      });
      const result = await response.json();
      if (response.ok) notifications = { email: result.email, sms: result.sms };
      else notifications = {
        email: { status: "not_configured", detail: result.error || "Test notifications are disabled." },
        sms: { status: "not_configured", detail: result.error || "Test notifications are disabled." },
      };
    } catch {
      notifications = {
        email: { status: "failed", detail: "Could not reach the notification server." },
        sms: { status: "failed", detail: "Could not reach the notification server." },
      };
    }
    setCompletedOrder({
      id: orderId,
      createdAt: now.toISOString(),
      customer: customerDetails,
      items: cartProducts.map((item) => ({ ...item })),
      subtotal,
      method,
      paymentReference: `DEMO-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      notifications,
    });
    setCart({});
    navigate("success");
  }

  return (
    <>
      <div className="announcement">Freshly made <span aria-hidden="true">✳</span> 100% eggless <span aria-hidden="true">✳</span> Preservative-free</div>
      <header className="site-header">
        <button className="wordmark" onClick={() => navigate("home")} aria-label="Savorê by Pallavi home"><img src="/savor-logo-clean.png" alt="Savorê by Pallavi" /></button>
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} aria-controls="main-nav">{mobileMenuOpen ? <X /> : <span className="menu-label">Menu</span>}</button>
        <nav className={`main-nav ${mobileMenuOpen ? "open" : ""}`} id="main-nav" aria-label="Main navigation">
          <button className={page === "menu" ? "active" : ""} onClick={() => navigate("menu")}>The menu</button>
          <button className={page === "story" ? "active" : ""} onClick={() => navigate("story")}>Our story</button>
          <button className={page === "visit" ? "active" : ""} onClick={() => navigate("visit")}>Visit us</button>
        </nav>
        <button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}><ShoppingBag size={16} strokeWidth={1.6} /><span>Bag</span><span className="bag-count">{itemCount}</span></button>
      </header>

      <main key={page}>
        {page === "home" && <Home cart={cart} onNavigate={navigate} onSelect={setSelected} onAdd={updateCart} />}
        {page === "menu" && <MenuPage cart={cart} category={category} setCategory={setCategory} query={query} setQuery={setQuery} items={visibleProducts} onSelect={setSelected} onAdd={updateCart} />}
        {page === "story" && <StoryPage onNavigate={navigate} />}
        {page === "visit" && <VisitPage onNavigate={navigate} />}
        {page === "checkout" && <CheckoutPage cartProducts={cartProducts} subtotal={subtotal} onQuantity={updateCart} onSubmit={submitOrder} onBack={() => setCartOpen(true)} onBrowse={() => navigate("menu")} />}
        {page === "payment" && customerDetails && <PaymentPage customer={customerDetails} cartProducts={cartProducts} subtotal={subtotal} onBack={() => navigate("checkout")} onPay={completeMockPayment} />}
        {page === "success" && completedOrder && <SuccessPage order={completedOrder} onNavigate={navigate} />}
      </main>

      <footer className="site-footer">
        <button className="wordmark footer-wordmark" onClick={() => navigate("home")} aria-label="Savorê by Pallavi home"><img src="/savor-logo-clean.png" alt="Savorê by Pallavi" /></button>
        <p>A little goodness in every bite.</p>
        <button onClick={() => navigate("visit")}>Find Savorê <ArrowUpRight size={14} /></button>
        <button className="privacy-link" onClick={() => setShowCookieSettings(true)}><Cookie size={14} /> Privacy choices</button>
        <span className="copyright">© {new Date().getFullYear()} Savorê by Pallavi</span>
      </footer>

      {selected && <ProductDialog product={selected} onClose={() => setSelected(null)} onAdd={updateCart} />}
      {cartOpen && <CartDrawer products={cartProducts} subtotal={subtotal} onClose={() => setCartOpen(false)} onQuantity={updateCart} onCheckout={() => navigate("checkout")} onBrowse={() => navigate("menu")} />}
      {showIntro && <IntroOverlay onDismiss={dismissIntro} />}
      {!consent && <CookieNotice onAccept={() => saveConsent("all", true)} onReject={() => saveConsent("essential")} onManage={() => setShowCookieSettings(true)} />}
      {showCookieSettings && <CookieSettings allowed={analyticsAllowed} onChange={setAnalyticsAllowed} onSave={() => saveConsent(analyticsAllowed ? "all" : "essential", analyticsAllowed)} onReject={() => saveConsent("essential", false)} onClose={() => setShowCookieSettings(false)} />}
    </>
  );
}

function Home({ cart, onNavigate, onSelect, onAdd }: { cart: Record<string, number>; onNavigate: (page: Page) => void; onSelect: (product: Product) => void; onAdd: (id: string, delta: number, option?: string) => void }) {
  return (
    <>
      <section className="hero" id="home">
        <div className="hero-copy">
          <Eyebrow>Freshly made · 100% eggless</Eyebrow>
          <h1>Fresh bowls.<br />Comfort <em>made</em><br />for you.</h1>
          <p className="hero-intro">Bright flavours, thoughtful ingredients, and feel-good food from Savorê by Pallavi.</p>
          <div className="hero-actions"><button className="button button-dark" onClick={() => onNavigate("menu")}>Explore all 59 dishes <ArrowUpRight size={15} /></button><a className="text-link" href="/savore-menu.pdf" target="_blank" rel="noreferrer">Open the menu PDF <ArrowUpRight size={14} /></a></div>
          <div className="hero-note"><span className="note-mark">✳</span><span>Freshly made<br />preservative-free</span></div>
        </div>
        <div className="hero-image-wrap"><img className="hero-image" src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85" alt="Colourful fresh salad bowl with greens and vegetables" /><div className="image-caption"><span>BRIGHT FLAVOURS · THOUGHTFUL INGREDIENTS</span><span>01 / 04</span></div><div className="floating-note">A little<br /><i>goodness</i><br />in every bite</div></div>
        <button className="scroll-cue" onClick={() => document.querySelector("#favorites")?.scrollIntoView({ behavior: "smooth" })} aria-label="Scroll to favorites"><ArrowDown size={16} /><span>SCROLL FOR THE GOOD STUFF</span></button>
      </section>
      <section className="menu-section" id="favorites">
        <div className="section-heading reveal"><div><Eyebrow>From the menu</Eyebrow><h2>Good food, <em>no fuss.</em></h2></div><button className="text-link" onClick={() => onNavigate("menu")}>Browse the full menu <ArrowRight size={14} /></button></div>
        <p className="draft-label"><span /> 59 menu items · prices in INR</p>
        <div className="product-grid featured-grid">{["italian-pasta-salad", "high-protein-burger", "chocolate-mousse"].map((id, index) => { const product = menuItems.find((item) => item.id === id)!; return <ProductCard key={product.id} product={product} cart={cart} index={index} onSelect={onSelect} onAdd={onAdd} />; })}</div>
      </section>
      <section className="story-section">
        <div className="story-image reveal"><img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1100&q=82" alt="Sunlit kitchen where the day's bakes begin" /></div>
        <div className="story-copy reveal"><Eyebrow>From Pallavi's kitchen</Eyebrow><h2>Good food.<br /><em>Good feeling.</em></h2><p>Freshly made, 100% eggless, and preservative-free. Bright flavours and thoughtful ingredients in every bite.</p><button className="button button-dark" onClick={() => onNavigate("menu")}>Explore the full menu <ArrowRight size={15} /></button></div>
      </section>
      <section className="visit-section reveal"><div><Eyebrow>Find us on Swiggy &amp; Zomato</Eyebrow><h2>A little goodness<br />in every <em>bite.</em></h2></div><div className="visit-details"><p>Order through your favourite food delivery app.</p><p><strong>Fresh bowls &amp; comfort plates</strong><br />Prices in INR · menu prepared fresh</p><button className="button button-dark" onClick={() => onNavigate("visit")}>Visit Savorê <ArrowUpRight size={15} /></button></div></section>
    </>
  );
}

function ProductCard({ product, cart, index, onSelect, onAdd }: { product: Product; cart: Record<string, number>; index: number; onSelect: (product: Product) => void; onAdd: (id: string, delta: number, option?: string) => void }) {
  const quantity = Object.entries(cart).reduce((total, [key, count]) => total + (key === product.id || key.startsWith(`${product.id}::`) ? count : 0), 0);
  return <article className="product reveal" style={{ "--stagger": `${Math.min(index, 5) * 55}ms` } as React.CSSProperties}><button className="menu-item-main" onClick={() => onSelect(product)} aria-label={`View ${product.name}`}><span className="menu-item-category">{product.category}</span><span className="product-name">{product.name}</span>{product.note && <span className="menu-item-note">{product.note}</span>}</button><div className="product-info"><span className="menu-item-fresh">Freshly made · eggless</span><span className="price">{money(product.price)}</span></div><div className="menu-add-row"><span className="menu-add-label">{product.options ? "Choose patty" : "Add to bag"}</span><div className="menu-quantity"><button className="quantity-step" type="button" onClick={() => onAdd(product.id, -1)} disabled={quantity === 0} aria-label={`Remove one ${product.name}`}><Minus size={13} /></button><span className={`quantity-value ${quantity > 0 ? "has-quantity" : ""}`} aria-label={`${quantity} ${quantity === 1 ? "item" : "items"} selected`}>{quantity}</span><button className="quantity-step quantity-add" type="button" onClick={() => product.options ? onSelect(product) : onAdd(product.id, 1)} aria-label={product.options ? `Choose options for ${product.name}` : `Add one ${product.name}`}><Plus size={16} /></button></div></div></article>;
}

function MenuPage({ cart, category, setCategory, query, setQuery, items, onSelect, onAdd }: { cart: Record<string, number>; category: string; setCategory: (category: string) => void; query: string; setQuery: (query: string) => void; items: Product[]; onSelect: (product: Product) => void; onAdd: (id: string, delta: number, option?: string) => void }) {
  return <section className="catalog-page"><div className="catalog-intro reveal"><Eyebrow>Freshly made · 100% eggless · preservative-free</Eyebrow><h1>Good food, <em>no fuss.</em></h1><p className="catalog-description">Explore all 59 dishes across salads, comfort plates, South Indian favourites, drinks, and more.</p><a className="text-link menu-pdf-link" href="/savore-menu.pdf" target="_blank" rel="noreferrer">View the four-page menu <ArrowUpRight size={14} /></a></div><div className="catalog-controls"><div className="category-row" role="tablist" aria-label="Filter menu categories">{categories.map((item) => <button key={item} className={`category ${category === item ? "active" : ""}`} role="tab" aria-selected={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-field"><Search size={16} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 59 dishes" aria-label="Search menu" /></label></div><p className="result-count">{items.length} {items.length === 1 ? "dish" : "dishes"}{category !== "All items" ? ` · ${category}` : " · across the full menu"}</p><div className="product-grid catalog-grid">{items.map((product, index) => <ProductCard key={product.id} product={product} cart={cart} index={index} onSelect={onSelect} onAdd={onAdd} />)}{items.length === 0 && <p className="empty-state">No dishes match that search. Try another name or category.</p>}</div></section>;
}

function StoryPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <section className="editorial-page story-page">
      <div className="editorial-heading reveal">
        <Eyebrow>Savorê by Pallavi</Eyebrow>
        <h1>Good food.<br /><em>Good feeling.</em></h1>
        <p>Freshly made, 100% eggless, and preservative-free. Bright flavours and thoughtful ingredients in every bite.</p>
      </div>
      <img className="editorial-image reveal" src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1500&q=85" alt="A freshly prepared meal in a bright kitchen" />
      <div className="editorial-body reveal">
        <p>Savorê by Pallavi brings together fresh bowls, comfort plates, familiar favourites, and protein-powered goodness. The supplied menu spans salads, smoothie bowls, thali, Chinese favourites, pasta, snacks, beverages, South Indian dishes, quick bites, and desserts.</p>
        <p>All menu items are described as freshly made, 100% eggless, and preservative-free.</p>
        <button className="button button-dark" onClick={() => onNavigate("menu")}>Explore the full menu <ArrowRight size={15} /></button>
      </div>
    </section>
  );
}

function VisitPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <section className="visit-page">
      <div className="visit-hero reveal">
        <div>
          <Eyebrow>Find Savorê</Eyebrow>
          <h1>Fresh food,<br /><em>made for you.</em></h1>
          <p>The supplied menu lists Savorê on Swiggy and Zomato. Restaurant listing links, location, hours, and contact details are not included yet.</p>
          <button className="button button-dark" onClick={() => onNavigate("menu")}>Browse the menu <ArrowRight size={15} /></button>
        </div>
        <div className="visit-photo"><img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=82" alt="Colourful fresh salad bowl with greens and vegetables" /></div>
      </div>
      <div className="visit-info-grid reveal">
        <div><Leaf size={18} /><h2>Freshly made</h2><p>The menu describes its food as freshly prepared.</p></div>
        <div><Cookie size={18} /><h2>100% eggless</h2><p>Preservative-free, as stated on the supplied menu.</p></div>
        <button className="visit-cta" onClick={() => onNavigate("menu")}>See all 59 dishes <ArrowRight size={15} /></button>
      </div>
    </section>
  );
}

function CheckoutPage({ cartProducts, subtotal, onQuantity, onSubmit, onBack, onBrowse }: { cartProducts: CartLine[]; subtotal: number; onQuantity: (id: string, delta: number) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onBack: () => void; onBrowse: () => void }) {
  return (
    <section className="checkout-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to bag</button>
      <div className="checkout-layout">
        <div className="checkout-main">
          <Eyebrow>Checkout · step 1 of 2</Eyebrow>
          <h1>Let's get the<br /><em>details right.</em></h1>
          <p className="draft-label"><span /> Demo checkout · no real payment or order submission</p>
          {cartProducts.length === 0 ? (
            <div className="empty-checkout"><p>Your bag is waiting for something good.</p><button className="button button-dark" type="button" onClick={onBrowse}>Browse the menu <ArrowRight size={15} /></button></div>
          ) : (
            <form className="checkout-form" onSubmit={onSubmit}>
              <fieldset>
                <legend>Who should we prepare this for?</legend>
                <label>Your name<input name="name" autoComplete="name" required placeholder="Name" /></label>
                <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
                <label>Mobile number for SMS<input name="phone" type="tel" autoComplete="tel" required /></label>
              </fieldset>
              <fieldset>
                <legend>Pickup preference</legend>
                <label>Preferred date<input name="date" type="date" required /></label>
                <label>Anything we should know? <span className="optional">optional</span><textarea name="notes" rows={3} placeholder="A note for the restaurant" /></label>
              </fieldset>
              <button className="button button-dark submit-button" type="submit">Continue to payment <ArrowRight size={15} /></button>
              <p className="checkout-disclaimer">Your contact details stay in this browser session for this demo. No order is sent to the restaurant. SMS and email will only be previewed, not sent.</p>
            </form>
          )}
        </div>
        <aside className="order-summary">
          <h2>Your bag</h2>
          {cartProducts.map((product) => (
            <div className="summary-line" key={product.cartKey}>
              <div><strong>{product.name}</strong>{product.selectedOption && <span>{product.selectedOption}</span>}<span>{money(product.price)} each</span><div className="quantity-control"><button type="button" onClick={() => onQuantity(product.cartKey, -1)} aria-label={`Remove one ${product.name}`}><Minus size={13} /></button><span>{product.quantity}</span><button type="button" onClick={() => onQuantity(product.cartKey, 1)} aria-label={`Add one ${product.name}`}><Plus size={13} /></button></div></div>
              <span className="summary-price">{money(product.price * product.quantity)}</span>
            </div>
          ))}
          <div className="summary-total"><span>Item subtotal</span><strong>{money(subtotal)}</strong></div>
          <p>Prices in INR. Delivery charges, if applicable, are set by the ordering platform.</p>
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

function PaymentPage({ customer, cartProducts, subtotal, onBack, onPay }: { customer: CustomerDetails; cartProducts: CartLine[]; subtotal: number; onBack: () => void; onPay: (method: PaymentMethod) => void }) {
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const SelectedIcon = paymentMethods.find((item) => item.id === method)?.icon || Smartphone;

  async function handlePayment(event: React.FormEvent<HTMLFormElement>) {
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
    <section className="payment-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to details</button>
      <div className="payment-heading"><Eyebrow>Checkout · step 2 of 2</Eyebrow><h1>Choose how<br />to <em>pay.</em></h1><p>Payment gateway preview</p></div>
      <div className="demo-payment-banner"><ShieldCheck size={18} /><div><strong>Simulation only</strong><p>Do not enter real card, bank, wallet, or UPI credentials. Nothing is transmitted, charged, or stored.</p></div></div>
      <div className="payment-layout">
        <form className="payment-methods" onSubmit={handlePayment}>
          <fieldset>
            <legend>Payment method</legend>
            <div className="payment-method-list">
              {paymentMethods.map(({ id, label, detail, icon: Icon }) => (
                <label className={`payment-method ${method === id ? "selected" : ""}`} key={id}>
                  <input type="radio" name="payment-method" value={id} checked={method === id} onChange={() => setMethod(id)} />
                  <span className="payment-method-icon"><Icon size={18} /></span>
                  <span className="payment-method-copy"><strong>{label}</strong><small>{detail}</small></span>
                  <span className="payment-radio" />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="payment-detail-panel">
            <div className="payment-detail-heading"><SelectedIcon size={17} /><strong>{paymentMethods.find((item) => item.id === method)?.label} details</strong><span>DEMO</span></div>
            {method === "upi" && <div className="upi-setup-notice"><div className="upi-qr-placeholder"><QrCode size={28} /></div><div><strong>UPI QR not configured</strong><p>A scannable, amount-specific QR needs the restaurant's merchant UPI ID and display name. This demo cannot verify payments.</p></div></div>}
            {method === "card" && <div className="card-fields"><label>Name on card<input name="card-name" autoComplete="off" required placeholder="Demo cardholder" /></label><label>Card number<input name="card-number" inputMode="numeric" autoComplete="off" required minLength={12} maxLength={19} placeholder="4242 4242 4242 4242" /></label><div className="card-field-row"><label>Expiry<input name="card-expiry" autoComplete="off" required placeholder="MM / YY" /></label><label>CVV<input name="card-cvv" inputMode="numeric" autoComplete="off" required minLength={3} maxLength={4} placeholder="123" /></label></div></div>}
            {method === "netbanking" && <label>Select a demo bank<select name="bank" required defaultValue=""><option value="" disabled>Choose a bank</option><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option><option>Kotak Mahindra Bank</option></select></label>}
            {method === "wallet" && <label>Select a demo wallet<select name="wallet" required defaultValue=""><option value="" disabled>Choose a wallet</option><option>Paytm (demo)</option><option>PhonePe (demo)</option><option>Amazon Pay (demo)</option><option>Other wallet (demo)</option></select></label>}
          </div>
          <button className="button button-dark payment-submit" type="submit" disabled={processing}>{processing ? "Sending test confirmations…" : `Pay ${money(subtotal)} (demo)`} <ArrowRight size={15} /></button>
          <p className="payment-privacy"><ShieldCheck size={14} /> Demo fields are discarded when you leave this step.</p>
        </form>
        <aside className="payment-summary"><div className="payment-summary-heading"><span>Order summary</span><span>{cartProducts.reduce((sum, item) => sum + item.quantity, 0)} items</span></div>{cartProducts.map((item) => <div className="payment-summary-line" key={item.cartKey}><div><strong>{item.quantity} × {item.name}</strong>{item.selectedOption && <small>{item.selectedOption}</small>}</div><span>{money(item.price * item.quantity)}</span></div>)}<div className="summary-total"><span>Item subtotal</span><strong>{money(subtotal)}</strong></div><p className="payment-customer"><strong>Pickup for</strong><br />{customer.name}<br />{customer.date}</p><p className="payment-summary-foot">No taxes or delivery fees have been added.</p></aside>
      </div>
    </section>
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character] || character);
}

function invoiceHtml(order: CompletedOrder) {
  const rows = order.items.map((item) => `<tr><td>${escapeHtml(item.name)}${item.selectedOption ? `<small>${escapeHtml(item.selectedOption)}</small>` : ""}</td><td>${item.quantity}</td><td>${money(item.price)}</td><td>${money(item.price * item.quantity)}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Invoice ${escapeHtml(order.id)} · Savorê by Pallavi</title><style>body{max-width:760px;margin:48px auto;padding:0 24px;color:#28271f;font:14px/1.6 Arial,sans-serif}header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #526c59;padding-bottom:20px}h1{font:32px Georgia,serif}h2{margin-top:32px;font:20px Georgia,serif}small{display:block;color:#777;font-size:11px}table{width:100%;border-collapse:collapse;margin-top:26px}th,td{padding:12px 8px;border-bottom:1px solid #ddd;text-align:left}th:last-child,td:last-child{text-align:right}.total{margin:22px 0 0 auto;width:260px;display:flex;justify-content:space-between;font-weight:bold}.demo{margin-top:32px;padding:12px;background:#f6f0e5;color:#655e50;font-size:12px}@media print{body{margin:0 auto}}</style><body><header><div><h1>Savorê by Pallavi</h1><div>Freshly made · 100% eggless · preservative-free</div></div><div><strong>DEMO INVOICE</strong><br>Order ${escapeHtml(order.id)}<br>${new Date(order.createdAt).toLocaleString("en-IN")}</div></header><h2>Customer</h2><div>${escapeHtml(order.customer.name)}<br>${escapeHtml(order.customer.email)}<br>${escapeHtml(order.customer.phone)}<br>Pickup date: ${escapeHtml(order.customer.date)}</div><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="total"><span>Item subtotal</span><span>${money(order.subtotal)}</span></div><p>Payment method: ${escapeHtml(order.method.toUpperCase())} (demo)</p><div class="demo">SIMULATION ONLY · No payment was collected and this invoice is not a tax invoice or proof of a real order.</div></body></html>`;
}

function downloadInvoice(order: CompletedOrder) {
  const blob = new Blob([invoiceHtml(order)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `savorê-invoice-${order.id}.html`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function printInvoice(order: CompletedOrder) {
  const blob = new Blob([invoiceHtml(order).replace("</body>", "<script>window.addEventListener('load',()=>window.print())<\/script></body>")], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function notificationLabel(result: NotificationResult) {
  if (result.status === "sent") return "Accepted by provider · test";
  if (result.status === "failed") return "Send failed";
  return "Setup required · not sent";
}

function notificationMessage(result: NotificationResult, channel: "email" | "sms") {
  if (result.status === "sent") {
    return channel === "email"
      ? "The test email and demo invoice content were accepted by EmailJS. This is TEST / UNPAID; payment was not verified."
      : `The test SMS was accepted by Twilio${result.providerState ? ` (${result.providerState})` : ""}. This is TEST / UNPAID; payment was not verified.`;
  }
  return result.detail || (result.status === "failed" ? "The provider did not accept this test message." : "This provider is not configured yet.");
}

function SuccessPage({ order, onNavigate }: { order: CompletedOrder; onNavigate: (page: Page) => void }) {
  const paymentLabel = order.method.toUpperCase();
  return (
    <section className="success-page order-success">
      <div className="success-stamp"><Check size={32} /></div>
      <Eyebrow>Demo order complete</Eyebrow>
      <h1>Thanks, {order.customer.name}.</h1>
      <p>Your demo checkout is complete. No payment was collected and the restaurant has not received this order.</p>
      <div className="confirmation-card"><div className="confirmation-id"><span>Demo order number</span><strong>{order.id}</strong></div><div className="confirmation-row"><span>Amount</span><strong>{money(order.subtotal)}</strong></div><div className="confirmation-row"><span>Method</span><strong>{paymentLabel} · demo</strong></div><div className="confirmation-row"><span>Pickup date</span><strong>{order.customer.date}</strong></div></div>
      <div className="invoice-actions"><button className="button button-dark" onClick={() => downloadInvoice(order)}>Download invoice <ArrowDown size={15} /></button><button className="button button-outline" onClick={() => printInvoice(order)}>Print / Save PDF</button></div>
      <div className="notification-previews"><h2>Test notification delivery</h2><article><Smartphone size={16} /><div><strong>SMS · {notificationLabel(order.notifications.sms)}</strong><p>To: {order.customer.phone}</p><p>{notificationMessage(order.notifications.sms, "sms")}</p></div></article><article><span className="email-glyph">@</span><div><strong>Email · {notificationLabel(order.notifications.email)}</strong><p>To: {order.customer.email}</p><p>Subject: [TEST · UNPAID] Savorê order {order.id}</p><p>{notificationMessage(order.notifications.email, "email")}</p></div></article></div>
      <button className="text-link success-home-link" onClick={() => onNavigate("menu")}>Back to the menu <ArrowRight size={14} /></button>
    </section>
  );
}

function ProductDialog({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (id: string, delta: number, option?: string) => void }) {
  const [selectedOption, setSelectedOption] = useState("");
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(event) => event.stopPropagation()}><button className="icon-button dialog-close" onClick={onClose} aria-label="Close product details"><X /></button><div className="product-dialog-art"><img src="/savor-logo.png" alt="" /><span>{product.category}</span></div><div className="dialog-copy"><p className="product-tag">{product.category}</p><h2 id="dialog-title">{product.name}</h2><p>{product.note || "Freshly made, 100% eggless, and preservative-free."}</p>{product.options && <label className="option-select">Choose a patty<select value={selectedOption} onChange={(event) => setSelectedOption(event.target.value)}><option value="">Select one option</option>{product.options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>}<p className="dialog-description">Prepared fresh · Prices in INR</p><div className="dialog-buy"><strong>{money(product.price)}</strong><button className="button button-dark" disabled={Boolean(product.options) && !selectedOption} onClick={() => { onAdd(product.id, 1, selectedOption || undefined); onClose(); }}>Add to bag <Plus size={15} /></button></div><span className="sample-note">Listed menu price · ordering is a preview</span></div></section></div>;
}

function CartDrawer({ products: cartProducts, subtotal, onClose, onQuantity, onCheckout, onBrowse }: { products: CartLine[]; subtotal: number; onClose: () => void; onQuantity: (id: string, delta: number) => void; onCheckout: () => void; onBrowse: () => void }) {
  return <div className="modal-backdrop drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"><div className="drawer-heading"><div><Eyebrow>Your menu picks</Eyebrow><h2 id="cart-title">The bag</h2></div><button className="icon-button" onClick={onClose} aria-label="Close shopping bag"><X /></button></div>{cartProducts.length === 0 ? <div className="empty-cart"><ShoppingBag size={28} /><p>Your bag is waiting for something good.</p><button className="text-link" onClick={onBrowse}>Explore the menu <ArrowRight size={14} /></button></div> : <><div className="cart-lines">{cartProducts.map((product) => <div className="cart-line" key={product.cartKey}><div className="cart-line-copy"><span>{product.category}</span><strong>{product.name}</strong>{product.selectedOption && <span>{product.selectedOption}</span>}<span>{money(product.price)} each</span><div className="quantity-control"><button onClick={() => onQuantity(product.cartKey, -1)} aria-label={`Remove one ${product.name}`}><Minus size={13} /></button><span>{product.quantity}</span><button onClick={() => onQuantity(product.cartKey, 1)} aria-label={`Add one ${product.name}`}><Plus size={13} /></button></div></div><strong className="line-total">{money(product.price * product.quantity)}</strong></div>)}</div><div className="drawer-bottom"><div className="summary-total"><span>Item subtotal</span><strong>{money(subtotal)}</strong></div><p>Prices in INR. Delivery charges, if applicable, are set by the ordering platform.</p><button className="button button-dark drawer-checkout" onClick={onCheckout}>Continue to details <ArrowRight size={15} /></button></div></>}</aside></div>;
}

function IntroOverlay({ onDismiss }: { onDismiss: () => void }) {
  return <div className="intro-overlay" role="dialog" aria-modal="true" aria-label="Welcome to Savorê by Pallavi"><div className="intro-grain" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} style={{ "--x": `${(index * 37) % 100}%`, "--y": `${(index * 61) % 100}%`, "--delay": `${(index % 9) * 80}ms` } as React.CSSProperties} />)}</div><div className="intro-content"><span className="intro-sun">✳</span><p className="intro-kicker">A little goodness is being prepared</p><h2>Welcome to<br /><em>Savorê.</em></h2><button className="intro-enter" onClick={onDismiss}>Come on in <ArrowRight size={16} /></button></div><button className="intro-skip" onClick={onDismiss}>Skip intro <ArrowUpRight size={13} /></button></div>;
}

function CookieNotice({ onAccept, onReject, onManage }: { onAccept: () => void; onReject: () => void; onManage: () => void }) {
  return <aside className="cookie-notice" aria-label="Cookie preferences"><div className="cookie-icon"><Cookie size={17} /></div><div className="cookie-copy"><strong>A little choice, before the crumbs.</strong><p>Essential storage keeps your bag and preferences working. This preview does not load analytics or advertising trackers.</p><button className="cookie-manage" onClick={onManage}>Manage choices</button></div><div className="cookie-actions"><button onClick={onReject}>Essential only</button><button className="cookie-accept" onClick={onAccept}>Save preference</button></div></aside>;
}

function CookieSettings({ allowed, onChange, onSave, onReject, onClose }: { allowed: boolean; onChange: (value: boolean) => void; onSave: () => void; onReject: () => void; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><section className="cookie-settings" role="dialog" aria-modal="true" aria-labelledby="privacy-title" onClick={(event) => event.stopPropagation()}><button className="icon-button dialog-close" onClick={onClose} aria-label="Close privacy settings"><X /></button><Cookie size={20} /><Eyebrow>Your privacy, your call</Eyebrow><h2 id="privacy-title">Cookie choices</h2><p>Essential storage supports the bag and privacy setting. Optional analytics are not active in this preview; no analytics or advertising trackers are loaded.</p><div className="consent-row"><div><strong>Essential</strong><span>Always on · bag and preferences</span></div><span className="always-on">On</span></div><label className="consent-row"><div><strong>Analytics</strong><span>Preference only · no tracker is active</span></div><input type="checkbox" checked={allowed} onChange={(event) => onChange(event.target.checked)} /></label><div className="consent-actions"><button onClick={onReject}>Reject optional</button><button className="button button-dark" onClick={onSave}>Save choices <Check size={14} /></button></div></section></div>;
}

export default App;