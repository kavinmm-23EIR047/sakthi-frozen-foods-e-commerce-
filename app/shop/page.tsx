'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { ProductType } from '@/lib/types';
import { fetchApi } from '@/lib/apiConfig';
import { Plus, Eye, Filter, RefreshCw, SlidersHorizontal, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChefHat } from 'lucide-react';
import { handleImageError } from '@/lib/imageCompressor';
import OptimizedImage from '@/components/OptimizedImage';

function isRetailCategory(category: string) {
  return category.toUpperCase().includes('RETAIL PACK');
}

function formatCleanWeight(w: string): string {
  if (!w) return '1kg';
  const clean = w.trim().toUpperCase();
  if (clean.includes('300')) return '300g';
  if (clean.includes('400')) return '400g';
  if (clean.includes('250')) return '250g';
  if (clean.includes('200')) return '200g';
  if (clean.includes('500')) return '500g';
  if (clean.includes('1') && (clean.includes('KG') || clean.includes('KILO'))) return '1kg';
  return w;
}

function formatProductDisplayName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bVeg\b/g, 'Veg')
    .replace(/\bLolipop\b/gi, 'Lollipop');
}

function getCategoryAudience(category: string) {
  return isRetailCategory(category)
    ? 'Smaller packs for home kitchens and everyday cooking'
    : 'Larger packs for markets, department stores and bulk buyers';
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  
  const productRequestId = useRef(0);

  // Fetch categories dynamically from backend API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchApi('/categories');
        if (res.success && Array.isArray(res.data)) {
          const names = ['All', ...res.data.map((c: any) => c.name)];
          setCategories(names);
        }
      } catch (err) {
        console.error('Error fetching categories from backend:', err);
      }
    };
    loadCategories();
  }, []);

  // Sync initial query params
  useEffect(() => {
    setSearchTerm(initialSearch);
    setDebouncedSearchTerm(initialSearch);
    setSelectedCategory(initialCategory);
  }, [initialSearch, initialCategory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchProducts = async (targetPage = page, targetLimit = pageSize) => {
    const requestId = ++productRequestId.current;
    setLoading(true);
    
    try {
      let endpoint = `/products?page=${targetPage}&limit=${targetLimit}&`;
      if (selectedCategory !== 'All') {
        endpoint += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (debouncedSearchTerm) {
        endpoint += `search=${encodeURIComponent(debouncedSearchTerm)}&`;
      }
      const data = await fetchApi(endpoint);
      if (requestId !== productRequestId.current) return;
      if (data.success) {
        setProducts(data.data);
        setPage(targetPage);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total ?? data.data.length);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      if (requestId === productRequestId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1, pageSize);
  }, [selectedCategory, debouncedSearchTerm, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page || loading) return;
    setPage(newPage);
    fetchProducts(newPage, pageSize);
    const element = document.getElementById('shop-products-top');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPaginationItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const items: (number | string)[] = [];
    
    if (page <= 4) {
      for (let i = 1; i <= 5; i++) {
        items.push(i);
      }
      items.push('...');
      items.push(totalPages);
    } else if (page >= totalPages - 3) {
      items.push(1);
      items.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      items.push('...');
      items.push(page - 1);
      items.push(page);
      items.push(page + 1);
      items.push('...');
      items.push(totalPages);
    }
    
    return items;
  };

  const filteredByPriceAndStock = products.filter((product) => {
    const meetsMin = !minPrice || product.price >= Number(minPrice);
    const meetsMax = !maxPrice || product.price <= Number(maxPrice);
    const meetsStock = !inStockOnly || product.stock > 0;
    return meetsMin && meetsMax && meetsStock;
  });

  // Sorting
  const sortedProducts = [...filteredByPriceAndStock].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return Number(a.code) - Number(b.code);
  });

  const groupedProducts = sortedProducts.reduce<Record<string, ProductType[]>>((groups, product) => {
    (groups[product.category] ||= []).push(product);
    return groups;
  }, {});

  const activeFilterCount = [minPrice, maxPrice, inStockOnly ? 'stock' : ''].filter(Boolean).length;

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSelectedCategory('All');
    setSortBy('default');
  };

  return (
    <div className="min-h-screen bg-[#F3FBEE] text-[#2F2F2F] flex flex-col font-sans">
      <Navbar
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="mx-auto w-full max-w-[1180px] px-3 py-5 sm:px-4 sm:py-8 md:py-10 flex-1">
        <div className="mb-6 max-w-2xl sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF0E5] border border-[#4D583F]/20 text-[#4D583F] text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
            <ChefHat className="w-4 h-4 text-emerald-600 animate-float-subtle" />
            <span>Master Chef Grade Collection</span>
          </div>
          <h1 className="text-3xl leading-tight sm:text-5xl font-black text-[#2F2F2F] tracking-tight font-poppins">
            Frozen food, made simple.
          </h1>
          <p className="text-sm leading-relaxed text-[#676662] mt-3 sm:text-lg">
            Browse the current collection and select the right pack for your kitchen.
          </p>
        </div>

        {/* Category Pills & Filter Controls */}
        <div id="shop-products-top" className="scroll-mt-28 space-y-4 mb-6 sm:space-y-6 sm:mb-10">
          <div className="surface-card rounded-2xl p-3 sm:p-5 flex items-center justify-between flex-wrap gap-3 sm:gap-4">
            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#61665D]" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#4F534C]/20 text-xs font-bold text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F] shadow-xs min-h-[44px]"
              >
                <option value="default">Sort: Default Code Order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#4F534C]/20 bg-white px-3 py-2 text-xs font-black text-[#4D583F] shadow-xs transition-colors hover:bg-[#EAF0E5]"
              aria-label="Open product filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && <span className="rounded-full bg-[#4D583F] px-1.5 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none sm:gap-2">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all shadow-xs min-h-[40px] sm:px-4 sm:py-2.5 sm:text-xs sm:min-h-[44px] ${
                    active
                      ? 'bg-[#4D583F] text-white shadow-md scale-105'
                      : 'bg-white text-[#61665D] hover:bg-[#EAF0E5] hover:text-[#1E201D] border border-[#4F534C]/15'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-[#1E201D]/40" onClick={() => setIsFilterOpen(false)}>
            <aside
              className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col bg-white p-5 shadow-2xl sm:p-6"
              onClick={(event) => event.stopPropagation()}
              aria-label="Product filters"
            >
              <div className="flex items-center justify-between border-b border-[#4F534C]/15 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#656B4F]">Refine products</p>
                  <h2 className="mt-1 text-xl font-black text-[#2F2F2F]">Filters</h2>
                </div>
                <button type="button" onClick={() => setIsFilterOpen(false)} className="rounded-lg p-2 text-[#61665D] hover:bg-[#EAF0E5]" aria-label="Close filters">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-7 overflow-y-auto py-6">
                <div>
                  <h3 className="mb-3 text-sm font-black text-[#1E201D]">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`flex min-h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-sm font-bold ${selectedCategory === category ? 'border-[#4D583F] bg-[#EAF0E5] text-[#4D583F]' : 'border-[#4F534C]/15 text-[#61665D]'}`}
                      >
                        <span>{category}</span>
                        {selectedCategory === category && <span className="text-xs">Selected</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-black text-[#1E201D]">Price range</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs font-bold text-[#61665D]">Minimum
                      <input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="₹ 0" className="mt-1 min-h-11 w-full rounded-xl border border-[#4F534C]/20 px-3 text-sm text-[#1E201D] outline-none focus:border-[#4D583F]" />
                    </label>
                    <label className="text-xs font-bold text-[#61665D]">Maximum
                      <input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="₹ 2000" className="mt-1 min-h-11 w-full rounded-xl border border-[#4F534C]/20 px-3 text-sm text-[#1E201D] outline-none focus:border-[#4D583F]" />
                    </label>
                  </div>
                </div>

                <label className="flex min-h-11 items-center justify-between rounded-xl border border-[#4F534C]/15 px-3 text-sm font-bold text-[#1E201D]">
                  Only show in-stock items
                  <input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} className="h-5 w-5 accent-[#4D583F]" />
                </label>

                <div>
                  <h3 className="mb-3 text-sm font-black text-[#1E201D]">Sort by</h3>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="min-h-11 w-full rounded-xl border border-[#4F534C]/20 px-3 text-sm font-bold text-[#1E201D] outline-none focus:border-[#4D583F]">
                    <option value="default">Default code order</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                    <option value="rating">Highest rated</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 border-t border-[#4F534C]/15 pt-4">
                <button type="button" onClick={resetFilters} className="min-h-11 flex-1 rounded-xl border border-[#4F534C]/20 px-3 text-sm font-bold text-[#61665D]">Reset</button>
                <button type="button" onClick={() => setIsFilterOpen(false)} className="min-h-11 flex-1 rounded-xl bg-[#4D583F] px-3 text-sm font-black text-white">Show {sortedProducts.length} items</button>
              </div>
            </aside>
          </div>
        )}

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 py-8 sm:gap-4 sm:py-10 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="flex min-h-[290px] flex-col justify-between rounded-xl border border-[#676662]/10 bg-white p-3 sm:min-h-[330px] sm:rounded-2xl sm:p-4">
                <div className="loading-shimmer aspect-[4/3] w-full rounded-lg sm:rounded-xl" />
                <div className="space-y-2 mt-4">
                  <div className="bg-[#EAF0E5] h-4 rounded w-3/4" />
                  <div className="bg-[#EAF0E5] h-3 rounded w-1/2" />
                </div>
                <div className="bg-[#EAF0E5] h-10 rounded-xl w-full mt-4" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#FAFAF5] rounded-3xl border border-[#4F534C]/15 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#EAF0E5] flex items-center justify-center mx-auto mb-4 text-[#4D583F]">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1E201D]">No products found</h3>
            <p className="text-xs text-[#61665D] mt-1">Try resetting your search query or category selection.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#4D583F] text-[#FAFAF5] text-xs font-bold hover:bg-[#414b35]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <section key={category} aria-labelledby={`category-${category}`}>
                <button
                  type="button"
                  onClick={() => setCollapsedCategories((previous) => ({ ...previous, [category]: !previous[category] }))}
                  className={`mb-4 flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors sm:px-5 ${isRetailCategory(category) ? 'border-amber-200 bg-amber-50/70 hover:bg-amber-50' : 'border-[#4F534C]/15 bg-white hover:bg-[#FAFAF5]'}`}
                  aria-expanded={!collapsedCategories[category]}
                  aria-controls={`products-${category}`}
                >
                  <span className="min-w-0">
                    <span className={`block text-[10px] font-black uppercase tracking-[0.18em] ${isRetailCategory(category) ? 'text-amber-700' : 'text-[#656B4F]'}`}>
                      {isRetailCategory(category) ? 'Retail Packs · Home Friendly' : 'Regular Packs · Market Supply'}
                    </span>
                    <span id={`category-${category}`} className="mt-1 block text-xl font-black text-[#2F2F2F] sm:text-2xl font-poppins">{category}</span>
                    <span className="mt-1 block text-xs font-medium text-[#676662]">{getCategoryAudience(category)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs font-bold text-[#676662]">
                    {categoryProducts.length} items
                    {collapsedCategories[category] ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                  </span>
                </button>
                {!collapsedCategories[category] && <div id={`products-${category}`} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categoryProducts.map((product) => {
              const displayName = formatProductDisplayName(product.name);
              const cleanWeight = formatCleanWeight(product.weight);
              const mrp = product.mrp ?? product.price;
              const discountPercent = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;

              return (
                <article
                  key={product.id}
                  className="group flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-[#4F534C]/12 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#4D583F]/35"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] bg-[#EAF0E5] overflow-hidden">
                    <OptimizedImage
                      src={product.image}
                      alt={displayName}
                      width={520}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Subtle bottom gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

                    {/* Badges */}
                    <div className="absolute inset-x-2 top-2 sm:inset-x-3 sm:top-3 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
                      <span className="rounded-full bg-[#1E281D]/85 backdrop-blur-xs px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
                        📦 {cleanWeight}
                      </span>
                      {product.isPopular && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-white shadow-xs flex items-center gap-1">
                          <ChefHat className="w-2.5 h-2.5" />
                          <span>Chef Pick</span>
                        </span>
                      )}
                    </div>

                    {/* Quick View Overlay Button */}
                    <Link
                      href={`/product/${product.id}`}
                      className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2"
                    >
                      <span className="bg-[#4D583F] px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
                        <Eye className="w-4 h-4" /> Quick View
                      </span>
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 space-y-2.5">
                    <div className="space-y-1">
                      <div className="truncate text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800">
                        {product.category.replace(' Alternatives', '').replace(' Retail Pack', '')}
                      </div>
                      <h3 className="line-clamp-1 text-sm sm:text-base md:text-lg font-black leading-snug text-[#1E201D] transition-colors group-hover:text-emerald-900">
                        {displayName}
                      </h3>
                      <p className="line-clamp-1 text-[11px] sm:text-xs text-[#61665D] leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-2.5 border-t border-[#4F534C]/10 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base sm:text-xl font-black text-[#1E201D]">
                            ₹{product.price}
                          </span>
                        </div>
                        {discountPercent > 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                            <span className="text-gray-400 line-through font-medium">₹{mrp}</span>
                            <span className="font-black text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">
                              {discountPercent}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/product/${product.id}`}
                        className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-[#4D583F] hover:bg-[#3B4430] text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Options</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
                </div>}
              </section>
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 pt-6 border-t border-[#4F534C]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Product Range Summary */}
                <div className="text-xs font-medium text-[#61665D] text-center sm:text-left order-2 sm:order-1">
                  Showing <span className="font-bold text-[#1E201D]">{Math.min((page - 1) * pageSize + 1, totalCount)}</span>–
                  <span className="font-bold text-[#1E201D]">{Math.min(page * pageSize, totalCount)}</span> of{' '}
                  <span className="font-bold text-[#1E201D]">{totalCount}</span> products
                </div>

                {/* Pagination Nav */}
                <nav className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2" aria-label="Products pagination">
                  {/* First Page */}
                  {totalPages > 5 && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(1)}
                      disabled={page === 1 || loading}
                      className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#4F534C]/20 bg-white text-[#1E201D] shadow-xs transition-all hover:bg-[#EAF0E5] hover:text-[#4D583F] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#1E201D]"
                      aria-label="First page"
                      title="First page"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                  )}

                  {/* Previous Page */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || loading}
                    className="flex h-9 min-w-[36px] sm:h-10 sm:min-w-[40px] items-center justify-center gap-1 rounded-xl border border-[#4F534C]/20 bg-white px-2.5 sm:px-3 text-xs font-bold text-[#1E201D] shadow-xs transition-all hover:bg-[#EAF0E5] hover:text-[#4D583F] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#1E201D]"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {getPaginationItems().map((item, idx) => {
                      if (item === '...') {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="flex h-9 w-6 sm:h-10 sm:w-8 items-center justify-center text-xs font-bold text-[#61665D]"
                          >
                            •••
                          </span>
                        );
                      }

                      const pageNum = Number(item);
                      const isActive = pageNum === page;

                      return (
                        <button
                          key={`page-btn-${pageNum}`}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-xs font-bold transition-all shadow-xs ${
                            isActive
                              ? 'bg-[#4D583F] text-white shadow-md scale-105 pointer-events-none ring-2 ring-[#4D583F]/30'
                              : 'border border-[#4F534C]/20 bg-white text-[#1E201D] hover:border-[#4D583F]/40 hover:bg-[#EAF0E5] hover:text-[#4D583F]'
                          }`}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={`Page ${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Page */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages || loading}
                    className="flex h-9 min-w-[36px] sm:h-10 sm:min-w-[40px] items-center justify-center gap-1 rounded-xl border border-[#4F534C]/20 bg-white px-2.5 sm:px-3 text-xs font-bold text-[#1E201D] shadow-xs transition-all hover:bg-[#EAF0E5] hover:text-[#4D583F] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#1E201D]"
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Last Page */}
                  {totalPages > 5 && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={page === totalPages || loading}
                      className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#4F534C]/20 bg-white text-[#1E201D] shadow-xs transition-all hover:bg-[#EAF0E5] hover:text-[#4D583F] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-[#1E201D]"
                      aria-label="Last page"
                      title="Last page"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  )}
                </nav>

                {/* Per Page Selector */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[#61665D] order-3">
                  <label htmlFor="per-page-select" className="hidden sm:inline">Per page:</label>
                  <select
                    id="per-page-select"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                    }}
                    className="rounded-xl border border-[#4F534C]/20 bg-white px-2.5 py-1.5 text-xs font-bold text-[#1E201D] shadow-xs outline-none focus:border-[#4D583F] focus:ring-1 focus:ring-[#4D583F]"
                  >
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>

      <Footer />

    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="min-h-screen bg-[#F3FBEE] text-[#2F2F2F] flex flex-col font-sans">
      <Navbar activeCategory="All" onSelectCategory={() => {}} />
      <main className="mx-auto w-full max-w-[1180px] px-3 py-5 sm:px-4 sm:py-8 md:py-10 flex-1">
        <div className="mb-6 max-w-2xl sm:mb-10 space-y-4">
          <div className="h-4 w-32 bg-[#EAF0E5] rounded animate-pulse" />
          <div className="h-10 sm:h-14 w-3/4 bg-[#EAF0E5] rounded-xl animate-pulse" />
          <div className="h-6 w-1/2 bg-[#EAF0E5] rounded animate-pulse" />
        </div>
        
        <div className="flex gap-2 mb-8 sm:mb-10 overflow-hidden">
          <div className="h-11 w-32 bg-[#EAF0E5] rounded-xl animate-pulse shrink-0" />
          <div className="h-11 w-24 bg-[#EAF0E5] rounded-xl animate-pulse shrink-0" />
          <div className="h-11 w-28 bg-[#EAF0E5] rounded-xl animate-pulse shrink-0" />
          <div className="h-11 w-24 bg-[#EAF0E5] rounded-xl animate-pulse shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="flex min-h-[290px] flex-col justify-between rounded-xl border border-[#676662]/10 bg-white p-3 sm:min-h-[330px] sm:rounded-2xl sm:p-4 animate-pulse shadow-sm">
              <div className="aspect-[4/3] w-full rounded-lg sm:rounded-xl bg-[#EAF0E5]" />
              <div className="space-y-2 mt-4">
                <div className="bg-[#EAF0E5] h-4 rounded w-3/4" />
                <div className="bg-[#EAF0E5] h-3 rounded w-1/2" />
              </div>
              <div className="flex items-end justify-between mt-4">
                <div className="space-y-1">
                  <div className="bg-[#EAF0E5] h-2 rounded w-8" />
                  <div className="bg-[#EAF0E5] h-5 rounded w-12" />
                </div>
                <div className="bg-[#EAF0E5] h-9 sm:h-11 rounded-lg sm:rounded-xl w-24" />
              </div>
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
