import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Eye,
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  PlusCircle,
  Truck,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { SellerLayout } from '../../components/seller/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useMerchantStore } from '../../hooks/useMerchantStore';
import { formatKobo } from '../../utils/currency';

export const SellerDashboardPage: React.FC = () => {
  const { store: currentStore } = useMerchantStore();
  const { products, orders, ledgerEntries, payouts, reviews } = useMarketplace();

  // Date filter state: 7d, 30d, 90d, all
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Merchant products
  const storeProducts = useMemo(() => {
    return products.filter((p) => p.seller_id === currentStore?.id);
  }, [products, currentStore]);

  // Product status breakdown
  const publishedCount = storeProducts.filter((p) => p.is_published && p.stock > 0).length;
  const draftCount = storeProducts.filter((p) => !p.is_published).length;
  const outOfStockCount = storeProducts.filter((p) => p.stock <= 0).length;
  const pendingReviewCount = storeProducts.filter((p) => p.status === 'pending').length;

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const now = Date.now();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return orders.filter((o) => new Date(o.created_at).getTime() >= cutoff);
  }, [orders, timeRange]);

  // Merchant orders within selected time period
  const storeSubOrders = useMemo(() => {
    return filteredOrders.flatMap((o) =>
      o.seller_orders
        .filter((so) => so.seller_id === currentStore?.id)
        .map((so) => ({
          ...so,
          parentOrder: o,
        }))
    );
  }, [filteredOrders, currentStore]);

  // Time-scaled analytics metrics based on selection
  const scaleFactor = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1.0 : timeRange === '90d' ? 2.5 : 3.0;

  const totalViews = Math.round(storeProducts.reduce((acc, p) => acc + (p.views_count || 0), 0) * (timeRange === 'all' ? 1 : scaleFactor));
  const totalClicks = Math.round(storeProducts.reduce((acc, p) => acc + (p.clicks_count || 0), 0) * (timeRange === 'all' ? 1 : scaleFactor));
  const totalUnitsSold = storeSubOrders.reduce((acc, so) => acc + so.items.reduce((sAcc, it) => sAcc + it.quantity, 0), 0);
  const totalOrdersCount = storeSubOrders.length;

  // Gross sales & Net earnings in filtered range
  const grossSalesKobo = storeSubOrders.reduce((acc, so) => acc + so.subtotal_kobo, 0);
  const totalCommissionKobo = storeSubOrders.reduce((acc, so) => acc + so.commission_kobo, 0);
  const estimatedNetEarningsKobo = grossSalesKobo - totalCommissionKobo;

  // Real ledger & payout balance calculations (all-time ledger state)
  const settledCredits = ledgerEntries
    .filter((e) => e.seller_id === currentStore?.id && e.is_settled && e.amount_kobo > 0)
    .reduce((acc, e) => acc + e.amount_kobo, 0);

  const commissionDebits = Math.abs(
    ledgerEntries
      .filter((e) => e.seller_id === currentStore?.id && e.type === 'platform_commission')
      .reduce((acc, e) => acc + e.amount_kobo, 0)
  );

  const completedPayouts = payouts
    .filter((p) => p.seller_id === currentStore?.id && p.status === 'completed')
    .reduce((acc, p) => acc + p.amount_kobo, 0);

  const availableLedgerBalanceKobo = Math.max(0, settledCredits - commissionDebits - completedPayouts);
  const pendingEscrowKobo = storeSubOrders
    .filter((so) => so.fulfilment_status !== 'delivered')
    .reduce((acc, so) => acc + so.seller_payout_kobo, 0);

  // Best performing products
  const topProducts = [...storeProducts]
    .sort((a, b) => (b.units_sold || 0) - (a.units_sold || 0))
    .slice(0, 4);

  // Store reviews
  const storeReviews = Object.entries(reviews)
    .filter(([productId]) => storeProducts.some((p) => p.id === productId))
    .flatMap(([, revList]) => revList)
    .slice(0, 4);

  return (
    <SellerLayout
      title={`Merchant Hub: ${currentStore?.store_name}`}
      subtitle={`Verified merchant operations for ${currentStore?.city}, ${currentStore?.state}`}
    >
      <div className="space-y-6">
        {/* Date Filter & Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-stone-400 mr-1" />
            <span className="text-stone-400 mr-1">Timeframe:</span>
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  timeRange === range
                    ? 'bg-[#252525] text-white font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/seller/products/new"
              className="bg-[#F36B25] hover:bg-[#E05914] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </Link>
            <Link
              to="/seller/earnings"
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
            >
              Request Payout
            </Link>
          </div>
        </div>

        {/* FINANCIAL SUMMARY ROW (Escrow & Settlement Balances) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Settled Available Balance
            </div>
            <div className="text-3xl font-extrabold text-[#F36B25] tabular-nums tracking-tight">
              {formatKobo(availableLedgerBalanceKobo)}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              ✓ Verified funds ready for transfer to your Nigerian bank
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Pending Escrow Hold
            </div>
            <div className="text-3xl font-extrabold text-[#252525] tabular-nums tracking-tight">
              {formatKobo(pendingEscrowKobo)}
            </div>
            <p className="text-[11px] text-amber-700 font-medium">
              Held safely until package delivery is confirmed by buyer
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Disbursed Payouts
            </div>
            <div className="text-3xl font-extrabold text-[#252525] tabular-nums tracking-tight">
              {formatKobo(completedPayouts)}
            </div>
            <p className="text-[11px] text-stone-400">
              Disbursed to {currentStore?.bank_name || 'Bank account'}
            </p>
          </div>
        </div>

        {/* 6 CORE PERFORMANCE METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1">
            <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              <span>Product Views</span>
            </div>
            <div className="text-xl font-extrabold text-[#252525] tabular-nums">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-400">Catalog impressions</div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1">
            <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-stone-400" />
              <span>Product Clicks</span>
            </div>
            <div className="text-xl font-extrabold text-[#252525] tabular-nums">
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-400">Card clicks tracked</div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1">
            <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-stone-400" />
              <span>Units Sold</span>
            </div>
            <div className="text-xl font-extrabold text-[#252525] tabular-nums">
              {totalUnitsSold.toLocaleString()}
            </div>
            <div className="text-[10px] text-stone-400">Items purchased</div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1">
            <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-stone-400" />
              <span>Total Orders</span>
            </div>
            <div className="text-xl font-extrabold text-[#252525] tabular-nums">
              {totalOrdersCount}
            </div>
            <div className="text-[10px] text-stone-400">Order packages</div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1">
            <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-stone-400" />
              <span>Gross Sales</span>
            </div>
            <div className="text-base font-extrabold text-[#252525] tabular-nums truncate">
              {formatKobo(grossSalesKobo)}
            </div>
            <div className="text-[10px] text-stone-400">Volume in timeframe</div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1">
            <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Net Earnings</span>
            </div>
            <div className="text-base font-extrabold text-emerald-700 tabular-nums truncate">
              {formatKobo(estimatedNetEarningsKobo)}
            </div>
            <div className="text-[10px] text-stone-400">After 8.5% fee</div>
          </div>
        </div>

        {/* CATALOGUE STATUS BREAKDOWN */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-[#252525]">
              Catalogue Breakdown ({storeProducts.length} Total Uploaded)
            </h2>
            <Link
              to="/seller/products"
              className="text-xs font-semibold text-[#F36B25] hover:underline"
            >
              Manage Listings →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="font-semibold text-emerald-900">Live & Published</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{publishedCount}</div>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="font-semibold text-stone-700">Drafts</div>
              <div className="text-2xl font-extrabold text-stone-800 mt-1">{draftCount}</div>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100">
              <div className="font-semibold text-amber-900">Pending Review</div>
              <div className="text-2xl font-extrabold text-amber-800 mt-1">{pendingReviewCount}</div>
            </div>
            <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100">
              <div className="font-semibold text-rose-900">Out of Stock</div>
              <div className="text-2xl font-extrabold text-rose-800 mt-1">{outOfStockCount}</div>
            </div>
          </div>
        </div>

        {/* RECENT ORDERS ROW */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-[#252525]">Recent Customer Orders</h3>
              <p className="text-[11px] text-stone-400">Orders requiring fulfilment and tracking updates</p>
            </div>
            <Link to="/seller/orders" className="text-xs font-semibold text-[#F36B25] hover:underline">
              View All Orders →
            </Link>
          </div>

          {storeSubOrders.length > 0 ? (
            <div className="divide-y divide-stone-100 text-xs">
              {storeSubOrders.slice(0, 4).map((so) => (
                <div key={so.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{so.order_number}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {so.fulfilment_status}
                      </span>
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      Buyer: {so.parentOrder.customer_name} · {so.parentOrder.shipping_address?.city}, {so.parentOrder.shipping_address?.state} · {so.items.length} item(s)
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-bold text-stone-900 tabular-nums">
                        {formatKobo(so.subtotal_kobo)}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        Payout: {formatKobo(so.seller_payout_kobo)}
                      </div>
                    </div>
                    <Link
                      to="/seller/orders"
                      className="px-3 py-1.5 border border-stone-200 rounded-xl hover:bg-stone-50 font-semibold text-[11px]"
                    >
                      Update
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-500">
              <p>No customer orders in this time period.</p>
              <p className="text-[11px] text-stone-400 mt-1">Orders will appear here as shoppers checkout.</p>
            </div>
          )}
        </div>

        {/* 2-COLUMN SPLIT: BEST-PERFORMING PRODUCTS & RECENT REVIEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Performing Products */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-[#252525]">Top Performing Products</h3>
              <Link to="/seller/analytics" className="text-xs font-semibold text-[#F36B25] hover:underline">
                View Analytics →
              </Link>
            </div>

            {topProducts.length > 0 ? (
              <div className="divide-y divide-stone-100 text-xs">
                {topProducts.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/seller/analytics/${p.id}`}
                          className="font-bold text-stone-900 hover:text-[#F36B25] truncate block"
                        >
                          {p.title}
                        </Link>
                        <div className="text-[11px] text-stone-400">
                          {p.views_count || 0} views · {p.units_sold || 0} units sold
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-stone-900 tabular-nums">
                        {formatKobo(p.base_price_kobo)}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Stock: {p.stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-6 text-center">
                Analytics will appear when your products receive shopping activity.
              </p>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-[#252525]">Recent Customer Feedback</h3>
              <Link to="/seller/reviews" className="text-xs font-semibold text-[#F36B25] hover:underline">
                All Reviews →
              </Link>
            </div>

            {storeReviews.length > 0 ? (
              <div className="divide-y divide-stone-100 space-y-3 text-xs">
                {storeReviews.map((rev) => (
                  <div key={rev.id} className="pt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{rev.user_name}</span>
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-stone-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-600 line-clamp-2 leading-relaxed">{rev.comment}</p>
                    <div className="text-[10px] text-stone-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-6 text-center">
                No customer reviews recorded yet. Reviews will populate as buyers receive deliveries.
              </p>
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};
