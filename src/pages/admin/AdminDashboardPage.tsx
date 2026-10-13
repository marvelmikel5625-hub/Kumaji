import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Package,
  Store,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatKobo } from '../../utils/currency';

export const AdminDashboardPage: React.FC = () => {
  const { products, sellers, applications, orders, ledgerEntries, payouts } = useMarketplace();

  // Metrics derived from actual store data
  const gmvKobo = orders.reduce((acc, o) => acc + o.total_kobo, 0);

  const platformCommissionKobo = ledgerEntries
    .filter((e) => e.type === 'platform_commission')
    .reduce((acc, e) => acc + Math.abs(e.amount_kobo), 0);

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const pendingPayouts = payouts.filter((p) => p.status === 'pending');

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-[#252525] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F36B25] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Administration & Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Kumaji Platform Operations
            </h1>
            <p className="text-xs text-stone-300 mt-1">
              Central marketplace authority for Nigeria operations and escrow settlement
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/sellers"
              className="bg-[#F36B25] hover:bg-[#E05914] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              Review Applications ({pendingApps.length})
            </Link>
            <Link
              to="/admin/finance"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            >
              Finance & Payouts
            </Link>
          </div>
        </div>

        {/* 4 Real Metric KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Gross Merchandise Value (GMV)
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#252525] tabular-nums tracking-tight">
              {formatKobo(gmvKobo)}
            </div>
            <div className="text-[11px] text-stone-400">Total customer orders placed</div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Platform Commission Revenue
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums tracking-tight">
              {formatKobo(platformCommissionKobo)}
            </div>
            <div className="text-[11px] text-stone-400">Standard 8.5% take rate</div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Verified Merchants
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#252525] tabular-nums tracking-tight">
              {sellers.length}
            </div>
            <div className="text-[11px] text-amber-700 font-medium">
              {pendingApps.length} pending application(s)
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Active Catalogue Items
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#252525] tabular-nums tracking-tight">
              {products.length}
            </div>
            <div className="text-[11px] text-stone-400">Across 7 departments</div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/admin/sellers"
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#F36B25] hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-sm text-[#252525]">Seller Approvals</div>
              <div className="text-xs text-stone-500">{pendingApps.length} awaiting review</div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/admin/products"
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#F36B25] hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-sm text-[#252525]">Catalogue Moderation</div>
              <div className="text-xs text-stone-500">Quality & compliance</div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/admin/orders"
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#F36B25] hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-sm text-[#252525]">Orders Audit</div>
              <div className="text-xs text-stone-500">Track shipments & escrow</div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </Link>

          <Link
            to="/admin/finance"
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#F36B25] hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-sm text-[#252525]">Financial Settlement</div>
              <div className="text-xs text-stone-500">{pendingPayouts.length} payout(s) queued</div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </Link>
        </div>

        {/* Urgent Action Items: Pending Applications */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-base font-bold text-[#252525] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F36B25]" />
              <span>Pending Merchant Registrations</span>
            </h2>
            <Link to="/admin/sellers" className="text-xs font-semibold text-[#F36B25] hover:underline">
              View All Applications →
            </Link>
          </div>

          {pendingApps.length > 0 ? (
            <div className="divide-y divide-stone-100 text-xs">
              {pendingApps.map((app) => (
                <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-stone-900 text-sm">{app.business_name}</div>
                    <div className="text-stone-500 mt-0.5">
                      {app.business_type} · {app.city}, {app.state} · Submitted {new Date(app.submitted_at).toLocaleDateString()}
                    </div>
                  </div>

                  <Link
                    to="/admin/sellers"
                    className="bg-[#F36B25] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#E05914] text-center"
                  >
                    Review Application
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 py-6 text-center">
              All seller applications are currently audited and resolved.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
