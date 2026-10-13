import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Store,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isSignUpInitial = searchParams.get('mode') === 'signup' || location.pathname.includes('sign-up');
  const [isSignUp, setIsSignUp] = useState(isSignUpInitial);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ loading: boolean; message?: string; error?: string }>({
    loading: false,
  });

  const { signInCustomer, signUpCustomer, resetPassword, isLoading } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (isSignUp) {
      if (!fullName.trim()) {
        setFormError('Please enter your full name.');
        return;
      }
      if (!email.includes('@')) {
        setFormError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return;
      }

      const result = await signUpCustomer(email, fullName, password, phone);
      if (!result.success) {
        setFormError(result.error || 'Failed to create customer account.');
        return;
      }
      setFormSuccess('Customer account created! Redirecting to your account...');
      setTimeout(() => navigate(redirectUrl), 800);
    } else {
      if (!email.includes('@')) {
        setFormError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }

      const result = await signInCustomer(email, password);
      if (!result.success) {
        setFormError(result.error || 'Invalid email or password.');
        return;
      }
      setFormSuccess('Welcome back! Directing to your shopping account...');
      setTimeout(() => navigate(redirectUrl), 800);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.includes('@')) {
      setResetStatus({ loading: false, error: 'Please enter a valid email.' });
      return;
    }
    setResetStatus({ loading: true });
    const res = await resetPassword(resetEmail);
    if (res.success) {
      setResetStatus({ loading: false, message: res.message });
    } else {
      setResetStatus({ loading: false, error: res.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-black text-[#252525]">
              Kumaji<span className="text-[#F36B25]">.</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 uppercase tracking-wider mt-1">
            <ShoppingBag className="w-3.5 h-3.5 text-[#F36B25]" />
            <span>Shopper Authentication</span>
          </div>
          <h1 className="text-base font-bold text-stone-800">
            {isSignUp ? 'Create your Shopper Account' : 'Sign In to Your Shopping Account'}
          </h1>
          <p className="text-xs text-stone-500">
            Fast doorstep delivery across Lagos, Abuja, Port Harcourt, and nationwide
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 shadow-xs space-y-6">
          {/* Sign In vs Sign Up Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setFormError(null);
                setFormSuccess(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                !isSignUp ? 'bg-white text-[#252525] shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Customer Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setFormError(null);
                setFormSuccess(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                isSignUp ? 'bg-white text-[#252525] shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              New Customer Sign Up
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUp && (
              <>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Adekunle Bello"
                      className="w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Phone Number (for courier delivery updates)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 802 345 6789"
                      className="w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shopper@example.ng"
                  className="w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-stone-700">
                  Password *
                </label>
                {!isSignUp && (
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
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
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
              {isSignUp && (
                <p className="text-[10px] text-stone-400 mt-1">
                  At least 6 characters with letters and numbers.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#F36B25] hover:bg-[#E05914] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Shopper Account' : 'Sign In as Customer'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* DISTINCT PATHWAY FOR MERCHANTS & SELLERS */}
          <div className="pt-4 border-t border-stone-100">
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                <Store className="w-4 h-4 text-[#F36B25]" />
                <span>Are you a Merchant or Business?</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Registered sellers and business owners should sign in through the dedicated Merchant Portal.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/merchant/sign-in"
                  className="py-2 px-3 bg-white hover:bg-stone-100 text-[#252525] border border-stone-300 rounded-xl text-center text-xs font-semibold transition-colors"
                >
                  Merchant Sign In
                </Link>
                <Link
                  to="/seller/register"
                  className="py-2 px-3 bg-[#F36B25]/10 hover:bg-[#F36B25]/20 text-[#F36B25] rounded-xl text-center text-xs font-bold transition-colors"
                >
                  Become a Seller →
                </Link>
              </div>
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
            <h3 className="text-sm font-bold text-[#252525]">Reset Shopper Password</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Enter your registered shopper email address to receive password reset instructions.
            </p>

            {resetStatus.message && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetStatus.message}</span>
              </div>
            )}

            {resetStatus.error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetStatus.error}</span>
              </div>
            )}

            {!resetStatus.message && (
              <form onSubmit={handlePasswordReset} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="shopper@example.ng"
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
                    disabled={resetStatus.loading}
                    className="px-4 py-2 bg-[#F36B25] text-white rounded-xl font-bold hover:bg-[#E05914] disabled:opacity-50"
                  >
                    {resetStatus.loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}

            {resetStatus.message && (
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
