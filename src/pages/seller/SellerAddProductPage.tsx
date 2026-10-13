import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Truck,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Eye,
} from 'lucide-react';
import { SellerLayout } from '../../components/seller/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useMerchantStore } from '../../hooks/useMerchantStore';
import { isSupabaseConfigured } from '../../services/supabase';
import { ProductVariant, ProductCondition, DeliveryAvailability, ProductStatus } from '../../types';
import { nairaToKobo, koboToNaira, formatKobo } from '../../utils/currency';
import { NIGERIAN_STATES } from '../../utils/delivery';

export const SellerAddProductPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const { store: currentStore } = useMerchantStore();
  const { products, categories, addProduct, updateProduct } = useMarketplace();
  const navigate = useNavigate();

  // Active step in the form: 1 (Basics), 2 (Media), 3 (Variants & Price), 4 (Delivery & Policies)
  const [currentStep, setCurrentStep] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('cat-phones');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('new');
  const [description, setDescription] = useState('');

  // Media
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  // Pricing & Inventory
  const [priceNaira, setPriceNaira] = useState('');
  const [originalPriceNaira, setOriginalPriceNaira] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('15');

  // Category-Aware Variants
  const [enableVariants, setEnableVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<ProductVariant[]>([]);

  // Delivery & Location
  const [deliveryAvailability, setDeliveryAvailability] = useState<DeliveryAvailability>('available');
  const [pickupAddress, setPickupAddress] = useState(currentStore?.address || '');
  const [deliveryWindow, setDeliveryWindow] = useState('1–2 business days');
  const [customFeeNaira, setCustomFeeNaira] = useState('');
  const [weightKg, setWeightKg] = useState('0.5');
  const [dimLength, setDimLength] = useState('15');
  const [dimWidth, setDimWidth] = useState('10');
  const [dimHeight, setDimHeight] = useState('5');
  const [returnPolicyDays, setReturnPolicyDays] = useState(7);

  // Check if trying to edit a product belonging to another merchant
  const existingProduct = isEditing && id ? products.find((p) => p.id === id) : null;
  const isUnauthorizedEdit = Boolean(
    existingProduct && currentStore && existingProduct.seller_id !== currentStore.id
  );

  // Load existing product if in editing mode
  useEffect(() => {
    if (isEditing && id && existingProduct && currentStore) {
      if (existingProduct.seller_id === currentStore.id) {
        setTitle(existingProduct.title);
        setCategoryId(existingProduct.category_id);
        setSubcategoryId(existingProduct.subcategory_id || '');
        setBrand(existingProduct.brand);
        setCondition(existingProduct.condition || 'new');
        setDescription(existingProduct.description);
        setMainImageUrl(existingProduct.images[0] || '');
        setAdditionalImages(existingProduct.images.slice(1));
        setPriceNaira(koboToNaira(existingProduct.base_price_kobo).toString());
        setOriginalPriceNaira(existingProduct.original_price_kobo ? koboToNaira(existingProduct.original_price_kobo).toString() : '');
        setSku(existingProduct.variants[0]?.sku || `SKU-${existingProduct.id}`);
        setStock(existingProduct.stock.toString());
        setVariantsList(existingProduct.variants || []);
        setEnableVariants(existingProduct.variants && existingProduct.variants.length > 1);
        setDeliveryAvailability(existingProduct.delivery_availability || 'available');
        setPickupAddress(existingProduct.pickup_address || currentStore?.address || '');
        setDeliveryWindow(existingProduct.delivery_window || '1–2 business days');
        setCustomFeeNaira(existingProduct.custom_delivery_charge_kobo ? koboToNaira(existingProduct.custom_delivery_charge_kobo).toString() : '');
        setWeightKg(existingProduct.weight_kg ? existingProduct.weight_kg.toString() : '0.5');
        setReturnPolicyDays(existingProduct.return_policy_days || 7);
      }
    }
  }, [isEditing, id, existingProduct, currentStore]);

  // Derived subcategories for selected category
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Generate Unique SKU helper
  const handleGenerateSku = () => {
    const catCode = categoryId.replace('cat-', '').toUpperCase().slice(0, 3);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const generated = `${catCode}-${rand}`;
    setSku(generated);
  };

  // Device file upload handler (converts to data URL for instant high-fidelity preview)
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        if (resultUrl) {
          if (!mainImageUrl) {
            setMainImageUrl(resultUrl);
          } else {
            setAdditionalImages((prev) => [...prev, resultUrl]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add additional image
  const handleAddImage = () => {
    if (newImageUrlInput.trim()) {
      setAdditionalImages([...additionalImages, newImageUrlInput.trim()]);
      setNewImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  // Quick Variant Preset Generator depending on category
  const handleAddPresetVariants = () => {
    const baseKobo = nairaToKobo(priceNaira || '10000');
    if (categoryId === 'cat-phones' || categoryId === 'cat-electronics') {
      setVariantsList([
        {
          id: `var-${Date.now()}-1`,
          product_id: '',
          sku: `${sku || 'SKU'}-128GB`,
          title: 'Titanium / 128GB Storage',
          attributes: { storage: '128GB', color: 'Titanium' },
          price_kobo: baseKobo,
          stock: 10,
        },
        {
          id: `var-${Date.now()}-2`,
          product_id: '',
          sku: `${sku || 'SKU'}-256GB`,
          title: 'Space Black / 256GB Storage',
          attributes: { storage: '256GB', color: 'Space Black' },
          price_kobo: Math.round(baseKobo * 1.15),
          stock: 10,
        },
      ]);
    } else if (categoryId.includes('fashion') || categoryId === 'cat-bags-shoes') {
      setVariantsList([
        {
          id: `var-${Date.now()}-1`,
          product_id: '',
          sku: `${sku || 'SKU'}-M`,
          title: 'Medium / Size M',
          attributes: { size: 'M' },
          price_kobo: baseKobo,
          stock: 12,
        },
        {
          id: `var-${Date.now()}-2`,
          product_id: '',
          sku: `${sku || 'SKU'}-L`,
          title: 'Large / Size L',
          attributes: { size: 'L' },
          price_kobo: baseKobo,
          stock: 8,
        },
      ]);
    } else {
      setVariantsList([
        {
          id: `var-${Date.now()}-1`,
          product_id: '',
          sku: `${sku || 'SKU'}-STD`,
          title: 'Standard Edition',
          attributes: { style: 'Standard' },
          price_kobo: baseKobo,
          stock: 15,
        },
      ]);
    }
    setEnableVariants(true);
  };

  const handleSaveListing = async (status: ProductStatus = 'published') => {
    setFormError(null);

    if (!currentStore) {
      setFormError('No active merchant store found. Please create or connect your store.');
      return;
    }

    if (isEditing && existingProduct && existingProduct.seller_id !== currentStore.id) {
      setFormError('Unauthorized: You cannot modify products belonging to another merchant store.');
      return;
    }

    if (!title.trim()) {
      setFormError('Please enter a product title.');
      setCurrentStep(1);
      return;
    }
    if (!description.trim()) {
      setFormError('Please provide a detailed product description.');
      setCurrentStep(1);
      return;
    }
    if (!priceNaira || parseFloat(priceNaira) <= 0) {
      setFormError('Please specify a valid product selling price in Naira.');
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);

    const basePriceKobo = nairaToKobo(priceNaira);
    const origPriceKobo = originalPriceNaira && parseFloat(originalPriceNaira) > parseFloat(priceNaira)
      ? nairaToKobo(originalPriceNaira)
      : undefined;

    const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const finalMainImage = mainImageUrl.trim() || '/src/assets/images/product_phone_flagship_1791852625273.jpg';
    const allImages = [finalMainImage, ...additionalImages];

    const finalVariants: ProductVariant[] = enableVariants && variantsList.length > 0
      ? variantsList
      : [
          {
            id: `var-${Date.now()}`,
            product_id: id || '',
            sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
            title: 'Standard Edition',
            attributes: {},
            price_kobo: basePriceKobo,
            original_price_kobo: origPriceKobo,
            stock: parseInt(stock, 10) || 15,
            image_url: finalMainImage,
          },
        ];

    const subcat = availableSubcategories.find((s) => s.id === subcategoryId);

    const productPayload = {
      seller_id: currentStore.id,
      seller_name: currentStore.store_name,
      seller_state: currentStore.state,
      title: title.trim(),
      slug: isEditing && id ? products.find((p) => p.id === id)?.slug || generatedSlug : `${generatedSlug}-${Date.now().toString().slice(-4)}`,
      description: description.trim(),
      category_id: categoryId,
      category_name: selectedCategory?.name || 'General',
      subcategory_id: subcategoryId || undefined,
      subcategory_name: subcat?.name,
      brand: brand.trim() || currentStore.store_name,
      base_price_kobo: basePriceKobo,
      original_price_kobo: origPriceKobo,
      stock: parseInt(stock, 10) || 15,
      rating: isEditing && id ? products.find((p) => p.id === id)?.rating || 5.0 : 5.0,
      review_count: isEditing && id ? products.find((p) => p.id === id)?.review_count || 0 : 0,
      status,
      is_published: status === 'published',
      is_featured: false,
      is_verified_seller: true,
      condition,
      return_policy_days: returnPolicyDays,
      images: allImages,
      variants: finalVariants,
      delivery_availability: deliveryAvailability,
      pickup_address: pickupAddress.trim(),
      delivery_window: deliveryWindow.trim(),
      custom_delivery_charge_kobo: customFeeNaira ? nairaToKobo(customFeeNaira) : undefined,
      weight_kg: parseFloat(weightKg) || 0.5,
      dimensions_cm: {
        length: parseFloat(dimLength) || 15,
        width: parseFloat(dimWidth) || 10,
        height: parseFloat(dimHeight) || 5,
      },
      views_count: isEditing && id ? products.find((p) => p.id === id)?.views_count || 0 : 0,
      clicks_count: isEditing && id ? products.find((p) => p.id === id)?.clicks_count || 0 : 0,
      add_to_cart_count: isEditing && id ? products.find((p) => p.id === id)?.add_to_cart_count || 0 : 0,
      units_sold: isEditing && id ? products.find((p) => p.id === id)?.units_sold || 0 : 0,
      orders_count: isEditing && id ? products.find((p) => p.id === id)?.orders_count || 0 : 0,
    };

    if (isEditing && id) {
      updateProduct(id, productPayload);
    } else {
      addProduct(productPayload);
    }

    setIsSubmitting(false);
    navigate('/seller/products');
  };

  if (isUnauthorizedEdit) {
    return (
      <SellerLayout title="Listing Access Restricted">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#252525]">Unauthorized Listing Modification</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            This product listing belongs to another verified merchant. Under Kumaji multi-vendor security rules, you may only modify listings created by your store.
          </p>
          <Link
            to="/seller/products"
            className="inline-block bg-[#F36B25] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#E05914]"
          >
            Return to My Products
          </Link>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout
      title={isEditing ? 'Edit Product Listing' : 'Create New Product Listing'}
      subtitle="Complete full listing details, imagery, variant pricing, and verified delivery rules"
    >
      <div className="space-y-6 max-w-4xl">
        <Link
          to="/seller/products"
          className="text-xs font-semibold text-stone-500 hover:text-[#F36B25] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Management</span>
        </Link>

        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 4-Step Navigation Tabs */}
        <div className="grid grid-cols-4 p-1 bg-stone-100 rounded-2xl text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 1 ? 'bg-white text-[#252525] shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            1. Basic Info
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 2 ? 'bg-white text-[#252525] shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            2. Images & Media
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 3 ? 'bg-white text-[#252525] shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            3. Price & Variants
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 4 ? 'bg-white text-[#252525] shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            4. Delivery & Policies
          </button>
        </div>

        {/* STEP 1: BASIC INFO */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5 text-xs">
            <h2 className="text-sm font-bold text-[#252525] pb-2 border-b border-stone-100">
              1. Title, Categorization & Description
            </h2>

            <div>
              <label className="font-semibold text-stone-700 block mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 65W GaN Fast Charger with 3-Ports"
                className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Department / Main Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId('');
                  }}
                  className="w-full border border-stone-300 rounded-xl p-3 bg-white focus:outline-none focus:border-[#F36B25]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Subcategory
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl p-3 bg-white focus:outline-none focus:border-[#F36B25]"
                >
                  <option value="">All / General {selectedCategory?.name}</option>
                  {availableSubcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Brand or Maker *
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. HyperPower, Kurmi Leather"
                  className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Product Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e: any) => setCondition(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl p-3 bg-white focus:outline-none focus:border-[#F36B25]"
                >
                  <option value="new">Brand New (Factory Sealed)</option>
                  <option value="refurbished">Certified Refurbished (Grade A)</option>
                  <option value="like_new">Like New / Open Box</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1.5">
                Detailed Product Description & Specifications *
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include materials, compatibility, wattage/measurements, packaging contents, and manufacturer warranty terms..."
                className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25] leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="bg-[#F36B25] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#E05914]"
              >
                Proceed to Media & Images →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MEDIA & IMAGES */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-100 gap-2">
              <h2 className="text-sm font-bold text-[#252525]">
                2. Gallery & Commercial Photography
              </h2>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                  <span>{isSupabaseConfigured ? 'Supabase CDN Storage Active' : 'Browser Sandbox Image Persistence'}</span>
                </span>
              </div>
            </div>

            {/* Direct Device Upload & URL Options */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-center space-y-3">
              <div className="space-y-1">
                <p className="font-bold text-stone-800">Upload Product Photos from Device</p>
                <p className="text-[11px] text-stone-500">Supports JPG, PNG, WEBP from your phone camera or laptop storage</p>
              </div>

              <div className="flex justify-center">
                <label className="cursor-pointer bg-[#F36B25] hover:bg-[#E05914] text-white px-5 py-2.5 rounded-xl font-bold transition-colors inline-flex items-center gap-2 shadow-xs">
                  <span>Select Images from Device</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleDeviceFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {!isSupabaseConfigured && (
                <p className="text-[10px] text-stone-400">
                  Note: Uploaded images are stored in browser sandbox localStorage. To enable live multi-region Supabase Storage, configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> with a public <code>product-images</code> bucket.
                </p>
              )}
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1.5">
                Primary Hero Image (URL or uploaded thumbnail) *
              </label>
              <input
                type="text"
                value={mainImageUrl}
                onChange={(e) => setMainImageUrl(e.target.value)}
                placeholder="Paste image URL or use device upload above..."
                className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-[#F36B25]"
              />
            </div>

            {/* Additional gallery images */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <label className="font-semibold text-stone-700 block">
                Additional Gallery Shots (Angles, packaging, closeups)
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newImageUrlInput}
                  onChange={(e) => setNewImageUrlInput(e.target.value)}
                  placeholder="Paste additional image URL..."
                  className="flex-1 border border-stone-300 rounded-xl p-2.5 focus:outline-none focus:border-[#F36B25]"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-4 py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Add Shot
                </button>
              </div>

              {/* Preview thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {mainImageUrl && (
                  <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[#F36B25] group">
                    <img src={mainImageUrl} alt="Main hero" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-[#F36B25] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      Main Photo
                    </span>
                    <button
                      type="button"
                      onClick={() => setMainImageUrl('')}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Clear main photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {additionalImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 group">
                    <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const oldMain = mainImageUrl;
                        setMainImageUrl(img);
                        const updated = [...additionalImages];
                        if (oldMain) {
                          updated[i] = oldMain;
                        } else {
                          updated.splice(i, 1);
                        }
                        setAdditionalImages(updated);
                      }}
                      className="absolute bottom-1.5 left-1.5 bg-black/70 hover:bg-[#F36B25] text-white text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                    >
                      Set as Hero
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-stone-300 rounded-xl font-medium"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="bg-[#F36B25] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#E05914]"
              >
                Proceed to Pricing & Variants →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PRICING & VARIANTS */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5 text-xs">
            <h2 className="text-sm font-bold text-[#252525] pb-2 border-b border-stone-100">
              3. Pricing, SKU & Category-Aware Variants
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Selling Price in Naira (₦) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-stone-400 font-bold">₦</span>
                  <input
                    type="number"
                    required
                    value={priceNaira}
                    onChange={(e) => setPriceNaira(e.target.value)}
                    placeholder="e.g. 28500"
                    className="w-full pl-8 pr-3 py-2.5 border border-stone-300 rounded-xl font-bold focus:outline-none focus:border-[#F36B25]"
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Authoritatively stored in integer kobo (₦1 = 100 kobo).
                </span>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Original Price (Optional Strike-through)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-stone-400 font-bold">₦</span>
                  <input
                    type="number"
                    value={originalPriceNaira}
                    onChange={(e) => setOriginalPriceNaira(e.target.value)}
                    placeholder="e.g. 32000"
                    className="w-full pl-8 pr-3 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#F36B25]"
                  />
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Only rendered as a discount when genuine original price exceeds selling price.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-stone-700">
                    Product SKU Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-[11px] text-[#F36B25] hover:underline font-semibold"
                  >
                    Auto-Generate SKU
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. GAN-65W-BLK"
                  className="w-full border border-stone-300 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Total Stock Inventory *
                </label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Available units"
                  className="w-full border border-stone-300 rounded-xl p-2.5"
                />
              </div>
            </div>

            {/* Category-Aware Variants Builder */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#F36B25]" />
                    <span>Product Variants (Size, Color, Storage, Model)</span>
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Allows customers to choose options with individual pricing and inventory.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddPresetVariants}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs"
                >
                  Generate {selectedCategory?.name} Variants
                </button>
              </div>

              {enableVariants && variantsList.length > 0 && (
                <div className="space-y-2 pt-2">
                  {variantsList.map((v, i) => (
                    <div
                      key={v.id || i}
                      className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-stone-900">{v.title}</div>
                        <div className="text-[11px] font-mono text-stone-400">SKU: {v.sku}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-900 tabular-nums">
                          {formatKobo(v.price_kobo)}
                        </span>
                        <span className="text-stone-500">Stock: {v.stock}</span>
                        <button
                          type="button"
                          onClick={() => setVariantsList(variantsList.filter((_, idx) => idx !== i))}
                          className="p-1 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-stone-300 rounded-xl font-medium"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="bg-[#F36B25] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#E05914]"
              >
                Proceed to Delivery & Policies →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DELIVERY & POLICIES */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5 text-xs">
            <h2 className="text-sm font-bold text-[#252525] pb-2 border-b border-stone-100">
              4. Delivery Availability & Return Policies
            </h2>

            {/* Explicit delivery availability selection */}
            <div>
              <label className="font-semibold text-stone-700 block mb-2">
                Merchant Fulfilment Capability *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    deliveryAvailability === 'available'
                      ? 'border-[#F36B25] bg-[#F36B25]/5 ring-1 ring-[#F36B25]'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery_avail"
                    value="available"
                    checked={deliveryAvailability === 'available'}
                    onChange={() => setDeliveryAvailability('available')}
                    className="mr-2 text-[#F36B25]"
                  />
                  <span className="font-bold text-stone-900 block mt-1">Delivery Available</span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Shipped to buyer doorstep across Nigerian states.
                  </span>
                </label>

                <label
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    deliveryAvailability === 'pickup_only'
                      ? 'border-[#F36B25] bg-[#F36B25]/5 ring-1 ring-[#F36B25]'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery_avail"
                    value="pickup_only"
                    checked={deliveryAvailability === 'pickup_only'}
                    onChange={() => setDeliveryAvailability('pickup_only')}
                    className="mr-2 text-[#F36B25]"
                  />
                  <span className="font-bold text-stone-900 block mt-1">Pickup Only</span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Customer must pick up item at your physical store location.
                  </span>
                </label>

                <label
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    deliveryAvailability === 'unavailable'
                      ? 'border-[#F36B25] bg-[#F36B25]/5 ring-1 ring-[#F36B25]'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery_avail"
                    value="unavailable"
                    checked={deliveryAvailability === 'unavailable'}
                    onChange={() => setDeliveryAvailability('unavailable')}
                    className="mr-2 text-[#F36B25]"
                  />
                  <span className="font-bold text-stone-900 block mt-1">Delivery Not Available</span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Item temporarily cannot be dispatched or collected.
                  </span>
                </label>
              </div>
            </div>

            {/* Estimated window & pickup location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Estimated Dispatch Window
                </label>
                <input
                  type="text"
                  value={deliveryWindow}
                  onChange={(e) => setDeliveryWindow(e.target.value)}
                  placeholder="e.g. 1–2 business days in Lagos"
                  className="w-full border border-stone-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Store Pickup Location (if pickup selected)
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. 14 Otigba St, Computer Village, Ikeja"
                  className="w-full border border-stone-300 rounded-xl p-2.5"
                />
              </div>
            </div>

            {/* Package weight & return policy */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Package Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 0.5"
                  className="w-full border border-stone-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Custom Delivery Charge (Optional ₦)
                </label>
                <input
                  type="number"
                  value={customFeeNaira}
                  onChange={(e) => setCustomFeeNaira(e.target.value)}
                  placeholder="Leave blank for platform rates"
                  className="w-full border border-stone-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">
                  Return Policy Window *
                </label>
                <select
                  value={returnPolicyDays}
                  onChange={(e) => setReturnPolicyDays(parseInt(e.target.value, 10))}
                  className="w-full border border-stone-300 rounded-xl p-2.5 bg-white"
                >
                  <option value={7}>7 Days Hassle-Free Returns</option>
                  <option value={14}>14 Days Extended Returns</option>
                  <option value={30}>30 Days Premium Returns</option>
                  <option value={0}>No Returns (Final Sale)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons: Save Draft or Publish */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-auto px-4 py-2.5 border border-stone-300 rounded-xl font-medium"
              >
                ← Back
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveListing('draft')}
                  className="flex-1 sm:flex-none px-5 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-xl font-semibold cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveListing('published')}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#F36B25] hover:bg-[#E05914] text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Listing' : 'Publish to Marketplace'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};
