'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalPrice,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const deliveryFee = totalPrice >= 999 || totalPrice === 0 ? 0 : 60;
  const grandTotal = totalPrice + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1E201D]/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAFAF5] shadow-2xl flex flex-col border-l border-[#4F534C]/20">
          {/* Header */}
          <div className="px-6 py-5 bg-[#4D583F] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <h2 className="text-lg font-bold">Your Cart ({cart.length})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-[#61665D]">
                <div className="w-16 h-16 rounded-full bg-[#E8EEE0] flex items-center justify-center mx-auto mb-4 border border-[#4F534C]/15">
                  <ShoppingCart className="w-8 h-8 text-[#4D583F]" />
                </div>
                <h3 className="text-base font-bold text-[#1E201D]">Your cart is empty</h3>
                <p className="text-xs mt-1 text-[#61665D]">
                  Explore our premium 100% plant-based meats and add your favorites!
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/15 shadow-xs"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="text-sm font-bold text-[#1E201D] truncate">{item.name}</h4>
                    <span className="inline-block text-[11px] font-semibold text-[#4D583F] bg-[#EAF0E5] px-2 py-0.5 rounded mt-1">
                      {item.weight}
                    </span>
                    <div className="text-xs font-semibold text-[#1E201D] mt-1.5">
                      ₹{item.price} × {item.quantity} ={' '}
                      <span className="text-[#4D583F] font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#4F534C]/20 rounded-lg bg-white overflow-hidden shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                        className="p-1.5 hover:bg-[#E8EEE0] text-[#1E201D] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-bold text-[#1E201D] min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                        className="p-1.5 hover:bg-[#E8EEE0] text-[#1E201D] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId, item.weight)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#E8EEE0] border-t border-[#4F534C]/15 space-y-3 shadow-inner">
              <div className="space-y-1.5 text-xs text-[#61665D]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#1E201D]">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-bold text-[#1E201D]">
                    {deliveryFee === 0 ? (
                      <span className="text-[#4D583F]">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <div className="text-[11px] text-[#4D583F] font-medium">
                    Add ₹{999 - totalPrice} more for free delivery!
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#4F534C]/15 flex justify-between items-center">
                <span className="text-sm font-bold text-[#1E201D]">Grand Total</span>
                <span className="text-xl font-extrabold text-[#4D583F]">₹{grandTotal}</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#4D583F] text-white font-bold text-sm hover:bg-[#414b35] transition-all shadow-lg flex items-center justify-center gap-2 group mt-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
