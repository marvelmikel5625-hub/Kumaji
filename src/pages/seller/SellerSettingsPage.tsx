import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Check, ChevronRight, Building, Phone, Mail, MapPin } from 'lucide-react';
import { SellerLayout } from '../../components/seller/SellerLayout';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useMerchantStore } from '../../hooks/useMerchantStore';
import { NIGERIAN_STATES } from '../../utils/delivery';

export const SellerSettingsPage: React.FC = () => {
  const { store: currentStore } = useMerchantStore();
  const { updateSellerStore } = useMarketplace();

  const [storeName, setStoreName] = useState(currentStore?.store_name || '');
  const [description, setDescription] = useState(currentStore?.description || '');
  const [phone, setPhone] = useState(currentStore?.contact_phone || '');
  const [email, setEmail] = useState(currentStore?.contact_email || '');
  const [address, setAddress] = useState(currentStore?.address || '');
  const [state, setState] = useState(currentStore?.state || 'Lagos');
  const [city, setCity] = useState(currentStore?.city || 'Ikeja');
  const [bankName, setBankName] = useState(currentStore?.bank_name || 'Guaranty Trust Bank (GTB)');
  const [accountNumber, setAccountNumber] = useState(currentStore?.bank_account_number || '0123456789');
  const [accountName, setAccountName] = useState(currentStore?.bank_account_name || currentStore?.store_name || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStore) {
      updateSellerStore(currentStore.id, {
        store_name: storeName.trim(),
        description: description.trim(),
        contact_phone: phone.trim(),
        contact_email: email.trim(),
        address: address.trim(),
        state,
        city: city.trim(),
        bank_name: bankName,
        bank_account_number: accountNumber.trim(),
        bank_account_name: accountName.trim(),
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <SellerLayout
      title="Store Profile & Settings"
      subtitle="Configure your storefront appearance, contact information, and settlement bank details"
    >
      <div className="space-y-6 max-w-4xl">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Store profile and bank information saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5 text-xs">
            <div className="pb-3 border-b border-stone-100">
              <h2 className="text-sm font-bold text-[#252525]">Public Storefront Information</h2>
              <p className="text-[11px] text-stone-400">Displayed to buyers on product pages and seller profile</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">
                  Official Merchant Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">
                  Store Bio & Specialization *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your authentic product lines, warranty policies, and background..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Customer Support Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Merchant Support Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s.code} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  City / LGA *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                />
              </div>
            </div>

            <div className="pt-4 pb-2 border-b border-stone-100">
              <h2 className="text-sm font-bold text-[#252525]">NIBSS Payout Bank Account</h2>
              <p className="text-[11px] text-stone-400">All escrow settlements and sales balances are wired here</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Financial Institution *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Account Number (NUBAN 10-digits) *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#F36B25] hover:bg-[#E05914] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Store Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </SellerLayout>
  );
};
