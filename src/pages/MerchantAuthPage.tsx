import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Building,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';

export const MerchantAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectUrl = searchParams.get('redirect') || '/seller';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPendingNotice, setIsPendingNotice] = useState(false);
  const [pendingDetails, setPendingDetails] = useState<string | null>(null);

  // Password reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetResult, setResetResult] = useState<{ message?: string; error?: string } | null>(null);

  const { signInMerchant, resetPassword, isLoading } = useAuth();
  const { applications } = useMarketplace();

  const handleMerchantSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsPendingNotice(false);
    setPendingDetails(null);

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid registered merchant email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // Check if there is an active application in the marketplace context for this email
    const matchingApp = applications.find(
      (a) => a.phone === email || a.business_name.toLowerCase().includes(email.split('@')[0].toLowerCase())
    );

    if (matchingApp && matchingApp.status === 'pending') {
      setIsPendingNotice(true);
      setPendingDetails(`Application for "${matchingApp.business_name}" is currently pending CAC and corporate bank verification.`);
      return;
    }

    const result = await signInMerchant(email, password);
    if (!result.success) {
      if (result.isPending) {
        setIsPendingNotice(true);
        setPendingDetails(result.error || 'Your merchant application is under review.');
      } else {
        setErrorMessage(result.error || 'Invalid merchant credentials. Please verify your email and password.');
      }
      return;
    }

    navigate(redirectUrl);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetResult(null);
    if (!resetEmail.includes('@')) {
      setResetResult({ error: 'Please enter a valid merchant email address.' });
      return;
    }
    const res = await resetPassword(resetEmail);
    if (res.success) {
      setResetResult({ message: res.message });
    } else {
      setResetResult({ error: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-black text-[#252525]">
              Kumaji<span className="text-[#F36B25]">.</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F36B25] uppercase tracking-wider mt-1">
            <Store className="w-4 h-4" />
            <span>Merchant Operations Portal</span>
          </div>
          <h1 className="text-lg font-bold text-stone-800">
            Sign In to Your Merchant Account
          </h1>
          <p className="text-xs text-stone-500">
            Access inventory management, orders, customer reviews, and escrow settlements
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 shadow-xs space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isPendingNotice && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Application Pending Admin Verification</span>
              </div>
              <p className="leading-relaxed">
                {pendingDetails ||
                  'Your merchant application is currently undergoing CAC, address, and banking verification by the Kumaji compliance team. Registered sellers receive SMS/Email notifications upon authorization.'}
              </p>
              <div className="pt-1 text-[11px] text-amber-800 font-semibold">
                Typical verification timeframe: 24–48 business hours.
              </div>
            </div>
          )}

          <form onSubmit={handleMerchantSignIn} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Merchant Registered Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@domain.ng"
                  className="w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-stone-700">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(true);
                    setResetEmail(email);
                  }}
                  className="text-[11px] text-[#F36B25] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#F36B25] hover:bg-[#E05914] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Merchant Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Merchant Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill for Testing Evaluation */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-900">Demo Store: Apex Gadgets</div>
              <div className="text-[11px] text-stone-500">Verified Ikeja Computer Village seller</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('chidi.apex@example.ng');
                setPassword('password123');
              }}
              className="text-[#F36B25] hover:underline font-bold text-xs cursor-pointer"
            >
              Autofill
            </button>
          </div>

          {/* DISTINCT PATHWAY FOR NEW MERCHANTS / REGISTRATION */}
          <div className="pt-4 border-t border-stone-100 text-center space-y-3">
            <p className="text-xs text-stone-600">
              Not yet a seller on Kumaji?
            </p>
            <Link
              to="/seller/register"
              className="inline-block w-full py-2.5 border-2 border-[#F36B25] text-[#F36B25] hover:bg-[#F36B25]/5 rounded-xl text-xs font-bold transition-colors"
            >
              Apply to Become a Verified Seller →
            </Link>

            <div className="pt-2 text-xs text-stone-400">
              <Link to="/auth/sign-in" className="hover:text-stone-700">
                ← Return to Shopper Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowResetModal(false)}
          />
          <div className="relative bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-6 shadow-2xl z-50 space-y-4">
            <h3 className="text-sm font-bold text-[#252525]">Merchant Password Recovery</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Enter your registered merchant email address to receive password recovery instructions.
            </p>

            {resetResult?.message && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetResult.message}</span>
              </div>
            )}

            {resetResult?.error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetResult.error}</span>
              </div>
            )}

            {!resetResult?.message && (
              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Registered Merchant Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="merchant@domain.ng"
                    className="w-full p-2.5 border border-stone-300 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3.5 py-2 border border-stone-300 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F36B25] text-white rounded-xl font-bold hover:bg-[#E05914]"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </form>
            )}

            {resetResult?.message && (
              <div className="text-right pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
