import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  SellerStore,
  SellerApplication,
  CustomerOrder,
  SellerOrder,
  LedgerEntry,
  SellerPayout,
  ProductReview,
  FulfilmentStatus,
  SellerApplicationStatus,
} from '../types';
import { CATEGORIES, INITIAL_SELLERS, INITIAL_PRODUCTS } from '../data/sampleData';

interface MarketplaceContextType {
  products: Product[];
  categories: Category[];
  sellers: SellerStore[];
  applications: SellerApplication[];
  orders: CustomerOrder[];
  ledgerEntries: LedgerEntry[];
  payouts: SellerPayout[];
  reviews: Record<string, ProductReview[]>;
  // Actions
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getSellerById: (id: string) => SellerStore | undefined;
  getSellerBySlug: (slug: string) => SellerStore | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
  addProduct: (productData: Omit<Product, 'id' | 'created_at'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  submitSellerApplication: (appData: Omit<SellerApplication, 'id' | 'submitted_at' | 'status'>) => SellerApplication;
  reviewSellerApplication: (id: string, status: SellerApplicationStatus, adminNotes?: string) => void;
  createOrder: (order: CustomerOrder) => void;
  updateFulfilmentStatus: (
    sellerOrderId: string,
    status: FulfilmentStatus,
    trackingNumber?: string,
    courierName?: string
  ) => void;
  requestSellerPayout: (
    sellerId: string,
    amountKobo: number,
    bankName: string,
    accountNumber: string,
    accountName: string
  ) => { success: boolean; message: string };
  approveSellerPayout: (payoutId: string) => void;
  addProductReview: (productId: string, rating: number, comment: string, userName: string, userId: string) => void;
  updateSellerStore: (id: string, updates: Partial<SellerStore>) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('kumaji_products');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_PRODUCTS;
  });

  const [categories] = useState<Category[]>(CATEGORIES);
  const [sellers, setSellers] = useState<SellerStore[]>(() => {
    try {
      const saved = localStorage.getItem('kumaji_sellers');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_SELLERS;
  });

  const [applications, setApplications] = useState<SellerApplication[]>(() => {
    try {
      const saved = localStorage.getItem('kumaji_applications');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'app-init-1',
        user_id: 'user-seller-demo',
        business_name: 'Kaduna Textile Artisans',
        business_type: 'registered_company',
        rc_number: 'RC-1928374',
        category: 'mens-fashion',
        phone: '+234 802 819 2831',
        state: 'Kaduna',
        city: 'Kaduna South',
        bank_name: 'Stanbic IBTC Bank',
        account_number: '0049182746',
        account_name: 'Kaduna Weavers Ltd',
        status: 'pending',
        submitted_at: '2025-02-28T14:00:00Z',
      },
    ];
  });

  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem('kumaji_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem('kumaji_ledger');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'led-1',
        seller_id: 'seller-apex',
        type: 'order_credit',
        amount_kobo: 68500000,
        balance_after_kobo: 62677500,
        description: 'Order credit for KMJ-2025-0918',
        is_settled: true,
        created_at: '2025-02-15T12:00:00Z',
      },
      {
        id: 'led-2',
        seller_id: 'seller-apex',
        type: 'platform_commission',
        amount_kobo: -5822500,
        balance_after_kobo: 62677500,
        description: 'Standard 8.5% platform commission',
        is_settled: true,
        created_at: '2025-02-15T12:00:01Z',
      },
    ];
  });

  const [payouts, setPayouts] = useState<SellerPayout[]>(() => {
    try {
      const saved = localStorage.getItem('kumaji_payouts');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  const [reviews, setReviews] = useState<Record<string, ProductReview[]>>(() => {
    try {
      const saved = localStorage.getItem('kumaji_reviews');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      'prod-phone-titanium': [
        {
          id: 'rev-1',
          product_id: 'prod-phone-titanium',
          user_id: 'usr-10',
          user_name: 'Emeka Nwosu',
          rating: 5,
          comment: 'Delivered in Lagos in 24 hours. The phone is 100% original, brand new sealed box with valid manufacturer warranty. Best marketplace experience in Nigeria so far.',
          verified_purchase: true,
          created_at: '2025-02-12T16:20:00Z',
        },
        {
          id: 'rev-2',
          product_id: 'prod-phone-titanium',
          user_id: 'usr-11',
          user_name: 'Amina Danjuma',
          rating: 5,
          comment: 'OLED screen is gorgeous, camera quality is top tier. Battery easily lasts the entire day.',
          verified_purchase: true,
          created_at: '2025-02-16T09:15:00Z',
        },
      ],
      'prod-african-blazer': [
        {
          id: 'rev-3',
          product_id: 'prod-african-blazer',
          user_id: 'usr-12',
          user_name: 'Dr. Tunde Fashola',
          rating: 5,
          comment: 'The collar craftsmanship and tailoring cut are world-class. Wore this to an awards dinner and received endless compliments.',
          verified_purchase: true,
          created_at: '2025-02-18T20:10:00Z',
        },
      ],
    };
  });

  // Persistent syncing
  useEffect(() => {
    localStorage.setItem('kumaji_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kumaji_sellers', JSON.stringify(sellers));
  }, [sellers]);

  useEffect(() => {
    localStorage.setItem('kumaji_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('kumaji_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('kumaji_ledger', JSON.stringify(ledgerEntries));
  }, [ledgerEntries]);

  useEffect(() => {
    localStorage.setItem('kumaji_payouts', JSON.stringify(payouts));
  }, [payouts]);

  useEffect(() => {
    localStorage.setItem('kumaji_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
  const getProductById = (id: string) => products.find((p) => p.id === id);
  const getSellerById = (id: string) => sellers.find((s) => s.id === id);
  const getSellerBySlug = (slug: string) => sellers.find((s) => s.slug === slug);
  const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

  const addProduct = (productData: Omit<Product, 'id' | 'created_at'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const submitSellerApplication = (
    appData: Omit<SellerApplication, 'id' | 'submitted_at' | 'status'>
  ): SellerApplication => {
    const newApp: SellerApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };
    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  const reviewSellerApplication = (
    id: string,
    status: SellerApplicationStatus,
    adminNotes?: string
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const updated = {
            ...app,
            status,
            admin_notes: adminNotes,
            reviewed_at: new Date().toISOString(),
          };

          // If approved, automatically create seller store profile
          if (status === 'approved') {
            const newStore: SellerStore = {
              id: `seller-${Date.now()}`,
              seller_id: app.user_id,
              store_name: app.business_name,
              slug: app.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: `Verified merchant in ${app.category}. Operating from ${app.city}, ${app.state}.`,
              logo_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=200&q=80',
              state: app.state,
              city: app.city,
              address: `${app.city}, ${app.state}`,
              contact_email: 'seller@kumaji.ng',
              contact_phone: app.phone,
              is_verified: true,
              commission_rate_percent: 8.5,
              bank_name: app.bank_name,
              bank_account_number: app.account_number,
              bank_account_name: app.account_name,
              rating: 5.0,
              total_sales_count: 0,
              created_at: new Date().toISOString(),
            };
            setSellers((s) => [...s, newStore]);
          }

          return updated;
        }
        return app;
      })
    );
  };

  const updateSellerStore = (id: string, updates: Partial<SellerStore>) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const createOrder = (order: CustomerOrder) => {
    setOrders((prev) => [order, ...prev]);

    // Atomic inventory decrement for purchased products and variants
    for (const sellerOrder of order.seller_orders) {
      for (const item of sellerOrder.items) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === item.product_id) {
              const updatedStock = Math.max(0, p.stock - item.quantity);
              const updatedVariants = p.variants.map((v) => {
                if (v.id === item.variant_id) {
                  return { ...v, stock: Math.max(0, v.stock - item.quantity) };
                }
                return v;
              });
              return { ...p, stock: updatedStock, variants: updatedVariants };
            }
            return p;
          })
        );
      }

      // Record financial escrow ledger entry for each seller
      const creditAmount = sellerOrder.subtotal_kobo;
      const commissionAmount = sellerOrder.commission_kobo;
      const netSellerPayout = sellerOrder.seller_payout_kobo;

      const newCreditEntry: LedgerEntry = {
        id: `led-${Date.now()}-1`,
        seller_id: sellerOrder.seller_id,
        order_id: order.id,
        type: 'order_credit',
        amount_kobo: creditAmount,
        balance_after_kobo: netSellerPayout,
        description: `Order credit for ${order.order_number}`,
        is_settled: order.payment_status === 'paid',
        created_at: new Date().toISOString(),
      };

      const newCommissionEntry: LedgerEntry = {
        id: `led-${Date.now()}-2`,
        seller_id: sellerOrder.seller_id,
        order_id: order.id,
        type: 'platform_commission',
        amount_kobo: -commissionAmount,
        balance_after_kobo: netSellerPayout,
        description: `Platform commission (8.5%) for ${order.order_number}`,
        is_settled: order.payment_status === 'paid',
        created_at: new Date().toISOString(),
      };

      setLedgerEntries((prev) => [newCreditEntry, newCommissionEntry, ...prev]);
    }
  };

  const updateFulfilmentStatus = (
    sellerOrderId: string,
    status: FulfilmentStatus,
    trackingNumber?: string,
    courierName?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        const updatedSellerOrders = order.seller_orders.map((so) => {
          if (so.id === sellerOrderId) {
            return {
              ...so,
              fulfilment_status: status,
              tracking_number: trackingNumber || so.tracking_number,
              courier_name: courierName || so.courier_name,
              shipped_at: status === 'shipped' ? new Date().toISOString() : so.shipped_at,
              delivered_at: status === 'delivered' ? new Date().toISOString() : so.delivered_at,
            };
          }
          return so;
        });
        return { ...order, seller_orders: updatedSellerOrders, updated_at: new Date().toISOString() };
      })
    );
  };

  const requestSellerPayout = (
    sellerId: string,
    amountKobo: number,
    bankName: string,
    accountNumber: string,
    accountName: string
  ): { success: boolean; message: string } => {
    if (amountKobo <= 0) {
      return { success: false, message: 'Invalid payout amount' };
    }

    // Check available verified ledger balance
    const sellerCredits = ledgerEntries
      .filter((e) => e.seller_id === sellerId && e.is_settled)
      .reduce((acc, e) => acc + e.amount_kobo, 0);

    const paidOut = payouts
      .filter((p) => p.seller_id === sellerId && (p.status === 'completed' || p.status === 'processing'))
      .reduce((acc, p) => acc + p.amount_kobo, 0);

    const availableKobo = sellerCredits - paidOut;

    if (amountKobo > availableKobo) {
      return {
        success: false,
        message: 'Requested amount exceeds settled available ledger balance.',
      };
    }

    const newPayout: SellerPayout = {
      id: `payout-${Date.now()}`,
      seller_id: sellerId,
      amount_kobo: amountKobo,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      status: 'pending',
      reference: `PAYOUT-REF-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setPayouts((prev) => [newPayout, ...prev]);

    return {
      success: true,
      message: 'Payout request registered and queued for administrator verification.',
    };
  };

  const approveSellerPayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? { ...p, status: 'completed', processed_at: new Date().toISOString() }
          : p
      )
    );
  };

  const addProductReview = (
    productId: string,
    rating: number,
    comment: string,
    userName: string,
    userId: string
  ) => {
    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      product_id: productId,
      user_id: userId,
      user_name: userName,
      rating,
      comment,
      verified_purchase: true,
      created_at: new Date().toISOString(),
    };

    setReviews((prev) => {
      const existing = prev[productId] || [];
      return {
        ...prev,
        [productId]: [newReview, ...existing],
      };
    });

    // Update product overall rating and review_count
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const currentCount = p.review_count;
          const currentRating = p.rating;
          const newCount = currentCount + 1;
          const newRating = Number(((currentRating * currentCount + rating) / newCount).toFixed(2));
          return {
            ...p,
            rating: newRating,
            review_count: newCount,
          };
        }
        return p;
      })
    );
  };

  return (
    <MarketplaceContext.Provider
      value={{
        products,
        categories,
        sellers,
        applications,
        orders,
        ledgerEntries,
        payouts,
        reviews,
        getProductBySlug,
        getProductById,
        getSellerById,
        getSellerBySlug,
        getCategoryBySlug,
        addProduct,
        updateProduct,
        deleteProduct,
        submitSellerApplication,
        reviewSellerApplication,
        createOrder,
        updateFulfilmentStatus,
        requestSellerPayout,
        approveSellerPayout,
        addProductReview,
        updateSellerStore,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
