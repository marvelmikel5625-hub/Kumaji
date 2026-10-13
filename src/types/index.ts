export type UserRole = 'customer' | 'seller' | 'store_manager' | 'support' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export type SellerApplicationStatus = 'pending' | 'approved' | 'rejected' | 'requires_more_info';

export interface SellerStore {
  id: string;
  seller_id: string;
  store_name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url?: string;
  state: string; // e.g. Lagos, Abuja, Rivers, Kano
  city: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  is_verified: boolean;
  commission_rate_percent: number; // e.g. 8.5%
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  rating: number;
  total_sales_count: number;
  created_at: string;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'individual' | 'registered_company';
  rc_number?: string; // Nigerian CAC RC Number
  tin?: string;
  category: string;
  phone: string;
  state: string;
  city: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: SellerApplicationStatus;
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  item_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  item_count: number;
  subcategories?: SubCategory[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  title: string; // e.g. "Space Black / 256GB"
  attributes: {
    color?: string;
    size?: string;
    storage?: string;
    style?: string;
    material?: string;
  };
  price_kobo: number; // integer kobo (100 kobo = 1 NGN)
  original_price_kobo?: number;
  stock: number;
  image_url?: string;
}

export type ProductStatus = 'published' | 'draft' | 'pending' | 'rejected' | 'archived';
export type ProductCondition = 'new' | 'refurbished' | 'like_new';
export type DeliveryAvailability = 'available' | 'pickup_only' | 'unavailable';

export interface Product {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_state: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  category_name: string;
  subcategory_id?: string;
  subcategory_name?: string;
  brand: string;
  base_price_kobo: number; // Lowest variant or standard price
  original_price_kobo?: number; // Only set when genuine discount exists
  stock: number; // Aggregate or standard stock
  rating: number; // 1.0 to 5.0
  review_count: number;
  status: ProductStatus;
  is_published: boolean;
  is_featured?: boolean;
  is_verified_seller: boolean;
  condition?: ProductCondition;
  return_policy_days: number;
  images: string[];
  variants: ProductVariant[];
  // Delivery & location configuration
  delivery_availability: DeliveryAvailability;
  pickup_address?: string;
  delivery_window?: string; // e.g. "1-2 business days"
  custom_delivery_charge_kobo?: number;
  weight_kg?: number;
  dimensions_cm?: { length?: number; width?: number; height?: number };
  // Analytics
  views_count: number;
  clicks_count: number;
  add_to_cart_count: number;
  units_sold: number;
  orders_count: number;
  // Metadata
  is_seed_data?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
}

export interface CartItem {
  id: string; // unique item id in cart (product_id + variant_id)
  product_id: string;
  variant_id?: string;
  seller_id: string;
  seller_name: string;
  title: string;
  variant_title?: string;
  sku: string;
  unit_price_kobo: number;
  quantity: number;
  image_url: string;
  max_stock: number;
  delivery_availability?: DeliveryAvailability;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string; // Nigerian state (e.g., Lagos, Abuja FCT, Rivers, Oyo)
  postal_code?: string;
  is_default: boolean;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfilmentStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface CustomerOrder {
  id: string;
  order_number: string; // e.g. "KMJ-2026-1049"
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address;
  subtotal_kobo: number;
  shipping_fee_kobo: number;
  discount_kobo: number;
  total_kobo: number;
  payment_method: 'paystack' | 'flutterwave' | 'bank_transfer' | 'cash_on_delivery';
  payment_status: PaymentStatus;
  payment_reference: string;
  idempotency_key: string;
  seller_orders: SellerOrder[];
  created_at: string;
  updated_at: string;
}

export interface SellerOrder {
  id: string;
  order_id: string;
  order_number: string;
  seller_id: string;
  seller_name: string;
  items: OrderItemSnapshot[];
  subtotal_kobo: number;
  commission_kobo: number; // Platform commission deducted
  seller_payout_kobo: number; // Net amount owed to seller
  fulfilment_status: FulfilmentStatus;
  tracking_number?: string;
  courier_name?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface OrderItemSnapshot {
  product_id: string;
  variant_id?: string;
  product_title: string;
  variant_title?: string;
  sku: string;
  unit_price_kobo: number;
  quantity: number;
  line_total_kobo: number;
  image_url: string;
}

export type LedgerEntryType = 'order_credit' | 'platform_commission' | 'escrow_hold' | 'seller_payout' | 'refund_debit';

export interface LedgerEntry {
  id: string;
  seller_id: string;
  order_id?: string;
  type: LedgerEntryType;
  amount_kobo: number; // positive or negative
  balance_after_kobo: number;
  description: string;
  is_settled: boolean;
  created_at: string;
}

export interface SellerPayout {
  id: string;
  seller_id: string;
  amount_kobo: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference: string;
  approved_by_admin_id?: string;
  created_at: string;
  processed_at?: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  target_entity: string;
  target_id: string;
  details: string;
  created_at: string;
}
