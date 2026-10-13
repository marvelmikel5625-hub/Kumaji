import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, ChevronRight, ShieldCheck, MapPin } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatKobo } from '../../utils/currency';

export const AdminOrdersPage: React.FC = () => {
  const { orders } = useMarketplace();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      o.payment_reference.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link to="/admin" className="hover:text-[#F36B25]">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-900">Orders Audit</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#252525]">Platform Orders & Fulfilments</h1>
            <p className="text-xs text-stone-500 mt-1">
              Audit customer parent transactions and independent merchant fulfillment status
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search order #, customer, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-[#F36B25]"
            />
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-base text-[#252525]">
                        {ord.order_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          ord.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Customer: {ord.customer_name} ({ord.customer_email} · {ord.customer_phone})
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-sm font-extrabold text-[#252525] tabular-nums">
                      {formatKobo(ord.total_kobo)}
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                      Ref: {ord.payment_reference}
                    </div>
                  </div>
                </div>

                {/* Sub-orders */}
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-stone-700">Merchant Shipments:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ord.seller_orders.map((so, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-stone-900">{so.seller_name}</div>
                          <div className="text-[11px] text-stone-500">
                            {so.items.length} item(s) · Net: {formatKobo(so.seller_payout_kobo)} (Comm: {formatKobo(so.commission_kobo)})
                          </div>
                          {so.tracking_number && (
                            <div className="text-[11px] text-stone-600 font-mono mt-0.5">
                              {so.courier_name}: {so.tracking_number}
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-stone-200">
                          {so.fulfilment_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    Destination: {ord.shipping_address?.street_address}, {ord.shipping_address?.city}, {ord.shipping_address?.state}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-xs text-stone-500">
            No orders match the current search query.
          </div>
        )}
      </div>
    </div>
  );
};
