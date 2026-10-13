import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Eye, EyeOff, Trash2, ChevronRight } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { formatKobo } from '../../utils/currency';

export const AdminProductsPage: React.FC = () => {
  const { products, updateProduct, deleteProduct } = useMarketplace();

  const toggleFeatured = (id: string, current: boolean) => {
    updateProduct(id, { is_featured: !current });
  };

  const togglePublish = (id: string, current: boolean) => {
    updateProduct(id, { is_published: !current });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link to="/admin" className="hover:text-[#F36B25]">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-stone-900">Catalogue Moderation</span>
        </nav>

        <div className="pb-6 border-b border-stone-200">
          <h1 className="text-2xl font-bold text-[#252525]">Platform Catalogue Moderation</h1>
          <p className="text-xs text-stone-500 mt-1">
            Audit item quality, feature spotlight products on homepage, and unlist non-compliant items
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Product & Merchant</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/product/${p.slug}`}
                          className="font-bold text-stone-900 hover:text-[#F36B25] line-clamp-1 text-xs"
                        >
                          {p.title}
                        </Link>
                        <div className="text-[11px] text-stone-500">
                          Merchant: <strong>{p.seller_name}</strong> · Category: {p.category_name}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold tabular-nums text-stone-900">
                      {formatKobo(p.base_price_kobo)}
                    </td>

                    <td className="py-4 px-4 font-medium">
                      <span className={p.stock > 0 ? 'text-emerald-700' : 'text-rose-600 font-bold'}>
                        {p.stock} in stock
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(p.id, !!p.is_featured)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                          p.is_featured
                            ? 'bg-[#F36B25]/10 border-[#F36B25] text-[#F36B25]'
                            : 'bg-stone-50 border-stone-200 text-stone-400'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${p.is_featured ? 'fill-current' : ''}`} />
                        <span>{p.is_featured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          p.is_published
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {p.is_published ? 'Active' : 'Unlisted'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => togglePublish(p.id, p.is_published)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                          title={p.is_published ? 'Unlist product' : 'Publish product'}
                        >
                          {p.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100"
                          title="Remove from marketplace"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
