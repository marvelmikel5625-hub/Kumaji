import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Star,
  Settings,
  Truck,
  Store,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Clock,
  ExternalLink,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMerchantStore } from '../../hooks/useMerchantStore';

interface SellerLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const SellerLayout: React.FC<SellerLayoutProps> = ({ children, title, subtitle }) => {
  const { signOut } = useAuth();
  const { store: currentStore, hasStore, isPending, pendingApplication } = useMerchantStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/seller', icon: LayoutDashboard, exact: true },
    { label: 'My Products', path: '/seller/products', icon: Package },
    { label: 'Add Product', path: '/seller/products/new', icon: PlusCircle },
    { label: 'Orders', path: '/seller/orders', icon: ShoppingBag },
    { label: 'Sales & Earnings', path: '/seller/earnings', icon: TrendingUp },
    { label: 'Product Analytics', path: '/seller/analytics', icon: BarChart3 },
    { label: 'Reviews', path: '/seller/reviews', icon: Star },
    { label: 'Store Profile & Settings', path: '/seller/settings', icon: Settings },
    { label: 'Delivery & Fulfilment', path: '/seller/delivery', icon: Truck },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/merchant/sign-in');
  };

  // If merchant has an application pending compliance review
  if (isPending) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-amber-200 p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <Clock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Application Under Review
            </span>
            <h1 className="text-xl font-bold text-[#252525]">
              {pendingApplication?.business_name || 'Your Store Application'}
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              Your merchant application was received on{' '}
              {new Date(pendingApplication?.submitted_at || Date.now()).toLocaleDateString()}.
              Our compliance team is verifying your Nigerian business credentials and bank information.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-400">RC / CAC Registration:</span>
              <span className="font-semibold text-stone-800">{pendingApplication?.rc_number || 'Individual Seller'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-400">Commercial Category:</span>
              <span className="font-semibold text-stone-800 capitalize">{pendingApplication?.category || 'General'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-400">Registered Bank:</span>
              <span className="font-semibold text-stone-800">{pendingApplication?.bank_name}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              to="/seller/register"
              className="inline-block w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors"
            >
              View Application Details
            </Link>
            <Link
              to="/"
              className="inline-block text-xs text-stone-400 hover:text-stone-700 font-medium"
            >
              ← Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If no store exists for this user and not pending
  if (!hasStore || !currentStore) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-[#F36B25]">
            <Store className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-[#252525]">No Active Storefront Found</h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              You are signed in, but this account is not associated with an approved Kumaji seller store.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              to="/seller/register"
              className="w-full py-3 bg-[#F36B25] hover:bg-[#E05914] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Apply to Become a Verified Seller</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="block pt-2 text-xs text-stone-400 hover:text-stone-700 font-medium"
            >
              ← Return to Marketplace Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col">
      {/* Top Mobile Bar for Merchant */}
      <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 text-stone-700 hover:text-[#F36B25]"
            aria-label="Open merchant menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/seller" className="flex items-center gap-1.5">
            <span className="text-lg font-black text-[#252525]">Kumaji</span>
            <span className="text-[11px] font-bold text-[#F36B25] bg-[#F36B25]/10 px-2 py-0.5 rounded-md">
              Merchant
            </span>
          </Link>
        </div>

        <Link
          to="/"
          className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1"
        >
          <span>Marketplace</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white rounded-3xl border border-stone-200 p-5 shadow-xs h-[calc(100vh-6rem)] sticky top-20 justify-between">
          <div className="space-y-6">
            {/* Store Identification Box */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 overflow-hidden shrink-0">
                <img
                  src={currentStore.logo_url}
                  alt={currentStore.store_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-[#252525] truncate">
                  {currentStore.store_name}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Store
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#F36B25] text-white shadow-xs'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-500 hover:text-[#F36B25] transition-colors"
            >
              <span>Switch to Buyer View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Merchant Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN MERCHANT CONTENT AREA */}
        <main className="flex-1 min-w-0 space-y-6">
          {(title || subtitle) && (
            <div className="pb-4 border-b border-stone-200">
              {title && <h1 className="text-2xl font-bold text-[#252525] tracking-tight">{title}</h1>}
              {subtitle && <p className="text-xs text-stone-500 mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* MOBILE DRAWER NAVIGATION */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-50 flex flex-col p-5 overflow-y-auto justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <span className="text-lg font-black text-[#252525]">Kumaji Merchant</span>
                  <p className="text-[10px] text-stone-500">{currentStore.store_name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-[#F36B25] text-white'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-stone-200 space-y-2 text-xs">
              <Link
                to="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="block py-2 text-stone-600 hover:text-stone-900"
              >
                Go to Shopper Marketplace →
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-rose-600 font-semibold block py-1 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
