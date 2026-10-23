# Savorê by Pallavi

A responsive bakery storefront foundation built with React, TypeScript, and Vite.

## Run locally

```sh
npm install
npm run dev
```

Create a production bundle with `npm run build`; inspect it locally with `npm run preview`.

## Current scope

- Home, menu browsing, product details, story, visit, bag, demo payment, and order confirmation
- Search and category filtering; bag state persists in local storage
- Intro animation, scroll reveals, reduced-motion support, and cookie preference controls
- Simulated UPI, card, net banking, and wallet choices
- Demo invoice download and print-to-PDF action, with SMS/email confirmation previews
- Supplied brand logo and four-page menu PDF are in `public/`
- Hero and story photography remains a visual placeholder pending approved product photography

The catalog and INR prices are transcribed from the supplied menu PDF. Payment is simulated only: no payment credentials are transmitted or stored, no charge is made, and no order is sent to the restaurant. A real amount-specific UPI QR needs the merchant UPI ID (VPA) and display name. Direct UPI QR payments cannot be verified by this site; verified paid confirmations need a gateway and server-side payment webhook.

## Test notifications

The Express server provides a same-origin, rate-limited test notification endpoint. It only sends to the email and phone allowlisted in the local `.env`, and every outgoing message is marked **TEST · UNPAID**. Checkout still uses simulated payment; test messages are not proof of payment or a real restaurant order.

1. Copy `.env.example` to `.env` if the local file is missing.
2. In EmailJS, connect an email service and create an order-confirmation template. Add its Service ID, Template ID, and Public Key to `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, and `EMAILJS_PUBLIC_KEY` in `.env`.
3. This account has EmailJS strict mode enabled. Create/copy its Private Key from EmailJS account/security settings into `EMAILJS_PRIVATE_KEY` in `.env`. This is server-only; never put it in browser code or share it in chat.
4. Configure the EmailJS template with `to_email`, `to_name`, `order_id`, `pickup_date`, `order_items`, `total`, `payment_method`, `test_label`, `invoice_html`, and `message`. Use `{{to_email}}` as recipient and `[{{test_label}}] Savorê order {{order_id}}` as subject.
5. For SMS, configure a Twilio Account SID, Auth Token, and approved sender number or Messaging Service in `.env`. The sender must be enabled for the destination country; India may require DLT registration and approved templates.
6. Keep `ENABLE_TEST_NOTIFICATIONS=true` only for private testing. The endpoint is rate-limited and rejects recipients that do not match `TEST_NOTIFICATION_EMAIL` and `TEST_NOTIFICATION_PHONE`.
7. Restart the app with `npm run dev`. Confirmation shows whether each provider accepted its message. Missing credentials or delivery failures are reported accurately.

The downloaded invoice is a demo HTML invoice; print/save PDF is available from the confirmation screen. EmailJS receives the invoice HTML content in the email template; it is not sent as a file attachment. For production, connect a payment gateway and verify payment server-side before creating a real order or sending non-test messages. Confirm business details, product availability, UPI merchant details, and delivery-platform links before launch.

Before production, connect an approved payment gateway, secure order backend, SMS provider, and email provider; confirm business details, product availability, and delivery-platform links.