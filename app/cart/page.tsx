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

  const deliveryFee = totalPrice >= 999 || totalPrice === 0 ? 0 : 60;
  const grandTotal = totalPrice + deliveryFee;

  return (
    <div className="min-h-screen bg-[#E8EEE0] text-[#1E201D] flex flex-col font-sans">
      <Navbar />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1">
        {/* Breadcrumb / Back button */}
        <button 
          onClick={() => router.push('/shop')}
          className="flex items-center gap-2 text-[#61665D] hover:text-[#4D583F] font-bold text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-[#4F534C]/15 flex flex-col md:flex-row">
          {/* Cart Items List */}
          <div className="w-full md:w-2/3 p-6 md:p-10 border-b md:border-b-0 md:border-r border-[#4F534C]/15 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#4D583F] text-white flex items-center justify-center shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-[#1E201D] font-poppins">Your Cart ({cart.length})</h1>
            </div>

            <div className="flex-1 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-[#61665D] bg-[#E8EEE0] rounded-2xl border border-[#4F534C]/10">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-[#4F534C]/15 shadow-sm">
                    <ShoppingCart className="w-8 h-8 text-[#4D583F]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E201D]">Your cart is empty</h3>
                  <p className="text-sm mt-1 text-[#61665D]">
                    Explore our premium 100% plant-based meats and add your favorites!
                  </p>
                  <button 
                    onClick={() => router.push('/shop')}
                    className="mt-6 px-6 py-3 bg-[#4D583F] text-white font-bold rounded-xl shadow-md hover:bg-[#414b35] transition-colors"
                  >
                    Browse Shop
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.weight}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-2xl bg-[#FAFAF5] border border-[#4F534C]/15 shadow-sm hover:shadow-md transition-shadow gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-[#1E201D] truncate">{item.name}</h4>
                      <span className="inline-block text-xs font-bold text-[#4D583F] bg-[#EAF0E5] px-2.5 py-1 rounded-md mt-1.5 uppercase tracking-wide">
                        {item.weight}
                      </span>
                      <div className="text-sm font-medium text-[#61665D] mt-2">
                        ₹{item.price} × {item.quantity} ={' '}
                        <span className="text-[#4D583F] font-black text-base">₹{item.price * item.quantity}</span>
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
                        <span className="px-3 text-sm font-bold text-[#1E201D] min-w-[32px] text-center">
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
          <div className="w-full md:w-1/3 p-6 md:p-10 bg-[#FAFAF5] flex flex-col">
            <h2 className="text-lg font-black text-[#1E201D] mb-6 font-poppins">Order Summary</h2>
            
            <div className="space-y-4 text-sm text-[#61665D] flex-1">
              <div className="flex justify-between items-center">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-bold text-[#1E201D]">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Estimated Delivery</span>
                <span className="font-bold text-[#1E201D]">
                  {deliveryFee === 0 ? (
                    <span className="text-white bg-[#4D583F] px-2 py-0.5 rounded text-xs font-bold shadow-sm">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              
              {deliveryFee > 0 && cart.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium mt-4">
                  Add ₹{999 - totalPrice} more to your order for <span className="font-bold">FREE Delivery!</span>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-[#4F534C]/15 flex justify-between items-center mb-8">
              <span className="text-base font-bold text-[#1E201D]">Grand Total</span>
              <span className="text-3xl font-black text-[#4D583F]">₹{grandTotal}</span>
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
