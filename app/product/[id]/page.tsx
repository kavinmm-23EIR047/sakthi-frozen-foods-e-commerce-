'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ShoppingBag, Plus, Minus, ShieldCheck, Flame, Sparkles, ArrowLeft, ChefHat } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { fetchApi } from '@/lib/apiConfig';
import { ProductType } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { handleImageError } from '@/lib/imageCompressor';
import OptimizedImage from '@/components/OptimizedImage';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductType | null>(null);
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeightIdx, setSelectedWeightIdx] = useState(0);

  function cleanBaseName(name: string): string {
    if (!name) return '';
    return name
      .toUpperCase()
      .replace(/\b(RETAIL PACK|RETAIL|REGULAR PACK|REGULAR|BULK PACK|BULK|CONSUMER PACK|CONSUMER|FOODSERVICE|ALTERNATIVE|ALTERNATIVES)\b/g, '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [singleRes, listRes] = await Promise.all([
          fetchApi(`/products/${params.id}`),
          fetchApi('/products'),
        ]);
        if (singleRes.success) {
          setProduct(singleRes.data);
        }
        if (listRes.success && Array.isArray(listRes.data)) {
          setAllProducts(listRes.data);
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
      <div className="min-h-screen bg-[#F3FBEE] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4D583F]/20 border-t-[#4D583F]"></div>
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

  // Combine Base Weight + Custom Variants + Companion Packs (Regular vs Retail)
  const baseKey = cleanBaseName(product.name);
  const companionProducts = allProducts.filter((p) => p.id !== product.id && cleanBaseName(p.name) === baseKey);

  const optionsMap = new Map<string, { label: string; weight: string; price: number; type: 'regular' | 'retail' | 'variant'; targetProduct: ProductType }>();

  // Helper to format pack label
  const formatPackLabel = (w: string, isRetail: boolean) => {
    const upper = (w || '').toUpperCase();
    if (isRetail || upper.includes('400') || upper.includes('250') || upper.includes('200')) {
      return `🛒 Retail Pack (${w})`;
    }
    return `📦 Regular Pack (${w})`;
  };

  const isCurrentRetail = (product.category || '').toUpperCase().includes('RETAIL') || (product.weight || '').includes('400');
  optionsMap.set(product.weight.trim().toUpperCase(), {
    label: formatPackLabel(product.weight || '1 KG', isCurrentRetail),
    weight: product.weight || '1 KG',
    price: product.price,
    type: isCurrentRetail ? 'retail' : 'regular',
    targetProduct: product,
  });

  // Add companion products
  for (const comp of companionProducts) {
    const isCompRetail = (comp.category || '').toUpperCase().includes('RETAIL') || (comp.weight || '').includes('400');
    const key = comp.weight.trim().toUpperCase();
    if (!optionsMap.has(key)) {
      optionsMap.set(key, {
        label: formatPackLabel(comp.weight, isCompRetail),
        weight: comp.weight,
        price: comp.price,
        type: isCompRetail ? 'retail' : 'regular',
        targetProduct: comp,
      });
    }
  }

  // Add variants if present
  if (product.variants && Array.isArray(product.variants)) {
    for (const v of product.variants) {
      const key = v.weight.trim().toUpperCase();
      if (!optionsMap.has(key)) {
        optionsMap.set(key, {
          label: formatPackLabel(v.weight, v.weight.includes('400') || v.weight.includes('250')),
          weight: v.weight,
          price: v.price,
          type: 'variant',
          targetProduct: { ...product, weight: v.weight, price: v.price },
        });
      }
    }
  }

  const weightOptions = Array.from(optionsMap.values()).sort((a, b) => {
    // Sort Retail first (smaller pack), then Regular (larger pack)
    if (a.type === 'retail' && b.type !== 'retail') return -1;
    if (a.type !== 'retail' && b.type === 'retail') return 1;
    return a.price - b.price;
  });

  const safeIdx = selectedWeightIdx >= 0 && selectedWeightIdx < weightOptions.length ? selectedWeightIdx : 0;
  const currentOption = weightOptions[safeIdx];
  const dynamicPrice = currentOption.price;

  const handleAdd = () => {
    const target = currentOption.targetProduct || product;
    const customizedProduct = {
      ...target,
      weight: currentOption.weight,
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
            <OptimizedImage
              src={product.image}
              alt={product.name}
              width={900}
              priority
              className="w-full aspect-square max-h-[480px] object-cover rounded-xl shadow-sm border border-[#4F534C]/15"
            />
            <span className="absolute top-6 left-6 bg-[#4D583F] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
              {currentOption.label}
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

              {/* Chef's Culinary Tip */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50/60 border border-amber-200/80 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <ChefHat className="w-5 h-5 text-amber-700 animate-float-subtle" />
                </div>
                <div className="text-xs text-[#4D534B] leading-relaxed">
                  <span className="font-extrabold text-amber-900 block mb-0.5">Chef&apos;s Master Recommendation:</span>
                  Thaw for 10 minutes at room temperature, then toss directly into bubbling gravies or pan-sear with herbs to seal in juicy tenderness and authentic meaty chew.
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
                  <span className="text-sm text-[#61665D] line-through block">MRP ₹{product.mrp ?? dynamicPrice}</span>
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
