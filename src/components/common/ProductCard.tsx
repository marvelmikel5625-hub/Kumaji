import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatKobo, calculateDiscountPercent } from '../../utils/currency';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const discountPercent = calculateDiscountPercent(
    product.base_price_kobo,
    product.original_price_kobo
  );

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = addToCart(product, product.variants[0], 1);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const isFavorited = isInWishlist(product.id);

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:border-stone-300 hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Product Image Slot */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[4/3] bg-stone-100 overflow-hidden block">
        <img
          src={product.images[0] || '/src/assets/images/product_phone_flagship_1791852625273.jpg'}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
        />

        {/* Wishlist Button (always functional) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all backdrop-blur-xs ${
            isFavorited
              ? 'bg-[#F36B25] text-white shadow-sm'
              : 'bg-white/85 text-stone-700 hover:bg-white hover:text-[#F36B25]'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quiet Discount or In Stock Note (Text without garish pill badges) */}
        {discountPercent > 0 && (
          <div className="absolute bottom-2.5 left-3 bg-[#252525]/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded">
            Save {discountPercent}%
          </div>
        )}
      </Link>

      {/* Card Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata: Category & Seller */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5 truncate">
            <span className="font-medium text-stone-600 truncate">{product.category_name}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.seller_name}</span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm font-semibold text-[#252525] line-clamp-2 group-hover:text-[#F36B25] transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Authentic Ratings */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-600">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-semibold text-stone-900">{product.rating.toFixed(1)}</span>
              <span className="text-stone-400">({product.review_count})</span>
            </div>
          )}
        </div>

        {/* Price & Quick Add Action Baseline */}
        <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-[#252525] tabular-nums tracking-tight">
              {formatKobo(product.base_price_kobo)}
            </div>
            {product.original_price_kobo && product.original_price_kobo > product.base_price_kobo && (
              <div className="text-xs text-stone-400 line-through tabular-nums">
                {formatKobo(product.original_price_kobo)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              added
                ? 'bg-emerald-600 text-white'
                : product.stock <= 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-stone-100 text-stone-800 hover:bg-[#F36B25] hover:text-white'
            }`}
            aria-label="Add to cart"
            title={product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
          >
            {added ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
