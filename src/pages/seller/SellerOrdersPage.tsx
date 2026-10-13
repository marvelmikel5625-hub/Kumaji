import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle2, Clock, ChevronRight, Package, X } from 'lucide-react';
import { SellerLayout } from '../../components/seller/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useMerchantStore } from '../../hooks/useMerchantStore';
import { formatKobo } from '../../utils/currency';
import { FulfilmentStatus } from '../../types';

export const SellerOrdersPage: React.FC = () => {
  const { store: currentStore } = useMerchantStore();
  const { orders, updateFulfilmentStatus } = useMarketplace();

  const [activeModalOrder, setActiveModalOrder] = useState<any | null>(null);
  const [courierName, setCourierName] = useState('GIG Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [targetStatus, setTargetStatus] = useState<FulfilmentStatus>('shipped');

  // Find all sub-orders that belong to this seller
  const sellerSubOrders = orders.flatMap((order) =>
    order.seller_orders
      .filter((so) => so.seller_id === currentStore?.id)
      .map((so) => ({
        ...so,
        parentOrder: order,
      }))
  );

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalOrder) return;

    updateFulfilmentStatus(
      activeModalOrder.id,
      targetStatus,
      trackingNumber.trim() || undefined,
      courierName.trim() || undefined
    );

    setActiveModalOrder(null);
    setTrackingNumber('');
  };

  return (
    <SellerLayout
      title="Merchant Fulfilment Orders"
      subtitle="Dispatch items within 24–48 hours to maintain high merchant quality rating"
    >
      <div className="space-y-6">
        {sellerSubOrders.length > 0 ? (
          <div className="space-y-4">
            {sellerSubOrders.map((so) => (
              <div
                key={so.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#252525]">{so.order_number}</span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        so.fulfilment_status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700'
                          : so.fulfilment_status === 'shipped'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {so.fulfilment_status}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      Customer: {so.parentOrder.customer_name} ({so.parentOrder.customer_phone}) · {so.parentOrder.shipping_address?.city}, {so.parentOrder.shipping_address?.state}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[11px] text-stone-400">Net Merchant Payout</div>
                      <div className="text-sm font-bold text-emerald-700 tabular-nums">
                        {formatKobo(so.seller_payout_kobo)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalOrder(so);
                        setTargetStatus(so.fulfilment_status === 'pending' ? 'processing' : 'shipped');
                      }}
                      className="bg-[#F36B25] hover:bg-[#E05914] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Update Status
                    </button>
                  </div>
                </div>

                {/* Items in this sub-order */}
                <div className="divide-y divide-stone-100 text-xs">
                  {so.items.map((item, idx) => (
                    <div key={`${item.product_id}-${idx}`} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.product_title} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900">{item.product_title}</div>
                          {item.variant_title && (
                            <div className="text-[11px] text-stone-500">{item.variant_title}</div>
                          )}
                          <div className="text-[11px] text-stone-400 font-mono">
                            SKU: {item.sku} · Qty: {item.quantity}
                          </div>
                        </div>
                      </div>

                      <div className="font-bold text-stone-900 tabular-nums">
                        {formatKobo(item.line_total_kobo || item.unit_price_kobo * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Courier info if shipped */}
                {so.tracking_number && (
                  <div className="pt-2 flex items-center gap-2 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <Truck className="w-4 h-4 text-[#F36B25]" />
                    <span>
                      Courier: <strong>{so.courier_name}</strong> · Tracking ID: <strong>{so.tracking_number}</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-xs text-stone-500 space-y-2">
            <Package className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-semibold text-stone-700">No orders assigned to your store yet.</p>
            <p className="text-stone-400">Customer orders will appear here automatically when shoppers complete checkout.</p>
          </div>
        )}

        {/* Modal for updating fulfilment */}
        {activeModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setActiveModalOrder(null)}
            />
            <div className="relative bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl z-50 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h3 className="font-bold text-sm text-[#252525]">
                  Update Order: {activeModalOrder.order_number}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModalOrder(null)}
                  className="p-1 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    New Fulfilment Status *
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as FulfilmentStatus)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing & Packaged</option>
                    <option value="shipped">Handed Over to Courier (Shipped)</option>
                    <option value="delivered">Delivered to Buyer (Escrow Release)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. GIG Logistics, Red Star Express"
                    className="w-full p-2.5 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Courier Waybill / Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. GIG-LOS-992819"
                    className="w-full p-2.5 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalOrder(null)}
                    className="px-4 py-2 border border-stone-300 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F36B25] text-white rounded-xl font-bold hover:bg-[#E05914]"
                  >
                    Confirm Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};
