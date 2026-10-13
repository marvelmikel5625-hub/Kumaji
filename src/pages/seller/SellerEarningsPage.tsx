import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShieldCheck, ArrowUpRight, Clock, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { SellerLayout } from '../../components/seller/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useMerchantStore } from '../../hooks/useMerchantStore';
import { formatKobo, nairaToKobo } from '../../utils/currency';

export const SellerEarningsPage: React.FC = () => {
  const { store: currentStore } = useMerchantStore();
  const { ledgerEntries, payouts, requestSellerPayout } = useMarketplace();

  const [payoutAmountNaira, setPayoutAmountNaira] = useState('');
  const [payoutMessage, setPayoutMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Filter ledger entries for this seller
  const storeLedger = ledgerEntries.filter((e) => e.seller_id === currentStore?.id);

  // Financial calculations
  const settledCredits = storeLedger
    .filter((e) => e.is_settled && e.amount_kobo > 0)
    .reduce((acc, e) => acc + e.amount_kobo, 0);

  const commissionDebits = Math.abs(
    storeLedger
      .filter((e) => e.type === 'platform_commission')
      .reduce((acc, e) => acc + e.amount_kobo, 0)
  );

  const completedPayouts = payouts
    .filter((p) => p.seller_id === currentStore?.id && (p.status === 'completed' || p.status === 'processing'))
    .reduce((acc, p) => acc + p.amount_kobo, 0);

  const availablePayoutBalanceKobo = Math.max(0, settledCredits - commissionDebits - completedPayouts);

  const storePayouts = payouts.filter((p) => p.seller_id === currentStore?.id);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutMessage(null);

    if (!currentStore) {
      setPayoutMessage({ success: false, text: 'No active merchant store found.' });
      return;
    }

    const amountKobo = nairaToKobo(payoutAmountNaira);
    if (amountKobo <= 0) {
      setPayoutMessage({ success: false, text: 'Please enter a valid payout amount in Naira.' });
      return;
    }

    if (amountKobo > availablePayoutBalanceKobo) {
      setPayoutMessage({
        success: false,
        text: 'Requested amount exceeds settled available ledger balance.',
      });
      return;
    }

    const result = requestSellerPayout(
      currentStore.id,
      amountKobo,
      currentStore.bank_name || 'GTBank',
      currentStore.bank_account_number || '0123456789',
      currentStore.bank_account_name || currentStore.store_name
    );

    setPayoutMessage({ success: result.success, text: result.message });
    if (result.success) {
      setPayoutAmountNaira('');
    }
  };

  return (
    <SellerLayout
      title="Escrow Ledger & Bank Payouts"
      subtitle="Authoritative integer-kobo audit ledger reflecting completed orders, commissions, and bank disbursements"
    >
      <div className="space-y-8">
        {/* Financial Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-2 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Settled Available for Payout
            </span>
            <div className="text-3xl font-extrabold text-[#F36B25] tabular-nums tracking-tight">
              {formatKobo(availablePayoutBalanceKobo)}
            </div>
            <div className="text-[11px] text-stone-400">
              Verified funds from confirmed delivered packages
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-2 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Platform Commission (8.5%)
            </span>
            <div className="text-3xl font-extrabold text-[#252525] tabular-nums tracking-tight">
              {formatKobo(commissionDebits)}
            </div>
            <div className="text-[11px] text-stone-400">
              Deducted transparently upon order settlement
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-2 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Cumulative Disbursed
            </span>
            <div className="text-3xl font-extrabold text-emerald-700 tabular-nums tracking-tight">
              {formatKobo(completedPayouts)}
            </div>
            <div className="text-[11px] text-stone-400">
              Successfully remitted to verified bank accounts
            </div>
          </div>
        </div>

        {/* Payout Request Section */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-[#252525]">Request Bank Settlement Payout</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Funds are dispatched via NIBSS Instant Payments to your registered account
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-stone-400 block">Registered Bank</span>
              <span className="text-xs font-bold text-stone-800">
                {currentStore?.bank_name} ({currentStore?.bank_account_number})
              </span>
            </div>
          </div>

          {payoutMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                payoutMessage.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {payoutMessage.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{payoutMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleRequestPayout} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                Amount to Withdraw (in NGN Naira)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold text-xs">₦</span>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  required
                  placeholder="e.g. 50000"
                  value={payoutAmountNaira}
                  onChange={(e) => setPayoutAmountNaira(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#F36B25]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={availablePayoutBalanceKobo <= 0}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#F36B25] hover:bg-[#E05914] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Request NIP Bank Transfer
            </button>
          </form>
        </div>

        {/* Ledger Entries Table */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#252525]">Authoritative Escrow Ledger Audit</h2>
            <span className="text-xs text-stone-400 font-mono">Integer-kobo ledger entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Reference / Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {storeLedger.length > 0 ? (
                  storeLedger.map((e) => (
                    <tr key={e.id} className="hover:bg-stone-50/50">
                      <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold capitalize whitespace-nowrap">
                        {e.type.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {e.description}
                      </td>
                      <td className={`py-3.5 px-4 font-bold tabular-nums whitespace-nowrap ${
                        e.amount_kobo > 0 ? 'text-emerald-700' : 'text-stone-900'
                      }`}>
                        {e.amount_kobo > 0 ? '+' : ''}{formatKobo(e.amount_kobo)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          e.is_settled
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {e.is_settled ? 'Settled' : 'In Escrow'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400">
                      No ledger transactions yet. Transactions appear automatically when orders are placed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};
