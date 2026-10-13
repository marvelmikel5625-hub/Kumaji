import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Address } from '../../types';
import { NIGERIAN_STATES } from '../../utils/delivery';

export const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      user_id: 'user-cust-1',
      full_name: 'Adekunle Bello',
      phone: '+234 802 345 6789',
      street_address: '12 Admiralty Way, Lekki Phase 1',
      city: 'Lagos Island',
      state: 'Lagos',
      is_default: true,
    },
    {
      id: 'addr-2',
      user_id: 'user-cust-1',
      full_name: 'Adekunle Bello (Abuja Office)',
      phone: '+234 802 345 6789',
      street_address: 'Plot 402 Constitution Avenue, Central Business District',
      city: 'Abuja',
      state: 'Abuja (FCT)',
      is_default: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !street.trim()) return;

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      user_id: 'user-cust-1',
      full_name: fullName.trim(),
      phone: phone.trim(),
      street_address: street.trim(),
      city: city.trim() || 'Lagos',
      state,
      is_default: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    setShowAddModal(false);
    setFullName('');
    setPhone('');
    setStreet('');
    setCity('');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map((a) => ({ ...a, is_default: a.id === id })));
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link to="/account" className="hover:text-[#F36B25]">
            Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-900">Saved Addresses</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#252525]">Delivery Addresses</h1>
            <p className="text-xs text-stone-500 mt-1">
              Save your residence and workplace addresses across Nigerian states for fast checkout
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#F36B25] hover:bg-[#E05914] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                addr.is_default ? 'border-[#F36B25] ring-1 ring-[#F36B25]/30' : 'border-stone-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#252525]">{addr.full_name}</h3>
                  {addr.is_default && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F36B25] bg-[#F36B25]/10 px-2 py-0.5 rounded-md">
                      Default
                    </span>
                  )}
                </div>

                <div className="text-xs text-stone-600 leading-relaxed">
                  <div>{addr.street_address}</div>
                  <div>
                    {addr.city}, {addr.state}
                  </div>
                  <div className="text-stone-500 mt-1">Phone: {addr.phone}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-4 text-xs">
                {!addr.is_default ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-stone-600 hover:text-[#F36B25] font-semibold"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Selected for Dispatch
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-stone-400 hover:text-rose-600 p-1"
                  aria-label="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Address */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setShowAddModal(false)}
            />
            <div className="relative bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl z-50 space-y-4">
              <h2 className="text-base font-bold text-[#252525] pb-2 border-b border-stone-100">
                Add New Delivery Destination
              </h2>

              <form onSubmit={handleAddAddress} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's name"
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Street Address & Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 5 Bompai Road"
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-white"
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s.code} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Ikeja, Kano City"
                      className="w-full text-xs border border-stone-300 rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold border border-stone-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-[#F36B25] text-white rounded-xl hover:bg-[#E05914]"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
