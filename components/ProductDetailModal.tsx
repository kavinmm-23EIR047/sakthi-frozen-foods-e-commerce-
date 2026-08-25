'use client';

import React, { useState } from 'react';
import { X, Star, ShoppingBag, Plus, Minus, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductDetailModal() {
  const { selectedProductForModal, setSelectedProductForModal, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);
  const [lastProductId, setLastProductId] = useState<string | null>(null);

  if (!selectedProductForModal) return null;

  const product = selectedProductForModal;

  // Dynamic weight calculation based on product's actual base weight and price
  const parseWeightToGrams = (weightStr: string) => {
    if (!weightStr) return 1000;
    const match = weightStr.toUpperCase().match(/([\d.]+)\s*(KG|G)/);
    if (!match) return 1000;
    const value = parseFloat(match[1]);
    const unit = match[2];
    return unit === 'KG' ? value * 1000 : value;
  };

  // Combine Base Weight + Custom Variants so BOTH appear together for customer selection
  const baseOpt = { label: product.weight || '1 KG', price: product.price };
  const customOpts = product.variants ? product.variants.map((v) => ({ label: v.weight, price: v.price })) : [];
  
  const optionsMap = new Map<string, { label: string; price: number }>();
  optionsMap.set(baseOpt.label.trim().toUpperCase(), baseOpt);
  customOpts.forEach((opt) => optionsMap.set(opt.label.trim().toUpperCase(), opt));

  const weightOptions = Array.from(optionsMap.values());

  // If the product changed, reset the selected weight
  if (product.id !== lastProductId) {
    setLastProductId(product.id || product.code);
    setSelectedWeightIdx(0);
  }

  const safeIdx = selectedWeightIdx >= 0 && selectedWeightIdx < weightOptions.length ? selectedWeightIdx : 0;
  const currentOption = weightOptions[safeIdx];
  const currentWeight = currentOption;
  const dynamicPrice = currentOption.price;

  const handleAdd = () => {
    const customizedProduct = {
      ...product,
      weight: currentOption.label,
      price: dynamicPrice,
    };
    addToCart(customizedProduct, quantity);
    setSelectedProductForModal(null);
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1E201D]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAFAF5] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#4F534C]/20 relative my-auto">
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
            <div className="relative h-64 md:h-full bg-[#EAF0E5] flex items-center justify-center p-6">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl shadow-md border border-[#4F534C]/15"
              />
              <span className="absolute top-4 left-4 bg-[#4D583F] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                {currentWeight.label}
              </span>
            </div>

          {/* Product Content Side */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-[#4D583F] bg-[#EAF0E5] px-2.5 py-1 rounded-md uppercase tracking-wider">
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
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4D583F]" />
                  <span>100% Plant-Based</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/10 text-[11px] font-semibold text-[#1E201D]">
                  <Flame className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rich Protein & Fiber</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/10 text-[11px] font-semibold text-[#1E201D]">
                  <Sparkles className="w-3.5 h-3.5 text-[#4D583F]" />
                  <span>Zero Cholesterol</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#E8EEE0] border border-[#4F534C]/10 text-[11px] font-semibold text-[#1E201D]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4D583F]" />
                  <span>Keep Frozen (-18°C)</span>
                </div>
              </div>
            </div>

            {/* Price & Add Action */}
            <div className="pt-4 border-t border-[#4F534C]/15 space-y-4">
              
              {/* Weight Selector */}
              <div>
                <span className="text-xs font-bold text-[#1E201D] mb-2 block">Select Pack Size</span>
                <div className="flex flex-wrap gap-2">
                  {weightOptions.map((opt, idx) => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedWeightIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        selectedWeightIdx === idx
                          ? 'bg-[#4D583F] text-white border-[#4D583F] shadow-md'
                          : 'bg-[#E8EEE0] text-[#61665D] border-[#4F534C]/20 hover:border-[#4D583F] hover:text-[#1E201D]'
                      }`}
                    >
                      {opt.label} {weightOptions.length > 1 ? `(₹${opt.price})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#61665D] block">Calculated Price</span>
                  <span className="text-2xl font-black text-[#4D583F]">₹{dynamicPrice}</span>
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

              <button
                onClick={handleAdd}
                className="w-full py-3.5 px-6 rounded-xl bg-[#4D583F] text-white font-bold text-sm hover:bg-[#414b35] transition-all shadow-lg flex items-center justify-center gap-2 group whitespace-nowrap flex-wrap sm:flex-nowrap"
              >
                <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Add {quantity} to Cart • ₹{dynamicPrice * quantity}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
