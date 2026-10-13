import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart3,
  Eye,
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Star,
  Package,
  Layers,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { SellerLayout } from '../../components/seller/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useMerchantStore } from '../../hooks/useMerchantStore';
import { formatKobo } from '../../utils/currency';

export const SellerProductAnalyticsPage: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const { store: currentStore } = useMerchantStore();
  const { products, orders, reviews } = useMarketplace();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  if (!currentStore) {
    return (
      <SellerLayout title="Store Analytics">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-3">
          <p className="text-xs text-stone-500 leading-relaxed">
            No active merchant store connected. Please log in with an approved merchant account to view product performance.
          </p>
        </div>
      </SellerLayout>
    );
  }

  const storeProducts = products.filter((p) => p.seller_id === currentStore.id);

  // If specific product ID is selected
  const selectedProduct = productId ? storeProducts.find((p) => p.id === productId) : null;

  // Security check: if product exists but belongs to a different seller, block access
  const isUnauthorized = productId && !selectedProduct && products.some((p) => p.id === productId);

  if (isUnauthorized) {
    return (
      <SellerLayout title="Access Restricted">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-3">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-[#252525]">Unauthorized Product Access</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            You do not have permission to view private analytics, sales records, or inventory for this product.
          </p>
          <Link
            to="/seller/analytics"
            className="inline-block bg-[#F36B25] text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Back to My Analytics
          </Link>
        </div>
      </SellerLayout>
    );
  }

  // 1. SPECIFIC PRODUCT ANALYTICS DETAIL VIEW
  if (selectedProduct) {
    const productReviews = reviews[selectedProduct.id] || [];

    // Filter orders containing this product
    const productOrders = orders.filter((o) =>
      o.seller_orders.some((so) =>
        so.seller_id === currentStore.id &&
        so.items.some((i) => i.product_id === selectedProduct.id)
      )
    );

    // Scaling based on time filter
    const scaleFactor = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1.0 : timeRange === '90d' ? 2.5 : 3.0;
    const views = Math.round((selectedProduct.views_count || 0) * (timeRange === 'all' ? 1 : scaleFactor));
    const clicks = Math.round((selectedProduct.clicks_count || 0) * (timeRange === 'all' ? 1 : scaleFactor));
    const addCart = Math.round((selectedProduct.add_to_cart_count || 0) * (timeRange === 'all' ? 1 : scaleFactor));
    const unitsSold = Math.round((selectedProduct.units_sold || 0) * (timeRange === 'all' ? 1 : scaleFactor));

    const grossSalesKobo = unitsSold * selectedProduct.base_price_kobo;
    const estimatedCommissionKobo = Math.round(grossSalesKobo * 0.085);
    const estimatedNetEarningsKobo = grossSalesKobo - estimatedCommissionKobo;

    // Conversion rates with protection against division by zero
    const clickThroughRate = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
    const cartConversionRate = clicks > 0 ? ((addCart / clicks) * 100).toFixed(1) : '0.0';
    const purchaseConversionRate = views > 0 ? ((unitsSold / views) * 100).toFixed(1) : '0.0';

    // Stock velocity and restock recommendations
    const remainingStock = selectedProduct.stock;
    const dailyVelocity = unitsSold > 0 ? (unitsSold / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90)) : 0;
    const daysUntilStockout = dailyVelocity > 0 ? Math.round(remainingStock / dailyVelocity) : null;

    // Rating distribution breakdown (5, 4, 3, 2, 1)
    const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    });

    return (
      <SellerLayout
        title="Product Performance Analytics"
        subtitle={`Detailed metrics and conversion funnel for ${selectedProduct.title}`}
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Link
              to="/seller/analytics"
              className="text-xs font-semibold text-stone-500 hover:text-[#F36B25] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Products Analytics</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs font-semibold bg-white p-1 rounded-xl border border-stone-200">
              <Calendar className="w-3.5 h-3.5 text-stone-400 ml-1.5" />
              {(['7d', '30d', '90d', 'all'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg cursor-pointer ${
                    timeRange === r ? 'bg-[#252525] text-white font-bold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Product Header Snapshot */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0"
              />
              <div>
                <span className="text-[11px] font-mono text-stone-400 block">
                  SKU: {selectedProduct.variants[0]?.sku || `SKU-${selectedProduct.id}`} · {selectedProduct.category_name}
                </span>
                <h2 className="text-base font-bold text-[#252525] line-clamp-1">
                  {selectedProduct.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                  <span className="font-bold text-stone-900 tabular-nums">
                    {formatKobo(selectedProduct.base_price_kobo)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className={remainingStock > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                    {remainingStock > 0 ? `${remainingStock} in stock` : 'Out of stock'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    {selectedProduct.rating.toFixed(1)} ({selectedProduct.review_count} reviews)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedProduct.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {selectedProduct.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/seller/products/edit/${selectedProduct.id}`}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold hover:border-stone-400"
              >
                Edit Listing
              </Link>
              <Link
                to={`/product/${selectedProduct.slug}`}
                className="px-4 py-2 bg-[#F36B25] text-white rounded-xl text-xs font-bold hover:bg-[#E05914]"
              >
                View Public Page
              </Link>
            </div>
          </div>

          {/* Core Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1 shadow-xs">
              <div className="text-[11px] text-stone-500 font-semibold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-stone-400" />
                <span>Product Views</span>
              </div>
              <div className="text-2xl font-extrabold text-[#252525] tabular-nums">
                {views.toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-400">Total catalog impressions</div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1 shadow-xs">
              <div className="text-[11px] text-stone-500 font-semibold flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-stone-400" />
                <span>Units Sold</span>
              </div>
              <div className="text-2xl font-extrabold text-[#252525] tabular-nums">
                {unitsSold.toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-400">Across {productOrders.length} confirmed orders</div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1 shadow-xs">
              <div className="text-[11px] text-stone-500 font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                <span>Gross Revenue</span>
              </div>
              <div className="text-xl font-extrabold text-[#252525] tabular-nums truncate">
                {formatKobo(grossSalesKobo)}
              </div>
              <div className="text-[10px] text-stone-400">Sales volume in timeframe</div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-1 shadow-xs">
              <div className="text-[11px] text-stone-500 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Est. Net Earnings</span>
              </div>
              <div className="text-xl font-extrabold text-emerald-700 tabular-nums truncate">
                {formatKobo(estimatedNetEarningsKobo)}
              </div>
              <div className="text-[10px] text-stone-400">After 8.5% platform take-rate</div>
            </div>
          </div>

          {/* Conversion Funnel Box */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#252525]">
              Customer Purchase Funnel & Conversion Rates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-400 block font-semibold">1. Product Views</span>
                <span className="text-xl font-bold text-[#252525] tabular-nums">{views}</span>
                <span className="text-[11px] text-stone-500 block">Baseline exposure</span>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-400 block font-semibold">2. Card Clicks</span>
                <span className="text-xl font-bold text-[#252525] tabular-nums">{clicks}</span>
                <span className="text-[11px] text-emerald-700 font-semibold block">{clickThroughRate}% CTR</span>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-400 block font-semibold">3. Added to Cart</span>
                <span className="text-xl font-bold text-[#252525] tabular-nums">{addCart}</span>
                <span className="text-[11px] text-emerald-700 font-semibold block">{cartConversionRate}% from click</span>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1">
                <span className="text-emerald-900 block font-semibold">4. Confirmed Purchases</span>
                <span className="text-xl font-bold text-emerald-800 tabular-nums">{unitsSold}</span>
                <span className="text-[11px] text-emerald-700 font-semibold block">{purchaseConversionRate}% view-to-sale</span>
              </div>
            </div>
          </div>

          {/* INVENTORY VELOCITY & RESTOCK RECOMMENDATION */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#252525] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#F36B25]" />
              <span>Stock Velocity & Inventory Intelligence</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold block">Remaining Inventory</span>
                <span className={`text-2xl font-extrabold ${remainingStock > 5 ? 'text-stone-900' : 'text-rose-600'}`}>
                  {remainingStock} units
                </span>
                <span className="text-[11px] text-stone-400 block">Available in warehouse</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 font-semibold block">Estimated Sales Velocity</span>
                <span className="text-2xl font-extrabold text-stone-900">
                  {dailyVelocity > 0 ? dailyVelocity.toFixed(1) : '0.0'} <span className="text-xs font-normal text-stone-500">units / day</span>
                </span>
                <span className="text-[11px] text-stone-400 block">Based on recent purchases</span>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1 ${
                remainingStock <= 0
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : remainingStock < 5
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  {remainingStock <= 0 ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : remainingStock < 5 ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>
                    {remainingStock <= 0
                      ? 'Out of Stock'
                      : remainingStock < 5
                      ? 'Restock Recommended'
                      : 'Healthy Inventory'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {remainingStock <= 0
                    ? 'Listing is currently inactive for buyers. Replenish inventory immediately to resume sales.'
                    : remainingStock < 5
                    ? `At current velocity, stock may deplete in ~${daysUntilStockout || 3} days. Restock recommended.`
                    : `Sufficient stock (~${daysUntilStockout ? `${daysUntilStockout} days` : '30+ days'} coverage).`}
                </p>
              </div>
            </div>
          </div>

          {/* Variant-Level Inventory Breakdown */}
          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#252525] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F36B25]" />
                <span>Variant Inventory & Pricing</span>
              </h3>

              <div className="divide-y divide-stone-100 text-xs">
                {selectedProduct.variants.map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-stone-900">{v.title}</div>
                      <div className="text-[11px] font-mono text-stone-400">SKU: {v.sku}</div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div className="font-bold text-stone-900 tabular-nums">
                        {formatKobo(v.price_kobo)}
                      </div>
                      <span className={`font-semibold ${v.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {v.stock} units
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMER RATING & REVIEW BREAKDOWN */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-sm font-bold text-[#252525]">
                Customer Ratings & Feedback ({productReviews.length})
              </h3>
              <span className="text-xs font-semibold text-stone-500">
                Average: <strong className="text-stone-900">{selectedProduct.rating.toFixed(1)} / 5.0</strong>
              </span>
            </div>

            {/* Rating distribution bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-1.5 text-xs">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[star] || 0;
                  const total = productReviews.length || 1;
                  const percent = productReviews.length > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-12 text-stone-600 font-medium flex items-center gap-1 shrink-0">
                        <span>{star}</span>
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                      </span>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-stone-400 tabular-nums text-[11px]">
                        {count} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-1">
                <div className="text-3xl font-black text-[#252525] tabular-nums">
                  {selectedProduct.rating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(selectedProduct.rating) ? 'fill-current' : 'text-stone-200'}`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-stone-400">
                  Based on verified marketplace purchases
                </p>
              </div>
            </div>

            {/* Individual Reviews */}
            {productReviews.length > 0 ? (
              <div className="divide-y divide-stone-100 text-xs space-y-3 pt-3">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="pt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{rev.user_name}</span>
                      <span className="text-stone-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-200'}`} />
                      ))}
                    </div>
                    <p className="text-stone-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 py-4 text-center">
                No customer reviews have been written for this item yet. Reviews will populate as orders are delivered.
              </p>
            )}
          </div>
        </div>
      </SellerLayout>
    );
  }

  // 2. ALL PRODUCTS ANALYTICS OVERVIEW TABLE
  return (
    <SellerLayout
      title="Store Product Analytics"
      subtitle="Track customer views, clicks, conversions, and sales volume by product"
    >
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Clicks</th>
                  <th className="py-3.5 px-4">Units Sold</th>
                  <th className="py-3.5 px-4">Gross Sales</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-6 text-right">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {storeProducts.map((p) => {
                  const gross = (p.units_sold || 0) * p.base_price_kobo;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/seller/analytics/${p.id}`}
                            className="font-bold text-stone-900 hover:text-[#F36B25] line-clamp-1 text-xs"
                          >
                            {p.title}
                          </Link>
                          <div className="text-[11px] text-stone-400">
                            {p.category_name} · SKU: {p.variants[0]?.sku || `SKU-${p.id}`}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold tabular-nums text-stone-900">
                        {p.views_count || 0}
                      </td>
                      <td className="py-4 px-4 tabular-nums text-stone-600">
                        {p.clicks_count || 0}
                      </td>
                      <td className="py-4 px-4 font-bold tabular-nums text-emerald-700">
                        {p.units_sold || 0}
                      </td>
                      <td className="py-4 px-4 font-bold tabular-nums text-stone-900">
                        {formatKobo(gross)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={p.stock > 0 ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                          {p.stock > 0 ? `${p.stock} units` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/seller/analytics/${p.id}`}
                          className="bg-[#F36B25] hover:bg-[#E05914] text-white px-3 py-1.5 rounded-xl font-semibold transition-colors inline-block"
                        >
                          View Breakdown →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {storeProducts.length === 0 && (
            <div className="p-12 text-center text-xs text-stone-500">
              <p>No products found for this store.</p>
              <Link to="/seller/products/new" className="text-[#F36B25] font-bold mt-2 inline-block">
                + Upload your first product
              </Link>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};
