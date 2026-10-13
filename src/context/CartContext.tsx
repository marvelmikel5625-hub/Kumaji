import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotalKobo: number;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => boolean;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  getSellerGroups: () => { sellerId: string; sellerName: string; items: CartItem[]; subtotalKobo: number }[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kumaji_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('kumaji_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity = 1): boolean => {
    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    const cartItemId = `${product.id}-${selectedVariant ? selectedVariant.id : 'base'}`;
    const priceKobo = selectedVariant ? selectedVariant.price_kobo : product.base_price_kobo;
    const maxStock = selectedVariant ? selectedVariant.stock : product.stock;

    if (maxStock <= 0) {
      return false; // Out of stock
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === cartItemId);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.min(maxStock, currentQty + quantity);
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: cartItemId,
        product_id: product.id,
        variant_id: selectedVariant?.id,
        seller_id: product.seller_id,
        seller_name: product.seller_name,
        title: product.title,
        variant_title: selectedVariant?.title,
        sku: selectedVariant?.sku || `SKU-${product.id}`,
        unit_price_kobo: priceKobo,
        quantity: Math.min(maxStock, quantity),
        image_url: selectedVariant?.image_url || product.images[0] || '',
        max_stock: maxStock,
      };
      return [...prev, newItem];
    });

    return true;
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const clampedQty = Math.min(i.max_stock, newQuantity);
          return { ...i, quantity: clampedQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalKobo = items.reduce((acc, item) => acc + item.unit_price_kobo * item.quantity, 0);

  const getSellerGroups = () => {
    const groupMap = new Map<string, { sellerId: string; sellerName: string; items: CartItem[]; subtotalKobo: number }>();
    for (const item of items) {
      if (!groupMap.has(item.seller_id)) {
        groupMap.set(item.seller_id, {
          sellerId: item.seller_id,
          sellerName: item.seller_name,
          items: [],
          subtotalKobo: 0,
        });
      }
      const group = groupMap.get(item.seller_id)!;
      group.items.push(item);
      group.subtotalKobo += item.unit_price_kobo * item.quantity;
    }
    return Array.from(groupMap.values());
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotalKobo,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSellerGroups,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
