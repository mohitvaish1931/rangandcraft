# Rang and Craft

E-commerce store for Rang and Craft, Jaipur: a React storefront with an admin panel, and an Express + MongoDB API with Razorpay payments.

```
clothing-brand-frontend/   React 19 + Vite + TypeScript storefront and admin panel
clothing-brand-backend/    Express 4 + Mongoose API
  routes/                  REST endpoints
  utils/pricing.js         Server-side order pricing (prices, coupons, stock)
  tests/                   API integration tests (node --test + supertest)
  scripts/                 One-off database maintenance scripts
api/index.js               Vercel serverless entry that mounts the API
```

## Getting started

Requirements: Node 20+ and a MongoDB instance (local or Atlas).

```bash
npm install                      # installs both workspaces
npm run dev:api                  # API on http://localhost:5000
npm run dev:web                  # storefront on http://localhost:5173
```

Create `clothing-brand-backend/.env` with at least `MONGO_URI` and `JWT_SECRET` (see below).
To create or reset the admin account: `ADMIN_PASSWORD=... node clothing-brand-backend/scripts/reset_admin.js`.

## Checks

```bash
npm run lint                     # ESLint (frontend)
npm run build                    # typecheck + production build
MONGO_TEST_URI=mongodb://127.0.0.1:27017/rangandcraft_test npm test   # API tests (uses a throwaway database)
```

CI (`.github/workflows/ci.yml`) runs all three on every pull request.

## Backend environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | **yes in production** | Signs login tokens. Without it a random secret is used and everyone is signed out on each restart. Use a long random string. |
| `NODE_ENV` | yes in production | Set to `production` |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | yes, to take payments | Without them, production refuses online payments (development uses a mock flow). |
| `ALLOW_MOCK_PAYMENTS` | no | `true` enables the mock payment flow outside development (staging only — orders are marked paid without charging). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | yes, for uploads | Product image and video uploads from the admin panel |
| `SHIPMOZO_API_TOKEN` | optional | Automatic shipment booking after payment. Without it, shipments are booked manually. |
| `SHIPROCKET_WEBHOOK_TOKEN` | yes, if using the Shiprocket webhook | Must match the token configured in the Shiprocket panel (sent as `x-api-key`). The webhook is rejected in production without it. |
| `CORS_ORIGINS` | recommended | Comma-separated list of sites allowed to call the API, e.g. `https://rangandcraft.store,https://www.rangandcraft.store` |
| `PORT` | no | Defaults to 5000 |

Frontend: `VITE_API_BASE` (in `clothing-brand-frontend/.env.production`) points the storefront at the API.

## How orders and payments work

1. The browser sends only product ids, quantities, sizes and an optional coupon code.
2. `POST /api/orders` loads the products, checks stock and the coupon, and computes every price on the server.
3. `POST /api/payment/razorpay` creates a Razorpay order for the stored total and remembers its id.
4. After checkout, `POST /api/payment/verify` checks Razorpay's signature **and** that the payment belongs to that order, then marks it paid, reduces stock, counts the coupon use and books the shipment, exactly once.

## Admin

Sign in with an admin account and open `/admin`. Every admin API requires an admin token. Customer reviews stay hidden until approved under **Reviews**; contact-form messages and newsletter sign-ups appear under **Inbox**.
