'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Plus,
  Minus,
  ShieldCheck,
  Flame,
  Sparkles,
  ArrowLeft,
  ChefHat,
  Heart,
  Truck,
  Check,
  ChevronRight,
  Utensils,
  Leaf,
  Ban,
  Package,
  Snowflake,
  BarChart3,
  UtensilsCrossed,
  Loader2,
  Wind,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { fetchApi, fetchCachedApi, getCachedData, setCachedData } from '@/lib/apiConfig';
import { ProductType } from '@/lib/types';
import { getBackendPackOptions, PackOption, getDefaultPackOptionIndex } from '@/lib/productPacks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { cart, addToCart, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const prodId = (params?.id as string) || '';

  const [product, setProduct] = useState<ProductType | null>(() => {
    if (typeof window === 'undefined' || !prodId) return null;
    const direct = getCachedData<ProductType>(`product_detail_${prodId}`);
    if (direct) return direct;
    const all = getCachedData<ProductType[]>('shop_products_cache') || getCachedData<ProductType[]>('home_products_cache');
    if (all && Array.isArray(all)) {
      const match = all.find((p) => p.id === prodId || (p as any)._id === prodId || p.slug === prodId);
      if (match) return match;
    }
    return null;
  });
  const [allProducts, setAllProducts] = useState<ProductType[]>(() => {
    if (typeof window === 'undefined') return [];
    return getCachedData<ProductType[]>('shop_products_cache') || getCachedData<ProductType[]>('home_products_cache') || [];
  });
  const [loading, setLoading] = useState(() => !product);
  const [quantity, setQuantity] = useState(1);
  const [selectedPackIdx, setSelectedPackIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'cooking' | 'nutrition' | 'ingredients' | 'storage'>('cooking');
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product and catalog from backend with cache hydration
  useEffect(() => {
    let isMounted = true;
    if (!prodId) return;

    // Instant cache hydration check
    const cachedProduct = getCachedData<ProductType>(`product_detail_${prodId}`);
    if (cachedProduct && cachedProduct.id && !product) {
      setProduct(cachedProduct);
      setLoading(false);
    }
    const cachedAll = getCachedData<ProductType[]>('shop_products_cache') || getCachedData<ProductType[]>('home_products_cache');
    if (cachedAll && Array.isArray(cachedAll) && cachedAll.length > 0 && allProducts.length === 0) {
      setAllProducts(cachedAll);
    }

    const loadProductData = async () => {
      const direct = getCachedData<ProductType>(`product_detail_${prodId}`);
      if (!direct && !product) setLoading(true);
      try {
        const [prodRes, listRes] = await Promise.all([
          fetchCachedApi<ProductType>(`/products/${prodId}`, { cacheKey: `product_detail_${prodId}`, ttlMs: 120000 }),
          fetchCachedApi<ProductType[]>('/products?limit=50', { cacheKey: 'shop_products_cache', ttlMs: 120000 }),
        ]);

        if (isMounted) {
          if (prodRes.success && prodRes.data) {
            setProduct(prodRes.data);
          }
          if (listRes.success && Array.isArray(listRes.data)) {
            setAllProducts(listRes.data);
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProductData();
    return () => { isMounted = false; };
  }, [params.id]);

  // Compute available pack options dynamically from backend product variants & companion products
  const packOptions = useMemo<PackOption[]>(() => {
    if (!product) return [];
    return getBackendPackOptions(product, allProducts);
  }, [product, allProducts]);

  // Compute default option index matching this specific product's own weight
  const defaultPackIdx = useMemo(() => {
    if (!product || !packOptions || packOptions.length === 0) return 0;
    return getDefaultPackOptionIndex(product, packOptions);
  }, [product, packOptions]);

  // Sync selectedPackIdx when product or packOptions load
  useEffect(() => {
    if (product && packOptions.length > 0) {
      setSelectedPackIdx(defaultPackIdx);
    }
  }, [defaultPackIdx]);

  const activePack = packOptions[selectedPackIdx] || packOptions[defaultPackIdx] || packOptions[0];
  const dynamicPrice = activePack ? activePack.price : product?.price || 0;
  const dynamicMrp = activePack ? activePack.mrp : product?.mrp || Math.round(dynamicPrice * 1.25);
  const discountPercent = dynamicMrp > dynamicPrice ? Math.round(((dynamicMrp - dynamicPrice) / dynamicMrp) * 100) : 0;
  const savings = Math.max(0, dynamicMrp - dynamicPrice);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  const targetProductId = activePack?.productId || product?.id || '';
  const targetWeight = activePack?.weight || product?.weight || '1kg';

  // Check if this exact variant is already in cart
  const inCartItem = cart.find(
    (item) => item.productId === targetProductId && item.weight === targetWeight
  );
  const inCartQty = inCartItem ? inCartItem.quantity : 0;
  const isAlreadyInCart = inCartQty > 0;

  // Sync quantity state when variant in-cart status changes
  useEffect(() => {
    if (inCartQty > 0) {
      setQuantity(inCartQty);
    } else {
      setQuantity(1);
    }
  }, [selectedPackIdx, inCartQty]);

  // Related products from same backend category
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCat = allProducts.filter(
      (p) => p.id !== product.id && (p.category === product.category || (p.category && product.category && p.category.toLowerCase().includes(product.category.toLowerCase())))
    );
    if (sameCat.length > 0) return sameCat.slice(0, 4);
    return allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  }, [product, allProducts]);

  const handleAddToCart = () => {
    if (!product || !activePack || addingToCart) return;
    setAddingToCart(true);

    const customizedProduct = {
      ...product,
      id: targetProductId,
      weight: targetWeight,
      price: dynamicPrice,
      mrp: dynamicMrp,
    };

    if (isAlreadyInCart) {
      if (quantity === inCartQty) {
        // Already in cart with same quantity - go straight to cart
        router.push('/cart');
        return;
      }
      // User changed quantity on this page - update cart directly without duplicating
      updateQuantity(targetProductId, targetWeight, quantity);
      showToast(`Updated ${product.name} quantity to ${quantity}`, 'success');
      router.push('/cart');
      return;
    }

    addToCart(customizedProduct, quantity);
    // Directly navigate to cart page on Add to Cart click
    router.push('/cart');
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
        <Navbar />
        <main className="site-shell py-8 flex-1 animate-pulse space-y-6">
          <div className="h-4 bg-stone-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 aspect-square bg-stone-200 rounded-3xl" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-8 bg-stone-200 rounded w-3/4" />
              <div className="h-4 bg-stone-200 rounded w-1/2" />
              <div className="h-10 bg-stone-200 rounded-2xl w-1/3" />
              <div className="h-24 bg-stone-200 rounded-2xl w-full" />
              <div className="h-12 bg-stone-200 rounded-2xl w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F7F8F4] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF0E5] flex items-center justify-center text-[#50563D] mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#1E201D] mb-2 font-poppins">Product Not Found</h2>
          <p className="text-xs text-[#61665D] max-w-sm mb-6">
            The requested plant meat item may have been moved or is currently being updated.
          </p>
          <Link
            href="/shop"
            className="px-6 py-3 bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            Back to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
      <Navbar />

      <main className="site-shell py-5 sm:py-7 lg:py-9 flex-1">
        {/* 1. BREADCRUMB & BACK BUTTON */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-xs text-[#818B7D] font-bold">
            <Link href="/" className="hover:text-[#656B4F] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-[#656B4F] transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-[#656B4F] transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1E201D] truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#656B4F] hover:text-[#50563D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        {/* 2. MAIN PRODUCT OVERVIEW (IMAGE + COMMERCE PANEL WITH BALANCED MATCHING HEIGHT) */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-[#D4DBC9] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT: PRODUCT IMAGE SHOWCASE (SAME HEIGHT AS DETAILS ON PC/LAPTOP) */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-3">
            <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[400px] xl:h-[420px] rounded-3xl overflow-hidden bg-[#EAF0E5] border border-[#D4DBC9] shadow-xs group flex-1">
              <OptimizedImage
                src={product.image}
                alt={product.name}
                width={800}
                priority
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Floating Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#50563D] bg-white/95 px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider backdrop-blur-xs">
                  <Leaf className="w-3 h-3 text-[#656B4F]" /> 100% Pure Plant
                </span>
                {product.isPopular && (
                  <span className="inline-block text-[10px] font-black text-white bg-[#E06A26] px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                    Best Seller
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="inline-block text-[10px] font-black text-white bg-[#656B4F] px-2.5 py-1 rounded-full shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`absolute top-3 right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-md ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-white/90 text-stone-600 hover:text-rose-500 hover:bg-white'
                }`}
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Key Trust Signals (Compact 4-grid aligned at bottom) */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-0.5 shrink-0">
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#FAFAF5] border border-[#D4DBC9]/60 text-center space-y-0.5">
                <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#656B4F] mx-auto" />
                <span className="text-[8.5px] sm:text-[10px] font-extrabold text-[#1E201D] block leading-tight">Plant Meat</span>
              </div>
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#FAFAF5] border border-[#D4DBC9]/60 text-center space-y-0.5">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 mx-auto" />
                <span className="text-[8.5px] sm:text-[10px] font-extrabold text-[#1E201D] block leading-tight">High Protein</span>
              </div>
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#FAFAF5] border border-[#D4DBC9]/60 text-center space-y-0.5">
                <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-700 mx-auto" />
                <span className="text-[8.5px] sm:text-[10px] font-extrabold text-[#1E201D] block leading-tight">0% Cholesterol</span>
              </div>
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#FAFAF5] border border-[#D4DBC9]/60 text-center space-y-0.5">
                <Snowflake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700 mx-auto" />
                <span className="text-[8.5px] sm:text-[10px] font-extrabold text-[#1E201D] block leading-tight">Keep -18°C</span>
              </div>
            </div>
          </div>

          {/* RIGHT: COMMERCE & SPECIFICATION PANEL (SAME HEIGHT AS IMAGE) */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-3.5">
            <div className="space-y-2">
              {/* Clean Horizontal Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-[#50563D] bg-[#EAF0E5] border border-[#656B4F]/20 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#656B4F]" /> 100% Pure Veg
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#50563D] bg-[#EAF0E5] border border-[#D4DBC9] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  {product.category || 'Plant Meat'}
                </span>
                {product.code && (
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-stone-600 bg-stone-100 border border-[#D4DBC9] px-2 py-0.5 rounded-full whitespace-nowrap">
                    SKU: {product.code}
                  </span>
                )}
                {(product.isAvailable === false || (product.isAvailable === undefined && product.stock <= 0)) ? (
                  <span className="text-[11px] sm:text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 whitespace-nowrap ml-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 whitespace-nowrap ml-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock (Live)
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1E201D] leading-tight font-poppins">
                {product.name}
              </h1>

              <p className="text-xs text-[#50563D] leading-relaxed">
                {product.description ||
                  'Rich, tender, plant-based culinary cut designed for rich curries, gravies, biryanis, and succulent tawa roasts.'}
              </p>
            </div>

            {/* Price & Discount Row */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAFAF5] border border-[#D4DBC9] space-y-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-[#1E201D]">₹{dynamicPrice}</span>
                {dynamicMrp > dynamicPrice && (
                  <span className="text-sm text-[#818B7D] line-through">₹{dynamicMrp}</span>
                )}
                {discountPercent > 0 && (
                  <span className="text-[11px] font-black text-[#50563D] bg-[#EAF0E5] px-2 py-0.5 rounded-full border border-[#656B4F]/20">
                    Save ₹{savings} ({discountPercent}% OFF)
                  </span>
                )}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#61665D] flex items-center gap-1.5">
                <span>Inclusive of all taxes</span>
                <span>•</span>
                <span className="text-[#656B4F] font-bold">Free cold delivery on ₹2999+</span>
              </div>
            </div>

            {/* Pack Size Selection Toggle Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-black text-[#1E201D] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#656B4F]" />
                  <span>Select Pack Size ({packOptions.length} available):</span>
                </label>
                <span className="font-black text-[#50563D] text-[11px] bg-[#E8EEE0] px-2.5 py-0.5 rounded-full border border-[#656B4F]/20">
                  Active: {activePack?.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-[#E8EEE0] rounded-2xl border border-[#4F534C]/20 shadow-inner">
                {packOptions.map((opt, idx) => {
                  const isSelected = selectedPackIdx === idx;
                  return (
                    <button
                      key={opt.weight}
                      type="button"
                      onClick={() => setSelectedPackIdx(idx)}
                      className={`p-3 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer border relative ${
                        isSelected
                          ? 'bg-[#50563D] text-white border-[#50563D] shadow-sm scale-[1.01]'
                          : 'bg-white hover:bg-[#F9FCF6] text-[#1E201D] border-stone-200/90 hover:border-[#656B4F]/50 shadow-2xs'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Radio Switch Indicator */}
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'border-white bg-[#86EFAC]'
                              : 'border-stone-300 bg-stone-50'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#1E201D]" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${
                                isSelected
                                  ? 'bg-white/20 text-[#EAF0E5]'
                                  : opt.packType === 'retail'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-[#D6DFC9] text-[#2D3823] border border-[#656B4F]/20'
                              }`}
                            >
                              {opt.badge}
                            </span>
                            <span className="font-extrabold text-xs sm:text-sm truncate">
                              {opt.weight}
                            </span>
                          </div>
                          <p
                            className={`text-[10px] mt-0.5 ${
                              isSelected ? 'text-white/80' : 'text-stone-500'
                            }`}
                          >
                            {opt.packType === 'retail' ? 'Consumer Pack' : 'Wholesale Master Pack'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm sm:text-base font-black ${
                            isSelected ? 'text-[#86EFAC]' : 'text-[#50563D]'
                          }`}
                        >
                          ₹{opt.price}
                        </span>
                        {opt.mrp > opt.price && (
                          <p
                            className={`text-[10px] line-through ${
                              isSelected ? 'text-white/60' : 'text-stone-400'
                            }`}
                          >
                            ₹{opt.mrp}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Direct Add to Cart Action */}
            <div className="pt-1">
              <div className="flex items-center gap-2.5 w-full">
                <div className="flex items-center border border-[#D4DBC9] rounded-2xl bg-[#FAFAF5] p-1 shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-xl hover:bg-stone-200 flex items-center justify-center text-[#1E201D] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-black text-[#1E201D]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-xl hover:bg-stone-200 flex items-center justify-center text-[#1E201D] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(product.isAvailable === false || (product.isAvailable === undefined && product.stock <= 0)) ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-3.5 px-4 sm:px-6 rounded-2xl bg-stone-200 text-stone-500 text-xs sm:text-sm font-bold shadow-none cursor-not-allowed opacity-75 flex items-center justify-center gap-2 whitespace-nowrap min-w-0"
                  >
                    <span className="truncate font-black">Out of Stock</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 py-3.5 px-4 sm:px-6 rounded-2xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-0 cursor-pointer disabled:opacity-75"
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                        <span className="truncate">Processing...</span>
                      </>
                    ) : isAlreadyInCart ? (
                      quantity === inCartQty ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                          <span className="truncate font-black">
                            In Cart ({inCartQty}) • View Cart →
                          </span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 shrink-0" />
                          <span className="truncate font-black">
                            Update Cart to {quantity} • ₹{dynamicPrice * quantity}
                          </span>
                        </>
                      )
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 shrink-0" />
                        <span className="truncate font-black">
                          Add to Cart • ₹{dynamicPrice * quantity}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Cold Delivery Assurance */}
            <div className="p-3 rounded-2xl bg-[#EAF0E5] border border-[#656B4F]/20 flex items-center gap-3 text-xs text-[#2D4030]">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#656B4F] shrink-0" />
              <div>
                <span className="font-extrabold block text-xs sm:text-sm text-[#1E201D]">Insulated Cold-Chain Delivery</span>
                <span className="text-[11px] text-[#50563D]">Packed in temperature-controlled frozen boxes at -18°C.</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. TABBED DEEP DIVE (COOKING GUIDE, NUTRITION, STORAGE) */}
        <div className="mt-8 bg-white rounded-3xl p-5 sm:p-7 border border-[#D4DBC9] shadow-xs space-y-6">
          <div
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
              overscrollBehaviorX: 'contain',
            }}
            className="flex items-center gap-2.5 border-b border-[#D4DBC9]/60 pb-2 overflow-x-auto scrollbar-none scrollbar-hide no-scrollbar w-full min-w-0"
          >
            {[
              { id: 'cooking', label: 'Cooking & Prep Guide', icon: UtensilsCrossed },
              { id: 'nutrition', label: 'Nutritional Facts', icon: BarChart3 },
              { id: 'ingredients', label: 'Clean Ingredients', icon: Leaf },
              { id: 'storage', label: 'Storage & Shelf Life', icon: Snowflake },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 min-w-max transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#656B4F] text-white shadow-xs'
                      : 'bg-[#FAFAF5] text-[#50563D] hover:bg-[#EAF0E5] border border-[#D4DBC9]/60'
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: COOKING GUIDE */}
          {activeTab === 'cooking' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#FAFAF5] border border-[#D4DBC9]/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-xs text-[#1E201D]">Curry & Gravy Simmer</h4>
                <p className="text-[11px] text-[#61665D] leading-relaxed">
                  Thaw for 10 mins. Add directly into boiling spicy curry/gravy during the last 8-10 minutes of cooking. It absorbs all rich spices perfectly.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF5] border border-[#D4DBC9]/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-xs text-[#1E201D]">Tawa Roast / Pan Sear</h4>
                <p className="text-[11px] text-[#61665D] leading-relaxed">
                  Heat 1 tbsp oil in a pan. Sauté pieces on medium heat for 6-8 minutes until golden brown and crispy outside, tender inside.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF5] border border-[#D4DBC9]/60 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center">
                  <Wind className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-xs text-[#1E201D]">Air Fryer / Oven</h4>
                <p className="text-[11px] text-[#61665D] leading-relaxed">
                  Lightly spray oil and air-fry at 180°C for 8-10 minutes for oil-free crispy appetizers.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: NUTRITION FACTS */}
          {activeTab === 'nutrition' && (
            <div className="max-w-md bg-[#FAFAF5] rounded-2xl p-4 border border-[#D4DBC9]/60 space-y-3 animate-in fade-in duration-200">
              <h4 className="font-black text-xs text-[#1E201D] uppercase tracking-wider border-b border-[#D4DBC9]/60 pb-2 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#656B4F]" /> Nutrition Information (Per 100g)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-[#61665D]">Energy</span>
                  <span className="font-bold text-[#1E201D]">185 kcal</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-[#61665D]">Plant Protein</span>
                  <span className="font-extrabold text-[#656B4F]">22.4 g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-[#61665D]">Dietary Fiber</span>
                  <span className="font-bold text-[#1E201D]">5.8 g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-[#61665D]">Total Carbohydrates</span>
                  <span className="font-bold text-[#1E201D]">6.2 g</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-[#61665D]">Total Fats</span>
                  <span className="font-bold text-[#1E201D]">4.5 g</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#61665D]">Cholesterol</span>
                  <span className="font-bold text-[#656B4F]">0 mg (Zero Cholesterol)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INGREDIENTS */}
          {activeTab === 'ingredients' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <h4 className="font-black text-xs text-[#1E201D] uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-[#656B4F]" /> 100% Vegetarian & Plant Sourced Ingredients
              </h4>
              <p className="text-xs text-[#50563D] leading-relaxed">
                Filtered Water, Non-GMO Textured Soy Protein, Isolated Pea Protein, Refined Sunflower Oil, Wheat Flour, Yeast Extract, Himalayan Pink Salt, Natural Spices & Aromatics, Beetroot Color Extract.
              </p>
              <div className="p-3 rounded-xl bg-[#EAF0E5] border border-[#656B4F]/30 text-xs text-[#2D3823] font-medium">
                Contains No MSG • No Artificial Preservatives • No Animal Products
              </div>
            </div>
          )}

          {/* TAB 4: STORAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-3 animate-in fade-in duration-200 text-xs text-[#50563D] leading-relaxed">
              <h4 className="font-black text-xs text-[#1E201D] uppercase tracking-wider flex items-center gap-1.5">
                <Snowflake className="w-4 h-4 text-blue-700" /> Storage & Handling Directions
              </h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Store in deep freezer at -18°C or colder at all times.</li>
                <li>Shelf life: 12 months from manufacturing date under frozen conditions.</li>
                <li>Do not refreeze once completely thawed. Consume within 24 hours of opening pack.</li>
              </ul>
            </div>
          )}
        </div>

        {/* 4. RELATED PRODUCTS FROM BACKEND CATEGORY */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#656B4F]">You Might Also Like</span>
                <h3 className="text-xl sm:text-2xl font-black text-[#1E201D] font-poppins">
                  More from {product.category}
                </h3>
              </div>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-extrabold text-[#656B4F] hover:text-[#50563D] hover:underline inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                <span className="whitespace-nowrap">View All</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((rel) => {
                const mrp = rel.mrp ?? Math.round(rel.price * 1.25);
                const disc = mrp > rel.price ? Math.round(((mrp - rel.price) / mrp) * 100) : 0;
                const handleRelClick = () => {
                  setCachedData(`product_detail_${rel.id}`, rel);
                  router.push(`/product/${rel.id}`);
                };
                const handleRelPrefetch = () => {
                  setCachedData(`product_detail_${rel.id}`, rel);
                  router.prefetch(`/product/${rel.id}`);
                };
                return (
                  <div
                    key={rel.id}
                    onClick={handleRelClick}
                    onMouseEnter={handleRelPrefetch}
                    onTouchStart={handleRelPrefetch}
                    className="p-3 rounded-2xl bg-white border border-[#D4DBC9] hover:border-[#656B4F]/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
                  >
                    <div>
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#EAF0E5] mb-2.5">
                        <OptimizedImage
                          src={rel.image}
                          alt={rel.name}
                          width={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {disc > 0 && (
                          <span className="absolute top-2 left-2 bg-[#656B4F] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                            {disc}% OFF
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#1E201D] group-hover:text-[#656B4F] truncate">
                        {rel.name}
                      </h4>
                      <p className="text-[10px] text-[#61665D] mt-0.5">{rel.weight || '1kg'}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="font-black text-xs sm:text-sm text-[#1E201D]">₹{rel.price}</span>
                      <span className="text-[10px] font-extrabold text-[#656B4F] group-hover:underline flex items-center gap-0.5">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
