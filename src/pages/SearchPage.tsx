import React, { useState, useMemo } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  Filter,
  X,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpDown,
  Search as SearchIcon,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/common/ProductCard';
import { formatKobo, nairaToKobo } from '../utils/currency';

export const SearchPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, sellers } = useMarketplace();

  // URL query params
  const query = searchParams.get('q') || '';
  const filterCat = categorySlug || searchParams.get('category') || '';
  const filterSeller = searchParams.get('seller') || '';
  const filterFeatured = searchParams.get('featured') === 'true';
  const filterDeals = searchParams.get('deals') === 'true';

  // Local filter states
  const [minPriceNaira, setMinPriceNaira] = useState<string>('');
  const [maxPriceNaira, setMaxPriceNaira] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Available brands derived from data
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [products]);

  // Current category metadata
  const currentCategory = useMemo(() => {
    if (!filterCat) return null;
    return categories.find((c) => c.slug === filterCat);
  }, [categories, filterCat]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Text Search query
      if (query) {
        const q = query.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesSeller = p.seller_name.toLowerCase().includes(q);
        const matchesCategory = p.category_name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesBrand && !matchesSeller && !matchesCategory) {
          return false;
        }
      }

      // 2. Category filter
      if (filterCat) {
        const cat = categories.find((c) => c.slug === filterCat);
        if (cat && p.category_id !== cat.id) return false;
      }

      // 3. Seller filter
      if (filterSeller && p.seller_id !== filterSeller) {
        return false;
      }

      // 4. Featured filter
      if (filterFeatured && !p.is_featured) {
        return false;
      }

      // 5. Deals filter
      if (filterDeals && (!p.original_price_kobo || p.original_price_kobo <= p.base_price_kobo)) {
        return false;
      }

      // 6. In stock only
      if (inStockOnly && p.stock <= 0) {
        return false;
      }

      // 7. Price range (min & max in kobo)
      if (minPriceNaira) {
        const minKobo = nairaToKobo(minPriceNaira);
        if (p.base_price_kobo < minKobo) return false;
      }
      if (maxPriceNaira) {
        const maxKobo = nairaToKobo(maxPriceNaira);
        if (p.base_price_kobo > maxKobo) return false;
      }

      // 8. Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.base_price_kobo - b.base_price_kobo;
      if (sortBy === 'price_desc') return b.base_price_kobo - a.base_price_kobo;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0; // Default recommended
    });
  }, [
    products,
    query,
    filterCat,
    filterSeller,
    filterFeatured,
    filterDeals,
    inStockOnly,
    minPriceNaira,
    maxPriceNaira,
    selectedBrands,
    sortBy,
    categories,
  ]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setMinPriceNaira('');
    setMaxPriceNaira('');
    setSelectedBrands([]);
    setInStockOnly(false);
    setSortBy('recommended');
  };

  const activeFiltersCount =
    (minPriceNaira ? 1 : 0) +
    (maxPriceNaira ? 1 : 0) +
    selectedBrands.length +
    (inStockOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Hierarchy */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6 truncate">
          <Link to="/" className="hover:text-[#F36B25] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/search" className="hover:text-[#F36B25] transition-colors">
            Catalogue
          </Link>
          {currentCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-stone-900">{currentCategory.name}</span>
            </>
          )}
          {query && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-medium text-stone-800">Search: &ldquo;{query}&rdquo;</span>
            </>
          )}
        </nav>

        {/* Page Title & Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#252525] tracking-tight">
              {currentCategory ? currentCategory.name : query ? `Results for "${query}"` : 'Marketplace Catalogue'}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Showing {filteredProducts.length} authenticated items from verified Nigerian sellers
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Trigger */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-700"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#F36B25]" />
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#F36B25] font-medium cursor-pointer"
              >
                <option value="recommended">Featured / Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar Filters (desktop) + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Filter Products
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-[#F36B25] hover:underline font-semibold"
                  >
                    Reset all
                  </button>
                )}
              </div>

              {/* Department Selector */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-2">Department</label>
                <div className="space-y-1.5 text-xs">
                  <Link
                    to="/search"
                    className={`block py-1 hover:text-[#F36B25] ${
                      !filterCat ? 'text-[#F36B25] font-bold' : 'text-stone-600'
                    }`}
                  >
                    All Departments
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/category/${c.slug}`}
                      className={`block py-1 hover:text-[#F36B25] ${
                        filterCat === c.slug ? 'text-[#F36B25] font-bold' : 'text-stone-600'
                      }`}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Range (in NGN) */}
              <div className="pt-4 border-t border-stone-100">
                <label className="text-xs font-bold text-stone-800 block mb-2">Price Range (₦)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ₦"
                    value={minPriceNaira}
                    onChange={(e) => setMinPriceNaira(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-lg p-2 focus:outline-none focus:border-[#F36B25]"
                  />
                  <input
                    type="number"
                    placeholder="Max ₦"
                    value={maxPriceNaira}
                    onChange={(e) => setMaxPriceNaira(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-lg p-2 focus:outline-none focus:border-[#F36B25]"
                  />
                </div>
              </div>

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div className="pt-4 border-t border-stone-100">
                  <label className="text-xs font-bold text-stone-800 block mb-2">Brand</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBrands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded text-[#F36B25] focus:ring-[#F36B25]"
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Availability */}
              <div className="pt-4 border-t border-stone-100">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-[#F36B25] focus:ring-[#F36B25]"
                  />
                  <span className="font-semibold text-stone-800">In Stock Items Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Cards Grid Area */}
          <main className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                  <SearchIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#252525]">No matching products found</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try adjusting your keywords, broadening your price range, or clearing selected filters to find what you are looking for.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="bg-[#F36B25] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#E05914] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl z-50 flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <span className="font-bold text-sm text-[#252525]">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 py-4 flex-1">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-2">Price (₦)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ₦"
                    value={minPriceNaira}
                    onChange={(e) => setMinPriceNaira(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-lg p-2"
                  />
                  <input
                    type="number"
                    placeholder="Max ₦"
                    value={maxPriceNaira}
                    onChange={(e) => setMaxPriceNaira(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-2">Brand</label>
                <div className="space-y-2">
                  {availableBrands.map((b) => (
                    <label key={b} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b)}
                        onChange={() => toggleBrand(b)}
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex gap-2">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-2 text-xs font-semibold border border-stone-300 rounded-xl"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs font-semibold bg-[#F36B25] text-white rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
