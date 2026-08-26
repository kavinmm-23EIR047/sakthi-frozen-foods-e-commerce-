'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { ProductType } from '@/lib/seedData';
import { fetchApi } from '@/lib/apiConfig';
import { Plus, Eye, Filter, RefreshCw } from 'lucide-react';
import { handleImageError } from '@/lib/imageCompressor';

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
    if (initialSearch) setSearchTerm(initialSearch);
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialSearch, initialCategory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let endpoint = '/products?';
      if (selectedCategory !== 'All') {
        endpoint += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (debouncedSearchTerm) {
        endpoint += `search=${encodeURIComponent(debouncedSearchTerm)}&`;
      }
      const data = await fetchApi(endpoint);
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, debouncedSearchTerm]);

  // Sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return Number(a.code) - Number(b.code);
  });

  return (
    <div className="min-h-screen bg-[#F3FBEE] text-[#2F2F2F] flex flex-col font-sans">
      <Navbar
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="site-shell w-full max-w-[1180px] py-6 sm:py-8 md:py-10 flex-1">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold tracking-[0.14em] text-[#656B4F] uppercase mb-2">Shop Sakthi</p>
          <h1 className="text-4xl sm:text-5xl font-black text-[#2F2F2F] tracking-tight font-poppins">
            Frozen food, made simple.
          </h1>
          <p className="text-lg text-[#676662] mt-3 leading-relaxed">
            Browse the current collection and select the right pack for your kitchen.
          </p>
        </div>

        {/* Category Pills & Filter Controls */}
        <div className="space-y-6 mb-10">
          <div className="surface-card rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4">
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
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs min-h-[44px] ${
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="group flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-[#676662]/15 bg-[#FBFDF2] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-2xl"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] bg-[#EAF0E5] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badges */}
                  <div className="absolute left-2 top-2 flex items-center gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
                    <span className="rounded-md bg-[#4D583F] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs sm:px-2.5 sm:py-1 sm:text-[10px]">
                      {product.weight}
                    </span>
                    {product.isPopular && (
                      <span className="rounded-md bg-amber-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs sm:px-2 sm:py-1 sm:text-[10px]">
                        Best Seller
                      </span>
                    )}
                  </div>

                  {/* Quick View Overlay Button */}
                  <button
                    onClick={() => window.location.href = `/product/${product.id}`}
                    className="absolute inset-0 bg-[#1E201D]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2"
                  >
                    <span className="bg-[#4D583F] px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg min-h-[44px]">
                      <Eye className="w-4 h-4" /> Quick View
                    </span>
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between space-y-3 p-3 sm:space-y-4 sm:p-5">
                  <div>
                    <div className="text-[11px] font-semibold text-[#4D583F] uppercase tracking-wider mb-1">
                      {product.category}
                    </div>
                    <h3 className="text-base font-extrabold leading-snug text-[#2F2F2F] transition-colors group-hover:text-[#656B4F] sm:text-xl font-poppins">
                      {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#676662] sm:mt-1.5 sm:text-sm">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between gap-2 border-t border-[#4F534C]/15 pt-2 sm:pt-3">
                    <div>
                      <span className="text-[10px] text-[#61665D] block uppercase font-medium">From</span>
                      <span className="text-xl font-black text-[#656B4F]">₹{product.price}</span>
                    </div>

                    <button
                      onClick={() => window.location.href = `/product/${product.id}`}
                      className="flex min-h-9 items-center gap-1 whitespace-nowrap rounded-lg bg-[#4D583F] px-2 py-2 text-[11px] font-bold text-white shadow-md transition-all hover:bg-[#414b35] active:scale-95 sm:min-h-11 sm:gap-1.5 sm:rounded-xl sm:px-3.5 sm:text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Select Options</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F3FBEE] flex flex-col gap-4 items-center justify-center"><div className="page-spinner" aria-label="Loading products" /><p className="text-[#676662] font-semibold">Loading the shop…</p></div>}>
      <ShopContent />
    </Suspense>
  );
}
