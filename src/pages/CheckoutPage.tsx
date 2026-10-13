import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ChevronRight,
  AlertCircle,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatKobo } from '../utils/currency';
import { NIGERIAN_STATES, getDeliveryQuote } from '../utils/delivery';
import { CustomerOrder, Address } from '../types';

export const CheckoutPage: React.FC = () => {
  const { items, subtotalKobo, clearCart, getSellerGroups } = useCart();
  const { user } = useAuth();
  const { createOrder } = useMarketplace();
  const navigate = useNavigate();

  // Shipping Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState('12 Admiralty Way, Lekki Phase 1');
  const [city, setCity] = useState('Lagos');
  const [selectedState, setSelectedState] = useState('Lagos');

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'bank_transfer' | 'cash_on_delivery'>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [idempotencyKey] = useState(() => `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  // Authoritative server-calculated pricing state
  const [serverCalculation, setServerCalculation] = useState<{
    subtotal_kobo: number;
    shipping_fee_kobo: number;
    discount_kobo: number;
    total_kobo: number;
  } | null>(null);

  const deliveryQuote = getDeliveryQuote(selectedState);
  const sellerGroups = getSellerGroups();

  // Call server calculation endpoint to verify pricing authority
  useEffect(() => {
    if (items.length === 0) return;

    fetch('/api/checkout/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        deliveryState: selectedState,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.total_kobo !== undefined) {
          setServerCalculation(data);
        }
      })
      .catch(() => {
        // Fallback calculation in integer kobo
        setServerCalculation({
          subtotal_kobo: subtotalKobo,
          shipping_fee_kobo: deliveryQuote.feeKobo,
          discount_kobo: 0,
          total_kobo: subtotalKobo + deliveryQuote.feeKobo,
        });
      });
  }, [items, selectedState, subtotalKobo, deliveryQuote.feeKobo]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-[#252525] mb-4">No items in your cart to checkout</h2>
        <Link to="/search" className="text-xs font-semibold text-[#F36B25] hover:underline">
          Return to Catalogue →
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    setIsProcessing(true);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !streetAddress.trim()) {
      setCheckoutError('Please complete all required delivery address fields.');
      setIsProcessing(false);
      return;
    }

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      user_id: user?.id || 'guest',
      full_name: fullName,
      phone,
      street_address: streetAddress,
      city,
      state: selectedState,
      is_default: true,
    };

    try {
      // Send idempotent order creation to trusted server endpoint
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotency_key: idempotencyKey,
          user_id: user?.id || 'guest',
          customer_name: fullName,
          customer_email: email,
          customer_phone: phone,
          shipping_address: shippingAddress,
          items,
          payment_method: paymentMethod,
          deliveryState: selectedState,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create order on server.');
      }

      const createdOrder: CustomerOrder = result.order;

      // In sandbox mode or card transfer, simulate trusted server payment verification
      if (paymentMethod === 'paystack' || paymentMethod === 'flutterwave') {
        // Call server payment verification endpoint
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_reference: result.payment_reference,
            order_number: createdOrder.order_number,
          }),
        });
        const verifyResult = await verifyRes.json();
        if (verifyResult.success) {
          createdOrder.payment_status = 'paid';
          createdOrder.seller_orders.forEach((so) => {
            so.fulfilment_status = 'processing';
          });
        }
      }

      // Commit to local marketplace context store
      createOrder(createdOrder);
      clearCart();

      // Navigate to order confirmation
      navigate(`/account/orders/${createdOrder.id}?confirmed=true`);
    } catch (err: any) {
      setCheckoutError(err.message || 'An error occurred during checkout processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatedShippingKobo = serverCalculation?.shipping_fee_kobo ?? deliveryQuote.feeKobo;
  const calculatedTotalKobo = serverCalculation?.total_kobo ?? (subtotalKobo + calculatedShippingKobo);

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link to="/cart" className="hover:text-[#F36B25]">
            Cart
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-900">Secure Checkout</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Shipping Information & Payment Method Form */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#252525] pb-3 border-b border-stone-100">
                <Truck className="w-4 h-4 text-[#F36B25]" />
                <span>1. Delivery Destination & Contact</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Babatunde Adeleke"
                    className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Contact Phone (for dispatch driver) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 803 123 4567"
                    className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Email Address (for receipts & tracking) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.ng"
                  className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Street Address & House / Office Number *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. Flat 4B, 15 Adeola Odeku St, Victoria Island"
                  className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    State / Territory *
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-xl p-3 bg-white focus:outline-none focus:border-[#F36B25]"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name} ({s.deliveryDaysMin}-{s.deliveryDaysMax} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    City / LGA *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Ikeja, Lekki, Maitama"
                    className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#252525] pb-3 border-b border-stone-100">
                <CreditCard className="w-4 h-4 text-[#F36B25]" />
                <span>2. Payment Gateway & Escrow Settlement</span>
              </div>

              <div className="space-y-3">
                {/* Paystack Option */}
                <label
                  className={`p-4 rounded-2xl border flex items-start justify-between cursor-pointer transition-all ${
                    paymentMethod === 'paystack'
                      ? 'border-[#F36B25] bg-[#F36B25]/5 ring-1 ring-[#F36B25]'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                      className="mt-0.5 text-[#F36B25] focus:ring-[#F36B25]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#252525] flex items-center gap-2">
                        <span>Paystack Direct (Card, Bank Transfer, USSD)</span>
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                          Verified Sandbox
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Instant payment processing via Nigeria's premier payment infrastructure. Funds held safely in escrow.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Flutterwave Option */}
                <label
                  className={`p-4 rounded-2xl border flex items-start justify-between cursor-pointer transition-all ${
                    paymentMethod === 'flutterwave'
                      ? 'border-[#F36B25] bg-[#F36B25]/5 ring-1 ring-[#F36B25]'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="flutterwave"
                      checked={paymentMethod === 'flutterwave'}
                      onChange={() => setPaymentMethod('flutterwave')}
                      className="mt-0.5 text-[#F36B25] focus:ring-[#F36B25]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#252525] flex items-center gap-2">
                        <span>Flutterwave Checkout</span>
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                          Sandbox
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Accepts cards, bank accounts, and mobile wallets across Africa.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Direct Escrow Bank Transfer */}
                <label
                  className={`p-4 rounded-2xl border flex items-start justify-between cursor-pointer transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#F36B25] bg-[#F36B25]/5 ring-1 ring-[#F36B25]'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="mt-0.5 text-[#F36B25] focus:ring-[#F36B25]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#252525] flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-stone-600" />
                        <span>Dedicated Virtual Account (Zenith / GTBank)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        A unique dynamic Nigerian bank account will be assigned to automatically verify your transfer.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {checkoutError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{checkoutError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#F36B25] hover:bg-[#E05914] text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Processing Authoritative Transaction...'
                    : `Authorize Payment (${formatKobo(calculatedTotalKobo)})`}
                </span>
              </button>
            </div>
          </form>

          {/* RIGHT: Order Review & Item Snapshots */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-[#252525] pb-3 border-b border-stone-100">
                Summary & Multi-Vendor Breakdown
              </h2>

              {/* Grouped by Seller */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {sellerGroups.map((group) => (
                  <div key={group.sellerId} className="space-y-2">
                    <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Merchant: {group.sellerName}
                    </div>
                    {group.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-xs">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-stone-900 truncate">{item.title}</div>
                          <div className="text-[11px] text-stone-500">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-bold tabular-nums text-stone-900">
                          {formatKobo(item.unit_price_kobo * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="pt-4 border-t border-stone-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    {formatKobo(subtotalKobo)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Shipping Fee to {selectedState}:</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    {formatKobo(calculatedShippingKobo)}
                  </span>
                </div>
                <div className="pt-3 border-t border-stone-200 flex items-baseline justify-between text-base font-extrabold text-[#252525]">
                  <span>Total Payable:</span>
                  <span className="text-xl tabular-nums tracking-tight text-[#F36B25]">
                    {formatKobo(calculatedTotalKobo)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kumaji Financial Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  Funds remain safely held in our marketplace escrow account until your items are physically delivered and verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
