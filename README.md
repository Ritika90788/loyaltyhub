<div align="center">

# LoyaltyHub

**AI-Powered Multi-Store E-Commerce & Loyalty Platform**

*Shop More. Earn More. Get Rewarded.*

![MERN](https://img.shields.io/badge/stack-MERN-4f46e5) ![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-f59e0b) ![License](https://img.shields.io/badge/license-MIT-green)

[Live Demo](#) · [Backend API](#) · [Report a Bug](../../issues)

</div>

---

## Overview

LoyaltyHub is a full-stack e-commerce ecosystem where customers shop across multiple (fictional) stores — **ShopKart, StyleHub, GlowMart, TechZone and HomeNest** — using **one account and one common loyalty wallet**.

Every order earns points, points can be redeemed for rewards or discounts, and an AI assistant (LoyaltyAI, powered by Google Gemini) recommends **only real products from the database**. A role-protected admin panel manages the catalog, coupons and AI-generated marketing campaigns.

> All stores and brands are fictional. This project is not affiliated with or integrated into any real marketplace.

## Screenshots

| Home | Products | Product Details |
|---|---|---|
| ![Home](docs/screenshots/home.png) | ![Products](docs/screenshots/products.png) | ![Product](docs/screenshots/product.png) |

| Cart & Checkout | Loyalty Wallet | Rewards |
|---|---|---|
| ![Cart](docs/screenshots/cart.png) | ![Wallet](docs/screenshots/wallet.png) | ![Rewards](docs/screenshots/rewards.png) |

| LoyaltyAI Assistant | Orders & Tracking | Admin Dashboard |
|---|---|---|
| ![AI](docs/screenshots/assistant.png) | ![Orders](docs/screenshots/orders.png) | ![Admin](docs/screenshots/admin.png) |

## Features

**Customer**
- Browse stores and products with search, category/store/price filters, sorting and pagination
- Product details with color/size selection, stock status, reviews and ratings, similar products
- Cart, coupon codes and loyalty-points discount, checkout with simulated payment (COD / UPI / Card / Demo)
- Order history with a status timeline (Placed → Confirmed → Packed → Shipped → Delivered) and cancellation
- Wishlist, coupon centre (gift a reward coupon to a friend with a share link), notifications and profile
- Welcome bonus (1,000 points, 1,200 via referral link) and a referral program that rewards the referrer after the friend's first order
- Membership tiers (Bronze / Silver / Gold / Platinum) with bonus points, achievement badges and progress tracking
- **LoyaltyAI** shopping assistant with product recommendation cards

**Admin**
- Dashboard: revenue, orders, users, active coupons, points issued/redeemed, 7-day revenue chart, recent orders
- Create / edit / delete products; create / edit / deactivate stores; create / edit coupons
- **AI Marketing Studio** — generates headline, description, promo message, social caption and CTA with Gemini

## Loyalty Engine (business rules)

| Rule | Value |
|---|---|
| Base earning | **10 points per ₹100** spent (on the amount actually paid) |
| Membership bonus | Bronze 0% · Silver 5% · Gold 10% · Platinum 20% |
| Tier thresholds (lifetime points) | Silver 1,000 · Gold 3,000 · Platinum 10,000 |
| Redemption value | **10 points = ₹1** |
| Delivery | ₹49, free when the payable subtotal is ₹499 or more |
| Signup bonus | 1,000 points for every new account, 1,200 when signing up via a referral link (does not count towards tier upgrades) |
| Referral | The referrer earns 100 points after the friend's first order |
| Cancellation | Earned points are **reversed**; points spent are refunded |

Design guarantees:
- The user's balance is **never changed without a `PointsTransaction` record** (types: `EARN`, `REDEEM`, `REVERSAL`, `BONUS`, `EXPIRED`).
- Spending points uses an atomic conditional update, so the balance can never go negative.
- Stock is decremented atomically at order time and rolled back if the order fails.
- **Prices, coupon discounts and totals are always calculated on the server.** The client only sends product IDs, quantities and the coupon code.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Axios, Context API, CSS3 (design tokens) |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose (MongoDB Atlas) |
| Auth | JWT, bcrypt (bcryptjs) |
| AI | Google Gemini API (`@google/generative-ai`) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## Architecture

```
┌────────────────┐   REST + JWT   ┌──────────────────────┐     ┌──────────────┐
│ React (Vercel) │ ─────────────▶ │ Express API (Render) │ ──▶ │ MongoDB Atlas│
└────────────────┘                │  routes → controllers │     └──────────────┘
                                  │  → services → models  │ ──▶ Google Gemini
                                  └──────────────────────┘     (key stays on server)
```

```
loyaltyhub/
├── backend/
│   ├── config/         # database connection
│   ├── controllers/    # order placement & cancellation
│   ├── middleware/     # auth, admin guard, error handler
│   ├── models/         # Mongoose schemas
│   ├── routes/         # REST routes
│   ├── services/       # loyalty engine, coupon validation, Gemini, notifications
│   ├── seed.js         # demo data
│   └── server.js
└── frontend/
    ├── public/products/  # product illustrations
    └── src/
        ├── components/   # Navbar, ProductCard, Footer, ErrorBoundary
        ├── context/      # auth, cart, toast state
        ├── pages/        # customer pages + Admin
        ├── services/     # Axios API client
        └── utils/
```

## Database Schema

| Collection | Key fields |
|---|---|
| **User** | name, email (unique), password (hashed), role, loyaltyPoints, lifetimePoints, membershipLevel, referralCode, referredBy |
| **Store** | name, description, category, logo, banner, isActive |
| **Product** | store, name, brand, description, price, originalPrice, category, images, stock, rating, reviewsCount, tags |
| **Coupon** | code, discountType (percent/flat), discountValue, minimumOrder, maximumDiscount, expiryDate, usageLimit, usedCount, usedBy, store, category, isActive |
| **Order** | user, orderNumber, items (product, store, name, category, price, qty), subtotal, coupon, discount, pointsUsed, pointsDiscount, deliveryFee, totalAmount, pointsEarned, address, paymentMethod, status, paymentStatus |
| **PointsTransaction** | user, store, order, type, points, reason, createdAt |
| **Wishlist** | user, products[] |
| **Review** | product, user, name, rating, comment |
| **Notification** | user, text, read |

## API Documentation

Base URL: `http://localhost:5000/api` · Protected routes need `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account (optional `ref` referral code) |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/stores` | Public | Active stores |
| GET | `/products` | Public | List products — query: `q, store, category, minPrice, maxPrice, sort, page, limit` |
| GET | `/products/:id` | Public | Product details |
| GET / POST | `/products/:id/reviews` | Public / User | List / add a review (one per user) |
| POST | `/coupons/validate` | User | Validate a coupon against server-priced items |
| GET | `/coupons` | User | Coupons available to the user |
| GET / POST | `/coupons/claim/:code` | User | Preview / claim a coupon shared by a friend (atomic, first claim wins) |
| POST | `/orders` | User | Place an order (coupon + points + stock handled atomically) |
| GET | `/orders`, `/orders/:id` | User | Order history / details |
| PUT | `/orders/:id/cancel` | User | Cancel order, reverse points, restock |
| GET | `/points` | User | Balance, reward value, level |
| GET | `/points/transactions` | User | Ledger (`?type=EARN\|REDEEM\|…`) |
| POST | `/points/redeem` | User | Redeem points for a reward coupon |
| GET / POST | `/wishlist`, `/wishlist/:productId` | User | List / toggle wishlist item |
| GET | `/referrals` | User | Referral code and stats |
| GET / PUT | `/notifications`, `/notifications/read` | User | List / mark as read |
| POST | `/ai/shopping-assistant` | User | LoyaltyAI recommendations grounded in DB products |
| POST | `/ai/generate-campaign` | Admin | Gemini marketing campaign |
| GET | `/admin/stats` | Admin | Dashboard metrics |
| POST / PUT / DELETE | `/products`, `/products/:id` | Admin | Manage products |
| GET / POST / PUT | `/admin/stores`, `/stores`, `/stores/:id` | Admin | Manage stores |
| GET / POST / PUT | `/admin/coupons`, `/admin/coupons/:id` | Admin | Manage coupons |
| GET | `/health` | Public | Health check (served at `/health`) |

Errors return `{ "message": "..." }` with a proper status code; server errors never leak internals.

## Environment Variables

**`backend/.env`**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/loyaltyhub
JWT_SECRET=<long-random-string>
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=<your-gemini-key>
GEMINI_MODEL=gemini-3.5-flash
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

Never commit `.env` files (they are in `.gitignore`). The Gemini key and database credentials exist only on the server.

## Local Setup

Prerequisites: Node.js 18+, a MongoDB Atlas account (free tier), and a Gemini API key from Google AI Studio.

```bash
git clone https://github.com/<your-username>/loyaltyhub.git
cd loyaltyhub
```

**Backend**
```bash
cd backend
npm install
cp .env.example .env     # then fill in the values
npm run seed             # 5 stores, 16 products, coupons, demo users
npm run dev              # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

**Demo accounts**

| Role | Email | Password |
|---|---|---|
| Customer (1,250 points) | `ritika@demo.com` | `password123` |
| Admin | `admin@loyaltyhub.com` | `password123` |

Try the coupon `SAVE20`. Re-running `npm run seed` resets all data.

## Deployment

1. **Database — MongoDB Atlas:** create a free M0 cluster and a database user, allow network access (`0.0.0.0/0`), and copy the connection string. Run `npm run seed` locally once with that `MONGO_URI` to load demo data.
2. **Backend — Render:** New → Web Service → connect the repo. Root directory `backend`, build command `npm install`, start command `npm start`. Add the environment variables above, setting `CLIENT_URL` to your Vercel URL (no trailing slash).
3. **Frontend — Vercel:** import the repo, root directory `frontend`, framework preset *Vite*. Add `VITE_API_URL=https://<your-render-service>.onrender.com/api`. `vercel.json` already contains the SPA rewrite so deep links work.
4. Open the Vercel URL and test login, an order and the AI assistant. On Render's free tier the first request after inactivity can take about a minute.

## Security

- Passwords hashed with bcrypt; stateless JWT authentication; role-based admin authorization
- Server-side coupon validation (existence, active, expiry, minimum order, usage limit, store/category applicability, one use per user)
- CORS restricted to the configured client origin
- Input validation on auth and review routes; centralized error handling hides internals
- Secrets only in environment variables

## Future Improvements

- Real payment gateway (Razorpay/Stripe) — checkout is already structured around a `paymentMethod` field
- Scheduled job to expire old points (the `EXPIRED` transaction type is already supported)
- Server-side cart and "price dropped" wishlist alerts
- Saving AI campaigns, richer analytics (top stores/categories, coupon usage), and an admin orders/users view
- Image uploads, email notifications, unit/integration tests and CI

## License

MIT — free to use for learning and portfolio purposes.
