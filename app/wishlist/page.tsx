'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Store,
  Flame,
  ChefHat,
  Eye,
  Package,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';
import FoodLoadingScreen from '@/components/FoodLoadingScreen';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { ProductType } from '@/lib/types';

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

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  const handleAddSingleToCart = (product: ProductType) => {
    addToCart(product, 1);
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach((product) => {
      addToCart(product, 1);
    });
    setIsCartOpen(true);
  };

  if (loading) {
    return (
      <FoodLoadingScreen
        message="Loading Wishlist..."
        subMessage="Gathering your saved plant-based favourites"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F3FBEE] text-[#1E201D] flex flex-col font-sans selection:bg-[#50563D] selection:text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-[1180px] px-3 py-6 sm:px-4 sm:py-10 flex-1">
        {/* Header section */}
        <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#4F534C]/15 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-wider mb-2.5 shadow-2xs">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Your Saved Favorites</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E201D] tracking-tight font-poppins">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-[#61665D] mt-1 font-medium">
              {wishlist.length === 0
                ? 'Save your favorite plant-based proteins to purchase anytime.'
                : `You have ${wishlist.length} item${wishlist.length === 1 ? '' : 's'} saved for your kitchen.`}
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={clearWishlist}
                className="px-3.5 py-2 rounded-xl border border-stone-300 hover:border-red-300 hover:bg-red-50 text-[#61665D] hover:text-red-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
              <button
                onClick={handleMoveAllToCart}
                className="px-4 py-2 rounded-xl bg-[#50563D] hover:bg-[#1E201D] text-white text-xs font-black transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move All to Cart</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 py-8">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-[#4F534C]/10 p-3 sm:p-4 animate-pulse min-h-[300px] flex flex-col justify-between"
              >
                <div className="aspect-[4/3] bg-[#EAF0E5] rounded-xl w-full" />
                <div className="space-y-2 mt-4">
                  <div className="bg-[#EAF0E5] h-4 rounded w-3/4" />
                  <div className="bg-[#EAF0E5] h-3 rounded w-1/2" />
                </div>
                <div className="bg-[#EAF0E5] h-10 rounded-xl w-full mt-4" />
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          /* Empty State */
          <div className="max-w-lg mx-auto py-12 sm:py-16 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5 text-rose-500 shadow-sm animate-in zoom-in-75">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 fill-rose-100 text-rose-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1E201D]">Your Wishlist is Empty</h2>
            <p className="text-xs sm:text-sm text-[#61665D] mt-2 max-w-sm mx-auto leading-relaxed">
              Explore our chef-crafted plant-based mock meats and starters, and tap the heart icon on any product to save it here.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-2.5 sm:gap-3 max-w-md mx-auto w-full">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-3 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-[#50563D] hover:bg-[#1E201D] text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 sm:gap-2 group text-center"
              >
                <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Explore Shop</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-3 sm:px-5 py-3 rounded-2xl bg-white border border-[#4F534C]/20 hover:border-[#50563D] text-[#1E201D] font-bold text-xs sm:text-sm transition-all shadow-2xs text-center flex items-center justify-center"
              >
                <span className="truncate">Back to Home</span>
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-3 mt-12 pt-8 border-t border-[#4F534C]/10 text-left">
              <div className="p-3 bg-white rounded-xl border border-[#4F534C]/10">
                <ShieldCheck className="w-4 h-4 text-[#656B4F] mb-1.5" />
                <h3 className="text-[11px] font-black text-[#1E201D]">100% Plant-Based</h3>
                <p className="text-[10px] text-[#61665D] mt-0.5">Pure veg & cruelty-free</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#4F534C]/10">
                <Flame className="w-4 h-4 text-amber-600 mb-1.5" />
                <h3 className="text-[11px] font-black text-[#1E201D]">Rich in Protein</h3>
                <p className="text-[10px] text-[#61665D] mt-0.5">Authentic meaty chew</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#4F534C]/10">
                <ChefHat className="w-4 h-4 text-[#50563D] mb-1.5" />
                <h3 className="text-[11px] font-black text-[#1E201D]">Chef Grade</h3>
                <p className="text-[10px] text-[#61665D] mt-0.5">Deep frozen fresh</p>
              </div>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {wishlist.map((product) => {
              const cleanWeight = formatCleanWeight(product.weight);
              const mrp = product.mrp ?? product.price;
              const discountPercent = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-[#4F534C]/12 bg-white shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#50563D]/30"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] bg-[#EAF0E5] overflow-hidden">
                    <OptimizedImage
                      src={product.image}
                      alt={product.name}
                      width={480}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

                    {/* Pack size badge */}
                    <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#50563D]/90 backdrop-blur-xs px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-2xs">
                        <Package className="w-2.5 h-2.5 shrink-0" />
                        <span>{cleanWeight}</span>
                      </span>
                    </div>

                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-rose-600 hover:bg-rose-50 hover:scale-110 transition-all shadow-sm"
                      title="Remove from wishlist"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick View Link */}
                    <Link
                      href={`/product/${product.id}`}
                      className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5"
                    >
                      <span className="bg-[#50563D] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                        <Eye className="w-3.5 h-3.5" /> View
                      </span>
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 space-y-2.5">
                    <div className="space-y-1">
                      <div className="truncate text-[10px] font-black uppercase tracking-wider text-[#656B4F]">
                        {product.category?.replace(' Alternatives', '').replace(' Retail Pack', '')}
                      </div>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="line-clamp-1 text-xs sm:text-sm md:text-base font-black leading-snug text-[#1E201D] hover:text-[#50563D] transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="line-clamp-1 text-[11px] text-[#61665D] leading-relaxed">
                        {product.description || '100% plant-based frozen delicacy.'}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-2.5 border-t border-[#4F534C]/10 space-y-2">
                      <div className="flex items-baseline justify-between gap-1">
                        <div>
                          <span className="text-base sm:text-lg font-black text-[#1E201D]">
                            ₹{product.price}
                          </span>
                          {discountPercent > 0 && (
                            <span className="ml-1.5 text-[10px] text-gray-400 line-through">
                              ₹{mrp}
                            </span>
                          )}
                        </div>

                        {discountPercent > 0 && (
                          <span className="text-[9px] font-black text-[#50563D] bg-[#EAF0E5] px-1.5 py-0.5 rounded border border-[#656B4F]/20">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddSingleToCart(product)}
                        className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-[#50563D] hover:bg-[#1E201D] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
