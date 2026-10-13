import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Check, X, Clock, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { SellerApplicationStatus } from '../../types';

export const AdminSellersPage: React.FC = () => {
  const { applications, sellers, reviewSellerApplication } = useMarketplace();
  const [adminNoteInput, setAdminNoteInput] = useState<Record<string, string>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleReview = (id: string, status: SellerApplicationStatus) => {
    const notes = adminNoteInput[id] || '';
    reviewSellerApplication(id, status, notes);
    setActionNotice(`Application marked as ${status.toUpperCase()}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link to="/admin" className="hover:text-[#F36B25]">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-900">Seller Onboarding & Stores</span>
        </nav>

        <div className="pb-6 border-b border-stone-200">
          <h1 className="text-2xl font-bold text-[#252525]">Merchant Applications & Store Audits</h1>
          <p className="text-xs text-stone-500 mt-1">
            Review Nigerian business registrations (CAC), bank credentials, and grant verified merchant badges
          </p>
        </div>

        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Pending & Historical Applications */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#252525]">
            Merchant Applications ({applications.length})
          </h2>

          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-[#252525]">{app.business_name}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          app.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : app.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Submitted: {new Date(app.submitted_at).toLocaleDateString()} · Business Type: {app.business_type}
                    </div>
                  </div>

                  <div className="text-xs text-stone-600 font-medium sm:text-right">
                    Category: <strong>{app.category}</strong> · Hub: <strong>{app.city}, {app.state}</strong>
                  </div>
                </div>

                {/* Registration Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                  <div>
                    <span className="text-stone-400 block text-[11px]">CAC RC / Registration</span>
                    <strong className="text-stone-900 font-mono">{app.rc_number || 'Individual / Pending'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Settlement Bank & NUBAN</span>
                    <strong className="text-stone-900">{app.bank_name} · {app.account_number}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Contact Telephone</span>
                    <strong className="text-stone-900">{app.phone}</strong>
                  </div>
                </div>

                {/* Review Controls (if pending or requires more info) */}
                {app.status !== 'approved' && app.status !== 'rejected' && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <input
                      type="text"
                      placeholder="Add compliance notes (e.g. CAC verified via portal)..."
                      value={adminNoteInput[app.id] || ''}
                      onChange={(e) =>
                        setAdminNoteInput({ ...adminNoteInput, [app.id]: e.target.value })
                      }
                      className="text-xs border border-stone-300 rounded-xl p-2.5 flex-1 focus:outline-none focus:border-[#F36B25]"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReview(app.id, 'requires_more_info')}
                        className="px-3.5 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                      >
                        Request Info
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(app.id, 'rejected')}
                        className="px-3.5 py-2 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(app.id, 'approved')}
                        className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Approve & Provision Store</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Existing Active Stores List */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs space-y-4 p-6">
          <h2 className="text-base font-bold text-[#252525]">Active Verified Stores ({sellers.length})</h2>

          <div className="divide-y divide-stone-100 text-xs">
            {sellers.map((s) => (
              <div key={s.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={s.logo_url}
                    alt={s.store_name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                  />
                  <div>
                    <div className="font-bold text-stone-900">{s.store_name}</div>
                    <div className="text-[11px] text-stone-500">
                      {s.city}, {s.state} · Commission: {s.commission_rate_percent}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified Storefront
                  </span>
                  <Link
                    to={`/search?seller=${encodeURIComponent(s.id)}`}
                    className="text-[#F36B25] hover:underline font-semibold"
                  >
                    View Catalog →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
