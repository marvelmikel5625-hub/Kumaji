import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, Store, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that ensures the current user is an authorized merchant
 * (role is 'seller', 'store_manager', or 'super_admin').
 * If unauthenticated, redirects to /merchant/sign-in.
 * If signed in as a customer, prevents unauthorized escalation and displays
 * an informative merchant authorization gate.
 */
export const MerchantRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#F36B25] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">Verifying Merchant Credentials...</p>
        </div>
      </div>
    );
  }

  // Not authenticated at all
  if (!isAuthenticated || !user) {
    return <Navigate to={`/merchant/sign-in?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Authenticated as shopper/customer only
  const isMerchantAuthorized = role === 'seller' || role === 'store_manager' || role === 'super_admin';

  if (!isMerchantAuthorized) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <Store className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-[#252525]">
              Merchant Account Required
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              You are currently signed in as a Shopper account (<span className="font-semibold text-stone-700">{user.email}</span>). The Merchant Portal requires authorized seller credentials.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 text-left space-y-2">
            <div className="font-semibold text-stone-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#F36B25]" />
              <span>Two Options to Proceed:</span>
            </div>
            <p className="text-[11px] text-stone-500">
              1. If you already have a registered seller store, please sign in with your merchant email.
            </p>
            <p className="text-[11px] text-stone-500">
              2. If you are new to selling, submit a verified merchant registration to list items on Kumaji.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              to={`/merchant/sign-in?redirect=${encodeURIComponent(location.pathname)}`}
              className="w-full py-2.5 bg-[#F36B25] hover:bg-[#E05914] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Sign In as Merchant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/seller/register"
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors block"
            >
              Apply to Become a Verified Seller
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

  return <>{children}</>;
};

/**
 * Route guard that ensures the current user is a super_admin.
 */
export const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB]">
        <div className="w-8 h-8 border-3 border-[#F36B25] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/auth/sign-in?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-base font-bold text-[#252525]">Administrator Access Only</h1>
          <p className="text-xs text-stone-500">
            This area is restricted to Kumaji platform system administrators.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#252525] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-black"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
