'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ProductType } from '@/lib/types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { fetchApi } from '@/lib/apiConfig';

interface WishlistContextType {
  wishlist: ProductType[];
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: ProductType) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  wishlistCount: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<ProductType[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();
  const initialLoadDone = useRef(false);
  const syncInProgress = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const local = localStorage.getItem('sakthi_wishlist');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
          setWishlistIds(parsed.map((p: any) => p.id || p._id).filter(Boolean));
        }
      }
    } catch (e) {
      console.error('Failed to load local wishlist:', e);
    } finally {
      initialLoadDone.current = true;
      setLoading(false);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!initialLoadDone.current) return;
    try {
      localStorage.setItem('sakthi_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save local wishlist:', e);
    }
  }, [wishlist]);

  // Sync with backend whenever user logs in
  useEffect(() => {
    if (!user || syncInProgress.current) return;

    const syncWithBackend = async () => {
      syncInProgress.current = true;
      try {
        const localIds = wishlist.map((p) => p.id).filter(Boolean);
        let res;
        if (localIds.length > 0) {
          // Merge local guest wishlist with backend
          res = await fetchApi('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productIds: localIds }),
          });
        } else {
          // Just fetch user's backend wishlist
          res = await fetchApi('/wishlist');
        }

        if (res.success && Array.isArray(res.data)) {
          setWishlist(res.data);
          setWishlistIds(res.data.map((p: any) => p.id || p._id).filter(Boolean));
        }
      } catch (err) {
        console.error('Error syncing wishlist with backend:', err);
      } finally {
        syncInProgress.current = false;
      }
    };

    syncWithBackend();
  }, [user]);

  const isInWishlist = useCallback(
    (productId: string) => {
      if (!productId) return false;
      const strId = productId.toString();
      return wishlistIds.includes(strId) || wishlist.some((p) => (p.id || '').toString() === strId);
    },
    [wishlistIds, wishlist]
  );

  const toggleWishlist = async (product: ProductType) => {
    if (!product || !product.id) return;
    const strId = product.id.toString();
    const currentlyIn = isInWishlist(strId);

    if (currentlyIn) {
      // Remove from wishlist
      const nextWishlist = wishlist.filter((p) => (p.id || '').toString() !== strId);
      const nextIds = wishlistIds.filter((id) => id !== strId);
      setWishlist(nextWishlist);
      setWishlistIds(nextIds);
      showToast(`Removed "${product.name}" from your wishlist`, 'info');

      if (user) {
        try {
          await fetchApi(`/wishlist/${strId}`, { method: 'DELETE' });
        } catch (err) {
          console.error('Failed to remove from server wishlist:', err);
        }
      }
    } else {
      // Add to wishlist
      const nextWishlist = [product, ...wishlist.filter((p) => (p.id || '').toString() !== strId)];
      const nextIds = [strId, ...wishlistIds.filter((id) => id !== strId)];
      setWishlist(nextWishlist);
      setWishlistIds(nextIds);
      showToast(`Added "${product.name}" to your wishlist!`, 'success');

      if (user) {
        try {
          await fetchApi('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productId: strId }),
          });
        } catch (err) {
          console.error('Failed to add to server wishlist:', err);
        }
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!productId) return;
    const strId = productId.toString();
    const foundProduct = wishlist.find((p) => (p.id || '').toString() === strId);
    const nextWishlist = wishlist.filter((p) => (p.id || '').toString() !== strId);
    const nextIds = wishlistIds.filter((id) => id !== strId);

    setWishlist(nextWishlist);
    setWishlistIds(nextIds);

    if (foundProduct) {
      showToast(`Removed "${foundProduct.name}" from your wishlist`, 'info');
    }

    if (user) {
      try {
        await fetchApi(`/wishlist/${strId}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to remove from server wishlist:', err);
      }
    }
  };

  const clearWishlist = async () => {
    setWishlist([]);
    setWishlistIds([]);
    showToast('Wishlist cleared', 'info');

    if (user) {
      try {
        await fetchApi('/wishlist', { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to clear server wishlist:', err);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
