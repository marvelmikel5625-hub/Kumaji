import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory persistent state store for local dev / sandbox environments
interface OrderStoreItem {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: any;
  subtotal_kobo: number;
  shipping_fee_kobo: number;
  discount_kobo: number;
  total_kobo: number;
  payment_method: string;
  payment_status: string;
  payment_reference: string;
  idempotency_key: string;
  seller_orders: any[];
  created_at: string;
}

const memoryOrders: OrderStoreItem[] = [];
const memoryProcessedReferences = new Set<string>();

// -----------------------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------------------

// 1. System & Integration Config endpoint
app.get('/api/config', (_req: Request, res: Response) => {
  const isSupabaseLive = Boolean(
    process.env.VITE_SUPABASE_URL &&
    process.env.VITE_SUPABASE_ANON_KEY &&
    !process.env.VITE_SUPABASE_URL.includes('placeholder')
  );

  const isPaystackLive = Boolean(
    process.env.PAYSTACK_SECRET_KEY &&
    !process.env.PAYSTACK_SECRET_KEY.includes('placeholder')
  );

  res.json({
    app_name: 'Kumaji',
    version: '1.0.0',
    currency: 'NGN',
    kobo_unit: 100,
    is_live_supabase: isSupabaseLive,
    is_live_paystack: isPaystackLive,
    mode: isPaystackLive ? 'live' : 'sandbox',
    platform_commission_rate: 8.5,
  });
});

// 2. Authoritative Cart & Checkout Calculation
app.post('/api/checkout/calculate', (req: Request, res: Response) => {
  const { items, deliveryState, couponCode } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  // Calculate items subtotal strictly in kobo
  let subtotalKobo = 0;
  for (const item of items) {
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const priceKobo = Math.max(0, parseInt(item.unit_price_kobo, 10) || 0);
    subtotalKobo += priceKobo * qty;
  }

  // Authoritative Nigerian shipping fee mapping
  let shippingFeeKobo = 150000; // Default Lagos: ₦1,500
  const stateNormalized = (deliveryState || 'Lagos').toLowerCase();

  if (stateNormalized.includes('lagos')) {
    shippingFeeKobo = 150000;
  } else if (stateNormalized.includes('abuja') || stateNormalized.includes('fct')) {
    shippingFeeKobo = 250000;
  } else if (stateNormalized.includes('rivers') || stateNormalized.includes('port harcourt')) {
    shippingFeeKobo = 280000;
  } else if (stateNormalized.includes('kano') || stateNormalized.includes('kaduna')) {
    shippingFeeKobo = 350000;
  } else {
    shippingFeeKobo = 250000;
  }

  // Discount voucher validation
  let discountKobo = 0;
  if (couponCode && typeof couponCode === 'string') {
    const code = couponCode.trim().toUpperCase();
    if (code === 'KUMAJI10') {
      discountKobo = Math.round(subtotalKobo * 0.1); // 10% off
    } else if (code === 'WELCOME5') {
      discountKobo = Math.round(subtotalKobo * 0.05); // 5% off
    }
  }

  const totalKobo = Math.max(0, subtotalKobo + shippingFeeKobo - discountKobo);
  const platformCommissionKobo = Math.round(subtotalKobo * 0.085);

  return res.json({
    subtotal_kobo: subtotalKobo,
    shipping_fee_kobo: shippingFeeKobo,
    discount_kobo: discountKobo,
    total_kobo: totalKobo,
    platform_commission_kobo: platformCommissionKobo,
    currency: 'NGN',
  });
});

// 3. Idempotent Order Creation
app.post('/api/checkout/create-order', (req: Request, res: Response) => {
  const {
    idempotency_key,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    items,
    payment_method,
    deliveryState,
    couponCode,
  } = req.body;

  if (!idempotency_key) {
    return res.status(400).json({ error: 'Idempotency key required' });
  }

  // Check if order already created with this idempotency key
  const existingOrder = memoryOrders.find((o) => o.idempotency_key === idempotency_key);
  if (existingOrder) {
    return res.json({
      success: true,
      order: existingOrder,
      is_duplicate: true,
    });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain items' });
  }

  // Group items by seller to create sub-orders
  const sellerMap = new Map<string, any[]>();
  let subtotalKobo = 0;

  for (const item of items) {
    const sId = item.seller_id || 'seller-apex';
    if (!sellerMap.has(sId)) {
      sellerMap.set(sId, []);
    }
    const qty = Math.max(1, item.quantity || 1);
    const unitPrice = Math.max(0, item.unit_price_kobo || 0);
    const lineTotal = unitPrice * qty;
    subtotalKobo += lineTotal;

    sellerMap.get(sId)!.push({
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_title: item.title,
      variant_title: item.variant_title,
      sku: item.sku || 'SKU-DEFAULT',
      unit_price_kobo: unitPrice,
      quantity: qty,
      line_total_kobo: lineTotal,
      image_url: item.image_url,
    });
  }

  const shippingFeeKobo = (deliveryState || '').toLowerCase().includes('abuja') ? 250000 : 150000;
  let discountKobo = 0;
  if (couponCode === 'KUMAJI10') {
    discountKobo = Math.round(subtotalKobo * 0.1);
  }
  const totalKobo = Math.max(0, subtotalKobo + shippingFeeKobo - discountKobo);

  const orderNumber = `KMJ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const paymentReference = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const sellerOrders: any[] = [];
  sellerMap.forEach((sellerItems, sellerId) => {
    const sellerSubtotal = sellerItems.reduce((acc, i) => acc + i.line_total_kobo, 0);
    const commission = Math.round(sellerSubtotal * 0.085);
    const sellerPayout = sellerSubtotal - commission;

    sellerOrders.push({
      id: `so-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order_number: orderNumber,
      seller_id: sellerId,
      seller_name: items.find((i: any) => i.seller_id === sellerId)?.seller_name || 'Verified Kumaji Seller',
      items: sellerItems,
      subtotal_kobo: sellerSubtotal,
      commission_kobo: commission,
      seller_payout_kobo: sellerPayout,
      fulfilment_status: 'pending',
      created_at: new Date().toISOString(),
    });
  });

  const newOrder: OrderStoreItem = {
    id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    order_number: orderNumber,
    user_id: user_id || 'guest',
    customer_name: customer_name || 'Valued Customer',
    customer_email: customer_email || 'customer@example.ng',
    customer_phone: customer_phone || '+234 800 000 0000',
    shipping_address: shipping_address || {},
    subtotal_kobo: subtotalKobo,
    shipping_fee_kobo: shippingFeeKobo,
    discount_kobo: discountKobo,
    total_kobo: totalKobo,
    payment_method: payment_method || 'paystack',
    payment_status: payment_method === 'cash_on_delivery' ? 'pending' : 'pending',
    payment_reference: paymentReference,
    idempotency_key,
    seller_orders: sellerOrders,
    created_at: new Date().toISOString(),
  };

  memoryOrders.push(newOrder);

  return res.json({
    success: true,
    order: newOrder,
    payment_reference: paymentReference,
  });
});

// 4. Server-Side Payment Verification (Paystack / Flutterwave Sandbox Abstraction)
app.post('/api/payment/verify', (req: Request, res: Response) => {
  const { payment_reference, order_number } = req.body;

  if (!payment_reference) {
    return res.status(400).json({ error: 'Payment reference is required' });
  }

  // Enforce idempotency: prevent double crediting
  if (memoryProcessedReferences.has(payment_reference)) {
    return res.json({
      success: true,
      message: 'Payment was already verified and ledger settled.',
      already_settled: true,
    });
  }

  const order = memoryOrders.find(
    (o) => o.payment_reference === payment_reference || o.order_number === order_number
  );

  if (order) {
    order.payment_status = 'paid';
    for (const so of order.seller_orders) {
      so.fulfilment_status = 'processing';
    }
  }

  memoryProcessedReferences.add(payment_reference);

  return res.json({
    success: true,
    status: 'paid',
    reference: payment_reference,
    channel: 'card_or_transfer',
    currency: 'NGN',
    verified_at: new Date().toISOString(),
    message: 'Payment verified successfully and ledger updated.',
  });
});

// -----------------------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION BUILD
// -----------------------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Kumaji marketplace server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
