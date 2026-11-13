import type { CompletedOrder, NotificationResult } from "../types";
import { money } from "./utils";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character] || character);
}

function invoiceHtml(order: CompletedOrder) {
  const rows = order.items.map((item) => `<tr><td>${escapeHtml(item.name)}${item.selectedOption ? `<small>${escapeHtml(item.selectedOption)}</small>` : ""}</td><td>${item.quantity}</td><td>${money(item.price)}</td><td>${money(item.price * item.quantity)}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Invoice ${escapeHtml(order.id)} · Savorê by Pallavi</title><style>body{max-width:760px;margin:48px auto;padding:0 24px;color:#2b1b12;font:14px/1.6 Arial,sans-serif}header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #7a4a22;padding-bottom:20px}h1{font:32px Georgia,serif;color:#7a4a22}h2{margin-top:32px;font:20px Georgia,serif}small{display:block;color:#6b5646;font-size:11px}table{width:100%;border-collapse:collapse;margin-top:26px}th,td{padding:12px 8px;border-bottom:1px solid #ddd;text-align:left}th:last-child,td:last-child{text-align:right}.total{margin:22px 0 0 auto;width:260px;display:flex;justify-content:space-between;font-weight:bold}.demo{margin-top:32px;padding:12px;background:#f2e4cc;color:#6b5646;font-size:12px}@media print{body{margin:0 auto}}</style><body><header><div><h1>Savorê by Pallavi</h1><div>Freshly made · 100% eggless · preservative-free</div></div><div><strong>DEMO INVOICE</strong><br>Order ${escapeHtml(order.id)}<br>${new Date(order.createdAt).toLocaleString("en-IN")}</div></header><h2>Customer</h2><div>${escapeHtml(order.customer.name)}<br>${escapeHtml(order.customer.email)}<br>${escapeHtml(order.customer.phone)}<br>Pickup date: ${escapeHtml(order.customer.date)}</div><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="total"><span>Item subtotal</span><span>${money(order.subtotal)}</span></div><p>Payment method: ${escapeHtml(order.method.toUpperCase())} (demo)</p><div class="demo">SIMULATION ONLY · No payment was collected and this invoice is not a tax invoice or proof of a real order.</div></body></html>`;
}

export function downloadInvoice(order: CompletedOrder) {
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

export function printInvoice(order: CompletedOrder) {
  const blob = new Blob([invoiceHtml(order).replace("</body>", "<script>window.addEventListener('load',()=>window.print())<\/script></body>")], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function notificationLabel(result: NotificationResult) {
  if (result.status === "sent") return "Accepted by provider · test";
  if (result.status === "failed") return "Send failed";
  return "Setup required · not sent";
}

export function notificationMessage(result: NotificationResult, channel: "email" | "sms") {
  if (result.status === "sent") {
    return channel === "email"
      ? "The test email and demo invoice content were accepted by EmailJS. This is TEST / UNPAID; payment was not verified."
      : `The test SMS was accepted by Twilio${result.providerState ? ` (${result.providerState})` : ""}. This is TEST / UNPAID; payment was not verified.`;
  }
  return result.detail || (result.status === "failed" ? "The provider did not accept this test message." : "This provider is not configured yet.");
}
