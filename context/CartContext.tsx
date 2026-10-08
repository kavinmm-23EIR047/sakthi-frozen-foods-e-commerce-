'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ProductType, OrderItemType } from '@/lib/types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { fetchApi } from '@/lib/apiConfig';

interface CartContextType {
  cart: OrderItemType[];
  addToCart: (product: ProductType, quantity?: number, openDrawer?: boolean) => void;
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
  isCartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<OrderItemType[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sakthi_cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductType | null>(null);
  
  const { showToast } = useToast();
  const { user } = useAuth();
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [cartLoaded, setCartLoaded] = useState(() => typeof window !== 'undefined');
  const serverCartReady = useRef(false);
  const isClearingCart = useRef(false);

  // Load cart from localStorage on mount & listen for multi-tab sync
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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sakthi_cart') {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : [];
          if (Array.isArray(next)) setCart(next);
        } catch (err) {
          console.error('Cross-tab cart sync error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!cartLoaded) return;
    try {
      localStorage.setItem('sakthi_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, cartLoaded]);

  // Initial Server Cart Sync
  useEffect(() => {
    if (!user || !cartLoaded || serverCartReady.current) return;
    let cancelled = false;
    const mergeServerCart = async () => {
      try {
        const response = await fetchApi('/cart');
        if (cancelled || !response.success) return;

        const serverItems = Array.isArray(response.data) ? response.data : [];
        
        // If local cart is empty (e.g. fresh session or after checkout), adopt server cart directly
        if (cart.length === 0) {
          if (serverItems.length > 0) {
            setCart(serverItems);
          }
          serverCartReady.current = true;
          return;
        }

        // If local cart already has items, preserve local quantities (never double add!)
        const localMap = new Map<string, any>();
        for (const item of cart) {
          const key = `${item.productId}:${item.weight}`;
          localMap.set(key, { ...item });
        }

        // Add any distinct items that exist only on server without altering existing quantities
        for (const sItem of serverItems) {
          const key = `${sItem.productId}:${sItem.weight}`;
          if (!localMap.has(key)) {
            localMap.set(key, { ...sItem });
          }
        }

        const mergedItems = Array.from(localMap.values());
        const payloadItems = mergedItems.map(({ productId, weight, quantity }) => ({ productId, weight, quantity }));
        
        const saved = await fetchApi('/cart', { method: 'PUT', body: JSON.stringify({ items: payloadItems }) });
        if (cancelled) return;
        if (saved.success && Array.isArray(saved.data)) {
          setCart(saved.data);
        }
        serverCartReady.current = true;
      } catch (error) {
        console.error('Server cart sync failed:', error);
      }
    };
    mergeServerCart();
    return () => { cancelled = true; };
  }, [user, cartLoaded]);

  // Background sync cart changes to server
  useEffect(() => {
    if (!user) {
      serverCartReady.current = false;
      return;
    }
    if (!serverCartReady.current || !cartLoaded || isClearingCart.current) return;
    const items = cart.map(({ productId, weight, quantity }) => ({ productId, weight, quantity }));
    fetchApi('/cart', { method: 'PUT', body: JSON.stringify({ items }) }).catch((error) => console.error('Server cart update failed:', error));
  }, [cart, user, cartLoaded]);

  const addToCart = useCallback((product: ProductType, quantity: number = 1, openDrawer: boolean = false) => {
    if (product.stock !== undefined && product.stock <= 0) {
      showToast(`${product.name} is currently out of stock`, 'error');
      return;
    }
    const prodId = String(product.id || (product as any)._id || '');
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === prodId && item.weight === product.weight);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: prodId,
            name: product.name,
            image: product.image,
            weight: product.weight,
            price: product.price,
            quantity,
          },
        ];
      }
    });
    showToast(`Added ${quantity}x ${product.name} to cart`, 'success');
    if (openDrawer) {
      setIsCartOpen(true);
    }
  }, [showToast]);

  const removeFromCart = useCallback((productId: string, weight: string) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.weight === weight)));
  }, []);

  const updateQuantity = useCallback((productId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId && item.weight === weight ? { ...item, quantity } : item))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    isClearingCart.current = true;
    setCart((prev) => {
      if (prev.length === 0) return prev;
      return [];
    });
    try {
      localStorage.removeItem('sakthi_cart');
      localStorage.setItem('sakthi_cart', JSON.stringify([]));
    } catch (e) {}
    if (userRef.current) {
      fetchApi('/cart', { method: 'DELETE' })
        .catch((error) => console.error('Server cart clear failed:', error))
        .finally(() => {
          setTimeout(() => {
            isClearingCart.current = false;
          }, 500);
        });
    } else {
      isClearingCart.current = false;
    }
  }, []);

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
        isCartLoading: !cartLoaded,
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
