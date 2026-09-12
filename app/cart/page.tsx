'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  const subtotal = totalPrice;
  const deliveryFee = subtotal >= 999 || subtotal === 0 ? 0 : 60;
  const convenienceFee = Number((subtotal * 0.025).toFixed(2));
  const grandTotal = Number((subtotal + deliveryFee + convenienceFee).toFixed(2));

  return (
    <div className="min-h-screen bg-[#F3FBEE] text-[#1E201D] flex flex-col font-sans">
      <Navbar />

      <main className="mx-auto w-full max-w-[1180px] px-3 py-5 sm:px-4 sm:py-8 md:py-10 flex-1">
        {/* Breadcrumb / Back button */}
        <button 
          onClick={() => router.push('/shop')}
          className="flex items-center gap-2 text-[#3D4533] hover:text-[#1A1E16] font-bold text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#4F534C]/15 flex flex-col md:flex-row">
          {/* Cart Items List */}
          <div className="w-full md:w-2/3 p-5 sm:p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#4F534C]/15 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#4D583F] text-white flex items-center justify-center shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1A1E16] font-poppins">Your Cart ({cart.length})</h1>
            </div>

            <div className="flex-1 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-[#3E4536] bg-[#EAF0E5] rounded-2xl border border-[#4F534C]/15">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-[#4F534C]/15 shadow-sm">
                    <ShoppingCart className="w-8 h-8 text-[#4D583F]" />
                  </div>
                  <h3 className="text-lg font-black text-[#1A1E16]">Your cart is empty</h3>
                  <p className="text-sm mt-1 text-[#3E4536] font-semibold">
                    Explore our premium 100% plant-based meats and add your favorites!
                  </p>
                  <button 
                    onClick={() => router.push('/shop')}
                    className="mt-6 px-6 py-3 bg-[#4D583F] text-white font-black rounded-xl shadow-md hover:bg-[#414b35] transition-colors"
                  >
                    Browse Shop
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.weight}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-2xl bg-[#F8FAF4] border border-[#4F534C]/15 shadow-sm hover:shadow-md transition-shadow gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-extrabold text-[#1A1E16] truncate">{item.name}</h4>
                      <span className="inline-block text-xs font-bold text-[#4D583F] bg-[#EAF0E5] px-2.5 py-1 rounded-md mt-1.5 uppercase tracking-wide">
                        {item.weight}
                      </span>
                      <div className="text-sm font-bold text-[#3E4536] mt-2">
                        ₹{item.price} × {item.quantity} ={' '}
                        <span className="text-[#26311A] font-black text-base">₹{item.price * item.quantity}</span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-between sm:justify-start">
                      <div className="flex items-center border border-[#4F534C]/20 rounded-xl bg-white overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                          className="p-2.5 hover:bg-[#E8EEE0] text-[#1E201D] transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-black text-[#1E201D] min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                          className="p-2.5 hover:bg-[#E8EEE0] text-[#1E201D] transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.weight)}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full md:w-1/3 p-6 md:p-8 bg-[#EAF0E5] flex flex-col border-t md:border-t-0 md:border-l border-[#4F534C]/15">
            <h2 className="text-lg font-black text-[#1A1E16] mb-6 font-poppins border-b border-[#4F534C]/15 pb-2">Order Summary</h2>
            
            <div className="space-y-3.5 text-xs sm:text-sm text-[#3E4536] font-bold flex-1">
              <div className="flex justify-between items-center">
                <span>Items Subtotal ({cart.length} items)</span>
                <span className="font-black text-[#1A1E16]">₹{subtotal}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>Convenience Fee</span>
                  <span className="bg-[#4D583F]/10 text-[#4D583F] text-[10px] px-1.5 py-0.5 rounded font-bold">2.5%</span>
                </span>
                <span className="font-black text-[#1A1E16]">₹{convenienceFee}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Estimated Delivery</span>
                <span className="font-black text-[#1A1E16]">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs font-black">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              
              {deliveryFee > 0 && cart.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold mt-2">
                  Add ₹{999 - subtotal} more to your order for <span className="font-black">FREE Delivery!</span>
                </div>
              )}
            </div>

            <div className="pt-5 mt-6 border-t border-[#4F534C]/20 flex justify-between items-center mb-6">
              <div>
                <span className="text-sm font-black text-[#1A1E16] block">Grand Total</span>
                <span className="text-[10px] text-[#4F5547] font-semibold">Incl. all taxes & fees</span>
              </div>
              <span className="text-2xl font-black text-[#26311A]">₹{grandTotal}</span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => router.push('/checkout')}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap ${
                cart.length > 0 
                  ? 'bg-[#4D583F] text-white hover:bg-[#414b35] hover:shadow-xl' 
                  : 'bg-[#D3D8CF] text-[#8F968B] cursor-not-allowed'
              }`}
            >
              <span>Proceed to Checkout</span>
              {cart.length > 0 && <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
