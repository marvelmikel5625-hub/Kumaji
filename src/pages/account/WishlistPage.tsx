import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useCart } from '../../context/CartContext';
import { ProductCard } from '../../components/common/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlistIds, clearWishlist } = useWishlist();
  const { products } = useMarketplace();

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link to="/account" className="hover:text-[#F36B25]">
            Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-900">Wishlist</span>
        </nav>

        <div className="flex items-center justify-between pb-6 border-b border-stone-200 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#252525]">My Saved Items</h1>
            <p className="text-xs text-stone-500 mt-1">
              {savedProducts.length} saved {savedProducts.length === 1 ? 'item' : 'items'} in your personal wishlist
            </p>
          </div>

          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs text-stone-500 hover:text-rose-600 font-semibold transition-colors"
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-[#252525]">Your Wishlist is Empty</h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Explore our marketplace and tap the heart icon on any product to save it here for later.
            </p>
            <Link
              to="/search"
              className="inline-block bg-[#F36B25] text-white px-5 py-2.5 rounded-xl text-xs font-semibold"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
