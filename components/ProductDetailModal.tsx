'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Star, ShoppingBag, Plus, Minus, ShieldCheck, Flame, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getBackendPackOptions, PackOption } from '@/lib/productPacks';

export default function ProductDetailModal() {
  const router = useRouter();
  const { selectedProductForModal, setSelectedProductForModal, addToCart, cart, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);
  const [lastProductId, setLastProductId] = useState<string | null>(null);

  if (!selectedProductForModal) return null;

  const product = selectedProductForModal;
  const weightOptions: PackOption[] = getBackendPackOptions(product);

  // If the product changed, reset the selected weight
  if (product.id !== lastProductId) {
    setLastProductId(product.id || product.code);
    setSelectedWeightIdx(0);
  }

  const safeIdx = selectedWeightIdx >= 0 && selectedWeightIdx < weightOptions.length ? selectedWeightIdx : 0;
  const currentOption = weightOptions[safeIdx] || {
    productId: product.id,
    weight: product.weight || '1kg',
    price: product.price,
    mrp: product.mrp || product.price,
    packType: 'wholesale' as const,
    badge: 'Wholesale' as const,
    label: product.weight || '1kg',
    isBase: true,
  };
  const dynamicPrice = currentOption.price;
  const dynamicMrp = currentOption.mrp;

  const targetProductId = currentOption.productId || product.id;
  const targetWeight = currentOption.weight;

  // Check if this variant is already in cart
  const inCartItem = cart.find(
    (item) => item.productId === targetProductId && item.weight === targetWeight
  );
  const inCartQty = inCartItem ? inCartItem.quantity : 0;
  const isAlreadyInCart = inCartQty > 0;

  // Sync quantity state when variant in-cart status changes
  useEffect(() => {
    if (inCartQty > 0) {
      setQuantity(inCartQty);
    } else {
      setQuantity(1);
    }
  }, [selectedWeightIdx, inCartQty]);

  const handleAdd = () => {
    const customizedProduct = {
      ...product,
      id: targetProductId,
      weight: targetWeight,
      price: dynamicPrice,
      mrp: dynamicMrp,
    };

    if (isAlreadyInCart) {
      if (quantity === inCartQty) {
        setSelectedProductForModal(null);
        router.push('/cart');
        return;
      }
      updateQuantity(targetProductId, targetWeight, quantity);
      setSelectedProductForModal(null);
      router.push('/cart');
      return;
    }

    addToCart(customizedProduct, quantity);
    setSelectedProductForModal(null);
    setQuantity(1);
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1E201D]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAFAF5] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#4F534C]/20 relative my-auto">
        <button
          onClick={() => {
            setSelectedProductForModal(null);
            setQuantity(1);
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-[#1E201D] shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Side */}
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[380px] bg-[#EAF0E5] flex items-center justify-center p-5">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl shadow-sm border border-[#4F534C]/15"
            />
            {(product.isAvailable === false || (product.isAvailable === undefined && product.stock <= 0)) ? (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Out of Stock
              </span>
            ) : (
              <span className="absolute top-4 left-4 bg-[#656B4F] text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                In Stock • {currentOption.badge} Pack
              </span>
            )}
          </div>

          {/* Product Content Side */}
          <div className="p-5 sm:p-6 md:p-7 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-[#656B4F] bg-[#EAF0E5] px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              <h2 className="text-2xl font-black text-[#1E201D] leading-tight">{product.name}</h2>

              <p className="text-xs text-[#61665D] mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/10 text-[11px] font-semibold text-[#1E201D]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#656B4F]" />
                  <span>100% Plant-Based</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/10 text-[11px] font-semibold text-[#1E201D]">
                  <Flame className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rich Protein & Fiber</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/10 text-[11px] font-semibold text-[#1E201D]">
                  <Sparkles className="w-3.5 h-3.5 text-[#656B4F]" />
                  <span>Zero Cholesterol</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/10 text-[11px] font-semibold text-[#1E201D]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#656B4F]" />
                  <span>Keep Frozen (-18°C)</span>
                </div>
              </div>
            </div>

            {/* Price & Add Action */}
            <div className="pt-4 border-t border-[#4F534C]/15 space-y-4">
              
              {/* Weight / Pack Size Selector Segmented Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-xs font-black uppercase tracking-wider text-[#3E4536] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#656B4F]" />
                    <span>Select Pack Size ({weightOptions.length} available):</span>
                  </span>
                  <span className="font-black text-[#50563D] text-[11px] bg-[#E8EEE0] px-2 py-0.5 rounded-full border border-[#4F534C]/20">
                    Active: {currentOption.badge} ({currentOption.weight})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-[#E8EEE0] rounded-2xl border border-[#4F534C]/20 shadow-inner">
                  {weightOptions.map((opt, idx) => {
                    const isSelected = selectedWeightIdx === idx;
                    return (
                      <button
                        key={opt.weight}
                        type="button"
                        onClick={() => setSelectedWeightIdx(idx)}
                        className={`p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer border relative ${
                          isSelected
                            ? 'bg-[#50563D] text-white border-[#50563D] shadow-sm scale-[1.01]'
                            : 'bg-white hover:bg-[#F9FCF6] text-[#1E201D] border-stone-200 hover:border-[#656B4F]/40 shadow-2xs'
                        }`}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Radio Switch Indicator */}
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'border-white bg-[#86EFAC]'
                                : 'border-stone-300 bg-stone-50'
                            }`}
                          >
                            {isSelected && <div className="w-1 h-1 rounded-full bg-[#1E201D]" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${
                                  isSelected
                                    ? 'bg-white/20 text-[#EAF0E5]'
                                    : opt.packType === 'retail'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : 'bg-[#D6DFC9] text-[#2D3823] border border-[#656B4F]/20'
                                }`}
                              >
                                {opt.badge}
                              </span>
                              <span className="font-extrabold text-xs truncate">
                                {opt.weight}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs sm:text-sm font-black ${
                              isSelected ? 'text-[#86EFAC]' : 'text-[#50563D]'
                            }`}
                          >
                            ₹{opt.price}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#61665D] block">Calculated Price</span>
                  <span className="text-2xl font-black text-[#656B4F]">₹{dynamicPrice}</span>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center border border-[#4F534C]/20 rounded-xl bg-[#E8EEE0] p-1 shadow-inner">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 rounded-lg hover:bg-white text-[#1E201D] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-bold text-[#1E201D]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 rounded-lg hover:bg-white text-[#1E201D] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {(product.isAvailable === false || (product.isAvailable === undefined && product.stock <= 0)) ? (
                <button
                  type="button"
                  disabled
                  className="w-full min-h-11 py-3 px-4 rounded-xl bg-stone-300 text-stone-600 font-extrabold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-stone-300"
                >
                  <X className="w-4 h-4" />
                  <span>Out of Stock</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleAdd();
                  }}
                  className="w-full min-h-11 py-3 px-4 rounded-xl bg-[#656B4F] text-white font-bold text-sm hover:bg-[#50563D] transition-all shadow-sm flex items-center justify-center gap-2 group whitespace-nowrap cursor-pointer"
                >
                  {isAlreadyInCart ? (
                    quantity === inCartQty ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                        <span>In Cart ({inCartQty}) • View Cart →</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Update Cart to {quantity} • ₹{dynamicPrice * quantity}</span>
                      </>
                    )
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Add {quantity} to Cart • ₹{dynamicPrice * quantity}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
