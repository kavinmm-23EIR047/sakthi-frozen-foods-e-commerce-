'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, ArrowRight, Flame } from 'lucide-react';
import { fetchApi } from '@/lib/apiConfig';
import { ProductType } from '@/lib/seedData';
import { handleImageError } from '@/lib/imageCompressor';

// Simple fuzzy match function that tolerates minor typos
function fuzzyMatch(pattern: string, text: string): boolean {
  const p = pattern.toLowerCase().replace(/\s+/g, '');
  const t = text.toLowerCase();
  
  if (t.includes(p)) return true;
  if (p.length < 3) return false;

  let patternIdx = 0;
  let textIdx = 0;

  while (patternIdx < p.length && textIdx < t.length) {
    if (p[patternIdx] === t[textIdx]) {
      patternIdx++;
    }
    textIdx++;
  }
  
  // Allow 1 typo (missing character)
  return patternIdx >= p.length - 1;
}

export default function SearchOverlay() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ProductType[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing recent searches', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen && products.length === 0) {
      // Fetch products on first open
      const loadProducts = async () => {
        const data = await fetchApi('/products');
        if (data.success) {
          setProducts(data.data);
        }
      };
      loadProducts();
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, products.length]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(t => t.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setIsOpen(false);
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleProductClick = (product: ProductType) => {
    saveRecentSearch(product.name);
    setIsOpen(false);
    router.push(`/product/${product.id}`);
    setQuery('');
  };

  const popularProducts = products.filter(p => p.isPopular).slice(0, 4);
  
  const searchResults = query.trim() 
    ? products.filter(p => fuzzyMatch(query, p.name) || fuzzyMatch(query, p.category))
    : [];

  return (
    <>
      {/* Search Trigger Bar */}
      <div 
        className="w-full relative cursor-text group"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#E8EEE0] border border-[#4F534C]/20 text-sm text-[#61665D] group-hover:border-[#4D583F] group-hover:bg-white transition-all shadow-inner flex items-center min-h-[44px]">
          Search Veg Mutton, Fish...
        </div>
        <Search className="w-4 h-4 text-[#61665D] absolute left-4 top-3.5" />
      </div>

      {/* Fullscreen Overlay using Portal to escape stacking context */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[60] bg-[#E8EEE0] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header & Input */}
          <div className="bg-white px-4 py-4 border-b border-[#4F534C]/15 flex items-center gap-3 safe-area-pt">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="What are you craving?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#E8EEE0] border border-[#4F534C]/20 text-base text-[#1E201D] placeholder-[#61665D] focus:outline-none focus:ring-2 focus:ring-[#4D583F] focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-5 h-5 text-[#4D583F] absolute left-3.5 top-3.5" />
              {query && (
                <button 
                  type="button" 
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 top-3.5 p-0.5 rounded-full bg-[#EAF0E5] text-[#61665D] hover:text-[#1E201D]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[#4D583F] font-bold text-sm px-2"
            >
              Cancel
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto pb-safe">
            {query.trim() ? (
              /* Search Results */
              <div className="p-4 space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="flex items-center gap-4 p-3 bg-white rounded-xl border border-[#4F534C]/10 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <img src={product.image} alt={product.name} onError={handleImageError} className="w-14 h-14 object-cover rounded-lg bg-[#EAF0E5]" />
                      <div className="flex-1">
                        <h4 className="font-bold text-[#1E201D] text-sm">{product.name}</h4>
                        <p className="text-xs text-[#61665D] mt-0.5">{product.category}</p>
                      </div>
                      <div className="font-bold text-[#4D583F] text-sm whitespace-nowrap">₹{product.price}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 rounded-full bg-[#EAF0E5] flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-[#A7ADA9]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1E201D] mb-1">No products found</h3>
                    <p className="text-sm text-[#61665D]">We couldn't find anything matching "{query}". Try checking your spelling.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State: Recent & Popular */
              <div className="p-4 space-y-8">
                
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm text-[#1E201D] uppercase tracking-wider">Recent Searches</h3>
                      <button onClick={clearRecentSearches} className="text-xs text-[#61665D] hover:text-[#4D583F] font-semibold">Clear All</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => { setQuery(term); handleSearchSubmit({ preventDefault: () => {} } as any); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#4F534C]/15 rounded-lg text-sm text-[#61665D] hover:border-[#4D583F] hover:text-[#4D583F] transition-colors shadow-sm"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Recommendations */}
                {popularProducts.length > 0 && (
                  <div>
                    <h3 className="font-bold text-sm text-[#1E201D] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Flame className="w-4 h-4 text-amber-500" />
                      Popular Right Now
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {popularProducts.map(product => (
                        <div 
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="bg-white rounded-xl overflow-hidden border border-[#4F534C]/15 cursor-pointer hover:shadow-md transition-all active:scale-95 group"
                        >
                          <div className="aspect-[4/3] relative overflow-hidden bg-[#EAF0E5]">
                            <img src={product.image} alt={product.name} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="p-2.5">
                            <h4 className="font-bold text-[#1E201D] text-xs truncate">{product.name}</h4>
                            <p className="text-[10px] text-[#61665D] mt-0.5">₹{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Browse Categories */}
                <div>
                  <h3 className="font-bold text-sm text-[#1E201D] uppercase tracking-wider mb-3">Browse Categories</h3>
                  <div className="space-y-2">
                    {['Mutton Alternatives', 'Seafood Alternatives', 'Poultry Alternatives', 'Snacks & Starters'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setIsOpen(false); router.push(`/shop?category=${encodeURIComponent(cat)}`); }}
                        className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-[#4F534C]/15 hover:border-[#4D583F] hover:shadow-sm transition-all group"
                      >
                        <span className="font-semibold text-sm text-[#4F534C] group-hover:text-[#4D583F]">{cat}</span>
                        <ArrowRight className="w-4 h-4 text-[#A7ADA9] group-hover:text-[#4D583F] group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
