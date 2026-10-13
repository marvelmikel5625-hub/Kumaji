import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  Store,
  ShieldCheck,
  Check,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';

export const AccountPage: React.FC = () => {
  const { user, role, switchDemoRole, signOut, updateProfile } = useAuth();
  const { orders } = useMarketplace();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const customerOrders = orders.filter((o) => o.user_id === user?.id || user?.role === 'customer');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: fullName, phone });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-6 border-b border-stone-200 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#252525]">My Kumaji Account</h1>
            <p className="text-xs text-stone-500 mt-1">
              Manage personal details, orders, saved addresses, and security
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Active Persona:</span>
            <span className="text-xs font-bold text-[#F36B25] uppercase tracking-wide bg-[#F36B25]/10 px-2.5 py-1 rounded-lg">
              {role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Account Navigation Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold text-base">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#252525] truncate">{user?.full_name}</div>
                  <div className="text-xs text-stone-500 truncate">{user?.email}</div>
                </div>
              </div>

              <div className="space-y-1 text-xs font-semibold">
                <Link
                  to="/account/orders"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 text-stone-700 hover:text-[#F36B25] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-stone-500" />
                    Orders & Tracking ({customerOrders.length})
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>

                <Link
                  to="/account/addresses"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 text-stone-700 hover:text-[#F36B25] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-stone-500" />
                    Saved Addresses
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>

                <Link
                  to="/account/wishlist"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 text-stone-700 hover:text-[#F36B25] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-stone-500" />
                    My Saved Wishlist
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>

                {role === 'seller' && (
                  <Link
                    to="/seller"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F36B25]/5 text-[#F36B25] font-bold transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Store className="w-4 h-4 text-[#F36B25]" />
                      Seller Merchant Portal
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}

                {role === 'super_admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-900 text-white font-bold transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-[#F36B25]" />
                      Super Admin Dashboard
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Persona switch selector for instant evaluation */}
              <div className="pt-4 border-t border-stone-100">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Switch Active Role:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => switchDemoRole('customer')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                      role === 'customer'
                        ? 'bg-[#F36B25] text-white border-[#F36B25]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('seller')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                      role === 'seller'
                        ? 'bg-[#F36B25] text-white border-[#F36B25]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    Seller
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('super_admin')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                      role === 'super_admin'
                        ? 'bg-[#F36B25] text-white border-[#F36B25]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Profile Settings & Quick Orders Snapshot */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-[#252525] pb-3 border-b border-stone-100">
                Personal Information
              </h2>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      Primary Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full text-xs border border-stone-200 bg-stone-50 rounded-xl p-3 text-stone-500 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Contact Kumaji support to modify registered email address.
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-[#F36B25] hover:bg-[#E05914] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Recent Orders */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-[#252525]">Recent Orders</h3>
                <Link
                  to="/account/orders"
                  className="text-xs font-semibold text-[#F36B25] hover:underline"
                >
                  View All Orders →
                </Link>
              </div>

              {customerOrders.length > 0 ? (
                <div className="divide-y divide-stone-100">
                  {customerOrders.slice(0, 3).map((ord) => (
                    <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-stone-900">{ord.order_number}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {new Date(ord.created_at).toLocaleDateString()} · {ord.seller_orders.length} merchant package(s)
                        </div>
                      </div>
                      <Link
                        to={`/account/orders/${ord.id}`}
                        className="font-semibold text-[#F36B25] hover:underline"
                      >
                        Track & Details →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 py-3">
                  No orders placed yet. Products you purchase will appear here with live tracking.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
