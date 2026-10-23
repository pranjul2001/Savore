# Savorê by Pallavi workspace notes

- Project: client-facing bakery storefront foundation.
- Stack: React, TypeScript, Vite, and lucide-react. Use `npm run dev` and `npm run build`.
- Keep the visual style editorial, warm, and handcrafted; preserve responsive layouts, keyboard access, and reduced-motion support.
- Use the transparent extracted Savorê wordmark so it blends into the page background; menu quantity steppers reflect the persistent bag state.
- Menu and INR prices are transcribed from the supplied PDF; client must confirm current availability and final details.
- Product photography, pickup hours, address, contact details, and delivery-platform links must be confirmed by the client before launch.
- Payment is a UI-only simulation. Mark all test messages TEST / UNPAID; do not imply payment was collected or the restaurant received a production order.
- Keep notification endpoints same-origin, rate-limited, and restricted to test recipients configured in local environment variables.
- Confirmation status must reflect provider responses. Never claim a message was accepted or delivered if configuration is missing or a provider failed.
- Never put EmailJS identifiers, Twilio credentials, or payment secrets in client code or ask the user to share them in chat; configure provider settings server-side through environment variables.
- Optional analytics are not integrated. Do not add trackers without consent flow and client approval.
