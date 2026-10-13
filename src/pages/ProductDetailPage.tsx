import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ShoppingBag,
  Store,
  ChevronRight,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductVariant } from '../types';
import { formatKobo, calculateDiscountPercent } from '../utils/currency';
import { NIGERIAN_STATES, getDeliveryQuote } from '../utils/delivery';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, getProductBySlug, getSellerById, reviews, addProductReview } = useMarketplace();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const product = getProductBySlug(slug || '');

  // Active selected variant & active image
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Delivery calculator state
  const [selectedState, setSelectedState] = useState('Lagos');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Initialize selected variant when product loads
  React.useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  const seller = useMemo(() => {
    if (!product) return null;
    return getSellerById(product.seller_id);
  }, [product, getSellerById]);

  const deliveryQuote = useMemo(() => {
    return getDeliveryQuote(selectedState);
  }, [selectedState]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl border border-stone-200 max-w-md">
          <h2 className="text-lg font-bold text-[#252525] mb-2">Product Not Found</h2>
          <p className="text-xs text-stone-500 mb-6">
            The requested product is unavailable or may have been unlisted by the merchant.
          </p>
          <Link
            to="/search"
            className="bg-[#F36B25] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#E05914] transition-colors"
          >
            Explore Catalogue
          </Link>
        </div>
      </div>
    );
  }

  // Active price & stock dynamically updated from variant
  const currentPriceKobo = selectedVariant ? selectedVariant.price_kobo : product.base_price_kobo;
  const currentOriginalPriceKobo = selectedVariant?.original_price_kobo || product.original_price_kobo;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant ? selectedVariant.sku : `SKU-${product.id}`;
  const discountPercent = calculateDiscountPercent(currentPriceKobo, currentOriginalPriceKobo);

  const productReviews = reviews[product.id] || [];

  const handleAddToCart = () => {
    const success = addToCart(product, selectedVariant || undefined, quantity);
    if (success) {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    }
  };

  const handleBuyNow = () => {
    const success = addToCart(product, selectedVariant || undefined, quantity);
    if (success) {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    addProductReview(
      product.id,
      reviewRating,
      reviewComment.trim(),
      user?.full_name || 'Verified Buyer',
      user?.id || 'usr-guest'
    );
    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Related products in same category
  const relatedProducts = products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  const isFavorited = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Hierarchy */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6 truncate">
          <Link to="/" className="hover:text-[#F36B25]">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/category/${product.category_id.replace('cat-', '')}`} className="hover:text-[#F36B25]">
            {product.category_name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-900 truncate max-w-xs">{product.title}</span>
        </nav>

        {/* CONTIGUOUS PURCHASE MODULE & GALLERY (2-Column Desktop Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-stone-200">
          {/* LEFT: Multi-image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-opacity duration-300"
              />

              {/* Wishlist Button on Gallery */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full transition-all backdrop-blur-xs ${
                  isFavorited
                    ? 'bg-[#F36B25] text-white shadow-sm'
                    : 'bg-white/90 text-stone-700 hover:text-[#F36B25]'
                }`}
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>

              {/* Genuine Discount Callout */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-[#252525] text-white text-xs font-bold px-3 py-1 rounded-md">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-[#F36B25] ring-2 ring-[#F36B25]/20'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Story & Detailed Description */}
            <div className="pt-6 border-t border-stone-200 space-y-3">
              <h3 className="text-sm font-bold text-[#252525] uppercase tracking-wider">
                Product Specifications & Story
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* RIGHT: Contiguous Purchase Module */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-5">
              {/* Brand & Seller Unboxed Metadata */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold text-stone-700 uppercase tracking-wide">
                  Brand: {product.brand}
                </span>
                <span className="font-mono text-stone-400">SKU: {currentSku}</span>
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-[#252525] leading-snug">
                {product.title}
              </h1>

              {/* Rating & Review Summary */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-stone-900">{product.rating.toFixed(1)}</span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-500">{product.review_count} verified buyer ratings</span>
              </div>

              {/* Price & Discount Display */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#252525] tabular-nums tracking-tight">
                    {formatKobo(currentPriceKobo)}
                  </div>
                  {currentOriginalPriceKobo && currentOriginalPriceKobo > currentPriceKobo && (
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className="line-through text-stone-400 tabular-nums">
                        {formatKobo(currentOriginalPriceKobo)}
                      </span>
                      <span className="text-[#F36B25] font-semibold">Save {discountPercent}%</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-semibold ${
                      currentStock > 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {currentStock > 0 ? `In Stock (${currentStock} available)` : 'Out of Stock'}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">VAT inclusive</div>
                </div>
              </div>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#252525] uppercase tracking-wider block">
                    Select Option / Edition:
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariant(v);
                            setQuantity(1);
                          }}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#F36B25] bg-[#F36B25]/5 text-[#252525] ring-1 ring-[#F36B25]'
                              : 'border-stone-200 hover:border-stone-300 text-stone-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{v.title}</div>
                            <div className="text-[11px] text-stone-500 font-mono">Stock: {v.stock}</div>
                          </div>
                          <div className="font-bold tabular-nums text-stone-900">
                            {formatKobo(v.price_kobo)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-stone-800">Quantity</span>
                <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold tabular-nums text-[#252525]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Primary CTAs: Add to Cart & Buy Now */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={currentStock <= 0}
                    className={`py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      addedToast
                        ? 'bg-emerald-600 text-white'
                        : currentStock <= 0
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-stone-100 text-[#252525] hover:bg-stone-200 border border-stone-300'
                    }`}
                  >
                    {addedToast ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={currentStock <= 0}
                    className="py-3.5 px-4 rounded-xl text-xs font-bold bg-[#F36B25] hover:bg-[#E05914] text-white flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nigerian Delivery Estimate Calculator */}
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#F36B25]" />
                    Delivery Destination:
                  </span>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="text-xs border border-stone-300 rounded-lg px-2 py-1 bg-white font-medium text-stone-800"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/70 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Doorstep Timeline:</span>
                    <span className="font-semibold text-stone-900">{deliveryQuote.daysEstimate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Shipping Fee:</span>
                    <span className="font-bold text-[#252525] tabular-nums">
                      {formatKobo(deliveryQuote.feeKobo)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Merchant Card */}
              {seller && (
                <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                      <img
                        src={seller.logo_url}
                        alt={seller.store_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#252525]">{seller.store_name}</div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {seller.city}, {seller.state}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/search?seller=${encodeURIComponent(seller.id)}`}
                    className="text-xs font-semibold text-[#F36B25] hover:underline"
                  >
                    Visit Store
                  </Link>
                </div>
              )}

              {/* Marketplace Buyer Protection Badges */}
              <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-3 text-[11px] text-stone-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Escrow Safe Payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>{product.return_policy_days}-Day Verified Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <section className="py-12 border-b border-stone-200">
          <div className="max-w-4xl space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#252525]">Customer Ratings & Reviews</h2>
              <p className="text-xs text-stone-500 mt-1">
                Authentic feedback from verified shoppers who purchased this item
              </p>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-4">
              {productReviews.length > 0 ? (
                productReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{rev.user_name}</span>
                        {rev.verified_purchase && (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-stone-400">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center text-xs text-stone-500">
                  No written reviews yet for this product. Be the first to share your experience!
                </div>
              )}
            </div>

            {/* Leave a Review Form */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#252525]">Write a Review</h3>

              {reviewSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Your review has been verified and added to this product!
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Your Rating:
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? 'fill-current' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Feedback & Experience:
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share details on packaging quality, speed of delivery, authenticity, and sizing..."
                    required
                    className="w-full text-xs border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#F36B25] hover:bg-[#E05914] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  Submit Verified Review
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="py-12">
            <h2 className="text-lg font-bold text-[#252525] mb-6">More in {product.category_name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* MOBILE STICKY BUY BAR (PDP Bottom Contract) */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-white border-t border-stone-200 p-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <div className="text-base font-extrabold text-[#252525] tabular-nums">
            {formatKobo(currentPriceKobo)}
          </div>
          <div className="text-[10px] text-stone-500">
            {currentStock > 0 ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={currentStock <= 0}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-stone-300 bg-stone-100 text-[#252525]"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={currentStock <= 0}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F36B25] text-white"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
