import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Store, Sparkles, ChevronRight } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/common/ProductCard';

export const HomePage: React.FC = () => {
  const { products, categories, sellers } = useMarketplace();

  const featuredProducts = products.filter((p) => p.is_featured);
  const dealsProducts = products.filter(
    (p) => p.original_price_kobo && p.original_price_kobo > p.base_price_kobo
  );
  const newArrivals = [...products].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Brand Message & Direct Category Routes */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F36B25] tracking-wide uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Nigeria's Trusted Multi-Vendor Marketplace</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#252525] text-balance leading-tight">
                Authentic merchants. Genuine products. Escrow-protected checkout.
              </h1>

              <p className="text-base text-stone-600 max-w-xl leading-relaxed">
                Shop verified Nigerian independent sellers across flagship smartphones, tailored African couture, handcrafted northern leather, and natural skincare with guaranteed doorstep delivery.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/search"
                  className="bg-[#F36B25] hover:bg-[#E05914] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/seller/register"
                  className="bg-stone-100 hover:bg-stone-200 text-[#252525] px-5 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-[#F36B25]" />
                  <span>Sell on Kumaji</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-stone-100 flex items-center gap-6 text-xs text-stone-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Buyer Escrow Protection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-stone-600" />
                  <span>Verified Merchant Audits</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero High-Fidelity Photography Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] shadow-lg border border-stone-200">
                <img
                  src="/src/assets/images/hero_marketplace_nigeria_1791852624023.jpg"
                  alt="Modern African shopping experience in Lagos"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <div className="text-xs font-semibold text-[#F36B25]">Featured Merchant Spotlight</div>
                    <div className="text-lg font-bold">Lagos Modern Tailors & Kano Leatherworks</div>
                    <div className="text-xs text-stone-200 mt-1">Curated contemporary African designs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY HORIZONTAL HIGHLIGHTS */}
      <section className="py-10 border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#252525]">Shop by Department</h2>
              <p className="text-xs text-stone-500">Browse verified collections from certified sellers</p>
            </div>
            <Link
              to="/search"
              className="text-xs font-semibold text-[#F36B25] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-[#F36B25]/50 hover:shadow-xs transition-all text-center flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-[#F36B25]/10 flex items-center justify-center text-[#252525] group-hover:text-[#F36B25] transition-colors">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-stone-800 group-hover:text-[#F36B25] transition-colors line-clamp-1">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS & POPULAR DEALS */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#252525]">Featured Marketplace Picks</h2>
            <p className="text-xs text-stone-500 mt-0.5">Top-rated items with verified merchant warranty and fast dispatch</p>
          </div>
          <Link
            to="/search?featured=true"
            className="text-xs font-semibold text-[#F36B25] hover:underline flex items-center gap-1"
          >
            <span>See more</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
            No featured products currently in stock.
          </div>
        )}
      </section>

      {/* 4. REAL DEALS & OFFERS */}
      {dealsProducts.length > 0 && (
        <section className="py-12 bg-white border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#F36B25] mb-1">
                  Verified Promotions
                </div>
                <h2 className="text-xl font-bold text-[#252525]">Limited Merchant Price Drops</h2>
                <p className="text-xs text-stone-500 mt-0.5">Discounts verified against actual historical merchant prices</p>
              </div>
              <Link
                to="/search?deals=true"
                className="text-xs font-semibold text-[#F36B25] hover:underline flex items-center gap-1"
              >
                <span>View all deals</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {dealsProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. FEATURED INDEPENDENT SELLERS */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#252525]">Meet Verified Kumaji Merchants</h2>
            <p className="text-xs text-stone-500 mt-0.5">Independent business owners, technology hubs, and craft masters</p>
          </div>
          <Link
            to="/seller/register"
            className="text-xs font-semibold text-[#F36B25] hover:underline flex items-center gap-1"
          >
            <span>Apply as Seller</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                    <img
                      src={seller.logo_url}
                      alt={seller.store_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#252525] line-clamp-1">{seller.store_name}</h3>
                    <div className="text-xs text-stone-500 font-medium">
                      {seller.city}, {seller.state}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                  {seller.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Store
                </span>
                <Link
                  to={`/search?seller=${encodeURIComponent(seller.id)}`}
                  className="font-medium text-[#F36B25] hover:underline"
                >
                  View Inventory →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. RECRUITMENT CALLOUT FOR SELLERS */}
      <section className="py-14 bg-stone-900 text-white border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border border-stone-700/80 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <div className="text-xs font-semibold text-[#F36B25] uppercase tracking-wider">
                Seller Empowerment Programme
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Grow your brand nationwide on Kumaji
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed">
                Connect directly with premium shoppers across Lagos, Abuja, Port Harcourt, and beyond. We handle escrow payments, dispute mediation, and verified logistics partners while you focus on quality products.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
              <Link
                to="/seller/register"
                className="bg-[#F36B25] hover:bg-[#E05914] text-white px-7 py-3.5 rounded-xl font-bold text-sm text-center transition-all shadow-sm"
              >
                Apply for Merchant Account
              </Link>
              <Link
                to="/seller"
                className="bg-white/10 hover:bg-white/15 text-white px-6 py-3.5 rounded-xl font-semibold text-sm text-center transition-colors border border-white/10"
              >
                Access Merchant Hub
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
