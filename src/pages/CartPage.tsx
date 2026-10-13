import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Store, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatKobo } from '../utils/currency';

export const CartPage: React.FC = () => {
  const { items, itemCount, subtotalKobo, removeFromCart, updateQuantity, getSellerGroups } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  const sellerGroups = getSellerGroups();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (code === 'KUMAJI10') {
      setAppliedCoupon('KUMAJI10');
      setCouponInput('');
    } else if (code === 'WELCOME5') {
      setAppliedCoupon('WELCOME5');
      setCouponInput('');
    } else {
      setCouponError('Invalid promo code. Try "KUMAJI10" for 10% off.');
    }
  };

  const discountKobo = appliedCoupon === 'KUMAJI10'
    ? Math.round(subtotalKobo * 0.1)
    : appliedCoupon === 'WELCOME5'
    ? Math.round(subtotalKobo * 0.05)
    : 0;

  // Estimated standard Lagos delivery
  const estimatedShippingKobo = items.length > 0 ? 150000 : 0;
  const finalTotalKobo = Math.max(0, subtotalKobo + estimatedShippingKobo - discountKobo);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#252525]">Your Cart is Empty</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            You haven't added any products to your cart yet. Explore our verified sellers for smartphones, fashion, and artisanal goods.
          </p>
          <Link
            to="/search"
            className="inline-block bg-[#F36B25] hover:bg-[#E05914] text-white px-6 py-3 rounded-xl text-xs font-semibold transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 border-b border-stone-200 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#252525] tracking-tight">Shopping Bag</h1>
            <p className="text-xs text-stone-500 mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} from {sellerGroups.length} independent {sellerGroups.length === 1 ? 'merchant' : 'merchants'}
            </p>
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold text-[#F36B25] hover:underline"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Items Grouped by Multi-Vendor Merchant */}
          <div className="lg:col-span-8 space-y-6">
            {sellerGroups.map((group) => (
              <div
                key={group.sellerId}
                className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs"
              >
                {/* Merchant Banner */}
                <div className="bg-stone-50/80 px-6 py-3.5 border-b border-stone-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#252525]">
                    <Store className="w-4 h-4 text-[#F36B25]" />
                    <span>Fulfilled by: {group.sellerName}</span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Subtotal: {formatKobo(group.subtotalKobo)}
                  </span>
                </div>

                {/* Items in this merchant group */}
                <div className="divide-y divide-stone-100 px-6">
                  {group.items.map((item) => (
                    <div key={item.id} className="py-5 flex gap-4 sm:gap-6 items-center">
                      <div className="w-20 h-20 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[#252525] truncate">
                          {item.title}
                        </h3>
                        {item.variant_title && (
                          <div className="text-xs text-stone-500 mt-0.5">
                            Option: {item.variant_title}
                          </div>
                        )}
                        <div className="text-xs font-bold text-[#252525] tabular-nums mt-1">
                          {formatKobo(item.unit_price_kobo)}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold tabular-nums text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.max_stock}
                          className="px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right shrink-0 min-w-[80px]">
                        <div className="text-sm font-bold text-[#252525] tabular-nums">
                          {formatKobo(item.unit_price_kobo * item.quantity)}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors mt-1 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Authoritative Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-[#252525] pb-3 border-b border-stone-100">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    {formatKobo(subtotalKobo)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-600">
                  <span>Estimated Shipping (Lagos standard):</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    {formatKobo(estimatedShippingKobo)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedCoupon}):</span>
                    <span className="tabular-nums">- {formatKobo(discountKobo)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-200 flex items-baseline justify-between text-base font-extrabold text-[#252525]">
                  <span>Total Due:</span>
                  <span className="text-xl tabular-nums tracking-tight">
                    {formatKobo(finalTotalKobo)}
                  </span>
                </div>
              </div>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyCoupon} className="pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. KUMAJI10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 border border-stone-300 rounded-xl uppercase placeholder:normal-case focus:outline-none focus:border-[#F36B25]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    ✓ Promo voucher applied!
                  </p>
                )}
              </form>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-[#F36B25] hover:bg-[#E05914] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Escrow buyer protection guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
