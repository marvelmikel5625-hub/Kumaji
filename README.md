# KUMAJI — Multi-Vendor E-Commerce Marketplace

**Kumaji** is a production-oriented, multi-vendor marketplace designed for Nigeria first and structured for international expansion. It connects discerning buyers with verified Nigerian merchants, tech distributors, couture tailors, and northern craft artisans.

---

## 1. Brand & Design System

- **Identity**: Exact brand name **Kumaji**
- **Palette**:
  - Primary Accent: Brand Orange `#F36B25`
  - Charcoal Typography & Structure: `#252525`
  - Crisp Surfaces: `#FFFFFF`, `#FBFBFB`, and warm light neutral `#F4F4F5`
  - Success States: Restrained Emerald `#16A34A`
- **Mobile Header (Option A)**:
  - Left: Hamburger drawer trigger
  - Center: Wordmark “Kumaji” precisely geometrically centered in the available viewport (`absolute left-1/2 -translate-x-1/2`) regardless of unequal left/right controls
  - Right: Wishlist and Cart/Shopping Bag with live numeric badge counters
  - Directly below: Full-width search bar
  - Sub-row: Horizontally scrollable category row (`no-scrollbar`)
  - Smooth header compaction on scroll while keeping search accessible
  - Persistent bottom mobile navigation: Home, Categories, Search, Wishlist, Account
- **Anti-AI Slop Standards**:
  - Zero-pill metadata: Unboxed typography with `·` or `/` separators
  - No decorative floating status dots or mechanical comment headers
  - High-fidelity commercial photography assets
  - Strict 60-30-10 color discipline

---

## 2. Financial Safety & Integer Kobo Architecture

All financial figures in Kumaji are strictly stored and computed as **integer kobo** (`BIGINT` in PostgreSQL, integer in TypeScript):
- `1 NGN = 100 kobo` (e.g. ₦125,000 is stored as `12500000`)
- Floating-point arithmetic errors are eradicated across shopping carts, line items, delivery fees, and commissions.
- **Double-Entry Escrow Ledger**:
  - Orders credit the merchant's escrow balance upon verified customer payment.
  - Platform take-rate (default 8.5%) is recorded as a dedicated commission debit.
  - Seller payout withdrawals require manual/automated administrative verification and are deducted from settled available ledger balances.

---

## 3. Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Router, Lucide Icons
- **Backend**: Express API (`server.ts`) integrated with Vite middleware for unified local development and production
- **Database & Storage**: Supabase (PostgreSQL 15+, Row Level Security, Storage, Auth)
- **Logistics Engine**: Nigerian state delivery fee matrix (Lagos, Abuja FCT, Rivers/Port Harcourt, Kano, Oyo, etc.)
- **Payment Abstraction**: Paystack & Flutterwave sandbox integration with server-side webhook verification

---

## 4. Database Setup (Supabase & PostgreSQL)

The complete SQL migration script is located at:
```
supabase/migrations/20250101_init_kumaji.sql
```

### Steps to Apply:
1. Create a project in [Supabase Dashboard](https://supabase.com).
2. Navigate to **SQL Editor** in your Supabase project.
3. Open `supabase/migrations/20250101_init_kumaji.sql`, paste the SQL, and click **Run**.
4. The migration will configure:
   - Tables: `profiles`, `seller_stores`, `seller_applications`, `categories`, `products`, `product_variants`, `addresses`, `orders`, `seller_orders`, `order_items`, `ledger_entries`, `seller_payouts`, `reviews`, `wishlists`, `audit_logs`.
   - Constraints: `price_kobo >= 0`, `quantity > 0`, unique idempotency keys, unique references.
   - Row Level Security (RLS) policies enforcing multi-vendor seller isolation and customer data privacy.

---

## 5. Environment Variables & Deployment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Public Supabase anon key for client-side Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role key for privileged backend operations |
| `PAYSTACK_SECRET_KEY` | Secret key for Paystack webhook and transfer verification |
| `PAYSTACK_PUBLIC_KEY` | Public key for client checkout initialization |

### Running the App:
```bash
npm run dev
```

### Building for Production:
```bash
npm run build
npm start
```

---

## 6. Testing & Personas

Kumaji comes pre-configured with a one-click persona switcher in the header and account screens:
1. **Shopper / Buyer** (`Adekunle Bello`): Browse catalogue, add variants to cart, test multi-vendor checkout, track orders.
2. **Verified Merchant** (`Apex Gadgets Ikeja`): Manage product listings, update dispatch status with logistics partners (GIG Logistics, DHL, Speedaf), monitor settled escrow earnings, request bank payout.
3. **Platform Super Admin** (`Oluwaseun Vance`): Review merchant applications, moderate listings, inspect platform-wide ledger, authorize seller bank payouts.
