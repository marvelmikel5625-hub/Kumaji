import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Store,
  ChevronRight,
  MapPin,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { formatKobo } from '../../utils/currency';
import { FulfilmentStatus } from '../../types';

export const OrdersPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isConfirmed = searchParams.get('confirmed') === 'true';

  const { orders } = useMarketplace();
  const { user } = useAuth();

  // If specific order ID is requested, render Order Detail View
  if (id) {
    const order = orders.find((o) => o.id === id);

    if (!order) {
      return (
        <div className="min-h-screen bg-[#FBFBFB] py-16 px-4 text-center">
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-stone-200">
            <h2 className="text-lg font-bold text-[#252525] mb-2">Order Not Found</h2>
            <p className="text-xs text-stone-500 mb-6">
              The requested order reference could not be located in your account.
            </p>
            <Link
              to="/account/orders"
              className="bg-[#F36B25] text-white px-5 py-2.5 rounded-xl text-xs font-semibold"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FBFBFB] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-stone-500">
            <Link to="/account" className="hover:text-[#F36B25]">
              Account
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/account/orders" className="hover:text-[#F36B25]">
              Orders
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-stone-900">{order.order_number}</span>
          </nav>

          {/* Newly Confirmed Celebration Banner */}
          {isConfirmed && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-emerald-900 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-bold text-emerald-950">
                  Payment Confirmed — Order #{order.order_number} Placed!
                </h2>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Your payment has been verified and settled into our marketplace escrow. The independent merchants have received your order details and are preparing packages for dispatch.
                </p>
              </div>
            </div>
          )}

          {/* Header Summary */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-stone-500 font-medium">Order Number:</div>
              <h1 className="text-2xl font-extrabold text-[#252525] tracking-tight">
                {order.order_number}
              </h1>
              <div className="text-xs text-stone-500 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                {new Date(order.created_at).toLocaleTimeString()}
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-xs text-stone-500 font-medium">Total Paid:</div>
              <div className="text-2xl font-extrabold text-[#252525] tabular-nums text-[#F36B25]">
                {formatKobo(order.total_kobo)}
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5 flex sm:justify-end items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Escrow Protected</span>
              </div>
            </div>
          </div>

          {/* Multi-Vendor Fulfilment Packages */}
          <div className="space-y-6">
            <h2 className="text-base font-bold text-[#252525]">
              Merchant Packages ({order.seller_orders.length})
            </h2>

            {order.seller_orders.map((so, idx) => {
              const statusStep =
                so.fulfilment_status === 'delivered'
                  ? 4
                  : so.fulfilment_status === 'shipped'
                  ? 3
                  : so.fulfilment_status === 'processing'
                  ? 2
                  : 1;

              return (
                <div
                  key={so.id || idx}
                  className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-6"
                >
                  {/* Seller Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#F36B25]" />
                      <span className="text-sm font-bold text-[#252525]">
                        Package {idx + 1} from {so.seller_name}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 font-medium">
                      Status:{' '}
                      <span className="font-bold uppercase tracking-wider text-stone-800">
                        {so.fulfilment_status}
                      </span>
                    </div>
                  </div>

                  {/* Visual Timeline Tracking */}
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="space-y-1.5">
                        <div
                          className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                            statusStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          1
                        </div>
                        <span className="font-semibold text-stone-800 block text-[11px]">Placed</span>
                      </div>

                      <div className="space-y-1.5">
                        <div
                          className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                            statusStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          2
                        </div>
                        <span className="font-semibold text-stone-800 block text-[11px]">Processing</span>
                      </div>

                      <div className="space-y-1.5">
                        <div
                          className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                            statusStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          3
                        </div>
                        <span className="font-semibold text-stone-800 block text-[11px]">In Transit</span>
                      </div>

                      <div className="space-y-1.5">
                        <div
                          className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                            statusStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          4
                        </div>
                        <span className="font-semibold text-stone-800 block text-[11px]">Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Courier Tracking Info if shipped */}
                  {so.tracking_number && (
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 text-stone-700">
                        <Truck className="w-4 h-4 text-[#F36B25]" />
                        <span>
                          Courier: <strong className="text-stone-900">{so.courier_name || 'GIG Logistics'}</strong>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Tracking Ref: <strong className="font-mono text-stone-900">{so.tracking_number}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700">Live Transit Updates</span>
                    </div>
                  )}

                  {/* Items in this package */}
                  <div className="divide-y divide-stone-100">
                    {so.items.map((item, i) => (
                      <div key={i} className="py-3 flex items-center gap-4 text-xs">
                        <img
                          src={item.image_url}
                          alt={item.product_title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-900 truncate">{item.product_title}</h4>
                          {item.variant_title && (
                            <div className="text-[11px] text-stone-500">Option: {item.variant_title}</div>
                          )}
                          <div className="text-[11px] text-stone-500 font-mono">
                            Qty: {item.quantity} × {formatKobo(item.unit_price_kobo)}
                          </div>
                        </div>
                        <div className="font-bold text-stone-900 tabular-nums">
                          {formatKobo(item.line_total_kobo)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Destination & Contact Details */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs">
            <h3 className="text-sm font-bold text-[#252525] pb-3 border-b border-stone-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F36B25]" />
              <span>Delivery Address & Recipient</span>
            </h3>

            <div className="pt-3 text-xs text-stone-600 space-y-1">
              <div className="font-bold text-stone-900">{order.customer_name}</div>
              <div>{order.shipping_address?.street_address}</div>
              <div>
                {order.shipping_address?.city}, {order.shipping_address?.state}
              </div>
              <div className="text-stone-500 pt-1">
                Phone: {order.customer_phone} · Email: {order.customer_email}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, list all orders
  const myOrders = orders.filter((o) => o.user_id === user?.id || user?.role === 'customer');

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-6 border-b border-stone-200 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#252525]">My Order History</h1>
            <p className="text-xs text-stone-500 mt-1">
              View and track all items purchased across Kumaji verified merchants
            </p>
          </div>
          <Link to="/search" className="text-xs font-semibold text-[#F36B25] hover:underline">
            Explore Catalogue →
          </Link>
        </div>

        {myOrders.length > 0 ? (
          <div className="space-y-4">
            {myOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-[#252525]">{ord.order_number}</span>
                    <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium uppercase">
                      {ord.payment_status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500">
                    Placed {new Date(ord.created_at).toLocaleDateString()} · {ord.seller_orders.length} merchant shipment(s)
                  </div>
                  <div className="text-xs text-stone-600 font-medium">
                    Destination: {ord.shipping_address?.city}, {ord.shipping_address?.state}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-stone-100">
                  <div className="text-right">
                    <div className="text-xs text-stone-400">Total</div>
                    <div className="text-base font-bold text-[#252525] tabular-nums">
                      {formatKobo(ord.total_kobo)}
                    </div>
                  </div>

                  <Link
                    to={`/account/orders/${ord.id}`}
                    className="bg-[#F36B25] hover:bg-[#E05914] text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>View Tracking</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-[#252525]">No Orders Recorded</h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              When you purchase items from our verified sellers, your orders and tracking timelines will appear here.
            </p>
            <Link
              to="/search"
              className="inline-block bg-[#F36B25] text-white px-5 py-2.5 rounded-xl text-xs font-semibold"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
