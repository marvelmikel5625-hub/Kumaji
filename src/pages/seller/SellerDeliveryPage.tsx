import React, { useState } from 'react';
import { Truck, MapPin, Clock, ShieldCheck, Check, Building, AlertCircle } from 'lucide-react';
import { SellerLayout } from '../../components/seller/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useMerchantStore } from '../../hooks/useMerchantStore';
import { NIGERIAN_STATES } from '../../utils/delivery';

export const SellerDeliveryPage: React.FC = () => {
  const { store: currentStore } = useMerchantStore();
  const { updateSellerStore } = useMarketplace();

  const [pickupAddress, setPickupAddress] = useState(
    currentStore?.address || 'Shop 14, Digital Plaza, Computer Village, Ikeja, Lagos'
  );
  const [pickupCity, setPickupCity] = useState(currentStore?.city || 'Ikeja');
  const [pickupState, setPickupState] = useState(currentStore?.state || 'Lagos');
  const [dispatchWindow, setDispatchWindow] = useState('24 hours');
  const [returnDays, setReturnDays] = useState('7');
  const [localFeeNaira, setLocalFeeNaira] = useState('1800');
  const [regionalFeeNaira, setRegionalFeeNaira] = useState('3200');
  const [nationwideFeeNaira, setNationwideFeeNaira] = useState('4500');
  const [allowStorePickup, setAllowStorePickup] = useState(true);

  // Enabled couriers
  const [couriers, setCouriers] = useState({
    gig: true,
    redstar: true,
    kwik: true,
    dhl: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStore) {
      updateSellerStore(currentStore.id, {
        address: pickupAddress.trim(),
        city: pickupCity.trim(),
        state: pickupState,
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <SellerLayout
      title="Delivery & Fulfilment Hub"
      subtitle={`Configure dispatch centers, couriers, and shipping fees for ${currentStore?.store_name}`}
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fulfilment and delivery settings saved successfully. Updated rates apply to new customer checkouts.</span>
          </div>
        )}

        {/* Warehouse Dispatch Location */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <MapPin className="w-5 h-5 text-[#F36B25]" />
            <div>
              <h2 className="text-sm font-bold text-[#252525]">Physical Dispatch Center</h2>
              <p className="text-[11px] text-stone-400">Where couriers will arrive to collect packaged parcels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="font-semibold text-stone-700 block mb-1">
                Full Street Address / Shop Number *
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                City / Commercial District *
              </label>
              <input
                type="text"
                required
                value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Dispatch State *
              </label>
              <select
                value={pickupState}
                onChange={(e) => setPickupState(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25] bg-white"
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={allowStorePickup}
                onChange={(e) => setAllowStorePickup(e.target.checked)}
                className="w-4 h-4 rounded text-[#F36B25] focus:ring-[#F36B25]"
              />
              <span className="font-semibold">
                Allow customers to select Free Self-Pickup at this store address
              </span>
            </label>
          </div>
        </div>

        {/* Courier Partnerships */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <Truck className="w-5 h-5 text-[#F36B25]" />
            <div>
              <h2 className="text-sm font-bold text-[#252525]">Courier Partnerships & Dispatch Window</h2>
              <p className="text-[11px] text-stone-400">Integrated logistics providers for automated tracking</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Standard Order Packaging & Dispatch Time
              </label>
              <select
                value={dispatchWindow}
                onChange={(e) => setDispatchWindow(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
              >
                <option value="Same day">Same day (orders before 12 PM)</option>
                <option value="24 hours">Within 24 business hours (Recommended)</option>
                <option value="48 hours">Within 48 business hours</option>
                <option value="3-5 days">3–5 days (Made-to-order / Custom)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Customer Return Window (Days)
              </label>
              <select
                value={returnDays}
                onChange={(e) => setReturnDays(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
              >
                <option value="7">7 Days Standard (Kumaji Escrow policy)</option>
                <option value="14">14 Days Extended</option>
                <option value="30">30 Days Premium</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <span className="font-semibold text-stone-700 block">Authorized Couriers for this Store:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'gig', name: 'GIG Logistics', tag: 'Nationwide' },
                { id: 'redstar', name: 'Red Star Express', tag: 'FedEx Affiliate' },
                { id: 'kwik', name: 'Kwik Delivery', tag: 'Same-Day Lagos' },
                { id: 'dhl', name: 'DHL Express Nigeria', tag: 'High-Value' },
              ].map((c) => (
                <label
                  key={c.id}
                  className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-between cursor-pointer hover:border-stone-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{c.name}</span>
                    <input
                      type="checkbox"
                      checked={couriers[c.id as keyof typeof couriers]}
                      onChange={(e) =>
                        setCouriers((prev) => ({ ...prev, [c.id]: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#F36B25]"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1">{c.tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Shipping Fee Configuration */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <Clock className="w-5 h-5 text-[#F36B25]" />
            <div>
              <h2 className="text-sm font-bold text-[#252525]">Regional Shipping Rates (NGN)</h2>
              <p className="text-[11px] text-stone-400">Default delivery fees passed to customer checkout</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Same-State Delivery (₦)
              </label>
              <input
                type="number"
                value={localFeeNaira}
                onChange={(e) => setLocalFeeNaira(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">e.g. Lagos to Lagos (1–2 days)</span>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Regional Adjacent States (₦)
              </label>
              <input
                type="number"
                value={regionalFeeNaira}
                onChange={(e) => setRegionalFeeNaira(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">e.g. Lagos to Ogun/Oyo (2–3 days)</span>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Nationwide Inter-State (₦)
              </label>
              <input
                type="number"
                value={nationwideFeeNaira}
                onChange={(e) => setNationwideFeeNaira(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">e.g. Lagos to Abuja/PH/Kano (3–5 days)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#F36B25] hover:bg-[#E05914] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Save Fulfilment Configuration
          </button>
        </div>
      </form>
    </SellerLayout>
  );
};
