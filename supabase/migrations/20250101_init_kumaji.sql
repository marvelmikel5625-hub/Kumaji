-- ==============================================================================
-- KUMAJI MARKETPLACE: COMPLETE PRODUCTION POSTGRESQL SCHEMA WITH RLS
-- Migration: 20250101_init_kumaji.sql
-- Financial Safety: All currency values stored in integer kobo (100 kobo = 1 NGN).
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('customer', 'seller', 'store_manager', 'support', 'super_admin');
CREATE TYPE seller_application_status AS ENUM ('pending', 'approved', 'rejected', 'requires_more_info');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE fulfilment_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE ledger_entry_type AS ENUM ('order_credit', 'platform_commission', 'escrow_hold', 'seller_payout', 'refund_debit');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ------------------------------------------------------------------------------
-- 2. USERS & PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- ------------------------------------------------------------------------------
-- 3. SELLER STORES & APPLICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seller_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    store_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    commission_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 8.50,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_account_name TEXT,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    total_sales_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_seller_stores_seller ON public.seller_stores(seller_id);
ALTER TABLE public.seller_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified seller stores"
    ON public.seller_stores FOR SELECT
    USING (is_verified = true OR auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own store details"
    ON public.seller_stores FOR UPDATE
    TO authenticated
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

CREATE TABLE IF NOT EXISTS public.seller_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    rc_number TEXT,
    tin TEXT,
    category TEXT NOT NULL,
    phone TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status seller_application_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants can read own application"
    ON public.seller_applications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application"
    ON public.seller_applications FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. CATEGORIES & CATALOGUE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    item_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.seller_stores(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    brand TEXT NOT NULL,
    base_price_kobo BIGINT NOT NULL CHECK (base_price_kobo >= 0),
    original_price_kobo BIGINT CHECK (original_price_kobo >= base_price_kobo),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    review_count INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    return_policy_days INT NOT NULL DEFAULT 7,
    images TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_seller ON public.products(seller_id);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published products"
    ON public.products FOR SELECT
    USING (is_published = true OR auth.uid() IN (SELECT seller_id FROM public.seller_stores WHERE id = products.seller_id));

CREATE POLICY "Sellers can manage own products"
    ON public.products FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT seller_id FROM public.seller_stores WHERE id = products.seller_id));

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    price_kobo BIGINT NOT NULL CHECK (price_kobo >= 0),
    original_price_kobo BIGINT CHECK (original_price_kobo >= price_kobo),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_variants_product ON public.product_variants(product_id);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product variants" ON public.product_variants FOR SELECT USING (true);

-- ------------------------------------------------------------------------------
-- 5. ADDRESSES & CARTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own addresses"
    ON public.addresses FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. ORDERS, PAYMENTS, COMMISSIONS & FULFILMENT
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    subtotal_kobo BIGINT NOT NULL CHECK (subtotal_kobo >= 0),
    shipping_fee_kobo BIGINT NOT NULL DEFAULT 0 CHECK (shipping_fee_kobo >= 0),
    discount_kobo BIGINT NOT NULL DEFAULT 0 CHECK (discount_kobo >= 0),
    total_kobo BIGINT NOT NULL CHECK (total_kobo >= 0),
    payment_method TEXT NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_reference TEXT UNIQUE,
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.seller_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    seller_id UUID NOT NULL REFERENCES public.seller_stores(id) ON DELETE RESTRICT,
    subtotal_kobo BIGINT NOT NULL CHECK (subtotal_kobo >= 0),
    commission_kobo BIGINT NOT NULL CHECK (commission_kobo >= 0),
    seller_payout_kobo BIGINT NOT NULL CHECK (seller_payout_kobo >= 0),
    fulfilment_status fulfilment_status NOT NULL DEFAULT 'pending',
    tracking_number TEXT,
    courier_name TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_seller_orders_seller ON public.seller_orders(seller_id);
ALTER TABLE public.seller_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own sub-orders"
    ON public.seller_orders FOR SELECT
    TO authenticated
    USING (auth.uid() IN (SELECT seller_id FROM public.seller_stores WHERE id = seller_orders.seller_id));

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    seller_order_id UUID NOT NULL REFERENCES public.seller_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    product_title TEXT NOT NULL,
    variant_title TEXT,
    sku TEXT NOT NULL,
    unit_price_kobo BIGINT NOT NULL CHECK (unit_price_kobo >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total_kobo BIGINT NOT NULL CHECK (line_total_kobo >= 0),
    image_url TEXT NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items viewable by order owners"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_items.order_id));

-- ------------------------------------------------------------------------------
-- 7. AUDITABLE FINANCIAL LEDGER & PAYOUTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.seller_stores(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    type ledger_entry_type NOT NULL,
    amount_kobo BIGINT NOT NULL,
    balance_after_kobo BIGINT NOT NULL,
    description TEXT NOT NULL,
    is_settled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_ledger_seller ON public.ledger_entries(seller_id);
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own ledger entries"
    ON public.ledger_entries FOR SELECT
    TO authenticated
    USING (auth.uid() IN (SELECT seller_id FROM public.seller_stores WHERE id = ledger_entries.seller_id));

CREATE TABLE IF NOT EXISTS public.seller_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.seller_stores(id) ON DELETE RESTRICT,
    amount_kobo BIGINT NOT NULL CHECK (amount_kobo > 0),
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    status payout_status NOT NULL DEFAULT 'pending',
    reference TEXT NOT NULL UNIQUE,
    approved_by_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ
);

ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own payouts"
    ON public.seller_payouts FOR SELECT
    TO authenticated
    USING (auth.uid() IN (SELECT seller_id FROM public.seller_stores WHERE id = seller_payouts.seller_id));

-- ------------------------------------------------------------------------------
-- 8. REVIEWS, WISHLISTS & AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can add reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- Audit logs strictly restricted to super_admin via application/service role
