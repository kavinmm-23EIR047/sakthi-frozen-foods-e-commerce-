'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Star, ShoppingBag, Plus, Minus, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getBackendPackOptions, PackOption } from '@/lib/productPacks';

export default function ProductDetailModal() {
  const router = useRouter();
  const { selectedProductForModal, setSelectedProductForModal, addToCart } = useCart();
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

  const handleAdd = () => {
    const customizedProduct = {
      ...product,
      id: currentOption.productId || product.id,
      weight: currentOption.weight,
      price: dynamicPrice,
      mrp: dynamicMrp,
    };
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
            <span className="absolute top-4 left-4 bg-[#656B4F] text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {currentOption.badge} Pack • {currentOption.weight}
            </span>
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
              
              {/* Weight Selector */}
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#3E4536] mb-2 block">
                  Select Pack Size ({weightOptions.length} available)
                </span>
                <div className="flex flex-wrap gap-2">
                  {weightOptions.map((opt, idx) => (
                    <button
                      key={opt.weight}
                      type="button"
                      onClick={() => setSelectedWeightIdx(idx)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        selectedWeightIdx === idx
                          ? 'bg-[#50563D] text-white border-[#50563D] shadow-sm'
                          : 'bg-[#E8EEE0] text-[#61665D] border-[#4F534C]/20 hover:border-[#656B4F] hover:text-[#1E201D]'
                      }`}
                    >
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${
                        selectedWeightIdx === idx
                          ? 'bg-white/20 text-white'
                          : opt.packType === 'retail' ? 'bg-amber-100 text-amber-900' : 'bg-[#D6DFC9] text-[#2D3823]'
                      }`}>
                        {opt.badge}
                      </span>
                      <span>{opt.weight}</span>
                      <span className="font-extrabold">• ₹{opt.price}</span>
                    </button>
                  ))}
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

              <button
                onClick={handleAdd}
                className="w-full min-h-11 py-3 px-4 rounded-lg bg-[#656B4F] text-white font-bold text-sm hover:bg-[#50563D] transition-all shadow-sm flex items-center justify-center gap-2 group whitespace-nowrap"
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
