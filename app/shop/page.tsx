'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { ProductType, CategoryType } from '@/lib/types';
import { fetchApi, fetchCachedApi, getCachedData } from '@/lib/apiConfig';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Leaf,
  Grid,
  List,
  Flame,
  Sparkles,
  ChefHat,
  ShieldCheck,
  Beef,
  Drumstick,
  Fish,
  Cookie,
  Package,
  Layers,
  Sprout,
  UtensilsCrossed,
  Check,
  ArrowRight
} from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import { getBackendPackOptions, PackOption, formatCleanWeight } from '@/lib/productPacks';

// Clean Vector SVG Icon helper for Categories
function getCategoryIcon(name: string, className = 'w-5 h-5') {
  const n = (name || '').toLowerCase();
  if (n.includes('mutton') || n.includes('meat') || n.includes('beef')) {
    return <Beef className={className} />;
  }
  if (n.includes('chicken') || n.includes('poultry')) {
    return <Drumstick className={className} />;
  }
  if (n.includes('fish') || n.includes('sea') || n.includes('prawn')) {
    return <Fish className={className} />;
  }
  if (n.includes('starter') || n.includes('snack') || n.includes('kebab') || n.includes('nugget')) {
    return <Cookie className={className} />;
  }
  if (n.includes('retail') || n.includes('pack') || n.includes('box')) {
    return <Package className={className} />;
  }
  if (n.includes('combo')) {
    return <Layers className={className} />;
  }
  if (n.includes('veg') || n.includes('plant')) {
    return <Sprout className={className} />;
  }
  return <Leaf className={className} />;
}

// Single Interactive Product Card Component
// Single Interactive Product Card Component
function ProductCard({
  product,
  allProducts,
  viewMode = 'grid',
}: {
  product: ProductType;
  allProducts?: ProductType[];
  viewMode?: 'grid' | 'list';
}) {
  const router = useRouter();
  const { cart, addToCart, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);

  // Compute available pack options dynamically from backend product variants & companions
  const packOptions = useMemo<PackOption[]>(() => {
    return getBackendPackOptions(product, allProducts);
  }, [product, allProducts]);

  const activeOption = packOptions[selectedWeightIdx] || packOptions[0] || {
    productId: product.id,
    weight: product.weight || '1kg',
    price: product.price,
    mrp: product.mrp || product.price,
    packType: 'wholesale' as const,
    badge: 'Wholesale' as const,
    label: product.weight || '1kg',
    isBase: true,
  };
  const currentPrice = activeOption.price;
  const currentMrp = activeOption.mrp;
  const discountPercent = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;
  const isWishlisted = isInWishlist(product.id);

  const activeProductId = activeOption.productId || product.id;
  const activeWeight = activeOption.weight;

  // Real-time cart state lookup for this exact variant
  const cartItem = cart.find(
    (item) => item.productId === activeProductId && (item.weight === activeWeight || !item.weight)
  );
  const inCartQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(
      {
        ...product,
        id: activeProductId,
        weight: activeWeight,
        price: currentPrice,
        mrp: currentMrp,
      },
      1,
      false
    );
  };

  const handleCardClick = () => {
    const targetId = product.id || (product as any)._id || product.code;
    if (targetId) {
      router.push(`/product/${targetId}`);
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col sm:flex-row items-stretch gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#4F534C]/15 hover:border-[#656B4F]/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        <div className="relative w-full sm:w-48 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-[#EAF0E5] shrink-0 border border-stone-200/60">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            width={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.isPopular ? (
            <span className="absolute top-2.5 left-2.5 bg-[#E06A26] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              Best Seller
            </span>
          ) : discountPercent > 0 ? (
            <span className="absolute top-2.5 left-2.5 bg-[#656B4F] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
              {discountPercent}% OFF
            </span>
          ) : null}

          <span className="absolute bottom-2.5 left-2.5 bg-[#50563D] text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
            {activeOption.badge} Pack
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-xs ${
              isWishlisted ? 'bg-rose-50 text-rose-500' : 'bg-white/90 text-stone-600 hover:text-rose-500 hover:bg-white'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#50563D] bg-[#EAF0E5] px-2 py-0.5 rounded border border-[#656B4F]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#656B4F]" /> 100% Veg
              </span>
              <span className="text-[11px] font-bold text-[#50563D] bg-[#EAF0E5] px-2 py-0.5 rounded">
                {product.category || 'Plant Meat'}
              </span>
              {product.stock !== undefined && product.stock <= 0 ? (
                <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full ml-auto">
                  Out of Stock
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 ml-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In Stock
                </span>
              )}
            </div>

            <h3 className="font-extrabold text-sm sm:text-base text-[#1E201D] group-hover:text-[#656B4F] truncate">
              {product.name}
            </h3>
            <p className="text-xs text-[#61665D] line-clamp-2 mt-0.5">
              {product.description || '100% plant-based meat alternative with rich authentic flavor & chewy texture.'}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-[#1E201D]">₹{currentPrice}</span>
                {currentMrp > currentPrice && (
                  <span className="text-xs text-[#818B7D] line-through">₹{currentMrp}</span>
                )}
                {discountPercent > 0 && (
                  <span className="text-[10px] font-extrabold text-[#50563D] bg-[#EAF0E5] px-1.5 py-0.5 rounded border border-[#656B4F]/20">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {packOptions.length > 1 ? (
              <div className="w-full max-w-[280px]" onClick={(e) => e.stopPropagation()}>
                <div className="p-0.5 bg-[#EAEFE3] rounded-xl border border-[#50563D]/20 shadow-inner grid grid-cols-2 gap-1">
                  {packOptions.map((opt, idx) => {
                    const isSelected = selectedWeightIdx === idx;
                    const cleanW = formatCleanWeight(opt.weight);
                    const badgeLabel = opt.badge === 'Retail' ? 'Retail' : 'Bulk';
                    return (
                      <button
                        key={opt.weight}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedWeightIdx(idx);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 min-w-0 ${
                          isSelected
                            ? 'bg-[#50563D] text-white shadow-xs font-black'
                            : 'text-[#4A5344] hover:bg-white/70 hover:text-[#1E201D] font-bold'
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-[#A9F2B7]' : 'bg-[#50563D]/30'
                          }`}
                        />
                        <span className="text-xs font-extrabold whitespace-nowrap leading-none">
                          {cleanW}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-wider font-extrabold whitespace-nowrap leading-none ${
                            isSelected ? 'text-white/80' : 'text-[#656B4F]'
                          }`}
                        >
                          {badgeLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : packOptions.length === 1 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAEFE3] border border-[#50563D]/20 text-xs font-bold text-[#50563D]">
                <span className="text-[9px] font-black uppercase bg-white/90 px-1.5 py-0.5 rounded text-[#50563D]">
                  {packOptions[0].badge}
                </span>
                <span className="font-extrabold text-[11px]">{formatCleanWeight(packOptions[0].weight)}</span>
              </div>
            ) : null}

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {product.stock !== undefined && product.stock <= 0 ? (
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-xl bg-stone-200 text-stone-500 text-xs font-bold cursor-not-allowed opacity-75 flex items-center gap-1.5"
                >
                  <span>Out of Stock</span>
                </button>
              ) : inCartQuantity > 0 ? (
                <div className="flex items-center justify-between bg-[#50563D] text-white rounded-xl p-0.5 shadow-sm border border-[#50563D] min-w-[125px] animate-in fade-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateQuantity(activeProductId, activeWeight, inCartQuantity - 1);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-all cursor-pointer text-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className="text-xs font-black px-2.5 select-none tracking-tight">
                    {inCartQuantity} in cart
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateQuantity(activeProductId, activeWeight, inCartQuantity + 1);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-all cursor-pointer text-white"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="px-4 py-2 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between rounded-2xl bg-white border border-[#4F534C]/15 hover:border-[#656B4F]/40 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-[#EAF0E5] overflow-hidden">
        <OptimizedImage
          src={product.image}
          alt={product.name}
          width={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {isOutOfStock ? (
          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
            Out of Stock
          </span>
        ) : product.isPopular ? (
          <span className="absolute top-2.5 left-2.5 bg-[#E06A26] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
            Best Seller
          </span>
        ) : discountPercent > 0 ? (
          <span className="absolute top-2.5 left-2.5 bg-[#656B4F] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
            {discountPercent}% OFF
          </span>
        ) : null}

        <span className="absolute bottom-2.5 left-2.5 bg-[#50563D] text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
          {activeOption.badge} Pack
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-xs cursor-pointer ${
            isWishlisted ? 'bg-rose-50 text-rose-500' : 'bg-white/90 text-stone-600 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#50563D] bg-[#EAF0E5] px-1.5 py-0.5 rounded border border-[#656B4F]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#656B4F]" /> Veg
            </span>
            {isOutOfStock ? (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                Out of Stock
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In Stock
              </span>
            )}
          </div>

          <h3 className="font-extrabold text-xs sm:text-sm text-[#1E201D] group-hover:text-[#50563D] truncate leading-tight">
            {product.name}
          </h3>

          <p className="text-[11px] text-[#61665D] line-clamp-1 mt-0.5">
            {product.description || '100% plant-based meat with rich texture.'}
          </p>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-[#1E201D]">₹{currentPrice}</span>
            {currentMrp > currentPrice && (
              <span className="text-[11px] text-[#818B7D] line-through">₹{currentMrp}</span>
            )}
            {discountPercent > 0 && (
              <span className="text-[9px] font-extrabold text-[#50563D] bg-[#EAF0E5] px-1 py-0.2 rounded border border-[#656B4F]/20">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {packOptions.length > 1 ? (
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-0.5 bg-[#EAEFE3] rounded-xl border border-[#50563D]/20 shadow-inner grid grid-cols-2 gap-1">
              {packOptions.map((opt, idx) => {
                const isSelected = selectedWeightIdx === idx;
                const cleanW = formatCleanWeight(opt.weight);
                const badgeLabel = opt.badge === 'Retail' ? 'Retail' : 'Bulk';
                return (
                  <button
                    key={opt.weight}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedWeightIdx(idx);
                    }}
                    className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer select-none flex items-center justify-center gap-1 min-w-0 ${
                      isSelected
                        ? 'bg-[#50563D] text-white shadow-xs font-black'
                        : 'text-[#4A5344] hover:bg-white/70 hover:text-[#1E201D] font-bold'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-[#A9F2B7]' : 'bg-[#50563D]/30'
                      }`}
                    />
                    <span className="text-[10px] sm:text-[11px] font-black whitespace-nowrap leading-none">
                      {cleanW}
                    </span>
                    <span
                      className={`text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold whitespace-nowrap leading-none ${
                        isSelected ? 'text-white/80' : 'text-[#656B4F]'
                      }`}
                    >
                      {badgeLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : packOptions.length === 1 ? (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#EAEFE3] border border-[#50563D]/20 text-[11px] font-bold text-[#50563D]">
            <span className="text-[8px] font-black uppercase bg-white/90 px-1 py-0.2 rounded text-[#50563D]">
              {packOptions[0].badge}
            </span>
            <span className="font-extrabold">{formatCleanWeight(packOptions[0].weight)}</span>
          </div>
        ) : null}

        <div className="pt-2 border-t border-stone-100 flex items-center" onClick={(e) => e.stopPropagation()}>
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 px-2 rounded-xl bg-stone-200 text-stone-500 text-xs font-bold cursor-not-allowed opacity-75 flex items-center justify-center gap-1.5"
            >
              <span>Out of Stock</span>
            </button>
          ) : inCartQuantity > 0 ? (
            <div className="w-full flex items-center justify-between bg-[#50563D] text-white rounded-xl p-0.5 shadow-sm border border-[#50563D] animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(activeProductId, activeWeight, inCartQuantity - 1);
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-all cursor-pointer text-white shrink-0"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
              <span className="text-xs font-black px-1 select-none tracking-tight flex items-center justify-center gap-1 min-w-0">
                <span>{inCartQuantity}</span>
                <span className="text-[10px] font-bold text-white/80 hidden min-[360px]:inline">in cart</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(activeProductId, activeWeight, inCartQuantity + 1);
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-all cursor-pointer text-white shrink-0"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-2.5 px-2.5 sm:px-3 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-black shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
            >
              <ShoppingBag className="w-3.5 h-3.5 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const { totalItems, totalPrice, setIsCartOpen } = useCart();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedPackSizes, setSelectedPackSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest' | 'discount'>('popular');
  const [quickFilter, setQuickFilter] = useState<'all' | 'bestsellers' | 'readytofry' | 'rawmeat' | 'under300'>('all');

  // UI View Layout
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 16;

  // 1. Fetch Categories dynamically from backend with instant cache hydration
  useEffect(() => {
    const cachedCats = getCachedData<CategoryType[]>('shop_categories_cache');
    if (cachedCats && Array.isArray(cachedCats) && cachedCats.length > 0) {
      setCategories(cachedCats);
    }

    const loadCategories = async () => {
      try {
        const res = await fetchCachedApi<CategoryType[]>('/categories', { cacheKey: 'shop_categories_cache', ttlMs: 180000 });
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories from backend:', err);
      }
    };
    loadCategories();
  }, []);

  // 2. Fetch All Products from backend API with instant cache hydration
  useEffect(() => {
    const cachedProds = getCachedData<ProductType[]>('shop_products_cache');
    if (cachedProds && Array.isArray(cachedProds) && cachedProds.length > 0) {
      setProducts(cachedProds);
      setLoading(false);
    }

    const loadProducts = async () => {
      if (!cachedProds || cachedProds.length === 0) {
        setLoading(true);
      }
      try {
        const res = await fetchCachedApi<ProductType[]>('/products?limit=100', { cacheKey: 'shop_products_cache', ttlMs: 120000 });
        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Sync query params
  useEffect(() => {
    setSearchTerm(initialSearch);
    setDebouncedSearch(initialSearch);
    setSelectedCategory(initialCategory || 'All');
    setPage(1);
  }, [initialSearch, initialCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination on any filter modification
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, selectedProductTypes, selectedPackSizes, priceRange, inStockOnly, quickFilter, sortBy]);

  // Category Carousel Slider Drag & Scroll Ref
  const categorySliderRef = useRef<HTMLDivElement>(null);
  const [isCatDragging, setIsCatDragging] = useState(false);
  const [catStartX, setCatStartX] = useState(0);
  const [catScrollLeft, setCatScrollLeft] = useState(0);
  const [catMoved, setCatMoved] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll boundary to show/hide arrows
  const checkSliderScroll = () => {
    if (!categorySliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categorySliderRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    checkSliderScroll();
    const el = categorySliderRef.current;
    if (el) {
      el.addEventListener('scroll', checkSliderScroll, { passive: true });
      window.addEventListener('resize', checkSliderScroll);
      return () => {
        el.removeEventListener('scroll', checkSliderScroll);
        window.removeEventListener('resize', checkSliderScroll);
      };
    }
  }, [categories, products]);

  // Smooth Category Slider Helpers
  const scrollCategorySlider = (direction: 'left' | 'right') => {
    if (!categorySliderRef.current) return;
    const distance = 300;
    categorySliderRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  const handleCatPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (!categorySliderRef.current) return;
    setIsCatDragging(true);
    setCatMoved(false);
    setCatStartX(e.clientX);
    setCatScrollLeft(categorySliderRef.current.scrollLeft);
  };

  const handleCatPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (!isCatDragging || !categorySliderRef.current) return;
    const diff = e.clientX - catStartX;
    if (Math.abs(diff) > 4) {
      setCatMoved(true);
      categorySliderRef.current.scrollLeft = catScrollLeft - diff;
    }
  };

  const handleCatPointerUpOrCancel = () => {
    setIsCatDragging(false);
  };

  const handleCategorySelect = (catName: string) => {
    if (catMoved) return;
    setSelectedCategory(catName);
  };

  const handleCatWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!categorySliderRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      categorySliderRef.current.scrollLeft += e.deltaY;
    }
  };

  // Helper string normalization
  const norm = (s: string) => (s || '').trim().toLowerCase();

  // 1. Unified & Deduplicated Categories directly synced with products
  const unifiedCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

    // Count all distinct categories from actual products
    products.forEach((p) => {
      const rawCat = (p.category || '').trim();
      if (!rawCat) return;
      const key = rawCat.toLowerCase();
      if (map.has(key)) {
        map.get(key)!.count += 1;
      } else {
        map.set(key, { id: key, name: rawCat, count: 1 });
      }
    });

    // Also include any backend API categories
    categories.forEach((c) => {
      const key = (c.name || '').trim().toLowerCase();
      if (!key) return;
      if (map.has(key)) {
        if (c.id) map.get(key)!.id = c.id;
      } else {
        map.set(key, { id: c.id || key, name: c.name.trim(), count: 0 });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [products, categories]);

  // 2. Dynamic Product Types with precise keyword matching
  const productTypeDefinitions = useMemo(() => [
    { key: 'Starters', label: 'Starters', match: (name: string, cat: string) => cat.includes('starter') || name.includes('starter') || name.includes('nugget') || name.includes('popcorn') || name.includes('finger') || name.includes('fry') || name.includes('bites') },
    { key: 'Chicken', label: 'Chicken', match: (name: string, cat: string) => name.includes('chicken') || cat.includes('chicken') },
    { key: 'Mutton', label: 'Mutton', match: (name: string, cat: string) => name.includes('mutton') || cat.includes('mutton') },
    { key: 'Fish', label: 'Fish', match: (name: string, cat: string) => name.includes('fish') || cat.includes('fish') },
    { key: 'Prawn', label: 'Prawn', match: (name: string, cat: string) => name.includes('prawn') || cat.includes('prawn') || name.includes('shrimp') },
    { key: 'Liver', label: 'Liver', match: (name: string, cat: string) => name.includes('liver') || cat.includes('liver') },
    { key: 'Chaap', label: 'Soya Chaap', match: (name: string, cat: string) => name.includes('chaap') || cat.includes('chaap') },
    { key: 'Biryani', label: 'Biryani / Curry', match: (name: string, cat: string) => name.includes('biryani') || name.includes('briyani') || name.includes('curry') || name.includes('gravy') },
  ], []);

  const dynamicProductTypes = useMemo(() => {
    return productTypeDefinitions
      .map((item) => ({
        ...item,
        count: products.filter((p) => item.match((p.name || '').toLowerCase(), (p.category || '').toLowerCase())).length,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [products, productTypeDefinitions]);

  // 3. Dynamic Pack Sizes with counts
  const dynamicPackSizes = useMemo(() => {
    const sizes = [
      { key: '250g', label: '200g - 250g', match: (w: string) => /200|250/i.test(w) },
      { key: '500g', label: '300g - 500g', match: (w: string) => /300|400|500/i.test(w) },
      { key: '1kg', label: '1kg Bulk Pack', match: (w: string) => /1\s*kg/i.test(w) || w.toLowerCase() === '1kg' },
      { key: '2kg', label: '2kg+ Family Pack', match: (w: string) => /2\s*kg|3\s*kg|5\s*kg/i.test(w) },
    ];

    return sizes.map((s) => ({
      ...s,
      count: products.filter((p) => s.match(p.weight || '1kg')).length,
    })).filter((s) => s.count > 0);
  }, [products]);

  // In-Stock items count
  const inStockCount = useMemo(() => {
    return products.filter((p) => p.stock === undefined || p.stock > 0).length;
  }, [products]);

  // 4. Filter Logic strictly applied with exact mapping
  const filteredProducts = useMemo(() => {
    const searchClean = debouncedSearch.trim().toLowerCase();
    const searchWords = searchClean ? searchClean.split(/\s+/).filter(Boolean) : [];
    const targetCategory = norm(selectedCategory);

    return products.filter((p) => {
      // 1. Search Query
      if (searchWords.length > 0) {
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const code = (p.code || '').toLowerCase();

        const match = searchWords.every((w) => name.includes(w) || cat.includes(w) || desc.includes(w) || code.includes(w));
        if (!match) return false;
      }

      // 2. Exact Category Filter (Case-insensitive trimmed exact match)
      if (targetCategory && targetCategory !== 'all') {
        const pCat = norm(p.category);
        if (pCat !== targetCategory) {
          return false;
        }
      }

      // 3. Product Type Filter
      if (selectedProductTypes.length > 0) {
        const pName = (p.name || '').toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        const matchesAnyType = selectedProductTypes.some((typeKey) => {
          const def = productTypeDefinitions.find((d) => d.key === typeKey);
          if (def) {
            return def.match(pName, pCat);
          }
          const lower = typeKey.toLowerCase();
          return pName.includes(lower) || pCat.includes(lower);
        });
        if (!matchesAnyType) return false;
      }

      // 4. Pack Size Filter
      if (selectedPackSizes.length > 0) {
        const weight = (p.weight || '').toLowerCase();
        const matchesPack = selectedPackSizes.some((s) => {
          if (s === '250g') return /200|250/i.test(weight);
          if (s === '500g') return /300|400|500/i.test(weight);
          if (s === '1kg') return /1\s*kg/i.test(weight) || weight === '1kg';
          if (s === '2kg') return /2\s*kg|3\s*kg|5\s*kg/i.test(weight);
          return false;
        });
        if (!matchesPack) return false;
      }

      // 5. Price Range Filter
      if (p.price < priceRange[0] || p.price > priceRange[1]) {
        return false;
      }

      // 6. In-Stock Filter
      if (inStockOnly && p.stock !== undefined && p.stock <= 0) {
        return false;
      }

      // 7. Quick Filter Tags
      if (quickFilter === 'bestsellers' && !p.isPopular) return false;
      if (quickFilter === 'readytofry') {
        const pCat = norm(p.category);
        const pName = (p.name || '').toLowerCase();
        if (!pCat.includes('starter') && !pName.includes('starter') && !pName.includes('nugget') && !pName.includes('fry') && !pName.includes('bites')) return false;
      }
      if (quickFilter === 'rawmeat') {
        const pCat = norm(p.category);
        const pName = (p.name || '').toLowerCase();
        if (pCat.includes('starter') || pName.includes('starter') || pName.includes('nugget')) return false;
      }
      if (quickFilter === 'under300' && p.price > 300) return false;

      return true;
    });
  }, [
    products,
    debouncedSearch,
    selectedCategory,
    selectedProductTypes,
    selectedPackSizes,
    priceRange,
    inStockOnly,
    quickFilter,
    productTypeDefinitions,
  ]);

  // Sort Products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-low') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'discount') {
      return list.sort((a, b) => {
        const discA = (a.mrp ?? a.price) - a.price;
        const discB = (b.mrp ?? b.price) - b.price;
        return discB - discA;
      });
    }
    if (sortBy === 'newest') {
      return list.sort((a, b) => (b.code || '').localeCompare(a.code || ''));
    }
    return list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
  }, [filteredProducts, sortBy]);

  // Paginated View
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));

  // Clear all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setSelectedProductTypes([]);
    setSelectedPackSizes([]);
    setPriceRange([0, 2000]);
    setInStockOnly(false);
    setSortBy('popular');
    setQuickFilter('all');
    setPage(1);
  };

  const toggleProductType = (t: string) => {
    setSelectedProductTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const togglePackSize = (s: string) => {
    setSelectedPackSizes((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  // Check if any filter is actively applied
  const isAnyFilterActive = useMemo(() => {
    return (
      selectedCategory !== 'All' ||
      selectedProductTypes.length > 0 ||
      selectedPackSizes.length > 0 ||
      priceRange[0] > 0 ||
      priceRange[1] < 2000 ||
      inStockOnly ||
      quickFilter !== 'all' ||
      Boolean(searchTerm)
    );
  }, [selectedCategory, selectedProductTypes, selectedPackSizes, priceRange, inStockOnly, quickFilter, searchTerm]);

  if (loading) {
    return <ShopSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
      <Navbar />

      <main className="site-shell py-5 sm:py-7 lg:py-9 pb-36 sm:pb-40 md:pb-24 flex-1">
        {/* 1. BREADCRUMBS & HERO BANNER */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5 text-xs text-[#818B7D] font-bold mb-3">
            <Link href="/" className="hover:text-[#656B4F] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#656B4F]">Products</span>
            {selectedCategory !== 'All' && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#1E201D]">{selectedCategory}</span>
              </>
            )}
          </div>

          <div className="relative rounded-3xl bg-gradient-to-r from-[#EAF0E5] via-[#DEE8D8] to-[#CDDBC6] p-6 sm:p-8 lg:p-10 border border-[#656B4F]/20 overflow-hidden shadow-xs">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#50563D] bg-white/80 px-3 py-1 rounded-full mb-3 shadow-2xs">
                <Leaf className="w-3.5 h-3.5 text-[#656B4F]" /> 100% Pure Plant Based
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1E201D] tracking-tight leading-tight font-poppins">
                Frozen food, made simple.
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-[#4F534C] font-medium leading-relaxed">
                Browse our plant-based range and find the right pack for your kitchen, restaurant, or catering.
              </p>
            </div>

            <div className="hidden md:flex absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 items-center gap-4">
              <div className="text-right">
                <span className="font-script text-2xl lg:text-3xl font-bold text-[#50563D] block leading-none rotate-[-6deg]">
                  100% Plant Based
                </span>
                <span className="font-script text-lg lg:text-xl text-[#656B4F] block rotate-[-3deg] mt-1">
                  Rich in Protein ↗
                </span>
              </div>
              <div className="w-32 lg:w-40 aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white/80 bg-white/40">
                <OptimizedImage
                  src={products[0]?.image || '/assets/mock-mutton.jpg'}
                  alt="Plant Meat Banner"
                  width={200}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. TOP CATEGORY CAROUSEL / PILLS STRIP (WITH SMOOTH SLIDER, POINTER DRAG & ARROWS) */}
        <div className="mb-8 w-full relative group/slider">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollCategorySlider('left')}
            className={`absolute -left-2 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-xs shadow-md border border-stone-200 text-[#1E201D] hover:bg-[#EAF0E5] hover:scale-110 active:scale-95 flex items-center justify-center transition-all ${
              canScrollLeft ? 'opacity-90 hover:opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#50563D]" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scrollCategorySlider('right')}
            className={`absolute -right-2 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-xs shadow-md border border-stone-200 text-[#1E201D] hover:bg-[#EAF0E5] hover:scale-110 active:scale-95 flex items-center justify-center transition-all ${
              canScrollRight ? 'opacity-90 hover:opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#50563D]" />
          </button>

          {/* Draggable Category Slider Container */}
          <div
            ref={categorySliderRef}
            onPointerDown={handleCatPointerDown}
            onPointerMove={handleCatPointerMove}
            onPointerUp={handleCatPointerUpOrCancel}
            onPointerCancel={handleCatPointerUpOrCancel}
            onWheel={handleCatWheel}
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
              overscrollBehaviorX: 'contain',
              scrollBehavior: 'smooth',
            }}
            className={`flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto py-1 scrollbar-none scrollbar-hide no-scrollbar w-full min-w-0 select-none ${
              isCatDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* All Products Pill */}
            <button
              type="button"
              onClick={() => handleCategorySelect('All')}
              className={`shrink-0 inline-flex items-center gap-3 p-2.5 sm:px-4 sm:py-3 rounded-2xl border transition-all duration-200 shadow-2xs min-w-max ${
                selectedCategory === 'All'
                  ? 'bg-[#50563D] text-white border-[#50563D] shadow-sm scale-[1.02]'
                  : 'bg-white text-[#4F534C] hover:bg-[#F3FBEE] border-[#4F534C]/15 hover:border-[#656B4F]/30'
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedCategory === 'All' ? 'bg-white/20 text-white' : 'bg-[#EAF0E5] text-[#50563D]'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="text-left pr-2 min-w-max">
                <span className="font-extrabold text-xs sm:text-sm block whitespace-nowrap">All Products</span>
                <span className={`text-[10px] block ${selectedCategory === 'All' ? 'text-white/80' : 'text-[#818B7D]'}`}>
                  {products.length} items
                </span>
              </div>
            </button>

            {/* Dynamic Categories with Unified Product Mapping and Counts */}
            {unifiedCategories.map((cat) => {
              const isSelected = norm(selectedCategory) === norm(cat.name);
              return (
                <button
                  key={cat.id || cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`shrink-0 inline-flex items-center gap-3 p-2.5 sm:px-4 sm:py-3 rounded-2xl border transition-all duration-200 shadow-2xs min-w-max ${
                    isSelected
                      ? 'bg-[#50563D] text-white border-[#50563D] shadow-sm scale-[1.02]'
                      : 'bg-white text-[#4F534C] hover:bg-[#F3FBEE] border-[#4F534C]/15 hover:border-[#656B4F]/30'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#EAF0E5] text-[#50563D]'
                    }`}
                  >
                    {getCategoryIcon(cat.name, 'w-5 h-5')}
                  </div>
                  <div className="text-left pr-2 min-w-max">
                    <span className="font-extrabold text-xs sm:text-sm block whitespace-nowrap">{cat.name}</span>
                    <span className={`text-[10px] block ${isSelected ? 'text-white/80' : 'text-[#818B7D]'}`}>
                      {cat.count > 0 ? `${cat.count} items` : '0 items'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. MAIN SHOPPING SECTION (SIDEBAR FILTERS + PRODUCT GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* DESKTOP FILTERS PANEL */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-[#4F534C]/15 shadow-2xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#50563D]" />
                <h2 className="font-black text-sm text-[#1E201D] uppercase tracking-wider">Filters</h2>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#656B4F] hover:text-[#50563D] hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <h3 className="font-extrabold text-xs text-[#1E201D] uppercase tracking-wider flex items-center justify-between">
                <span>Category</span>
                <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
              </h3>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                <label className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F3FBEE] cursor-pointer text-xs font-semibold text-[#4F534C] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="categoryRadio"
                      checked={selectedCategory === 'All'}
                      onChange={() => setSelectedCategory('All')}
                      className="w-4 h-4 accent-[#50563D] cursor-pointer"
                    />
                    <span className={selectedCategory === 'All' ? 'font-bold text-[#1E201D]' : ''}>All Products</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#818B7D]">({products.length})</span>
                </label>

                {unifiedCategories.map((cat) => {
                  const isChecked = norm(selectedCategory) === norm(cat.name);
                  return (
                    <label
                      key={cat.id || cat.name}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F3FBEE] cursor-pointer text-xs font-semibold text-[#4F534C] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <input
                          type="radio"
                          name="categoryRadio"
                          checked={isChecked}
                          onChange={() => setSelectedCategory(cat.name)}
                          className="w-4 h-4 accent-[#50563D] cursor-pointer shrink-0"
                        />
                        <span className={`truncate ${isChecked ? 'font-bold text-[#1E201D]' : ''}`}>{cat.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#818B7D] shrink-0">({cat.count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Product Type Filter */}
            {dynamicProductTypes.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-stone-100">
                <h3 className="font-extrabold text-xs text-[#1E201D] uppercase tracking-wider flex items-center justify-between">
                  <span>Product Type</span>
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                </h3>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {dynamicProductTypes.map((t) => {
                    const isChecked = selectedProductTypes.includes(t.key);
                    return (
                      <label
                        key={t.key}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F3FBEE] cursor-pointer text-xs font-semibold text-[#4F534C] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProductType(t.key)}
                            className="w-4 h-4 rounded-sm accent-[#50563D] cursor-pointer"
                          />
                          <span className={isChecked ? 'font-bold text-[#1E201D]' : ''}>{t.label}</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#818B7D]">({t.count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="space-y-2.5 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-[#1E201D] uppercase tracking-wider">Price Range</h3>
                <span className="text-xs font-black text-[#50563D]">
                  ₹{priceRange[0]} – ₹{priceRange[1]}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={2000}
                step={25}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[#50563D] cursor-pointer h-2 bg-stone-200 rounded-lg"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-[#4F534C]">
                  ₹ {priceRange[0]}
                </div>
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-[#4F534C] text-right">
                  ₹ {priceRange[1]}
                </div>
              </div>
            </div>

            {/* Pack Size Filter */}
            {dynamicPackSizes.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-stone-100">
                <h3 className="font-extrabold text-xs text-[#1E201D] uppercase tracking-wider">Pack Size</h3>
                <div className="space-y-1.5">
                  {dynamicPackSizes.map((s) => (
                    <label
                      key={s.key}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F3FBEE] cursor-pointer text-xs font-semibold text-[#4F534C] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedPackSizes.includes(s.key)}
                          onChange={() => togglePackSize(s.key)}
                          className="w-4 h-4 rounded-sm accent-[#50563D] cursor-pointer"
                        />
                        <span className={selectedPackSizes.includes(s.key) ? 'font-bold text-[#1E201D]' : ''}>{s.label}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#818B7D]">({s.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="space-y-2.5 pt-4 border-t border-stone-100">
              <h3 className="font-extrabold text-xs text-[#1E201D] uppercase tracking-wider">Availability</h3>
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F3FBEE] cursor-pointer text-xs font-semibold text-[#4F534C] transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded-sm accent-[#50563D] cursor-pointer"
                  />
                  <span className={inStockOnly ? 'font-bold text-[#1E201D]' : ''}>In Stock Only</span>
                </div>
                <span className="text-[11px] font-bold text-[#818B7D]">({inStockCount})</span>
              </label>
            </div>
          </aside>

          {/* PRODUCTS CATALOG SECTION */}
          <section className="lg:col-span-9 space-y-5">
            {/* Header Controls */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#4F534C]/15 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#1E201D] font-poppins">
                    {selectedCategory === 'All' ? 'All Plant-Based Essentials' : selectedCategory}
                  </h2>
                  <p className="text-xs text-[#61665D] mt-0.5">
                    Large packs for restaurants, smaller packs for home cooks.
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className="text-xs font-black text-[#50563D] bg-[#EAF0E5] px-3 py-1 rounded-full">
                    {sortedProducts.length} items
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#50563D] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filters</span>
                  </button>

                  <div className="hidden sm:flex items-center border border-stone-200 rounded-xl p-0.5 bg-[#FAFAF5]">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-all ${
                        viewMode === 'grid' ? 'bg-[#50563D] text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                      }`}
                      aria-label="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-all ${
                        viewMode === 'list' ? 'bg-[#50563D] text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                      }`}
                      aria-label="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Tags Filter Bar with Lucide Vector Icons & Stable Min-Width */}
              <div className="w-full overflow-hidden pt-2 border-t border-stone-100">
                <div
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-x',
                  }}
                  className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none scrollbar-hide no-scrollbar w-full min-w-0"
                >
                  {/* Sort Dropdown */}
                  <div className="relative shrink-0 min-w-max">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 pr-7 rounded-xl bg-[#FAFAF5] hover:bg-[#EAF0E5] border border-stone-200 text-xs font-bold text-[#4F534C] appearance-none outline-none cursor-pointer"
                    >
                      <option value="popular">Sort: Most Popular</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="discount">Discount %</option>
                      <option value="newest">Newest First</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Clean Filter Chips */}
                  {[
                    { id: 'all', label: 'All Items', icon: null },
                    { id: 'bestsellers', label: 'Bestsellers', icon: Flame, iconColor: 'text-amber-500' },
                    { id: 'readytofry', label: 'Ready to Fry', icon: Sparkles, iconColor: 'text-[#656B4F]' },
                    { id: 'rawmeat', label: 'Raw Curry Meat', icon: ChefHat, iconColor: 'text-blue-600' },
                    { id: 'under300', label: 'Under ₹300', icon: Leaf, iconColor: 'text-[#50563D]' },
                  ].map((chip) => {
                    const IconComponent = chip.icon;
                    const isChipActive = quickFilter === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setQuickFilter(chip.id as any)}
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap min-w-max transition-all cursor-pointer ${
                          isChipActive
                            ? 'bg-[#50563D] text-white shadow-2xs'
                            : 'bg-[#FAFAF5] hover:bg-[#EAF0E5] text-[#4F534C] border border-stone-200/80'
                        }`}
                      >
                        {IconComponent && (
                          <IconComponent
                            className={`w-3.5 h-3.5 shrink-0 ${isChipActive ? 'text-white' : chip.iconColor}`}
                          />
                        )}
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Filter Chips & Removal Tags */}
              {isAnyFilterActive && (
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-[#818B7D] uppercase tracking-wider mr-1">Active:</span>

                  {/* Category Chip */}
                  {selectedCategory !== 'All' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF0E5] text-[#50563D] text-xs font-bold border border-[#656B4F]/20">
                      <span>Category: {selectedCategory}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('All')}
                        className="hover:text-red-600 rounded-full p-0.5 cursor-pointer"
                        aria-label="Remove category filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Product Type Chips */}
                  {selectedProductTypes.map((typeKey) => {
                    const label = productTypeDefinitions.find((d) => d.key === typeKey)?.label || typeKey;
                    return (
                      <span
                        key={typeKey}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF0E5] text-[#50563D] text-xs font-bold border border-[#656B4F]/20"
                      >
                        <span>{label}</span>
                        <button
                          type="button"
                          onClick={() => toggleProductType(typeKey)}
                          className="hover:text-red-600 rounded-full p-0.5 cursor-pointer"
                          aria-label={`Remove ${label} filter`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                  {/* Pack Size Chips */}
                  {selectedPackSizes.map((packKey) => {
                    const sizeLabel = dynamicPackSizes.find((s) => s.key === packKey)?.label || packKey;
                    return (
                      <span
                        key={packKey}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF0E5] text-[#50563D] text-xs font-bold border border-[#656B4F]/20"
                      >
                        <span>Size: {sizeLabel}</span>
                        <button
                          type="button"
                          onClick={() => togglePackSize(packKey)}
                          className="hover:text-red-600 rounded-full p-0.5 cursor-pointer"
                          aria-label={`Remove ${sizeLabel} filter`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}

                  {/* Price Chip */}
                  {priceRange[1] < 2000 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF0E5] text-[#50563D] text-xs font-bold border border-[#656B4F]/20">
                      <span>Max Price: ₹{priceRange[1]}</span>
                      <button
                        type="button"
                        onClick={() => setPriceRange([0, 2000])}
                        className="hover:text-red-600 rounded-full p-0.5 cursor-pointer"
                        aria-label="Reset price filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* In Stock Only Chip */}
                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF0E5] text-[#50563D] text-xs font-bold border border-[#656B4F]/20">
                      <span>In Stock Only</span>
                      <button
                        type="button"
                        onClick={() => setInStockOnly(false)}
                        className="hover:text-red-600 rounded-full p-0.5 cursor-pointer"
                        aria-label="Remove in stock filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Search Term Chip */}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAF0E5] text-[#50563D] text-xs font-bold border border-[#656B4F]/20">
                      <span>Search: &ldquo;{searchTerm}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setDebouncedSearch('');
                        }}
                        className="hover:text-red-600 rounded-full p-0.5 cursor-pointer"
                        aria-label="Clear search query"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Clear All Button */}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline ml-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Product Cards Grid / List Display */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="rounded-2xl bg-white p-3 border border-stone-200/60 shadow-xs animate-pulse space-y-3">
                    <div className="aspect-[4/3] bg-stone-200 rounded-xl" />
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-3 bg-stone-200 rounded w-1/2" />
                    <div className="h-8 bg-stone-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="py-14 px-4 bg-white rounded-3xl border border-[#4F534C]/15 shadow-sm text-center space-y-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#EAF0E5] flex items-center justify-center mx-auto text-[#50563D]">
                  <Filter className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1E201D]">
                    {debouncedSearch ? `No exact matches for "${debouncedSearch}"` : 'No matching products found'}
                  </h3>
                  <p className="text-xs text-[#61665D] mt-1 max-w-sm mx-auto">
                    Try selecting a category below or reset filters to explore our complete plant-based catalog.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {unifiedCategories.slice(0, 4).map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setDebouncedSearch('');
                        setSelectedCategory(cat.name);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-[#FAFAF5] hover:bg-[#EAF0E5] border border-stone-200 text-xs font-bold text-[#50563D] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {getCategoryIcon(cat.name, 'w-3.5 h-3.5 text-[#50563D]')}
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-6 py-2.5 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    View All Products
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'list'
                    ? 'space-y-3.5'
                    : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'
                }
              >
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} allProducts={products} viewMode={viewMode} />
                ))}
              </div>
            )}

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="pt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-white border border-stone-200 text-[#1E201D] disabled:opacity-40 hover:bg-[#EAF0E5] transition-all cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      page === num
                        ? 'bg-[#50563D] text-white shadow-xs'
                        : 'bg-white text-[#4F534C] border border-stone-200 hover:bg-[#EAF0E5]'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl bg-white border border-stone-200 text-[#1E201D] disabled:opacity-40 hover:bg-[#EAF0E5] transition-all cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MOBILE / TABLET FILTER SLIDE-OVER DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <aside
            className="w-[min(90vw,360px)] h-full bg-white p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#50563D]" />
                <h3 className="font-black text-sm text-[#1E201D] uppercase tracking-wider">Filter Products</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {/* Category Filter */}
              <div>
                <h4 className="text-xs font-black text-[#1E201D] uppercase tracking-wider mb-2">Category</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <label className="flex items-center justify-between p-1.5 rounded-lg text-xs font-semibold text-[#4F534C] hover:bg-[#F3FBEE] cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="drawerCat"
                        checked={selectedCategory === 'All'}
                        onChange={() => setSelectedCategory('All')}
                        className="w-4 h-4 accent-[#50563D]"
                      />
                      <span className={selectedCategory === 'All' ? 'font-bold text-[#1E201D]' : ''}>All Products</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#818B7D]">({products.length})</span>
                  </label>
                  {unifiedCategories.map((cat) => (
                    <label key={cat.name} className="flex items-center justify-between p-1.5 rounded-lg text-xs font-semibold text-[#4F534C] hover:bg-[#F3FBEE] cursor-pointer">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <input
                          type="radio"
                          name="drawerCat"
                          checked={norm(selectedCategory) === norm(cat.name)}
                          onChange={() => setSelectedCategory(cat.name)}
                          className="w-4 h-4 accent-[#50563D] shrink-0"
                        />
                        <span className={`truncate ${norm(selectedCategory) === norm(cat.name) ? 'font-bold text-[#1E201D]' : ''}`}>{cat.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#818B7D] shrink-0">({cat.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Product Type Filter */}
              {dynamicProductTypes.length > 0 && (
                <div className="pt-3 border-t border-stone-100">
                  <h4 className="text-xs font-black text-[#1E201D] uppercase tracking-wider mb-2">Product Type</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {dynamicProductTypes.map((t) => (
                      <label key={t.key} className="flex items-center justify-between p-1.5 rounded-lg text-xs font-semibold text-[#4F534C] hover:bg-[#F3FBEE] cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedProductTypes.includes(t.key)}
                            onChange={() => toggleProductType(t.key)}
                            className="w-4 h-4 rounded-sm accent-[#50563D]"
                          />
                          <span className={selectedProductTypes.includes(t.key) ? 'font-bold text-[#1E201D]' : ''}>{t.label}</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#818B7D]">({t.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Pack Size Filter */}
              {dynamicPackSizes.length > 0 && (
                <div className="pt-3 border-t border-stone-100">
                  <h4 className="text-xs font-black text-[#1E201D] uppercase tracking-wider mb-2">Pack Size</h4>
                  <div className="space-y-1.5">
                    {dynamicPackSizes.map((s) => (
                      <label key={s.key} className="flex items-center justify-between p-1.5 rounded-lg text-xs font-semibold text-[#4F534C] hover:bg-[#F3FBEE] cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedPackSizes.includes(s.key)}
                            onChange={() => togglePackSize(s.key)}
                            className="w-4 h-4 rounded-sm accent-[#50563D]"
                          />
                          <span className={selectedPackSizes.includes(s.key) ? 'font-bold text-[#1E201D]' : ''}>{s.label}</span>
                        </div>
                        <span className="text-[11px] font-bold text-[#818B7D]">({s.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-[#1E201D] uppercase tracking-wider">Max Price</h4>
                  <span className="text-xs font-black text-[#50563D]">₹{priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={25}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-[#50563D]"
                />
              </div>

              {/* In Stock Only */}
              <div className="pt-3 border-t border-stone-100">
                <label className="flex items-center justify-between text-xs font-bold text-[#1E201D] cursor-pointer">
                  <span>In-Stock Items Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#50563D]"
                  />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-[#4F534C] hover:bg-stone-50 cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Show {sortedProducts.length} Items
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Sticky Floating Bottom Mini-Cart Bar (Multi-product add & instant checkout routing) */}
      {totalItems > 0 && (
        <div className="fixed bottom-[68px] sm:bottom-[72px] md:bottom-4 inset-x-0 z-40 px-3 sm:px-4 pointer-events-none">
          <div className="max-w-lg mx-auto bg-[#1E201D] text-white rounded-2xl p-2.5 sm:p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] border border-white/15 flex items-center justify-between gap-2.5 sm:gap-3 pointer-events-auto animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#656B4F] text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-xs sm:text-sm font-black text-[#B4CEB1] shrink-0">
                    ₹{totalPrice}
                  </span>
                </div>
                <p className="text-[9.5px] sm:text-[10px] text-white/70 truncate">
                  Ready in your Sakthi Frozen cart
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => router.push('/cart')}
                className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 group cursor-pointer whitespace-nowrap"
              >
                <span>View Cart</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
      <Navbar />
      <main className="site-shell py-5 sm:py-7 lg:py-9 pb-36 sm:pb-40 md:pb-24 flex-1 animate-pulse space-y-6">
        <div className="h-28 sm:h-36 rounded-3xl bg-stone-200/70 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="rounded-2xl bg-white p-3.5 border border-stone-200/60 shadow-xs space-y-3">
              <div className="aspect-[4/3] bg-stone-200 rounded-xl" />
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
              <div className="h-9 bg-stone-200 rounded-xl" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
