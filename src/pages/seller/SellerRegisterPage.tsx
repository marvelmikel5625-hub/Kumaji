import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { NIGERIAN_STATES } from '../../utils/delivery';

export const SellerRegisterPage: React.FC = () => {
  const { user, role, switchDemoRole } = useAuth();
  const { applications, submitSellerApplication } = useMarketplace();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<'individual' | 'registered_company'>('registered_company');
  const [rcNumber, setRcNumber] = useState('');
  const [category, setCategory] = useState('phones-tablets');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState('Lagos');
  const [city, setCity] = useState('');
  const [bankName, setBankName] = useState('Guaranty Trust Bank (GTB)');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const [submittedApp, setSubmittedApp] = useState<any>(null);

  // Check if current user already has an application
  const existingApp = applications.find((a) => a.user_id === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim() || !accountNumber.trim()) return;

    const newApp = submitSellerApplication({
      user_id: user?.id || 'usr-temp',
      business_name: businessName.trim(),
      business_type: businessType,
      rc_number: rcNumber.trim() || undefined,
      category,
      phone: phone.trim(),
      state,
      city: city.trim() || 'Lagos',
      bank_name: bankName,
      account_number: accountNumber.trim(),
      account_name: accountName.trim() || businessName.trim(),
    });

    setSubmittedApp(newApp);
  };

  const currentDisplayApp = submittedApp || existingApp;

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F36B25] uppercase tracking-wider">
            <Store className="w-4 h-4" />
            <span>Merchant Onboarding</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#252525] tracking-tight">
            Sell to Millions of Shoppers on Kumaji
          </h1>
          <p className="text-xs text-stone-600 max-w-xl mx-auto leading-relaxed">
            Register your business, pass verification checks, and list verified products with secure escrow payment guarantees.
          </p>
        </div>

        {/* Existing Application Status Card */}
        {currentDisplayApp ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-[#252525]">
                    Application: {currentDisplayApp.business_name}
                  </h3>
                  <div className="text-xs text-stone-500">
                    Submitted: {new Date(currentDisplayApp.submitted_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  currentDisplayApp.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-700'
                    : currentDisplayApp.status === 'rejected'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {currentDisplayApp.status.replace('_', ' ')}
              </span>
            </div>

            <div className="text-xs text-stone-600 space-y-2 leading-relaxed">
              <p>
                <strong>Category:</strong> {currentDisplayApp.category} ·{' '}
                <strong>Location:</strong> {currentDisplayApp.city}, {currentDisplayApp.state}
              </p>
              <p>
                <strong>Payout Bank Account:</strong> {currentDisplayApp.bank_name} · {currentDisplayApp.account_number} ({currentDisplayApp.account_name})
              </p>
              {currentDisplayApp.admin_notes && (
                <div className="p-3 bg-stone-50 rounded-xl text-stone-700">
                  <strong>Compliance Team Note:</strong> {currentDisplayApp.admin_notes}
                </div>
              )}
            </div>

            {currentDisplayApp.status === 'approved' ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    switchDemoRole('seller');
                    navigate('/seller');
                  }}
                  className="bg-[#F36B25] text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#E05914] transition-colors"
                >
                  Enter Seller Portal →
                </button>
              </div>
            ) : (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600">
                Our verification team reviews CAC details, banking credentials, and product authenticity within 24–48 hours. You will receive an SMS and email update.
              </div>
            )}
          </div>
        ) : (
          /* Application Form */
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#252525] pb-2 border-b border-stone-100">
                  1. Business & Legal Identity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Business / Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Kano Heritage Leather"
                      className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Business Structure *
                    </label>
                    <select
                      value={businessType}
                      onChange={(e: any) => setBusinessType(e.target.value)}
                      className="w-full text-xs border border-stone-300 rounded-xl p-3 bg-white focus:outline-none focus:border-[#F36B25]"
                    >
                      <option value="registered_company">Registered Company (CAC Ltd / BN)</option>
                      <option value="individual">Sole Proprietor / Individual Artisan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      CAC RC / Business Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={rcNumber}
                      onChange={(e) => setRcNumber(e.target.value)}
                      placeholder="RC-1294829"
                      className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Primary Merchandise Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs border border-stone-300 rounded-xl p-3 bg-white focus:outline-none focus:border-[#F36B25]"
                    >
                      <option value="phones-tablets">Phones & Gadgets</option>
                      <option value="computing-electronics">Computing & Electronics</option>
                      <option value="mens-fashion">Men's Tailoring & Streetwear</option>
                      <option value="womens-fashion">Women's Fashion</option>
                      <option value="bags-footwear">Artisanal Leather & Footwear</option>
                      <option value="beauty-skincare">Beauty & Organic Skincare</option>
                      <option value="home-living">Home & Living</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location & Contact */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="text-sm font-bold text-[#252525] pb-2 border-b border-stone-100">
                  2. Dispatch Location & Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Merchant Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Operating State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs border border-stone-300 rounded-xl p-3 bg-white"
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s.code} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      City / Hub *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Ikeja, Kano City"
                      className="w-full text-xs border border-stone-300 rounded-xl p-3"
                    />
                  </div>
                </div>
              </div>

              {/* Settlement Bank Details */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <h3 className="text-sm font-bold text-[#252525] pb-2 border-b border-stone-100">
                  3. Settlement Bank Account (for Escrow Payouts)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Settlement Bank *
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full text-xs border border-stone-300 rounded-xl p-3 bg-white"
                    >
                      <option value="Guaranty Trust Bank (GTB)">Guaranty Trust Bank (GTB)</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                      <option value="United Bank for Africa (UBA)">UBA</option>
                      <option value="Stanbic IBTC Bank">Stanbic IBTC</option>
                      <option value="Kuda Microfinance Bank">Kuda MFB</option>
                      <option value="OPay">OPay</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      NUBAN Account Number (10 digits) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="0123456789"
                      className="w-full text-xs border border-stone-300 rounded-xl p-3 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Official account title"
                      className="w-full text-xs border border-stone-300 rounded-xl p-3"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Standard marketplace commission: 8.5% on successful delivery</span>
                </div>

                <button
                  type="submit"
                  className="bg-[#F36B25] hover:bg-[#E05914] text-white px-6 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
