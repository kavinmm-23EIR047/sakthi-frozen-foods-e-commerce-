'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  X,
  Flame,
  ArrowRight,
  ScanLine,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  ChefHat,
  Leaf,
  Clock,
  Beef,
  Drumstick,
  Fish,
  Cookie,
  Package,
  Layers,
  Sprout,
  UtensilsCrossed
} from 'lucide-react';
import { fetchApi, setCachedData } from '@/lib/apiConfig';
import { ProductType, CategoryType } from '@/lib/types';
import OptimizedImage from '@/components/OptimizedImage';

function getCategoryIcon(name: string, className = 'w-4 h-4') {
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
  return <Leaf className={className} />;
}

export default function SearchOverlay() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'categories' | 'recipes'>('all');
  
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [dropdownTop, setDropdownTop] = useState<number>(84);

  // Measure navbar/input bottom dynamically to position megamenu dropdown perfectly
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownTop(Math.max(64, Math.round(rect.bottom + 8)));
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, { passive: true });
      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition);
      };
    }
  }, [isOpen]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, []);

  // Fetch live products and categories from backend API immediately on mount
  useEffect(() => {
    let isMounted = true;
    const loadBackendData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetchApi('/products?limit=100'),
          fetchApi('/categories'),
        ]);

        if (isMounted) {
          if (prodRes.success && Array.isArray(prodRes.data)) {
            setAllProducts(prodRes.data);
          }
          if (catRes.success && Array.isArray(catRes.data)) {
            setCategories(catRes.data);
          }
        }
      } catch (err) {
        console.error('Error fetching search data from backend:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 120);
    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener for desktop dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideInput = containerRef.current?.contains(target);
      const clickedInsideDropdown = dropdownRef.current?.contains(target);
      if (!clickedInsideInput && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent, term?: string) => {
    if (e) e.preventDefault();
    const finalQuery = term !== undefined ? term : query;
    if (finalQuery.trim()) {
      saveRecentSearch(finalQuery.trim());
      setIsOpen(false);
      router.push(`/shop?search=${encodeURIComponent(finalQuery.trim())}`);
      setQuery('');
    }
  };

  const handleProductSelect = (productId: string, productName: string, productObj?: ProductType) => {
    saveRecentSearch(productName);
    const targetProd = productObj || allProducts.find((p) => p.id === productId || (p as any)._id === productId);
    if (targetProd) {
      setCachedData(`product_detail_${productId}`, targetProd);
    }
    router.prefetch(`/product/${productId}`);
    setIsOpen(false);
    router.push(`/product/${productId}`);
    setQuery('');
  };

  const handleProductPrefetch = (productId: string, productObj?: ProductType) => {
    const targetProd = productObj || allProducts.find((p) => p.id === productId || (p as any)._id === productId);
    if (targetProd) {
      setCachedData(`product_detail_${productId}`, targetProd);
    }
    router.prefetch(`/product/${productId}`);
  };

  const handleCategorySelect = (categoryName: string) => {
    saveRecentSearch(categoryName);
    setIsOpen(false);
    router.push(`/shop?category=${encodeURIComponent(categoryName)}`);
    setQuery('');
  };

  // Robust product filtering strictly against backend data with smart fallback
  const filteredProducts = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) {
      return allProducts.slice(0, 10);
    }

    const words = q.split(/\s+/).filter(Boolean);
    const matched = allProducts.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const code = (p.code || '').toLowerCase();

      return words.some((word) =>
        name.includes(word) || cat.includes(word) || desc.includes(word) || code.includes(word)
      );
    });

    if (matched.length > 0) {
      return matched.sort((a, b) => {
        const aFull = (a.name || '').toLowerCase().includes(q) ? 2 : (a.category || '').toLowerCase().includes(q) ? 1 : 0;
        const bFull = (b.name || '').toLowerCase().includes(q) ? 2 : (b.category || '').toLowerCase().includes(q) ? 1 : 0;
        return bFull - aFull;
      });
    }

    // Stable fallback
    return allProducts.slice(0, 8);
  }, [allProducts, debouncedQuery]);

  // Dynamic search queries strictly from real backend product & category names
  const searchSuggestions = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    
    const terms: string[] = [];
    allProducts.forEach((p) => {
      if (p.name && !terms.includes(p.name)) {
        terms.push(p.name);
      }
    });
    categories.forEach((c) => {
      if (c.name && !terms.includes(c.name)) {
        terms.push(c.name);
      }
    });

    const fallbackList = [
      'Veg Mutton Chukka',
      'Plant-Based Chicken',
      'Mock Fish Fingers',
      'Vegan Prawns',
      'Soya Seekh Kebab',
      'Corn Cheese Balls',
      'Plant-Based Biryani Meat',
      'Coimbatore Express Delivery',
    ];

    const sourceList = terms.length > 0 ? terms : fallbackList;

    if (!q) return sourceList.slice(0, 6);

    const matched = sourceList.filter((term) => term.toLowerCase().includes(q));
    if (matched.length > 0) {
      return matched.slice(0, 6);
    }

    return [q, ...sourceList.slice(0, 5)];
  }, [allProducts, categories, debouncedQuery]);

  // Live category items with product counts dynamically computed from backend products
  const categoriesWithCounts = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    const list = categories.length > 0 ? categories : [];
    
    const mapped = list.map((cat) => {
      const count = allProducts.filter((p) =>
        (p.category || '').toLowerCase().includes(cat.name.toLowerCase()) ||
        cat.name.toLowerCase().includes((p.category || '').toLowerCase())
      ).length;
      return {
        ...cat,
        productCount: count > 0 ? `${count}+ products` : 'In stock',
      };
    });

    if (!q) return mapped;
    const filtered = mapped.filter((c) => c.name.toLowerCase().includes(q));
    return filtered.length > 0 ? filtered : mapped;
  }, [categories, allProducts, debouncedQuery]);

  // Dynamic Recipe ideas linked to backend products
  const recipesList = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    const baseRecipes = [
      {
        title: 'Mock Mutton Pepper Chukka',
        time: '20 mins',
        tag: 'Mock Mutton · Pan-fry with pepper, onion and curry leaves',
        icon: Beef,
        keyword: 'mutton',
        image: '/assets/0e18a4d9-5d57-4c36-8768-8e7d790a4b5d.jpg',
      },
      {
        title: 'Corn Cheese Ball Bites',
        time: '10 mins',
        tag: 'Corn Cheese Balls · Cook until golden and serve with dip',
        icon: Cookie,
        keyword: 'cheese',
        image: '/assets/813a46d7-0030-47c9-af6a-3db11c6edbc7.jpg',
      },
      {
        title: 'Veg Chicken Cutlet Chaat',
        time: '15 mins',
        tag: 'Veg Chicken Cutlet · Top crisp cutlets with chutney and chaat masala',
        icon: Drumstick,
        keyword: 'chicken',
        image: '/assets/928db126-f62c-4d88-a874-f3d8c08d68bd.jpg',
      },
      {
        title: 'Crispy French Fries & Dip',
        time: '15 mins',
        tag: 'French Fries · Air-fry or deep-fry until crisp',
        icon: Fish,
        keyword: 'fries',
        image: '/assets/a677a7a9-c56a-4885-a823-51be3e0177b3.jpg',
      },
      {
        title: 'Sweet Corn Masala Bowl',
        time: '12 mins',
        tag: 'Sweet Corn · Toss with butter, chilli and lime',
        icon: UtensilsCrossed,
        keyword: 'corn',
        image: '/assets/c0410062-941f-4ab6-bcc8-b9b2ffd98cc1.jpg',
      },
      {
        title: 'Mock Mutton Dum Biryani',
        time: '35 mins',
        tag: 'Mock Mutton · Brown with masala, layer with rice and steam',
        icon: Layers,
        keyword: 'mutton',
        image: '/assets/plant-mutton-dum-biryani.png',
      },
    ];

    return baseRecipes
      .map((rec) => {
        const matchingProduct =
          allProducts.find((p) => (p.name || '').toLowerCase().includes(rec.keyword)) ||
          null;
        return {
          ...rec,
          product: matchingProduct,
        };
      })
      .filter((rec) => (!q || rec.title.toLowerCase().includes(q) || rec.keyword.includes(q)) && rec.product);
  }, [allProducts, debouncedQuery]);

  // Featured promo product from backend
  const featuredPromoProduct = useMemo(() => {
    return (
      allProducts.find((p) => (p.name || '').toLowerCase().includes('mutton')) ||
      allProducts.find((p) => p.isPopular) ||
      allProducts[0] ||
      null
    );
  }, [allProducts]);

  return (
    <div ref={containerRef} className="w-full relative">
      {/* 1. INLINE SEARCH BAR (DESKTOP & TABLET & MOBILE COLLAPSED) */}
      <div className="w-full flex flex-col gap-2">
        <div className="relative flex items-center w-full">
          <form
            onSubmit={(e) => handleSearchSubmit(e)}
            className="w-full flex items-center bg-[#F4F7F0] hover:bg-white border border-[#4F534C]/25 hover:border-[#50563D] focus-within:border-[#50563D] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#50563D]/20 rounded-full transition-all duration-200 shadow-2xs overflow-hidden pl-3.5 pr-1.5 py-1 min-h-[42px] sm:min-h-[46px]"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#656B4F] shrink-0 mr-2 pointer-events-none" />
            
            {/* CLEAN INPUT - NO INNER RECTANGULAR BOX */}
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              suppressHydrationWarning
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder="Search veg mutton, chicken, fish, starters..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#1E201D] placeholder-[#767E72] font-medium border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none ring-0 appearance-none"
              style={{
                outline: 'none',
                border: 'none',
                boxShadow: 'none',
                WebkitAppearance: 'none',
              }}
            />

            {query && (
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors mr-1 shrink-0"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="sm:hidden pr-1.5 text-[#656B4F] shrink-0 pointer-events-none">
              <ScanLine className="w-4 h-4 opacity-70" />
            </div>

            <button
              type="submit"
              suppressHydrationWarning
              className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 sm:py-2 rounded-full bg-[#50563D] hover:bg-[#3E442F] text-white text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95 ml-1"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Backdrop for Desktop/Tablet Search Dropdown */}
      {isOpen && (
        <div
          className="hidden sm:block fixed inset-0 bg-black/25 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 2. DESKTOP & TABLET SEARCH DROPDOWN OVERLAY (MEGAMENU) */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{ top: `${dropdownTop}px` }}
          className="hidden sm:block fixed left-1/2 -translate-x-1/2 w-[min(94vw,980px)] lg:w-[min(92vw,1080px)] xl:w-[1120px] max-h-[calc(100vh-100px)] bg-white rounded-3xl shadow-2xl border border-[#4F534C]/15 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200"
        >
          {/* Filter Tabs on Dropdown Header */}
          <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-[#4F534C]/10 bg-[#FAFAF5]">
            {(['all', 'products', 'categories', 'recipes'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-[#50563D] text-white shadow-xs'
                    : 'bg-white text-[#61665D] hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: ALL (4-Column Mega Layout) */}
          {activeTab === 'all' && (
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-5 lg:gap-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              
              {/* COLUMN 1: Search Queries */}
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#1E201D] uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Search Queries</span>
                </div>

                <div className="space-y-1">
                  {searchSuggestions.slice(0, 6).map((term, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSearchSubmit(undefined, term)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#4F534C] hover:bg-[#F3FBEE] hover:text-[#50563D] transition-all group"
                    >
                      <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#50563D] transition-colors shrink-0" />
                      <span className="truncate capitalize">{term}</span>
                    </button>
                  ))}
                </div>

                {recentSearches.length > 0 && (
                  <div className="pt-3 border-t border-[#4F534C]/10">
                    <div className="text-[10px] font-bold text-[#818B7D] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.slice(0, 3).map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSearchSubmit(undefined, item)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#EAF0E5] text-[11px] font-semibold text-[#50563D] transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* COLUMN 2: Product Suggestions */}
              <div className="lg:col-span-4 space-y-3 border-t md:border-t-0 md:border-l border-[#4F534C]/10 md:pl-5 lg:pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1E201D] uppercase tracking-wider">
                    Products
                  </span>
                  <span className="text-[10px] font-bold text-[#656B4F]">
                    {filteredProducts.length} items
                  </span>
                </div>

                <div className="space-y-2">
                  {loading && allProducts.length === 0 ? (
                    <div className="space-y-2 py-2">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 animate-pulse">
                          <div className="w-12 h-12 rounded-lg bg-stone-200 shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 bg-stone-200 rounded w-3/4" />
                            <div className="h-2.5 bg-stone-200 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    filteredProducts.slice(0, 4).map((product) => {
                      const mrp = product.mrp ?? product.price;
                      const discount = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product.id, product.name, product)}
                          onMouseEnter={() => handleProductPrefetch(product.id, product)}
                          onTouchStart={() => handleProductPrefetch(product.id, product)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F3FBEE] border border-transparent hover:border-[#656B4F]/20 cursor-pointer transition-all group"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#EAF0E5] shrink-0 border border-stone-200/60">
                            <OptimizedImage
                              src={product.image}
                              alt={product.name}
                              width={120}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-[#1E201D] group-hover:text-[#656B4F] truncate">
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-[#61665D] truncate mt-0.5">
                              100% plant-based · {product.weight || '1kg'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-black text-xs text-[#1E201D]">₹{product.price}</span>
                              {(product.isAvailable === false || (product.isAvailable === undefined && product.stock <= 0)) ? (
                                <span className="text-[9px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-1 py-0.5 rounded">
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                                </span>
                              )}
                              {discount > 0 && (
                                <span className="text-[9px] font-bold text-[#50563D] bg-[#EAF0E5] px-1 py-0.2 rounded">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* COLUMN 3: Categories with Vector Icons */}
              <div className="lg:col-span-3 space-y-3 border-t md:border-t-0 md:border-l border-[#4F534C]/10 md:pl-5 lg:pl-6">
                <span className="text-xs font-black text-[#1E201D] uppercase tracking-wider block">
                  Categories
                </span>

                <div className="space-y-1.5">
                  {loading && categoriesWithCounts.length === 0 ? (
                    <div className="space-y-2 py-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 animate-pulse">
                          <div className="w-7 h-7 rounded-lg bg-stone-200 shrink-0" />
                          <div className="h-3.5 bg-stone-200 rounded w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    categoriesWithCounts.slice(0, 5).map((cat: any, i) => (
                      <button
                        key={cat.id || i}
                        type="button"
                        onClick={() => handleCategorySelect(cat.name)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F3FBEE] transition-all group text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-[#EAF0E5] text-[#50563D] flex items-center justify-center shrink-0 shadow-2xs">
                            {getCategoryIcon(cat.name, 'w-3.5 h-3.5')}
                          </span>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-[#1E201D] group-hover:text-[#50563D] block truncate">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-[#61665D] block">
                              {cat.productCount}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#50563D] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 4: Featured Promo Banner */}
              {featuredPromoProduct ? (
                <div className="lg:col-span-2 hidden lg:flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#EAF0E5] via-[#DEE8D8] to-[#CDDBC6] p-4 border border-[#656B4F]/20 relative overflow-hidden group shadow-2xs">
                  <div className="relative z-10 space-y-1.5">
                    <span className="inline-block bg-[#50563D] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-2xs">
                      POPULAR
                    </span>
                    <h3 className="font-black text-sm text-[#1E201D] leading-tight font-poppins">
                      {featuredPromoProduct.name}
                    </h3>
                    <p className="text-[10px] text-[#4F534C] leading-snug">
                      Juicy texture. 100% Plant Based.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        handleProductSelect(featuredPromoProduct.id, featuredPromoProduct.name);
                      }}
                      className="mt-2 inline-flex items-center gap-1 bg-[#50563D] hover:bg-[#3E442F] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      <span>Shop Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="relative w-full aspect-square mt-2 rounded-xl overflow-hidden shadow-sm border border-white/50 bg-white/40">
                    <OptimizedImage
                      src={featuredPromoProduct.image}
                      alt={featuredPromoProduct.name}
                      width={240}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              ) : loading ? (
                <div className="lg:col-span-2 hidden lg:flex flex-col justify-between rounded-2xl bg-stone-100 p-4 border border-stone-200 animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-16" />
                    <div className="h-5 bg-stone-200 rounded w-28" />
                    <div className="h-3 bg-stone-200 rounded w-full" />
                  </div>
                  <div className="aspect-square bg-stone-200 rounded-xl mt-3" />
                </div>
              ) : null}

            </div>
          )}

          {/* TAB 2: PRODUCTS EXPANDED VIEW */}
          {activeTab === 'products' && (
            <div className="p-5 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const mrp = product.mrp ?? product.price;
                  const discount = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product.id, product.name, product)}
                      onMouseEnter={() => handleProductPrefetch(product.id, product)}
                      onTouchStart={() => handleProductPrefetch(product.id, product)}
                      className="p-3 rounded-2xl bg-[#FAFAF5] hover:bg-[#F3FBEE] border border-[#4F534C]/10 hover:border-[#656B4F]/30 cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#EAF0E5] mb-2 border border-stone-200/50">
                          <OptimizedImage
                            src={product.image}
                            alt={product.name}
                            width={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {discount > 0 && (
                            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                              {discount}% OFF
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-[#1E201D] group-hover:text-[#50563D] line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-[#61665D] mt-0.5">
                          {product.category} · {product.weight || '1kg'}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                        <span className="font-black text-xs text-[#1E201D]">₹{product.price}</span>
                        <span className="text-[10px] font-bold text-[#50563D] group-hover:underline flex items-center gap-0.5">
                          View <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES EXPANDED VIEW */}
          {activeTab === 'categories' && (
            <div className="p-5 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categoriesWithCounts.map((cat: any, i) => (
                  <button
                    key={cat.id || i}
                    type="button"
                    onClick={() => handleCategorySelect(cat.name)}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-[#FAFAF5] hover:bg-[#F3FBEE] border border-[#4F534C]/10 hover:border-[#656B4F]/30 text-left transition-all group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#EAF0E5] text-[#50563D] flex items-center justify-center shrink-0">
                      {getCategoryIcon(cat.name, 'w-5 h-5')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-[#1E201D] group-hover:text-[#50563D] truncate">
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-[#61665D] mt-0.5">
                        {cat.productCount}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#50563D] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RECIPES & INSPIRATION */}
          {activeTab === 'recipes' && (
            <div className="p-5 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipesList.map((rec, i) => {
                  const IconComp = rec.icon;
                  return (
                      <article
                      key={i}
                      className="p-4 rounded-2xl bg-[#FAFAF5] border border-[#4F534C]/10 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <img src={rec.image} alt={rec.title} className="mb-3 h-28 w-full rounded-xl object-cover" />
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-xl bg-[#EAF0E5] text-[#50563D] flex items-center justify-center">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-extrabold text-[#656B4F] bg-[#EAF0E5] px-2 py-0.5 rounded-full">
                            {rec.time}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#1E201D] group-hover:text-[#50563D] leading-snug">
                          {rec.title}
                        </h4>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-[#818B7D]">
                          {rec.tag}
                        </span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-[11px] font-bold text-[#50563D]">
                        Recipe idea uses our {rec.keyword === 'mutton' ? 'Mock Mutton' : rec.keyword === 'chicken' ? 'Veg Chicken Cutlet' : rec.keyword === 'cheese' ? 'Corn Cheese Balls' : rec.keyword === 'fries' ? 'French Fries' : 'Sweet Corn'} product.
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer of megamenu */}
          <div className="px-6 py-3 bg-[#F4F8F1] border-t border-[#4F534C]/10 flex items-center justify-between text-xs text-[#61665D]">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[10px] font-bold">ESC</kbd> to close</span>
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="text-[#50563D] font-extrabold hover:underline flex items-center gap-1"
            >
              <span>View all matching results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. MOBILE FULLSCREEN SEARCH MODAL */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-[70] bg-white flex flex-col animate-in fade-in duration-200">
          {/* Top Search Input Bar */}
          <div className="px-3.5 py-3 border-b border-[#4F534C]/15 flex items-center gap-2 bg-white safe-area-pt">
            <div className="flex-1 relative flex items-center bg-[#F4F7F0] rounded-full pl-3 pr-2 py-1">
              <Search className="w-4 h-4 text-[#656B4F] shrink-0 mr-2 pointer-events-none" />
              
              <input
                ref={mobileInputRef}
                autoFocus
                type="text"
                autoComplete="off"
                suppressHydrationWarning
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search veg mutton, chicken, fish..."
                className="w-full bg-transparent text-xs text-[#1E201D] placeholder-[#767E72] font-medium border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none shadow-none ring-0 appearance-none"
                style={{
                  outline: 'none',
                  border: 'none',
                  boxShadow: 'none',
                  WebkitAppearance: 'none',
                }}
              />

              {query && (
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setQuery('')}
                  className="p-1 text-stone-400 hover:text-stone-700 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1.5 text-xs font-bold text-[#656B4F] hover:text-[#1E201D]"
            >
              Cancel
            </button>
          </div>

          {/* Filter Tabs on Mobile */}
          <div className="w-full overflow-hidden border-b border-[#4F534C]/10 bg-[#FAFAF5]">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 overflow-x-auto scrollbar-none scrollbar-hide no-scrollbar w-full min-w-0">
              {(['all', 'products', 'categories', 'recipes'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold capitalize whitespace-nowrap min-w-max transition-all ${
                    activeTab === tab
                      ? 'bg-[#50563D] text-white shadow-2xs'
                      : 'bg-white text-[#61665D] border border-stone-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Content Results */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* Search Queries List */}
            {activeTab !== 'products' && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#818B7D] uppercase tracking-wider px-1">
                  Search Queries
                </div>
                {searchSuggestions.slice(0, 6).map((term, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSearchSubmit(undefined, term)}
                    className="w-full flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-left text-xs font-semibold text-[#1E201D] hover:bg-[#F3FBEE] active:bg-[#EAF0E5]"
                  >
                    <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate capitalize">{term}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Product Cards Result */}
            {activeTab !== 'categories' && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-[#818B7D] uppercase tracking-wider">
                    Products
                  </span>
                  <span className="text-[10px] text-[#656B4F] font-bold">
                    {filteredProducts.length} items
                  </span>
                </div>

                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const mrp = product.mrp ?? product.price;
                    const discount = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product.id, product.name, product)}
                        onMouseEnter={() => handleProductPrefetch(product.id, product)}
                        onTouchStart={() => handleProductPrefetch(product.id, product)}
                        className="flex items-center justify-between p-2.5 bg-[#FAFAF5] hover:bg-[#F3FBEE] border border-[#4F534C]/10 rounded-2xl active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#EAF0E5] shrink-0 border border-stone-200/60">
                            <OptimizedImage
                              src={product.image}
                              alt={product.name}
                              width={120}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-[#1E201D] truncate">
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-[#61665D] truncate mt-0.5">
                              100% plant-based · {product.weight || '1kg'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="font-black text-xs text-[#1E201D] block">
                            ₹{product.price}
                          </span>
                          {discount > 0 && (
                            <span className="text-[9px] font-extrabold text-[#50563D] bg-[#EAF0E5] px-1 py-0.2 rounded inline-block mt-0.5">
                              {discount}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categories on Mobile */}
            {activeTab === 'categories' && (
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-bold text-[#818B7D] uppercase tracking-wider px-1">
                  Categories
                </div>
                <div className="space-y-2">
                  {categoriesWithCounts.map((cat: any, i) => (
                    <button
                      key={cat.id || i}
                      type="button"
                      onClick={() => handleCategorySelect(cat.name)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#FAFAF5] border border-[#4F534C]/10 text-left active:bg-[#EAF0E5]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#EAF0E5] text-[#50563D] flex items-center justify-center">
                          {getCategoryIcon(cat.name, 'w-4 h-4')}
                        </span>
                        <div>
                          <span className="font-bold text-xs text-[#1E201D] block">{cat.name}</span>
                          <span className="text-[10px] text-[#61665D]">{cat.productCount}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recipes on Mobile */}
            {activeTab === 'recipes' && (
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-bold text-[#818B7D] uppercase tracking-wider px-1">
                  Cooking Recipes & Ideas
                </div>
                <div className="space-y-2">
                  {recipesList.map((rec, i) => {
                    const IconComp = rec.icon;
                    return (
                      <article key={i} className="p-3 bg-[#FAFAF5] border border-[#4F534C]/10 rounded-2xl">
                        <img src={rec.image} alt={rec.title} className="mb-2 h-28 w-full rounded-xl object-cover" />
                        <div className="flex items-center justify-between">
                          <div className="w-7 h-7 rounded-lg bg-[#EAF0E5] text-[#50563D] flex items-center justify-center">
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] font-bold text-[#656B4F] bg-[#EAF0E5] px-2 py-0.5 rounded-full">
                            {rec.time}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#1E201D] mt-1">{rec.title}</h4>
                        <p className="text-[10px] text-[#818B7D] mt-0.5">{rec.tag}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
