import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShieldCheck, Check, Clock, ChevronRight } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatKobo } from '../../utils/currency';

export const AdminFinancePage: React.FC = () => {
  const { ledgerEntries, payouts, approveSellerPayout } = useMarketplace();
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  const pendingPayouts = payouts.filter((p) => p.status === 'pending');
  const processedPayouts = payouts.filter((p) => p.status !== 'pending');

  const handleApprove = (payoutId: string) => {
    approveSellerPayout(payoutId);
    setApprovalNotice('Seller payout approved and marked as processed to Nigerian bank.');
    setTimeout(() => setApprovalNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link to="/admin" className="hover:text-[#F36B25]">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-900">Financial Settlements</span>
        </nav>

        <div className="pb-6 border-b border-stone-200">
          <h1 className="text-2xl font-bold text-[#252525]">Platform Escrow Settlements & Payouts</h1>
          <p className="text-xs text-stone-500 mt-1">
            Authoritative approval workflow for seller withdrawals and platform fee reconciliation
          </p>
        </div>

        {approvalNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{approvalNotice}</span>
          </div>
        )}

        {/* Queued Payout Requests Section */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#252525] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F36B25]" />
            <span>Pending Payout Authorizations ({pendingPayouts.length})</span>
          </h2>

          {pendingPayouts.length > 0 ? (
            <div className="divide-y divide-stone-100 text-xs">
              {pendingPayouts.map((po) => (
                <div key={po.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-stone-900 text-sm tabular-nums">
                      {formatKobo(po.amount_kobo)}
                    </div>
                    <div className="text-stone-500 mt-0.5">
                      Bank: <strong>{po.bank_name}</strong> · Account: <strong className="font-mono">{po.account_number}</strong> ({po.account_name})
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                      Ref: {po.reference} · Requested {new Date(po.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApprove(po.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Approve & Disburse Funds
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 py-4 text-center">
              No pending seller payout requests awaiting administrative verification.
            </p>
          )}
        </div>

        {/* Full Platform Immutable Escrow Ledger */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-[#252525]">Platform-Wide Escrow Ledger</h2>
              <p className="text-xs text-stone-500">All double-entry ledger items stored in integer kobo</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Balanced & Audited
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount (NGN)</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {ledgerEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50/50">
                    <td className="py-3.5 px-4 text-stone-500">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-900">
                      {e.description}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 uppercase">
                      {e.type.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold tabular-nums">
                      <span className={e.amount_kobo >= 0 ? 'text-emerald-700' : 'text-stone-700'}>
                        {e.amount_kobo >= 0 ? '+' : ''}
                        {formatKobo(e.amount_kobo)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          e.is_settled ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {e.is_settled ? 'Settled' : 'Hold'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
