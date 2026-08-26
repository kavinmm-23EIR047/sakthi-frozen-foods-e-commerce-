'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ShoppingBag, Plus, Minus, ShieldCheck, Flame, Sparkles, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { fetchApi } from '@/lib/apiConfig';
import { ProductType } from '@/lib/seedData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { handleImageError } from '@/lib/imageCompressor';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`/products/${params.id}`);
        if (data.success) {
          setProduct(data.data);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8EEE0] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4D583F]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#E8EEE0] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold text-[#1E201D] mb-4">Product not found</h2>
          <button onClick={() => router.push('/shop')} className="px-6 py-2 bg-[#4D583F] text-white rounded-xl">
            Back to Shop
          </button>
        </div>
        <Footer />
      </div>
    );
  }

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
    setQuantity(1);
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-[#E8EEE0] text-[#1E201D] flex flex-col font-sans">
      <Navbar />

      <main className="site-shell py-6 sm:py-8 md:py-10 flex-1">
        {/* Breadcrumb / Back button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#61665D] hover:text-[#4D583F] font-bold text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#4F534C]/15 flex flex-col md:flex-row">
          {/* Image Side */}
          <div className="w-full md:w-1/2 relative bg-[#EAF0E5] flex items-center justify-center p-5 md:p-8 min-h-[280px]">
            <img
              src={product.image}
              alt={product.name}
              onError={handleImageError}
              className="w-full aspect-square max-h-[480px] object-cover rounded-xl shadow-sm border border-[#4F534C]/15"
            />
            <span className="absolute top-6 left-6 bg-[#4D583F] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
              {currentWeight.label}
            </span>
            {product.isPopular && (
              <span className="absolute top-6 right-6 bg-amber-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                Best Seller
              </span>
            )}
          </div>

          {/* Content Side */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col">
            <div className="flex-1 space-y-6">
              <div>
                <div className="inline-block text-xs font-bold text-[#4D583F] bg-[#EAF0E5] px-3 py-1.5 rounded-md uppercase tracking-wider mb-3">
                  {product.category}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-[#1E201D] leading-tight font-poppins">{product.name}</h1>
              </div>

              <p className="text-base text-[#61665D] leading-relaxed">
                {product.description}
              </p>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/10 text-xs font-semibold text-[#1E201D]">
                  <ShieldCheck className="w-4 h-4 text-[#4D583F]" />
                  <span>100% Plant-Based</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/10 text-xs font-semibold text-[#1E201D]">
                  <Flame className="w-4 h-4 text-amber-700" />
                  <span>Rich Protein & Fiber</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/10 text-xs font-semibold text-[#1E201D]">
                  <Sparkles className="w-4 h-4 text-[#4D583F]" />
                  <span>Zero Cholesterol</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/10 text-xs font-semibold text-[#1E201D]">
                  <ShieldCheck className="w-4 h-4 text-[#4D583F]" />
                  <span>Keep Frozen (-18°C)</span>
                </div>
              </div>
            </div>

            {/* Price & Add Action */}
            <div className="pt-8 mt-8 border-t border-[#4F534C]/15 space-y-6">
              {/* Weight Selector */}
              <div>
                <span className="text-sm font-bold text-[#1E201D] mb-3 block">Select Pack Size</span>
                <div className="flex flex-wrap gap-2.5">
                  {weightOptions.map((opt, idx) => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedWeightIdx(idx)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        selectedWeightIdx === idx
                          ? 'bg-[#4D583F] text-white border-[#4D583F] shadow-md scale-105'
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
                  <span className="text-sm text-[#61665D] block font-medium">Calculated Price</span>
                  <span className="text-3xl font-black text-[#4D583F]">₹{dynamicPrice}</span>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center border border-[#4F534C]/20 rounded-xl bg-[#E8EEE0] p-1.5 shadow-inner">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg hover:bg-white text-[#1E201D] transition-colors shadow-sm"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-5 text-lg font-bold text-[#1E201D]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg hover:bg-white text-[#1E201D] transition-colors shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full py-4 px-6 rounded-2xl bg-[#4D583F] text-white font-black text-lg hover:bg-[#414b35] transition-all shadow-xl flex items-center justify-center gap-2 group whitespace-nowrap"
              >
                <ShoppingBag className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Add {quantity} to Cart • ₹{dynamicPrice * quantity}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
