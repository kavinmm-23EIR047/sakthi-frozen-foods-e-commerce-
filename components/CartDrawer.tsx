'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingCart, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import OptimizedImage from '@/components/OptimizedImage';

export default function CartDrawer() {
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalPrice,
    totalItems,
  } = useCart();

  if (!isCartOpen) return null;

  const convenienceFee = Number((totalPrice * 0.025).toFixed(2));
  const estimatedTotal = Number((totalPrice + convenienceFee).toFixed(2));

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1E201D]/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className="w-screen max-w-md bg-[#FAFAF5] shadow-2xl flex flex-col border-l border-[#4F534C]/20 animate-in slide-in-from-right duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 bg-[#50563D] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight">Your Cart</h2>
                <span className="text-[11px] text-white/80 font-semibold">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-[#61665D] space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#EAF0E5] flex items-center justify-center mx-auto border border-[#4F534C]/15">
                  <ShoppingBag className="w-8 h-8 text-[#50563D]" />
                </div>
                <h3 className="text-base font-extrabold text-[#1E201D]">Your cart is empty</h3>
                <p className="text-xs text-[#61665D] max-w-xs mx-auto">
                  Explore our pure plant-based meats, starters &amp; essentials and add your favorites!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push('/shop');
                  }}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.weight}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#4F534C]/15 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-[#EAF0E5] overflow-hidden shrink-0 border border-stone-200/60">
                    <OptimizedImage
                      src={item.image || '/assets/mock-mutton.jpg'}
                      alt={item.name}
                      width={80}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.productId}`}
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs sm:text-sm font-extrabold text-[#1E201D] hover:text-[#50563D] line-clamp-1 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-[#50563D] bg-[#EAF0E5] px-1.5 py-0.2 rounded">
                        {item.weight || '1kg'}
                      </span>
                      <span className="text-xs font-black text-[#1E201D]">
                        ₹{item.price}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-[#FAFAF5] p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                          className="p-1 hover:bg-stone-200 text-[#1E201D] rounded transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black text-[#1E201D] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                          className="p-1 hover:bg-stone-200 text-[#1E201D] rounded transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#50563D]">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.weight)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#EAF0E5]/60 border-t border-[#4F534C]/15 space-y-3">
              <div className="space-y-1.5 text-xs text-[#61665D]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#1E201D]">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience Fee (2.5%)</span>
                  <span className="font-bold text-[#1E201D]">₹{convenienceFee}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-[#1E201D]">
                    {totalPrice >= 2999 ? (
                      <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-black">FREE</span>
                    ) : (
                      'Calculated at checkout'
                    )}
                  </span>
                </div>
                {totalPrice < 2999 && (
                  <div className="text-[11px] text-[#50563D] font-bold bg-white/80 p-2 rounded-xl border border-[#656B4F]/20">
                    Add ₹{2999 - totalPrice} more for free cold-chain delivery!
                  </div>
                )}
                <div className="rounded-lg bg-white/70 px-2.5 py-2 text-[10px] leading-relaxed text-[#59604F]">
                  Exact delivery cost is calculated after you choose a destination at checkout.
                </div>
              </div>

              <div className="pt-2 border-t border-stone-300/60 flex justify-between items-center">
                <div>
                  <span className="text-sm font-extrabold text-[#1E201D] block">Estimated total before delivery</span>
                  <span className="text-[10px] text-[#61665D]">Finalized at checkout</span>
                </div>
                <span className="text-xl font-black text-[#50563D]">₹{estimatedTotal}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push('/cart');
                  }}
                  className="py-3 px-3 rounded-xl border border-[#50563D] text-[#50563D] font-black text-xs hover:bg-[#EAF0E5] transition-colors text-center cursor-pointer"
                >
                  View Full Cart
                </button>

                <button
                  type="button"
                  disabled={isCheckingOut}
                  onClick={() => {
                    if (isCheckingOut) return;
                    setIsCheckingOut(true);
                    setIsCartOpen(false);
                    router.push('/checkout');
                  }}
                  className="py-3 px-3 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 group cursor-pointer disabled:opacity-75"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Opening...</span>
                    </>
                  ) : (
                    <>
                      <span>Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
