# Sakthi Frozen Foods Production Optimization Report

Date: 2026-09-09

## Executive Summary

The existing Vercel + Render + MongoDB Atlas + Cloudinary + Razorpay architecture is appropriate for approximately 100-500 visitors per month. A rewrite, microservices, Redis, queues, Kubernetes, or additional infrastructure is not currently justified.

The code now uses stateless request handling, durable payment-event records, bounded retries, public-data cache boundaries, atomic stock updates, and a webhook recovery path. These practices make later horizontal scaling possible without claiming that the current free deployment can serve 100,000+ visitors.

The main risks were in payment verification, server-side order pricing, authorization, secret fallbacks, and unbounded API responses. These areas were improved while preserving the current architecture and API usage patterns.

## Priority Findings

### Critical

- Payment verification trusted a client-supplied database order ID.
- The backend accepted client-supplied prices, quantities, and total amounts.
- Razorpay amount, currency, order ownership, and captured status were not verified.
- Payment verification could be repeated and overwrite payment state.
- Several administrative APIs had no authentication or admin authorization.
- JWT, Razorpay, and database secrets had insecure fallback values.
- Users could query orders using an arbitrary email address.

### High

- Product and order lists were unbounded or had weak pagination defaults.
- Product queries retrieved more data than necessary.
- CORS allowed arbitrary origins.
- MongoDB connection options were not tuned for a small Render instance.
- API errors could expose internal error messages.
- Frontend API fallback reused an already-aborted timeout signal.

### Medium

- The project contains duplicate Next.js API handlers alongside the Render API.
- Cloudinary upload handling is backend-only and memory-based, but uploads are limited to 10 MB.
- Product search uses a case-insensitive regular expression and may require a search-specific strategy if the catalogue becomes large.

## Implemented Changes

### Backend API

- Added centralized 404 and production-safe error handling.
- Restricted CORS to configured `FRONTEND_URL` origins.
- Added security headers and a 100 KB JSON request limit.
- Added protected admin routes for products, orders, users, categories, reviews, and uploads.
- Added validation for order customer details, item IDs, quantities, weights, and stock.
- Preserved the existing checkout flow while making the backend the source of truth.

### MongoDB

- Added reusable connection settings with:
  - Maximum pool size of 5.
  - Disabled command buffering.
  - Connection and socket timeouts.
- Added indexes for:
  - Orders by customer email and creation date.
  - Razorpay order IDs.
  - Products by category and code.
  - Product names.
- Product listing responses are now bounded and projected to required fields.

### Razorpay

The backend now:

1. Reads product prices from MongoDB.
2. Calculates subtotal, delivery fee, and final amount server-side.
3. Creates the Razorpay order using the trusted amount.
4. Finds the stored order using the Razorpay order ID from the payment response.
5. Verifies the HMAC signature using the configured secret.
6. Fetches the Razorpay order and payment from Razorpay.
7. Confirms order ID, amount, currency, payment order association, and captured status.
8. Updates payment state using a conditional pending-to-paid operation.
9. Returns success safely for the same already-processed payment.

#### Webhook recovery

- Added `POST /api/payment/webhook`.
- Verifies the raw request body with `RAZORPAY_WEBHOOK_SECRET` and the Razorpay signature header.
- Handles captured/paid and failed events.
- Revalidates captured payments with Razorpay before changing the order.
- Stores event IDs in a durable `PaymentEvent` collection to make duplicate delivery safe.
- Uses the same idempotent payment processor as the browser verification endpoint.

#### Retry behavior

- Razorpay fetch calls retry at most twice after the initial attempt.
- Retries use exponential backoff with jitter for timeouts, 429 responses, and 5xx responses.
- Validation, authentication, payment rejection, and other 4xx business failures are not retried.
- Order creation is rate-limited to 20 requests per minute per client IP.

### Authentication and Authorization

- Removed insecure JWT fallback secrets.
- Reduced JWT lifetime to 7 days.
- Normalized user email values.
- Fixed authentication middleware fall-through behavior.
- Added proper `403` responses for unauthorized admin access.
- Added `/api/orders/mine`, which uses the authenticated user's email rather than a client-selected email.
- Fixed the Next.js login and registration proxies so the JWT is stored in an HttpOnly cookie and is not returned in the JSON response.

### Frontend Communication

- Direct Render API requests can forward the authenticated bearer token.
- API fallback requests use a fresh timeout controller.
- Customer order history uses the authenticated `/orders/mine` endpoint.

### Caching Strategy

- Product list and product detail responses advertise short public cache lifetimes with stale-while-revalidate.
- Category responses advertise a longer public cache lifetime because categories change less often.
- Orders, payment verification, authentication, cart state, and admin responses are not publicly cached.
- No Redis was added. A CDN or Redis can be introduced later behind the same read-service boundaries if real traffic requires it.

### Stock Consistency

- Payment capture changes the order from pending to paid and commits inventory in one MongoDB transaction.
- Each product decrement uses an atomic `stock >= quantity` predicate and `$inc`.
- Duplicate payment callbacks cannot decrement stock twice because the order update requires `stockCommitted: false`.
- Cash-on-delivery orders reserve inventory with the same atomic conditional updates before they are returned as accepted orders.
- MongoDB Atlas must support transactions for this path, which standard Atlas replica-set deployments do.

### Cloudinary

- Existing memory-only upload flow was retained.
- Uploads remain limited to one image and 10 MB.
- Accepted formats remain JPG, PNG, WebP, and AVIF.
- Cloudinary transformations cap large originals and request automatic delivery formats and quality.

## Validation Performed

- Backend JavaScript syntax checks passed.
- `npx tsc --noEmit` passed with exit code 0.
- Next.js production compilation succeeded.
- No production latency improvement is claimed because live benchmarking was not performed against the deployed services.

## Remaining Risks and Recommended Follow-Up

### Payment recovery

Configure `RAZORPAY_WEBHOOK_SECRET` in Render and register the Render endpoint in Razorpay. Test duplicate and out-of-order deliveries in Razorpay test mode. COD does not use Razorpay, but its stock reservation is also atomic.

### Duplicate API implementations

The duplicate Next.js order handlers are now thin authenticated proxies to the Render API. Production should still set `NEXT_PUBLIC_API_URL` to the Render API URL; the Next auth, upload, and order proxies honor that variable.

### Secrets

Rotate the MongoDB password if the current `.env` value has ever been committed or shared. Configure these values in Render and Vercel environment settings rather than source control:

- `MONGODB_URI`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL`

## Final Assessment

### Current deployment: 100-500 visitors/month

The current Vercel + one Render Free API + MongoDB Atlas + Cloudinary + Razorpay deployment is sufficient. Keep it small and avoid Redis, queues, Kubernetes, or multiple API instances until measurements justify them.

### Scale path

- **100-500 visitors/month:** Current deployment. Focus on correctness, security, and short public cache headers.
- **Around 1,000 visitors/month:** Measure p95 latency, Render memory, database latency, and payment failures. Tune indexes and request limits before adding infrastructure.
- **Around 10,000 visitors/month:** Consider a paid API instance with more predictable CPU/memory, CDN caching for public catalogue data, and a distributed rate-limit/cache store if multiple instances are introduced.
- **Around 100,000+ visitors/month:** Load-test first, then add multiple stateless API instances behind a load balancer, Redis or equivalent distributed cache/rate-limit storage, and appropriately scaled MongoDB. This will be an infrastructure scaling exercise, not a complete business-logic rewrite.

### Future scalability verdict

The code is designed toward future scaling through stateless APIs, durable MongoDB state, bounded queries, targeted indexes, idempotent payment processing, webhook recovery, atomic inventory updates, safe retry boundaries, and explicit caching boundaries. No claim is made that the current free infrastructure can serve 100,000+ visitors.

## Notification System

The original codebase did not contain an email provider, Telegram integration, notification model, notification API, or notification dashboard. A lightweight backend notification boundary is now implemented without adding a queue or worker:

- `Notification` records persist event type, channel, recipient, status, attempts, timestamps, failure reason, and related order.
- Order creation, successful payment, failed payment, and admin order-status changes create durable notification records.
- Email uses the optional Resend HTTP API through `RESEND_API_KEY` and `EMAIL_FROM`.
- Admin email uses `ADMIN_EMAIL`.
- Admin Telegram uses `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
- Provider calls happen after business state is committed and are not awaited by customer-facing order/payment responses.
- Provider retries are bounded to three attempts with exponential backoff and jitter for transient failures only.
- Duplicate notification keys prevent repeated payment verification or webhook delivery from sending the same event repeatedly.
- `/api/notifications` is admin-only and paginated; failed records can be retried from `/admin/notifications`.

Provider credentials are optional in local development. Missing credentials are recorded as failed delivery rather than blocking checkout.

## Module Classification

| Module | Assessment | Main reason |
| --- | --- | --- |
| Authentication | Mostly complete | JWT, password hashing, one-time expiring password reset, and durable session revocation are implemented. |
| Authorization | Mostly complete | Backend admin guards exist; future private resources must follow the same pattern. |
| Products | Mostly complete | Server validation, projections, pagination, and indexes are present. |
| Categories | Mostly complete | Public reads and protected mutations are present. |
| Cart | Mostly complete | Authenticated server carts, ownership checks, local merge, product rehydration, and checkout revalidation are implemented. |
| Checkout | Mostly complete | Trusted totals and stock validation are server-side. |
| Orders | Mostly complete | Ownership detail/cancel endpoints, admin pagination, controlled transitions, and separated payment/status fields exist. |
| Payments | Mostly complete | Signature, amount, currency, capture, idempotency, and recovery are implemented. |
| Refunds | Mostly complete | Admin-only idempotent Razorpay refunds and refund state are implemented; provider integration testing remains. |
| Razorpay webhook | Mostly complete | Raw-body signature and durable event protection are implemented; provider test-mode verification remains. |
| Inventory | Mostly complete | Atomic stock updates and transactions cover online and COD acceptance. |
| Notifications | Mostly complete | Durable records, providers, retries, filtering, admin API, and dashboard are implemented; no queue yet. |
| Email / Telegram | Needs configuration | Provider credentials and sender/recipient settings must be configured in Render. |
| Notification dashboard | Mostly complete | Admin history and retry UI is available at `/admin/notifications`. |
| Cloudinary | Mostly complete | Size/type limits and transformations exist; deletion/public-ID lifecycle can be expanded. |
| MongoDB | Mostly complete | Reusable connections and targeted indexes exist; query-plan/load evidence is still pending. |
| API performance | Mostly complete | Bounded reads and projections exist; no production p95 benchmark was run. |
| Caching | Mostly complete | Public catalogue cache headers exist; private data is not publicly cached. |
| Retry | Mostly complete | Razorpay and notification retries are bounded and transient-only. |
| Idempotency | Mostly complete | Payment, webhook, stock, and notification keys are durable. |
| Error handling | Mostly complete | Central safe handler and request IDs exist. |
| Scalability | Mostly complete | Stateless business state and service boundaries support later infrastructure scaling. |

## Percentage Assessment

These are engineering-readiness estimates, not measured uptime or load-test results:

- Business logic completeness: **82%**
- Security: **78%**
- Performance: **72%**
- Reliability: **76%**
- Payment safety: **88%**
- Notification system: **72%**
- Scalability readiness: **78%**
- Overall production readiness: **78%**

The scores are below 100% because live payment/provider tests, load testing, and production latency measurements are not present.

## Final Verdict

1. The current deployment is appropriate for 100-500 visitors/month after Render secrets and webhook configuration are completed.
2. Razorpay browser and webhook payment validation is server-side and amount-aware.
3. Order/payment state is updated by backend verification; the frontend does not determine paid status.
4. Duplicate payment and webhook events are protected by conditional state changes and durable event keys.
5. Stock updates are atomic and transaction-protected for online and COD orders.
6. Notifications are durable and retryable, but provider credentials and delivery testing remain deployment tasks.
7. Retries are bounded and limited to transient provider failures.
8. Public catalogue caching is enabled; private/order/payment data is not publicly cached.
9. MongoDB has reusable connections, projections, pagination, and targeted indexes; production query measurements remain to be collected.
10. The backend stores important state in MongoDB and is designed to be stateless across instances.
11. Multiple backend instances can be introduced later; notification delivery should move to a queue when volume warrants it.
12. Before production: configure and rotate secrets, register/test the Razorpay webhook, configure email/Telegram providers, and run payment/stock/notification integration tests.
13. Redis, workers, Kubernetes, sharding, and multiple servers can wait until measurements show a need.
14. Vercel + Render Free + MongoDB Atlas + Cloudinary + Razorpay remains suitable for current traffic.
15. At roughly 1,000 visitors/month measure first; at 10,000 consider paid API/CDN and distributed rate limiting; at 100,000+ load-test and add horizontally scaled API instances, distributed cache/rate limiting, scaled MongoDB, and notification workers.

## Pending Features Audit

### Implemented

- Forgot-password and one-time expiring reset-token flow.
- Customer order detail and ownership checks.
- Customer cancellation for eligible pending orders.
- Controlled admin order transitions.
- Admin-authorized Razorpay refund processing with duplicate protection.
- Atomic stock restoration on customer and admin cancellation.
- Product input validation for prices, stock, required fields, and variants.
- Escaped and length-limited product search patterns.
- Notification status and channel filtering.
- Notification idempotency, attempt timestamps, next-attempt field, and failure reason fields.

### Partially implemented

- Refunds support full Razorpay refunds; partial refunds and refund approval policy are not defined by the current business rules.
- Notification providers are integrated behind a service boundary, but real delivery requires provider credentials and test messages.
- The automated suite uses mocked providers; live provider delivery and Razorpay test-mode checks remain deployment tasks.

### Not implemented

- No remaining required business feature is currently identified as not implemented. Load testing and live provider verification are intentionally deployment tasks.

## Files Changed In This Pass

- `backend/controllers/authController.js`
- `backend/models/User.js`
- `backend/models/Order.js`
- `backend/models/Notification.js`
- `backend/routes/authRoutes.js`
- `backend/routes/orderRoutes.js`
- `backend/routes/productRoutes.js`
- `backend/routes/notificationRoutes.js`
- `backend/services/notificationService.js`
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`
- `app/orders/page.tsx`
- `app/admin/notifications/page.tsx`
- `app/admin/page.tsx`
- `render.yaml`
- `PRODUCTION_OPTIMIZATION_REPORT.md`

## Environment Variables

Required in production:

- `MONGODB_URI`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `FRONTEND_URL`

Required to enable notifications:

- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ADMIN_EMAIL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Frontend:

- `NEXT_PUBLIC_API_URL` must point to the Render API in production.

## Test Status

- Backend syntax: **PASS**
- TypeScript: **PASS**
- Editor diagnostics: **PASS**
- Production build: **INCOMPLETE RESULT** in the reused PowerShell session; compilation previously reached the Next.js build phase, but the final exit marker was not returned.
- Automated unit/integration tests: **PASS**, with the mocked integration suite available under `backend/test/integration.test.js`.

## Final Validation Update

- `npm run lint`: **PASS**, with four non-blocking existing warnings for raw `<img>` usage and the shop product-loader effect dependency.
- `npm audit --omit=dev`: **FAIL / ACTION REQUIRED** with one critical Next.js advisory chain and one high PostCSS advisory. npm recommends `next@16.3.4`, which is a breaking upgrade from the current Next 14 application; do not run `npm audit fix --force` without a dedicated Next migration and regression test pass.
- `npm run build`: **PASS** in the latest completed build output.
- Admin cancellation cannot bypass refunds for paid Razorpay orders; the refund endpoint must be used first.
- Payment verification also requires the provider response order ID to match the requested Razorpay order ID.

## Final Development Audit

| Feature | Before | After | Status |
| --- | --- | --- | --- |
| Password reset | Reset incremented a session version during save | Hashed token consumption, password update, and version increment are one conditional MongoDB update | PASS |
| Session revocation | Version check existed but reset was not atomic | Middleware validates the current durable version; reset invalidates all prior JWTs across instances | PASS |
| Notifications | Manual retry and retry metadata | Durable 30-second poller, MongoDB claim lease, stale-lease recovery, bounded transient retry | PASS |
| Automated retry | No scheduled retry execution | Scheduler retries timeout/network/429/5xx only, with jitter and max attempts | PASS |
| Persistent cart | Server whole-cart sync existed | Authenticated get/add/update/remove/clear operations with server-side product hydration and safe local merge | PASS |
| Razorpay | Provider tests were not present | Mocked valid, invalid signature, amount, currency, order identity, association, capture status, duplicate, and already-paid coverage | PASS (mocked) |
| Webhook | Signature path existed without executable tests | Mocked valid/invalid signature, duplicate event, captured, failed, unknown, out-of-order, and wrong-link coverage | PASS (mocked) |
| Inventory | Atomic implementation existed without executable tests | Successful deduction, insufficient stock, COD reservation, cancellation restore, duplicate payment/webhook, and concurrent non-negative stock coverage | PASS (automated; production load not claimed) |
| Integration tests | No test suite | 13 executable Node/Supertest/MongoDB-memory tests, all passing | PASS |
| Security audit | Next/PostCSS vulnerabilities remained | Audited; no safe Next 14 fix exists, Next 16.3.4 migration remains required | FAIL / ACTION REQUIRED |

### Validation Status

- `npm run lint`: PASS with four existing non-blocking warnings.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS.
- `npm test`: PASS, 13 tests passed.
- `npm audit --omit=dev`: FAIL / ACTION REQUIRED. Installed Next.js 14.2.35 and nested PostCSS remain in vulnerable ranges; npm recommends the breaking Next 16.3.4 upgrade.
- Live Razorpay, Resend, and Telegram delivery: REQUIRES EXTERNAL CONFIGURATION.

### Remaining Tasks

- Perform a dedicated Next.js 16 migration and regression pass before applying the audit fix.
- Configure the Render API URL, provider credentials, and Razorpay webhook in deployment settings.
- Run live provider test-mode checks with non-production credentials.
- Add a dedicated load/concurrency test run against MongoDB replica-set infrastructure.