import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { menuItems } from "./menu";
import type { Cart, CompletedOrder, CustomerDetails, Navigate, Page, PaymentMethod, Product } from "./types";
import { readConsent, readStored, writeStored } from "./lib/utils";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer, CookieNotice, CookieSettings, IntroOverlay, ProductDialog } from "./components/Overlays";
import { ease } from "./components/motion";
import { Home } from "./pages/Home";
import { ALL_ITEMS, MenuPage } from "./pages/MenuPage";
import { StoryPage, VisitPage } from "./pages/StoryVisit";
import { CheckoutPage, PaymentPage, SuccessPage } from "./pages/Checkout";

function App() {
  const [page, setPage] = useState<Page>("home");
  const [category, setCategory] = useState(ALL_ITEMS);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Cart>(() => {
    const stored = readStored<Cart>("savor.cart", {});
    return Object.fromEntries(Object.entries(stored).filter(([key, quantity]) => menuItems.some((item) => item.id === key.split("::")[0]) && Number.isSafeInteger(quantity) && quantity > 0));
  });
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
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
  const mainRef = useRef<HTMLElement>(null);

  const itemCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  const cartProducts = Object.entries(cart).flatMap(([cartKey, quantity]) => {
    const [productId, selectedOption] = cartKey.split("::");
    const product = menuItems.find((item) => item.id === productId);
    return product ? [{ ...product, cartKey, quantity, selectedOption }] : [];
  });
  const subtotal = cartProducts.reduce((total, line) => total + line.price * line.quantity, 0);
  const visibleProducts = menuItems.filter((product) => {
    const matchesCategory = category === ALL_ITEMS || product.category === category;
    const matchesQuery = `${product.name} ${product.category} ${product.note || ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  useEffect(() => {
    writeStored("savor.cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", Boolean(selected || cartOpen || showCookieSettings || showIntro));
    return () => document.body.classList.remove("no-scroll");
  }, [selected, cartOpen, showCookieSettings, showIntro]);

  const dismissIntro = useCallback(() => {
    try { sessionStorage.setItem("savor.introSeen", "1"); } catch { /* Storage can be disabled. */ }
    setShowIntro(false);
  }, []);

  const navigate: Navigate = (nextPage, options) => {
    if (options?.category) {
      setCategory(options.category);
      setQuery("");
    }
    setSelected(null);
    setCartOpen(false);
    if (nextPage === page) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      return;
    }
    setPage(nextPage);
  };

  /** Runs after the outgoing page has animated away: reset scroll and move focus to the new content. */
  function onPageChanged() {
    window.scrollTo({ top: 0, behavior: "instant" });
    mainRef.current?.focus({ preventScroll: true });
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

  function submitOrder(event: FormEvent<HTMLFormElement>) {
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
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header page={page} itemCount={itemCount} onNavigate={navigate} onOpenBag={() => setCartOpen(true)} />

      <AnimatePresence mode="wait" initial={false} onExitComplete={onPageChanged}>
        <motion.main
          id="main"
          ref={mainRef}
          tabIndex={-1}
          key={page}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease }}
        >
          {page === "home" && <Home cart={cart} onNavigate={navigate} onSelect={setSelected} onAdd={updateCart} />}
          {page === "menu" && <MenuPage cart={cart} category={category} setCategory={setCategory} query={query} setQuery={setQuery} items={visibleProducts} onSelect={setSelected} onAdd={updateCart} />}
          {page === "story" && <StoryPage onNavigate={navigate} />}
          {page === "visit" && <VisitPage onNavigate={navigate} />}
          {page === "checkout" && <CheckoutPage cartProducts={cartProducts} subtotal={subtotal} onQuantity={updateCart} onSubmit={submitOrder} onBack={() => setCartOpen(true)} onBrowse={() => navigate("menu")} />}
          {page === "payment" && customerDetails && <PaymentPage customer={customerDetails} cartProducts={cartProducts} subtotal={subtotal} onBack={() => navigate("checkout")} onPay={completeMockPayment} />}
          {page === "success" && completedOrder && <SuccessPage order={completedOrder} onNavigate={navigate} />}
        </motion.main>
      </AnimatePresence>

      <Footer onNavigate={navigate} onPrivacy={() => setShowCookieSettings(true)} />

      <AnimatePresence>{selected && <ProductDialog key={selected.id} product={selected} onClose={() => setSelected(null)} onAdd={updateCart} />}</AnimatePresence>
      <AnimatePresence>{cartOpen && <CartDrawer products={cartProducts} subtotal={subtotal} onClose={() => setCartOpen(false)} onQuantity={updateCart} onCheckout={() => navigate("checkout")} onBrowse={() => navigate("menu")} />}</AnimatePresence>
      <AnimatePresence>{!consent && !showIntro && <CookieNotice onAccept={() => saveConsent("all", true)} onReject={() => saveConsent("essential")} onManage={() => setShowCookieSettings(true)} />}</AnimatePresence>
      <AnimatePresence>{showCookieSettings && <CookieSettings allowed={analyticsAllowed} onChange={setAnalyticsAllowed} onSave={() => saveConsent(analyticsAllowed ? "all" : "essential", analyticsAllowed)} onReject={() => saveConsent("essential", false)} onClose={() => setShowCookieSettings(false)} />}</AnimatePresence>
      <AnimatePresence>{showIntro && <IntroOverlay onDismiss={dismissIntro} />}</AnimatePresence>
    </MotionConfig>
  );
}

export default App;
