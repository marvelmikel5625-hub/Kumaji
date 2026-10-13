import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  User,
  Package,
  Store,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatKobo } from '../../utils/currency';

export const Header: React.FC = () => {
  const { user, role, switchDemoRole, switchDemoUser, signOut } = useAuth();
  const { itemCount, subtotalKobo } = useCart();
  const { wishlistCount } = useWishlist();
  const { categories } = useMarketplace();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Smooth scroll compaction effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setRoleMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const catParam = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : '';
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}${catParam}`);
    } else if (selectedCategory) {
      navigate(`/category/${selectedCategory}`);
    }
  };

  return (
    <>
      {/* Top Banner / Announcement Bar (desktop) */}
      <div className="hidden lg:block bg-[#252525] text-white text-xs font-normal tracking-wide py-2 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-stone-300">
            <span>Verified Nigerian Merchants</span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span>Same-Day Dispatch in Lagos & Abuja</span>
            <span aria-hidden="true" className="text-stone-500">·</span>
            <span>Escrow-Protected Transactions</span>
          </div>

          <div className="flex items-center gap-5 text-stone-300">
            {/* Interactive Switch Role dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-xs font-medium"
              >
                <span className="text-stone-400">Viewing as:</span>
                <span className="text-[#F36B25] font-semibold capitalize">
                  {role === 'super_admin' ? 'Super Admin' : role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-[#252525] rounded-xl shadow-xl border border-stone-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  <button
                    type="button"
                    onClick={() => { switchDemoRole('customer'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between"
                  >
                    <span>Buyer / Customer</span>
                    {role === 'customer' && <span className="text-[#F36B25] text-xs font-bold">Active</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { switchDemoRole('seller'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between"
                  >
                    <span>Merchant (Apex Gadgets)</span>
                    {user?.id === 'user-seller-1' && <span className="text-[#F36B25] text-xs font-bold">Active</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoUser({
                        id: 'user-seller-2',
                        email: 'orders@kanoheritage.ng',
                        full_name: 'Malam Ibrahim (Kano Leather)',
                        phone: '+234 814 839 1044',
                        role: 'seller',
                        created_at: '2025-02-01T10:30:00Z',
                      });
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between"
                  >
                    <span>Merchant (Kano Leather)</span>
                    {user?.id === 'user-seller-2' && <span className="text-[#F36B25] text-xs font-bold">Active</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoUser({
                        id: 'user-seller-demo',
                        email: 'pending@kadunatextiles.ng',
                        full_name: 'Ahmad Bello (Kaduna - Pending)',
                        phone: '+234 802 819 2831',
                        role: 'seller',
                        created_at: '2025-02-28T14:00:00Z',
                      });
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between"
                  >
                    <span>Merchant (Pending Approval)</span>
                    {user?.id === 'user-seller-demo' && <span className="text-[#F36B25] text-xs font-bold">Active</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { switchDemoRole('super_admin'); setRoleMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between"
                  >
                    <span>Platform Super Admin</span>
                    {role === 'super_admin' && <span className="text-[#F36B25] text-xs font-bold">Active</span>}
                  </button>
                </div>
              )}
            </div>

            <span aria-hidden="true" className="text-stone-600">|</span>
            <Link to="/merchant/sign-in" className="hover:text-white transition-colors flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-stone-400" />
              <span>Merchant Sign In</span>
            </Link>
            <span aria-hidden="true" className="text-stone-600">|</span>
            <Link to="/seller/register" className="hover:text-white transition-colors flex items-center gap-1 text-[#F36B25] font-semibold">
              <span>Become a Seller</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 bg-white border-b border-stone-200 transition-shadow duration-200 ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        {/* DESKTOP HEADER (lg and above) */}
        <div className="hidden lg:block max-w-7xl mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between gap-8">
            {/* Left: Brand Logo & Wordmark */}
            <div className="flex items-center gap-6 shrink-0">
              <Link to="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-black tracking-tight text-[#252525]">
                  Kumaji<span className="text-[#F36B25]">.</span>
                </span>
              </Link>
              <div className="text-xs text-stone-500 font-medium">
                Nigeria <span className="text-stone-300">·</span> NGN (₦)
              </div>
            </div>

            {/* Center: Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
              <div className="flex items-center rounded-xl border border-stone-300 bg-stone-50/70 focus-within:border-[#F36B25] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#F36B25]/15 transition-all">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="hidden xl:block bg-transparent border-r border-stone-200 px-3 py-2.5 text-xs text-stone-600 focus:outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search genuine phones, fashion, leather bags, beauty..."
                    className="w-full bg-transparent px-4 py-2.5 text-sm text-[#252525] placeholder:text-stone-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 mr-2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-[#F36B25] hover:bg-[#E05914] text-white px-5 py-2.5 rounded-r-xl transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Right: User, Orders, Wishlist, Cart */}
            <div className="flex items-center gap-5 shrink-0">
              {/* Account */}
              <Link
                to={role === 'super_admin' ? '/admin' : role === 'seller' ? '/seller' : '/account'}
                className="flex items-center gap-2 text-xs font-medium text-stone-700 hover:text-[#F36B25] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                  {role === 'super_admin' ? (
                    <ShieldCheck className="w-4 h-4 text-[#F36B25]" />
                  ) : role === 'seller' ? (
                    <Store className="w-4 h-4 text-[#F36B25]" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-stone-400 leading-tight">Account</div>
                  <div className="font-semibold text-stone-800 truncate max-w-[100px]">
                    {user?.full_name?.split(' ')[0] || 'Sign In'}
                  </div>
                </div>
              </Link>

              {/* Orders */}
              <Link
                to="/account/orders"
                className="flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-[#F36B25] transition-colors"
              >
                <Package className="w-5 h-5 text-stone-600" />
                <span className="hidden xl:inline">Orders</span>
              </Link>

              {/* Wishlist */}
              <Link
                to="/account/wishlist"
                className="relative p-2 text-stone-700 hover:text-[#F36B25] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#F36B25] text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag / Cart */}
              <Link
                to="/cart"
                className="flex items-center gap-2.5 bg-stone-100/80 hover:bg-[#F36B25]/10 hover:text-[#F36B25] px-3.5 py-2 rounded-xl transition-all"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-[#252525]" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#F36B25] text-white text-[10px] font-bold flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="text-left hidden xl:block">
                  <div className="text-[10px] text-stone-500 uppercase leading-none font-medium">Cart</div>
                  <div className="text-xs font-bold text-[#252525] tabular-nums leading-tight">
                    {formatKobo(subtotalKobo)}
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Desktop Horizontal Category Navigation */}
          <div className="flex items-center gap-7 pt-3 mt-1 border-t border-stone-100 overflow-x-auto no-scrollbar text-xs font-medium text-stone-600">
            <Link
              to="/search"
              className="text-[#252525] font-semibold hover:text-[#F36B25] transition-colors whitespace-nowrap"
            >
              All Departments
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="hover:text-[#F36B25] transition-colors whitespace-nowrap text-stone-600 hover:underline underline-offset-4"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/seller/register"
              className="ml-auto text-[#F36B25] font-semibold hover:underline underline-offset-4 whitespace-nowrap"
            >
              Become a Verified Seller →
            </Link>
          </div>
        </div>

        {/* MOBILE HEADER (Option A - Mandatory Design Specification) */}
        <div className="lg:hidden">
          {/* Top Row: Hamburger Left, Wordmark Precisely Centered, Wishlist & Cart Right */}
          <div className={`relative px-4 flex items-center justify-between transition-all ${
            isScrolled ? 'py-2.5' : 'py-3'
          }`}>
            {/* Left Control: Hamburger Menu Button */}
            <div className="w-16 flex items-center justify-start">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-stone-800 hover:text-[#F36B25] rounded-lg transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Geometric Center: Kumaji Text Wordmark precisely centered in viewport */}
            <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
              <Link to="/" className="inline-block text-center">
                <span className="text-xl font-black tracking-tight text-[#252525]">
                  Kumaji<span className="text-[#F36B25]">.</span>
                </span>
              </Link>
            </div>

            {/* Right Controls: Wishlist and Shopping Bag / Cart */}
            <div className="w-16 flex items-center justify-end gap-1">
              <Link
                to="/account/wishlist"
                className="relative p-1.5 text-stone-700 hover:text-[#F36B25]"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#F36B25] text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative p-1.5 text-stone-700 hover:text-[#F36B25]"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#F36B25] text-white text-[9px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Full-width Search Bar directly below top row */}
          <div className="px-4 pb-2.5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center rounded-xl border border-stone-300 bg-stone-50 focus-within:border-[#F36B25] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#F36B25]/15 transition-all">
                <Search className="w-4 h-4 text-stone-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search phones, fashion, lifestyle..."
                  className="w-full bg-transparent px-3 py-2 text-sm text-[#252525] placeholder:text-stone-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 mr-2 text-stone-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#F36B25] text-white px-3 py-1.5 mr-1 rounded-lg text-xs font-semibold"
                >
                  Go
                </button>
              </div>
            </form>
          </div>

          {/* Horizontally scrollable category row follows */}
          <div className="border-t border-stone-100 bg-stone-50/50 px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-4 text-xs font-medium text-stone-600">
            <Link
              to="/search"
              className="whitespace-nowrap font-semibold text-[#252525] shrink-0"
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className="whitespace-nowrap hover:text-[#F36B25] shrink-0"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (when hamburger clicked) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl z-50 flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <span className="text-xl font-black text-[#252525]">
                  Kumaji<span className="text-[#F36B25]">.</span>
                </span>
                <p className="text-[11px] text-stone-500">Nigeria's Marketplace</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-stone-600 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Persona Switcher for Quick Evaluation */}
            <div className="p-4 border-b border-stone-200 bg-stone-50/60">
              <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                Active Test Persona ({role})
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => switchDemoRole('customer')}
                  className={`py-1.5 px-2 text-xs rounded-lg font-medium border text-center ${
                    role === 'customer'
                      ? 'bg-[#F36B25] text-white border-[#F36B25]'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => switchDemoRole('seller')}
                  className={`py-1.5 px-2 text-xs rounded-lg font-medium border text-center ${
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
                  className={`py-1.5 px-2 text-xs rounded-lg font-medium border text-center ${
                    role === 'super_admin'
                      ? 'bg-[#F36B25] text-white border-[#F36B25]'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-4 space-y-1 border-b border-stone-200 text-sm">
              <Link
                to="/account"
                className="flex items-center justify-between py-2.5 text-stone-800 font-medium hover:text-[#F36B25]"
              >
                <span className="flex items-center gap-3">
                  <User className="w-4 h-4 text-stone-500" />
                  My Profile & Addresses
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/account/orders"
                className="flex items-center justify-between py-2.5 text-stone-800 font-medium hover:text-[#F36B25]"
              >
                <span className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-stone-500" />
                  My Orders & Tracking
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/merchant/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 text-stone-800 font-medium hover:text-[#F36B25]"
              >
                <span className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-stone-500" />
                  Merchant Sign In
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/seller"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 text-stone-800 font-medium hover:text-[#F36B25]"
              >
                <span className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-[#F36B25]" />
                  Merchant Hub (Seller Dashboard)
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>
              {role === 'super_admin' && (
                <Link
                  to="/admin"
                  className="flex items-center justify-between py-2.5 text-stone-800 font-medium hover:text-[#F36B25]"
                >
                  <span className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#F36B25]" />
                    Platform Admin Dashboard
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </Link>
              )}
            </div>

            {/* Category Directory */}
            <div className="p-4 flex-1">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Shop By Category
              </div>
              <div className="space-y-1">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/category/${c.slug}`}
                    className="block py-2 text-sm text-stone-700 hover:text-[#F36B25]"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50">
              <Link
                to="/seller/register"
                className="block w-full py-2.5 bg-[#F36B25] text-white text-center rounded-xl text-xs font-semibold hover:bg-[#E05914] transition-colors"
              >
                Register as Merchant
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
