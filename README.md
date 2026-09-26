# Dodo Checkout - Tiny Embeddable Checkout

A lightweight, embeddable checkout integration demonstrating cross-origin UI isolation, strict postMessage communication, and deterministic payment simulation.

---

## 1. Overview & Architecture

The project consists of three main components structured in an npm workspace monorepo:

```
┌────────────────────────────────────────────────────────┐
│                   Demo Merchant App                    │
│                (http://localhost:5173)                 │
│                                                        │
│  - Storefront product card ("Starter Kit Pro", ₹799)  │
│  - Invokes DodoCheckout.open({ productId, ... })       │
│  - Live Event & Callback Log                           │
└───────────────────────────┬────────────────────────────┘
                            │
              Direct API    │  TypeScript SDK (@dodo/sdk)
              Invocation    │  Zero external dependencies
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Modal Overlay Host                   │
│                                                        │
│  - Mounts accessible <div role="dialog"> overlay       │
│  - Locks background body scroll                        │
│  - Injects isolated <iframe> pointing to Checkout      │
└───────────────────────────┬────────────────────────────┘
                            │
               postMessage  │  - event.origin validation
               Protocol     │  - event.source === contentWindow
                            │  - Recognized types only
                            │  - Zero card/CVV data in payload
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Checkout Web App                      │
│                (http://localhost:5174)                 │
│                                                        │
│  - Isolated browsing context / separate origin         │
│  - Product summary & inclusions                        │
│  - Formatted payment form (Card, Expiry, CVV, Email)   │
│  - Deterministic in-memory payment simulation          │
│  - Intermediate states: Processing, Success, Declined  │
└────────────────────────────────────────────────────────┘
```

### Component Structure
- `apps/demo`: Merchant storefront displaying the product, "Buy with Dodo Checkout" button, and live SDK callback logs.
- `apps/checkout`: Standalone checkout web app running on a distinct port/origin, isolating card inputs from merchant JavaScript.
- `packages/sdk`: Zero-dependency TypeScript SDK (`DodoCheckout`) providing modal mounting, duplicate click protection, strict postMessage verification, and callback lifecycle management.
- `packages/types`: Shared TypeScript interfaces and postMessage protocol types.

---

## 2. Quickstart

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
From the repository root:
```bash
npm install
```

### Running Locally
To run both the Demo Storefront (`http://localhost:5173`) and Checkout App (`http://localhost:5174`) concurrently:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser to interact with the demo.

### Typecheck & Production Build
```bash
# Typecheck all workspaces
npm run typecheck

# Build production bundles
npm run build
```

---

## 3. SDK API & Usage

```typescript
import { DodoCheckout } from '@dodo/sdk';

DodoCheckout.open({
  productId: 'starter-kit-pro',
  onSuccess: ({ sessionId }) => {
    console.log('Payment successful! Session ID:', sessionId);
  },
  onError: ({ code, message }) => {
    console.error(`Payment failed [${code}]:`, message);
  },
  onClose: ({ reason }) => {
    console.log('Checkout dismissed by user. Reason:', reason);
  },
});
```

### SDK Guarantees
- **Duplicate Instance Protection**: Rapid or repeated calls to `DodoCheckout.open()` while a checkout session is active or opening are safely dropped to ensure only one modal, one iframe, and one listener exist.
- **Single-Fire Callbacks**: `onSuccess`, `onError`, and `onClose` fire strictly once per appropriate lifecycle event.
- **Clean Teardown**: Upon dismissal, the overlay is removed from the DOM, the message listener is detached, and body scroll is restored. Post-success cleanup does not trigger `onClose`.

---

## 4. Test Cards & Simulation Behaviors

Payments are simulated deterministically in-memory with realistic processing delays (1200ms).

| Card Number | Expiry | CVV | Scenario | Expected Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `4242 4242 4242 4242` | `12/28` | `123` | **Success** | Simulates approved transaction. Displays `SuccessView` with session ID (`sess_*`). Emits `onSuccess({ sessionId })`. |
| `4000 0000 0000 0002` | `12/28` | `123` | **Declined** | Simulates non-retryable card decline. Displays `DeclinedView`. Emits `onError({ code: 'PAYMENT_DECLINED', message: 'Payment was declined.' })`. |
| `4000 0000 0000 0341` | `12/28` | `123` | **Retryable Failure** | **Attempt 1**: Fails with retryable error *inside Checkout*. Merchant `onError` is NOT emitted while waiting for retry.<br>**Attempt 2**: Customer clicks "Try Again" $\rightarrow$ Succeeds $\rightarrow$ Emits `onSuccess({ sessionId })`. |

---

## 5. Security & Isolation Approach

- **Origin & DOM Isolation via Iframe**: Card number, expiry, and CVV fields are rendered strictly inside the Checkout iframe (`:5174`). The merchant site (`:5173`) cannot inspect, access, or keylog these inputs via host DOM access due to standard browser cross-origin boundaries.
- **Zero Card Data in Host Bridge**: Card numbers, expiries, and CVVs are never placed in postMessage payloads, URL parameters, `localStorage`, `sessionStorage`, or console logs.
- **Strict postMessage Security**:
  - `event.origin`: Verified against the configured Checkout origin (`http://localhost:5174`).
  - `event.source`: Verified to strictly match `overlayHandle.iframe.contentWindow`.
  - Type checking: Only recognized `DODO_CHECKOUT_*` union types are processed; all unknown messages are silently discarded.
  - Payload inspection: Payloads are explicitly checked for forbidden sensitive keys (`cardNumber`, `card`, `cvv`, `expiry`, etc.).
- **URL Parameter Safety**: Only the non-sensitive product identifier (`productId=starter-kit-pro`) and trusted parent origin (`parentOrigin`) are passed via iframe query parameters.

*Note on Security Scope: This assignment demonstrates iframe origin boundaries and postMessage hardening. It does not implement PCI-DSS Level 1 infrastructure, tokenization services, or banking-grade HSMs.*

---

## 6. Two Decisions We Went Back and Forth On

### Decision 1: Full-Modal Iframe vs. Direct Host DOM Elements
- **Alternative**: Render checkout form fields directly inside the merchant host page DOM (like an embedded React component or modal).
- **The Dilemma**: Direct DOM rendering is simpler to style, eliminates postMessage bridging, and avoids iframe scrolling or resizing quirks. However, any script running on the merchant host page (analytics trackers, third-party libraries, browser extensions) would have direct access to raw card numbers and CVVs.
- **Choice**: Full-modal iframe isolation (`:5174` embedded inside `:5173`).
- **The Tradeoff**: Requires coordinating postMessage event contracts, validating origins, and managing modal overlay lifecycles, but guarantees browser-enforced Same-Origin Policy (SOP) isolation for sensitive card data.

### Decision 2: Internal Checkout Retry vs. Immediate Merchant `onError` on First 0341 Failure
- **Alternative**: Immediately emit `onError({ code: 'PAYMENT_DECLINED', ... })` to the merchant host page as soon as the first attempt with test card `0341` fails.
- **The Dilemma**: Immediate notification informs merchant telemetry right away, but merchant code might prematurely close the checkout, redirect the user, or display an abandonment screen while the customer is simply retrying a transient failure.
- **Choice**: Keep retryable failures inside the Checkout UI (attempt 1 displays a retry alert and preserves form values) and only emit a merchant-level callback when the transaction reaches a final state (`onSuccess` or fatal decline).
- **The Tradeoff**: The merchant event log does not record the intermediate retry attempt, but customer conversion is protected and merchant state is not prematurely marked failed.

---

## 7. What We'd Explore Next

1. **Hosted Payment Elements (Field-Level Iframes)**:
   Transition from a full-page checkout iframe to individual hosted input fields (separate iframes for card number, expiry, and CVV, similar to Stripe Elements), giving merchants full CSS layout customization while retaining PCI card isolation.
2. **Localized Payment Rails & Wallets**:
   Support regional payment methods (native UPI intent/QR for India, Apple Pay / Google Pay via the Payment Request API) with automatic device capability detection.
3. **Automated Cross-Origin Integration Testing**:
   Implement automated Playwright/Cypress end-to-end test suites running across multiple local origins (`:5173` and `:5174`) to continuously verify postMessage origin rejection, iframe teardown, and race-condition handling.
4. **Server-Side Session Verification & Webhooks**:
   Introduce a backend session creation endpoint (`POST /sessions`) and asynchronous webhook notifications (`payment.succeeded`, `payment.failed`) so merchants verify payments cryptographically on their servers rather than relying solely on client-side callbacks.

---

## 8. Known Limitations

- **Simulated Transactions**: Payments are simulated in-memory and do not connect to live financial networks or processing gateways.
- **Single Product Focus**: Designed specifically around the `starter-kit-pro` product flow.
- **Session Lifespan**: Attempt counts and session states are scoped to the active page session.
