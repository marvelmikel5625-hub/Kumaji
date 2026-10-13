import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, CheckCircle2, ShieldCheck, CornerDownRight, Send } from 'lucide-react';
import { SellerLayout } from '../../components/seller/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useMerchantStore } from '../../hooks/useMerchantStore';
import { ProductReview } from '../../types';

interface ReviewWithProduct extends ProductReview {
  productTitle: string;
  productImage: string;
}

export const SellerReviewsPage: React.FC = () => {
  const { store: currentStore } = useMerchantStore();
  const { products, reviews } = useMarketplace();

  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<Record<string, string>>({});

  const storeProducts = useMemo(() => {
    if (!currentStore) return [];
    return products.filter((p) => p.seller_id === currentStore.id);
  }, [products, currentStore]);

  // Aggregate all reviews across store products
  const storeReviews: ReviewWithProduct[] = useMemo(() => {
    const list: ReviewWithProduct[] = [];
    storeProducts.forEach((p) => {
      const pReviews = reviews[p.id] || [];
      pReviews.forEach((r) => {
        list.push({
          ...r,
          productTitle: p.title,
          productImage: p.images[0],
        });
      });
    });
    return list;
  }, [storeProducts, reviews]);

  const filteredReviews = useMemo(() => {
    return storeReviews.filter((r) => {
      if (starFilter !== 'all' && Math.round(r.rating) !== starFilter) return false;
      if (selectedProductFilter !== 'all' && r.product_id !== selectedProductFilter) return false;
      return true;
    });
  }, [storeReviews, starFilter, selectedProductFilter]);

  const averageRating = useMemo(() => {
    if (storeReviews.length === 0) return currentStore?.rating || 4.8;
    const sum = storeReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / storeReviews.length;
  }, [storeReviews, currentStore]);

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setReplies((prev) => ({
      ...prev,
      [reviewId]: replyText.trim(),
    }));
    setReplyText('');
    setReplyingReviewId(null);
  };

  return (
    <SellerLayout
      title="Customer Reviews & Reputation"
      subtitle={`Customer feedback and seller ratings for ${currentStore?.store_name}`}
    >
      <div className="space-y-6">
        {/* Rating Overview Summary */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-5">
            <div className="text-center p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="text-3xl font-black text-[#252525] tabular-nums">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center text-amber-500 justify-center my-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.round(averageRating) ? 'fill-current' : 'text-stone-200'}`}
                  />
                ))}
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                {storeReviews.length} total reviews
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#252525]">
                Verified Store Rating
              </h2>
              <p className="text-xs text-stone-500 max-w-md leading-relaxed">
                Reputation is calculated from genuine confirmed buyer purchases. Fast shipping and responsive replies preserve your verified seller badge.
              </p>
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Good Standing: Standard 8.5% platform commission rate applies</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/seller/products"
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold"
            >
              View Products
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-stone-200 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-stone-400 font-semibold mr-1">Rating:</span>
            {(['all', 5, 4, 3, 2, 1] as const).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setStarFilter(star)}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                  starFilter === star
                    ? 'bg-[#252525] text-white font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {star === 'all' ? 'All Ratings' : `${star} Stars`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-semibold">Filter by Product:</span>
            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
              className="p-1.5 border border-stone-300 rounded-xl text-stone-800 bg-white"
            >
              <option value="all">All Store Products</option>
              {storeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((rev) => (
              <div key={rev.id} className="p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.productImage}
                      alt={rev.productTitle}
                      className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-xs text-stone-900">{rev.user_name}</div>
                      <Link
                        to={`/product/${rev.product_id}`}
                        className="text-[11px] text-[#F36B25] hover:underline line-clamp-1"
                      >
                        {rev.productTitle}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-stone-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50/50 p-3.5 rounded-2xl border border-stone-100">
                  {rev.comment}
                </p>

                {/* Seller Reply Box if present */}
                {replies[rev.id] && (
                  <div className="pl-6 pt-1 space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#F36B25]">
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Official Merchant Response:</span>
                    </div>
                    <p className="text-xs text-stone-600 bg-orange-50/50 border border-orange-100 p-3 rounded-xl leading-relaxed">
                      {replies[rev.id]}
                    </p>
                  </div>
                )}

                {/* Reply action button */}
                {!replies[rev.id] && (
                  <div>
                    {replyingReviewId === rev.id ? (
                      <div className="pt-2 space-y-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type an official seller reply to this buyer review..."
                          className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingReviewId(null);
                              setReplyText('');
                            }}
                            className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(rev.id)}
                            className="px-3.5 py-1.5 bg-[#F36B25] text-white rounded-lg text-xs font-bold hover:bg-[#E05914] flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Post Reply</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText('');
                        }}
                        className="text-[11px] font-semibold text-stone-500 hover:text-[#F36B25] flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reply as Store</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-stone-500 space-y-1">
              <p>No customer reviews match the selected filter criteria.</p>
              <p className="text-[11px] text-stone-400">
                Reviews will appear here as shoppers receive orders and provide feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};
