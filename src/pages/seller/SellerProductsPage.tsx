import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  BarChart3,
  Eye,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { SellerLayout } from '../../components/seller/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useMerchantStore } from '../../hooks/useMerchantStore';
import { formatKobo } from '../../utils/currency';
import { Product } from '../../types';

export const SellerProductsPage: React.FC = () => {
  const { store: currentStore } = useMerchantStore();
  const { products, categories, addProduct, updateProduct, deleteProduct } = useMarketplace();
  const navigate = useNavigate();

  const storeProducts = useMemo(() => {
    if (!currentStore) return [];
    return products.filter((p) => p.seller_id === currentStore.id);
  }, [products, currentStore]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Deletion modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return storeProducts.filter((p) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesSku = p.variants.some((v) => v.sku.toLowerCase().includes(q));
        if (!matchesTitle && !matchesBrand && !matchesSku) return false;
      }

      if (selectedCategory && p.category_id !== selectedCategory) {
        return false;
      }

      if (selectedStatus === 'published' && (!p.is_published || p.stock <= 0)) return false;
      if (selectedStatus === 'draft' && p.is_published) return false;
      if (selectedStatus === 'out_of_stock' && p.stock > 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_high') return b.base_price_kobo - a.base_price_kobo;
      if (sortBy === 'price_low') return a.base_price_kobo - b.base_price_kobo;
      if (sortBy === 'stock_low') return a.stock - b.stock;
      if (sortBy === 'views') return (b.views_count || 0) - (a.views_count || 0);
      if (sortBy === 'units_sold') return (b.units_sold || 0) - (a.units_sold || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [storeProducts, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const handleDuplicate = (p: Product) => {
    const duplicatedSku = `CPY-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProduct: Omit<Product, 'id' | 'created_at'> = {
      ...p,
      title: `${p.title} (Copy)`,
      slug: `${p.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'draft',
      is_published: false,
      variants: p.variants.map((v) => ({
        ...v,
        id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sku: `${v.sku}-CPY`,
      })),
      views_count: 0,
      clicks_count: 0,
      add_to_cart_count: 0,
      units_sold: 0,
      orders_count: 0,
    };
    addProduct(newProduct);
    setToastMessage(`Created draft duplicate of "${p.title}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (productToDelete && currentStore && productToDelete.seller_id === currentStore.id) {
      deleteProduct(productToDelete.id);
      setToastMessage(`Listing "${productToDelete.title}" removed.`);
      setProductToDelete(null);
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setProductToDelete(null);
    }
  };

  return (
    <SellerLayout
      title="My Products Management"
      subtitle={`Manage inventory, pricing, variants, and product performance for ${currentStore?.store_name}`}
    >
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search products by title, brand, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
              />
            </div>

            <Link
              to="/seller/products/new"
              className="w-full sm:w-auto bg-[#F36B25] hover:bg-[#E05914] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-stone-300 rounded-xl p-2 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-stone-300 rounded-xl p-2 bg-white"
              >
                <option value="all">All Statuses ({storeProducts.length})</option>
                <option value="published">Published & In Stock</option>
                <option value="draft">Drafts</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                Sort Listings By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-stone-300 rounded-xl p-2 bg-white"
              >
                <option value="newest">Recently Added</option>
                <option value="price_high">Price: High to Low</option>
                <option value="price_low">Price: Low to High</option>
                <option value="stock_low">Low Stock Alerts</option>
                <option value="views">Most Views</option>
                <option value="units_sold">Most Units Sold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Product Details</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Available Stock</th>
                  <th className="py-3.5 px-4">Performance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3 min-w-[260px]">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/seller/products/edit/${p.id}`}
                          className="font-bold text-stone-900 hover:text-[#F36B25] line-clamp-1 block text-xs"
                        >
                          {p.title}
                        </Link>
                        <div className="text-[11px] text-stone-400 font-mono">
                          SKU: {p.variants[0]?.sku || `SKU-${p.id}`} · {p.category_name}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold tabular-nums text-stone-900 whitespace-nowrap">
                      {formatKobo(p.base_price_kobo)}
                    </td>

                    <td className="py-4 px-4 font-medium whitespace-nowrap">
                      <span className={p.stock > 0 ? 'text-emerald-700' : 'text-rose-600 font-bold'}>
                        {p.stock} units
                      </span>
                    </td>

                    <td className="py-4 px-4 text-stone-500 whitespace-nowrap">
                      <div className="text-[11px]">
                        <strong>{p.views_count || 0}</strong> views · <strong className="text-emerald-700">{p.units_sold || 0}</strong> sold
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.is_published && p.stock > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.stock <= 0
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {p.is_published && p.stock > 0
                          ? 'Published'
                          : p.stock <= 0
                          ? 'Out of Stock'
                          : 'Draft'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/seller/products/edit/${p.id}`}
                          className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/seller/analytics/${p.id}`}
                          className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                          title="View product analytics"
                        >
                          <BarChart3 className="w-4 h-4 text-[#F36B25]" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
                          title="Duplicate listing"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 cursor-pointer"
                          title="Delete listing"
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

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-xs text-stone-500 space-y-2">
              <p>No products match the selected filters or search terms.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedStatus('all');
                }}
                className="text-[#F36B25] font-semibold hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* Confirmation Modal for Destructive Delete */}
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setProductToDelete(null)}
            />
            <div className="relative bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-6 shadow-2xl z-50 space-y-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#252525]">Delete Product Listing?</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Are you sure you want to remove &ldquo;{productToDelete.title}&rdquo;? Historical customer orders will preserve their purchase snapshots.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};
