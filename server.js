import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import express from "express";
import twilio from "twilio";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "0.0.0.0";
const limiter = new Map();
const outcomes = new Map();
const windowMs = 15 * 60 * 1000;
const maxRequests = 5;

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  })[character]);
}

function validateOrder(order) {
  if (!order || typeof order !== "object") return "Order data is required.";
  if (!/^SVR-\d{8}-[A-Z0-9]{5}$/.test(order.id || "")) return "Invalid test order ID.";
  const customer = order.customer;
  if (!customer || typeof customer.name !== "string" || !customer.name.trim() || customer.name.length > 100) return "Customer name is required.";
  if (typeof customer.email !== "string" || customer.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return "A valid customer email is required.";
  if (typeof customer.phone !== "string" || !/^\+[1-9]\d{7,14}$/.test(customer.phone)) return "Phone number must use international format, for example +919876543210.";
  if (typeof customer.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(customer.date)) return "Pickup date is required.";
  if (!Array.isArray(order.items) || order.items.length < 1 || order.items.length > 60) return "Order items are invalid.";
  let calculatedAmount = 0;
  for (const item of order.items) {
    if (!item || typeof item.name !== "string" || item.name.length > 120 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50 || !Number.isInteger(item.price) || item.price < 1) return "An order line is invalid.";
    calculatedAmount += item.price * item.quantity;
  }
  if (calculatedAmount !== order.amount || calculatedAmount > 1000000) return "Order total does not match the line items.";
  if (!new Set(["upi", "card", "netbanking", "wallet"]).has(order.method)) return "Payment method is invalid.";
  return null;
}

function sameOrigin(req, res, next) {
  const origin = req.get("origin");
  if (!origin) return res.status(403).json({ error: "Same-origin browser request required." });
  try {
    if (new URL(origin).host !== req.get("host")) return res.status(403).json({ error: "Cross-origin requests are not allowed." });
  } catch {
    return res.status(403).json({ error: "Invalid request origin." });
  }
  next();
}

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const recent = (limiter.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= maxRequests) return res.status(429).json({ error: "Test notification limit reached. Please try again later." });
  recent.push(now);
  limiter.set(key, recent);
  next();
}

function invoiceHtml(order) {
  const rows = order.items.map((item) => `<tr><td>${item.quantity} × ${escapeHtml(item.name)}${item.selectedOption ? `<br><small>${escapeHtml(item.selectedOption)}</small>` : ""}</td><td>Rs. ${(item.price * item.quantity).toLocaleString("en-IN")}</td></tr>`).join("");
  return `<!doctype html><html><meta charset="utf-8"><title>Demo invoice ${escapeHtml(order.id)}</title><body style="font:14px/1.6 Arial,sans-serif;max-width:680px;margin:32px auto;color:#28271f"><h1>Savorê by Pallavi</h1><p><b>TEST ORDER · UNPAID</b></p><p>Order ${escapeHtml(order.id)}<br>Customer: ${escapeHtml(order.customer.name)}<br>Pickup date: ${escapeHtml(order.customer.date)}</p><table style="width:100%;border-collapse:collapse">${rows}<tr><td style="padding-top:12px"><b>Subtotal</b></td><td style="padding-top:12px"><b>Rs. ${order.amount.toLocaleString("en-IN")}</b></td></tr></table><p>This is a real notification test only. No payment was collected and this is not a confirmed restaurant order or tax invoice.</p></body></html>`;
}

async function sendEmail(order) {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    return { status: "not_configured", detail: "EmailJS service ID, template ID, public key, or strict-mode private key is not configured." };
  }
  const itemsText = order.items.map((item) => `${item.quantity} x ${item.name}${item.selectedOption ? ` (${item.selectedOption})` : ""}: Rs. ${(item.price * item.quantity).toLocaleString("en-IN")}`).join("\n");
  const itemRows = order.items.map((item) => `<tr><td>${item.quantity} × ${escapeHtml(item.name)}${item.selectedOption ? `<br><small>${escapeHtml(item.selectedOption)}</small>` : ""}</td><td>Rs. ${(item.price * item.quantity).toLocaleString("en-IN")}</td></tr>`).join("");
  const invoiceHtml = `<h2>Savorê by Pallavi · TEST INVOICE</h2><p><b>TEST ORDER · UNPAID</b></p><p>Order ${escapeHtml(order.id)}<br>Customer: ${escapeHtml(order.customer.name)}<br>Pickup date: ${escapeHtml(order.customer.date)}</p><table>${itemRows}<tr><td><b>Subtotal</b></td><td><b>Rs. ${order.amount.toLocaleString("en-IN")}</b></td></tr></table><p>No payment was collected. This is not a confirmed restaurant order or tax invoice.</p>`;
  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: {
          to_email: order.customer.email,
          to_name: order.customer.name,
          name: order.customer.name,
          customer_name: order.customer.name,
          from_name: "Savorê by Pallavi",
          time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          email: order.customer.email,
          reply_to: order.customer.email,
          order_id: order.id,
          pickup_date: order.customer.date,
          order_items: itemsText,
          total: `Rs. ${order.amount.toLocaleString("en-IN")}`,
          payment_method: `${order.method.toUpperCase()} (simulated)`,
          test_label: "TEST ORDER · UNPAID",
          invoice_html: invoiceHtml,
          message: `TEST ORDER · UNPAID. No payment was collected; the restaurant has not received an order.\n\n${itemsText}\n\nSubtotal: Rs. ${order.amount.toLocaleString("en-IN")}`,
        },
      }),
    });
    if (!response.ok) {
      const providerMessage = (await response.text()).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").slice(0, 220);
      console.error("EmailJS rejected test email:", response.status, providerMessage);
      return { status: "failed", detail: `EmailJS rejected the test email (HTTP ${response.status})${providerMessage ? `: ${providerMessage}` : ". Check the service and template configuration."}` };
    }
    const providerResult = (await response.text()).trim();
    return { status: "sent", providerId: providerResult || "accepted" };
  } catch (error) {
    console.error("EmailJS request failed:", error instanceof Error ? error.message : "unknown error");
    return { status: "failed", detail: "Could not reach EmailJS. Check network and server configuration." };
  }
}

async function sendSms(order) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, TWILIO_MESSAGING_SERVICE_SID } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || (!TWILIO_FROM && !TWILIO_MESSAGING_SERVICE_SID)) {
    return { status: "not_configured", detail: "Twilio credentials and an approved sender are not configured." };
  }
  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const result = await client.messages.create({
      to: order.customer.phone,
      ...(TWILIO_MESSAGING_SERVICE_SID ? { messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID } : { from: TWILIO_FROM }),
      body: `TEST ORDER · UNPAID: Savorê order ${order.id} for ${order.customer.date}. Total Rs. ${order.amount.toLocaleString("en-IN")}. Payment is simulated; this is not a restaurant order.`,
    });
    return { status: "sent", providerId: result.sid, providerState: result.status };
  } catch (error) {
    console.error("Twilio SMS failed:", error instanceof Error ? error.message : "unknown error");
    return { status: "failed", detail: "Twilio did not accept the SMS. Check sender approval and account configuration." };
  }
}

app.post("/api/test-order-notifications", sameOrigin, rateLimit, async (req, res) => {
  if (process.env.ENABLE_TEST_NOTIFICATIONS !== "true") return res.status(503).json({ error: "Test sends are disabled. Set ENABLE_TEST_NOTIFICATIONS=true in the server .env to enable explicit test messages." });
  const order = req.body?.order;
  const invalid = validateOrder(order);
  if (invalid) return res.status(400).json({ error: invalid });
  const allowedEmail = (process.env.TEST_NOTIFICATION_EMAIL || "").trim().toLowerCase();
  const allowedPhone = (process.env.TEST_NOTIFICATION_PHONE || "").trim();
  if (!allowedEmail || !allowedPhone) return res.status(503).json({ error: "Set a test email and phone allowlist in the server .env before enabling real test sends." });
  if (order.customer.email.trim().toLowerCase() !== allowedEmail || order.customer.phone.trim() !== allowedPhone) {
    return res.status(403).json({ error: "Test notifications are restricted to the configured test email and phone." });
  }
  if (outcomes.has(order.id)) return res.json(outcomes.get(order.id));
  const [email, sms] = await Promise.all([sendEmail(order), sendSms(order)]);
  const result = { orderId: order.id, test: true, unpaid: true, email, sms };
  outcomes.set(order.id, result);
  while (outcomes.size > 100) outcomes.delete(outcomes.keys().next().value);
  return res.json(result);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(rootDir, "dist"), { index: false }));
  app.use((req, res, next) => req.method === "GET" && req.accepts("html") ? res.sendFile(path.join(rootDir, "dist", "index.html")) : next());
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  app.use(vite.middlewares);
  app.use(async (req, res, next) => {
    if (req.method !== "GET" || !req.accepts("html")) return next();
    try {
      const html = await readFile(path.join(rootDir, "index.html"), "utf8");
      res.status(200).set({ "Content-Type": "text/html" }).end(await vite.transformIndexHtml(req.originalUrl, html));
    } catch (error) {
      vite.ssrFixStacktrace(error);
      next(error);
    }
  });
}

app.listen(port, host, () => {
  console.log(`Savorê server listening on http://localhost:${port}`);
  if (process.env.ENABLE_TEST_NOTIFICATIONS === "true") console.warn("TEST notification sending is enabled. Emails and texts will be explicitly marked TEST / UNPAID.");
});
