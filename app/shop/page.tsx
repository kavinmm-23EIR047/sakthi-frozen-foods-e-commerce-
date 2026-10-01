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
import { fetchApi } from '@/lib/apiConfig';
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
  Check
} from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import FoodLoadingScreen from '@/components/FoodLoadingScreen';
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
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(
      {
        ...product,
        id: activeOption.productId || product.id,
        weight: activeOption.weight,
        price: currentPrice,
        mrp: currentMrp,
      },
      quantity
    );
    showToast(`Added ${quantity}x ${product.name} (${activeOption.label}) to cart`, 'success');
  };

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
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
              {product.stock && product.stock <= 10 ? (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded ml-auto">
                  Only {product.stock} left
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#50563D] bg-[#EAF0E5] px-1.5 py-0.5 rounded flex items-center gap-1 ml-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#656B4F]" /> In Stock
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

            <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
              {packOptions.map((opt, idx) => (
                <button
                  key={opt.weight}
                  type="button"
                  onClick={() => setSelectedWeightIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                    selectedWeightIdx === idx
                      ? 'bg-[#50563D] text-white border-[#50563D] shadow-2xs'
                      : 'bg-[#F4F7F0] text-[#61665D] border-stone-200/80 hover:bg-[#EAF0E5]'
                  }`}
                >
                  <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold uppercase ${
                    selectedWeightIdx === idx ? 'bg-white/20 text-white' : opt.packType === 'retail' ? 'bg-amber-100 text-amber-900' : 'bg-[#D6DFC9] text-[#2D3823]'
                  }`}>
                    {opt.badge}
                  </span>
                  <span>{opt.weight}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center border border-stone-300 rounded-xl bg-[#FAFAF5] p-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 rounded-lg hover:bg-stone-200 text-[#1E201D]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 text-xs font-black text-[#1E201D]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 rounded-lg hover:bg-stone-200 text-[#1E201D]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="px-4 py-2 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#50563D] bg-[#EAF0E5] px-1.5 py-0.5 rounded border border-[#656B4F]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#656B4F]" /> Veg
            </span>
            <span className="text-[10px] font-bold text-[#50563D] bg-[#EAF0E5] px-1.5 py-0.5 rounded truncate max-w-[130px]">
              {product.category || 'Plant Meat'}
            </span>
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

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none scrollbar-hide no-scrollbar py-0.5" onClick={(e) => e.stopPropagation()}>
          {packOptions.map((opt, idx) => (
            <button
              key={opt.weight}
              type="button"
              onClick={() => setSelectedWeightIdx(idx)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 border ${
                selectedWeightIdx === idx
                  ? 'bg-[#50563D] text-white border-[#50563D] shadow-2xs'
                  : 'bg-[#F4F7F0] text-[#61665D] hover:bg-[#EAF0E5] border border-stone-200/60'
              }`}
            >
              <span className={`text-[8px] px-1 py-0.2 rounded font-black uppercase ${
                selectedWeightIdx === idx ? 'bg-white/20 text-white' : opt.packType === 'retail' ? 'bg-amber-100 text-amber-900' : 'bg-[#D6DFC9] text-[#2D3823]'
              }`}>
                {opt.badge}
              </span>
              <span>{opt.weight}</span>
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center border border-stone-300 rounded-xl bg-[#FAFAF5] p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-lg hover:bg-stone-200 text-[#1E201D]"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 text-xs font-black text-[#1E201D]">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-lg hover:bg-stone-200 text-[#1E201D]"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-2 px-2.5 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

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
  const [inStockOnly, setInStockOnly] = useState(true);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest' | 'discount'>('popular');
  const [quickFilter, setQuickFilter] = useState<'all' | 'bestsellers' | 'new' | 'chef' | 'protein' | 'lowfat'>('all');

  // UI View Layout
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 16;

  // 1. Fetch Categories dynamically from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchApi('/categories');
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories from backend:', err);
      }
    };
    loadCategories();
  }, []);

  // 2. Fetch All Products from backend API
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await fetchApi('/products?limit=100');
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
    setSelectedCategory(initialCategory);
  }, [initialSearch, initialCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  // Dynamic Product Types with counts
  const dynamicProductTypes = useMemo(() => {
    const typesMap: Record<string, number> = {};
    const standardKeywords = ['Mutton', 'Chicken', 'Fish', 'Prawn', 'Starters', 'Nuggets', 'Chaap', 'Liver', 'Kolambu', 'Kebab', 'Burger', 'Biryani'];

    products.forEach((p) => {
      const name = p.name || '';
      const cat = p.category || '';
      standardKeywords.forEach((kw) => {
        if (name.toLowerCase().includes(kw.toLowerCase()) || cat.toLowerCase().includes(kw.toLowerCase())) {
          typesMap[kw] = (typesMap[kw] || 0) + 1;
        }
      });
    });

    return Object.entries(typesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || 'Other';
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [products]);

  // Dynamic Pack Sizes with counts
  const dynamicPackSizes = useMemo(() => {
    const sizes = [
      { key: '200g', label: '200g - 250g', match: (w: string) => w.includes('200') || w.includes('250') },
      { key: '500g', label: '300g - 500g', match: (w: string) => w.includes('300') || w.includes('400') || w.includes('500') },
      { key: '1kg', label: '1kg Bulk Pack', match: (w: string) => w.toLowerCase().includes('1kg') || w.toLowerCase().includes('1 kg') },
      { key: '2kg', label: '2kg+ Family Pack', match: (w: string) => w.toLowerCase().includes('2kg') || w.toLowerCase().includes('2 kg') },
    ];

    return sizes.map((s) => ({
      ...s,
      count: products.filter((p) => s.match(p.weight || '1kg')).length,
    }));
  }, [products]);

  // Filter Logic strictly applied over backend products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const words = q.split(/\s+/).filter(Boolean);
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const code = (p.code || '').toLowerCase();

        const match = words.some((w) => name.includes(w) || cat.includes(w) || desc.includes(w) || code.includes(w));
        if (!match) return false;
      }

      if (selectedCategory && selectedCategory !== 'All') {
        const catMatch =
          (p.category || '').toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes((p.category || '').toLowerCase());
        if (!catMatch) return false;
      }

      if (selectedProductTypes.length > 0) {
        const pName = (p.name || '').toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        const matchesAnyType = selectedProductTypes.some(
          (t) => pName.includes(t.toLowerCase()) || pCat.includes(t.toLowerCase())
        );
        if (!matchesAnyType) return false;
      }

      if (selectedPackSizes.length > 0) {
        const weight = (p.weight || '1kg').toLowerCase();
        const matchesPack = selectedPackSizes.some((s) => {
          if (s === '200g') return weight.includes('200') || weight.includes('250');
          if (s === '500g') return weight.includes('300') || weight.includes('400') || weight.includes('500');
          if (s === '1kg') return weight.includes('1kg') || weight.includes('1 kg');
          if (s === '2kg') return weight.includes('2kg') || weight.includes('2 kg');
          return false;
        });
        if (!matchesPack) return false;
      }

      if (p.price < priceRange[0] || p.price > priceRange[1]) {
        return false;
      }

      if (inStockOnly && p.stock !== undefined && p.stock <= 0) {
        return false;
      }

      if (quickFilter === 'bestsellers' && !p.isPopular) return false;

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

  const handleResetFilters = () => {
    setSearchTerm('');
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

  if (loading) {
    return (
      <FoodLoadingScreen
        message="Loading Sakthi Frozen Foods Catalog"
        subMessage="Preparing 100% pure vegetarian & plant-based essentials"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
      <Navbar />

      <main className="site-shell py-5 sm:py-7 lg:py-9 flex-1">
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

            {/* Dynamic Backend Categories with Lucide Vector Icons */}
            {categories.map((cat) => {
              const count = categoryCounts[cat.name] || 0;
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
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
                      {count > 0 ? `${count} items` : 'In stock'}
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
                className="text-xs font-bold text-[#656B4F] hover:text-[#50563D] hover:underline"
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

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F3FBEE] cursor-pointer text-xs font-semibold text-[#4F534C]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="categoryRadio"
                      checked={selectedCategory === 'All'}
                      onChange={() => setSelectedCategory('All')}
                      className="w-4 h-4 accent-[#50563D]"
                    />
                    <span>All Products</span>
                  </div>
                  <span className="text-[11px] text-[#818B7D]">({products.length})</span>
                </label>

                {categories.map((cat) => {
                  const count = categoryCounts[cat.name] || 0;
                  const isChecked = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <label
                      key={cat.id || cat.name}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F3FBEE] cursor-pointer text-xs font-semibold text-[#4F534C]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="radio"
                          name="categoryRadio"
                          checked={isChecked}
                          onChange={() => setSelectedCategory(cat.name)}
                          className="w-4 h-4 accent-[#50563D]"
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[11px] text-[#818B7D]">({count})</span>
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

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {dynamicProductTypes.map(({ name, count }) => {
                    const isChecked = selectedProductTypes.includes(name);
                    return (
                      <label
                        key={name}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F3FBEE] cursor-pointer text-xs font-semibold text-[#4F534C]"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProductType(name)}
                            className="w-4 h-4 rounded-sm accent-[#50563D]"
                          />
                          <span>{name}</span>
                        </div>
                        <span className="text-[11px] text-[#818B7D]">({count})</span>
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
                <span className="text-xs font-extrabold text-[#50563D]">
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-[#50563D]"
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
            <div className="space-y-2.5 pt-4 border-t border-stone-100">
              <h3 className="font-extrabold text-xs text-[#1E201D] uppercase tracking-wider">Pack Size</h3>
              <div className="space-y-1.5">
                {dynamicPackSizes.map((s) => (
                  <label
                    key={s.key}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F3FBEE] cursor-pointer text-xs font-semibold text-[#4F534C]"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedPackSizes.includes(s.key)}
                        onChange={() => togglePackSize(s.key)}
                        className="w-4 h-4 rounded-sm accent-[#50563D]"
                      />
                      <span>{s.label}</span>
                    </div>
                    <span className="text-[11px] text-[#818B7D]">({s.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2.5 pt-4 border-t border-stone-100">
              <h3 className="font-extrabold text-xs text-[#1E201D] uppercase tracking-wider">Availability</h3>
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#F3FBEE] cursor-pointer text-xs font-semibold text-[#4F534C]">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded-sm accent-[#50563D]"
                  />
                  <span>In Stock Only</span>
                </div>
                <span className="text-[11px] text-[#818B7D]">({products.length})</span>
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
                    className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#50563D] text-white text-xs font-bold shadow-xs"
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

                  {/* Clean SVG Filter Chips */}
                  {[
                    { id: 'all', label: 'All Items', icon: null },
                    { id: 'bestsellers', label: 'Bestsellers', icon: Flame, iconColor: 'text-amber-500' },
                    { id: 'new', label: 'New Arrivals', icon: Sparkles, iconColor: 'text-[#656B4F]' },
                    { id: 'chef', label: 'Chef\'s Choice', icon: ChefHat, iconColor: 'text-blue-600' },
                    { id: 'protein', label: 'High Protein', icon: ShieldCheck, iconColor: 'text-[#656B4F]' },
                    { id: 'lowfat', label: 'Low Fat', icon: Leaf, iconColor: 'text-[#50563D]' },
                  ].map((chip) => {
                    const IconComponent = chip.icon;
                    const isChipActive = quickFilter === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setQuickFilter(chip.id as any)}
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap min-w-max transition-all ${
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
                  {categories.slice(0, 4).map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory(cat.name);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-[#FAFAF5] hover:bg-[#EAF0E5] border border-stone-200 text-xs font-bold text-[#50563D] transition-colors inline-flex items-center gap-1.5"
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
                    className="px-6 py-2.5 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
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
                  className="p-2 rounded-xl bg-white border border-stone-200 text-[#1E201D] disabled:opacity-40 hover:bg-[#EAF0E5] transition-all"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
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
                  className="p-2 rounded-xl bg-white border border-stone-200 text-[#1E201D] disabled:opacity-40 hover:bg-[#EAF0E5] transition-all"
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
        <div className="fixed inset-0 z-[80] bg-black/40 flex justify-end animate-in fade-in duration-200">
          <aside
            className="w-[min(90vw,360px)] h-full bg-white p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#50563D]" />
                <h3 className="font-black text-sm text-[#1E201D] uppercase tracking-wider">Refine Products</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              <div>
                <h4 className="text-xs font-black text-[#1E201D] uppercase tracking-wider mb-2">Categories</h4>
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between p-1.5 rounded-lg text-xs font-semibold text-[#4F534C]">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="drawerCat"
                        checked={selectedCategory === 'All'}
                        onChange={() => setSelectedCategory('All')}
                        className="accent-[#50563D]"
                      />
                      <span>All Products</span>
                    </div>
                    <span className="text-[11px] text-[#818B7D]">({products.length})</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.name} className="flex items-center justify-between p-1.5 rounded-lg text-xs font-semibold text-[#4F534C]">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="drawerCat"
                          checked={selectedCategory === cat.name}
                          onChange={() => setSelectedCategory(cat.name)}
                          className="accent-[#50563D]"
                        />
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-[11px] text-[#818B7D]">({categoryCounts[cat.name] || 0})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <h4 className="text-xs font-black text-[#1E201D] uppercase tracking-wider mb-2">Max Price: ₹{priceRange[1]}</h4>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={50}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-[#50563D]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100">
                <label className="flex items-center justify-between text-xs font-bold text-[#1E201D]">
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
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-[#4F534C]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-bold shadow-xs transition-all"
              >
                Show {sortedProducts.length} Items
              </button>
            </div>
          </aside>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <FoodLoadingScreen
          message="Loading Sakthi Frozen Foods Catalog"
          subMessage="Preparing 100% pure vegetarian & plant-based essentials"
        />
      }
    >
      <ShopContent />
    </Suspense>
  );
}
