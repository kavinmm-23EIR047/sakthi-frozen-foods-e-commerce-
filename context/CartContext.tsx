'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ProductType, OrderItemType } from '@/lib/types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { fetchApi } from '@/lib/apiConfig';

interface CartContextType {
  cart: OrderItemType[];
  addToCart: (product: ProductType, quantity?: number) => void;
  removeFromCart: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedProductForModal: ProductType | null;
  setSelectedProductForModal: (product: ProductType | null) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<OrderItemType[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductType | null>(null);
  
  const { showToast } = useToast();
  const { user } = useAuth();
  const [cartLoaded, setCartLoaded] = useState(false);
  const serverCartReady = useRef(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sakthi_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sakthi_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    if (!user || !cartLoaded || serverCartReady.current) return;
    let cancelled = false;
    const mergeServerCart = async () => {
      const response = await fetchApi('/cart');
      if (cancelled || !response.success) return;
      const localItems = cart.map(({ productId, weight, quantity }) => ({ productId, weight, quantity }));
      const merged = new Map<string, { productId: string; weight: string; quantity: number }>();
      for (const item of [...(response.data || []), ...localItems]) {
        const key = `${item.productId}:${item.weight}`;
        merged.set(key, { ...item, quantity: Math.min(50, (merged.get(key)?.quantity || 0) + item.quantity) });
      }
      const mergedItems = Array.from(merged.values());
      const saved = await fetchApi('/cart', { method: 'PUT', body: JSON.stringify({ items: mergedItems }) });
      if (cancelled) return;
      if (saved.success) setCart(saved.data || []);
      serverCartReady.current = true;
    };
    mergeServerCart().catch((error) => console.error('Server cart sync failed:', error));
    return () => { cancelled = true; };
  }, [user, cartLoaded]);

  useEffect(() => {
    if (!user) {
      serverCartReady.current = false;
      return;
    }
    if (!serverCartReady.current || !cartLoaded) return;
    const items = cart.map(({ productId, weight, quantity }) => ({ productId, weight, quantity }));
    fetchApi('/cart', { method: 'PUT', body: JSON.stringify({ items }) }).catch((error) => console.error('Server cart update failed:', error));
  }, [cart, user, cartLoaded]);

  const addToCart = (product: ProductType, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product.id && item.weight === product.weight);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            weight: product.weight,
            price: product.price,
            quantity,
          },
        ];
      }
    });
    showToast(`Added ${quantity}x ${product.name} to cart`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, weight: string) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.weight === weight)));
  };

  const updateQuantity = (productId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId && item.weight === weight ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    if (user && serverCartReady.current) fetchApi('/cart', { method: 'DELETE' }).catch((error) => console.error('Server cart clear failed:', error));
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        selectedProductForModal,
        setSelectedProductForModal,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
