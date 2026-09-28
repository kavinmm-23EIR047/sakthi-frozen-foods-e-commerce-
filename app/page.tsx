'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransparentPattyGraphic from '@/components/TransparentPattyGraphic';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { ProductType } from '@/lib/types';
import { fetchApi } from '@/lib/apiConfig';
import {
  ShieldCheck,
  Flame,
  Sparkles,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Heart,
  Utensils,
  ShoppingBag,
  Clock,
  ChefHat,
  Droplets,
  Package,
  Settings,
  Play,
  X,
  Image as ImageIcon,
  Smartphone,
  Check
} from 'lucide-react';

interface ReviewType {
  _id?: string;
  id?: string;
  authorName: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
  dateText: string;
  isGoogleReview?: boolean;
}

// Official WhatsApp Icon Component
function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

// 4 Official Hero Banner Images from User Workspace Assets
const HERO_BANNERS = [
  {
    id: 'mock-mutton',
    image: '/assets/mock-mutton.jpg',
    title: 'Flavorful Mock Mutton',
    subtitle: '100% Veg. 100% Delicious.',
    category: 'Mutton Alternatives',
    badge: 'Best Seller',
    link: '/shop?category=Mutton%20Alternatives',
  },
  {
    id: 'corn-cheese-balls',
    image: '/assets/corn-cheese-balls.jpg',
    title: 'Crispy Corn Cheese Balls',
    subtitle: '100% Veg. 100% Delicious.',
    category: 'Snacks & Starters',
    badge: 'Popular Favorite',
    link: '/shop?category=Snacks%20%26%20Starters',
  },
  {
    id: 'french-fries',
    image: '/assets/french-fries.jpg',
    title: 'Crispy French Fries',
    subtitle: 'Golden, Hot & Crunchy',
    category: 'Snacks & Starters',
    badge: 'All-Time Favorite',
    link: '/shop?category=Snacks%20%26%20Starters',
  },
  {
    id: 'sweet-corn',
    image: '/assets/sweet-corn.jpg',
    title: 'Golden Sweet Corn',
    subtitle: '100% Veg. 100% Delicious.',
    category: 'Snacks & Starters',
    badge: 'Pure Veg',
    link: '/shop?category=Snacks%20%26%20Starters',
  },
];

// FAQs Data
const FAQS = [
  {
    q: 'Is Sakthi mock meat completely plant-based?',
    a: 'Yes, all our products are 100% plant-based and contain no animal meat, hormones or antibiotics. Made purely with non-GMO soy, pea isolate, and authentic botanical spices.',
  },
  {
    q: 'Which ingredients are used?',
    a: 'We use non-GMO soy protein isolate, yellow pea protein, shiitake & oyster mushroom extracts, wheat gluten, and cold-pressed natural spices.',
  },
  {
    q: 'How should I store the products?',
    a: 'Store sealed packets at -18°C in your freezer. Shelf life is 12 months. When ready to cook, thaw for 10 minutes or add directly into hot oil or gravies.',
  },
  {
    q: 'Is it suitable for kids?',
    a: 'Absolutely! Our plant meats are rich in clean protein and natural dietary fiber with zero cholesterol, making them healthy and delicious for growing children.',
  },
];

// Recipes Data
const RECIPES = [
  {
    title: 'Mock Mutton Curry',
    time: '40 Mins',
    difficulty: 'Easy',
    image: '/assets/mock-mutton.jpg',
    category: 'Curries & Gravies',
  },
  {
    title: 'Plant Keema Biryani',
    time: '45 Mins',
    difficulty: 'Medium',
    image: '/assets/dish-mock-meat-curry.jpg',
    category: 'Special Rice',
  },
  {
    title: 'Cutlet Platter',
    time: '20 Mins',
    difficulty: 'Easy',
    image: '/assets/dish-crispy-cutlets.jpg',
    category: 'Starters',
  },
  {
    title: 'Sausage Stir Fry',
    time: '20 Mins',
    difficulty: 'Easy',
    image: '/assets/corn-cheese-balls.jpg',
    category: 'Quick Bites',
  },
];

interface PackDetail {
  type: 'regular' | 'retail';
  label: string;
  weight: string;
  price: number;
  mrp: number;
  id: string;
}

interface UnifiedProduct extends ProductType {
  baseKey: string;
  hasBothPacks: boolean;
  hasRegularPack: boolean;
  hasRetailPack: boolean;
  regularPack?: PackDetail;
  retailPack?: PackDetail;
  allPacks: PackDetail[];
  minPrice: number;
  maxPrice: number;
  minMrp: number;
  maxMrp: number;
}

function cleanBaseProductName(name: string): string {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/\b(RETAIL PACK|RETAIL|REGULAR PACK|REGULAR|BULK PACK|BULK|CONSUMER PACK|CONSUMER|FOODSERVICE|ALTERNATIVE|ALTERNATIVES)\b/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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

function formatProductDisplayName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bVeg\b/g, 'Veg')
    .replace(/\bLolipop\b/gi, 'Lollipop');
}

function isRetailItem(product: ProductType): boolean {
  const cat = (product.category || '').toUpperCase();
  const name = (product.name || '').toUpperCase();
  const desc = (product.description || '').toUpperCase();
  const weight = (product.weight || '').toUpperCase();
  return (
    cat.includes('RETAIL') ||
    name.includes('RETAIL') ||
    desc.includes('RETAIL') ||
    desc.includes('CONSUMER') ||
    weight.includes('400') ||
    weight.includes('250') ||
    weight.includes('200')
  );
}

function processUniqueProducts(rawProducts: ProductType[]): UnifiedProduct[] {
  const groups = new Map<string, ProductType[]>();

  for (const prod of rawProducts) {
    const key = cleanBaseProductName(prod.name) || prod.name.toUpperCase();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(prod);
  }

  const uniqueList: UnifiedProduct[] = [];

  for (const [baseKey, items] of Array.from(groups.entries())) {
    const primaryItem = items.find((i: ProductType) => i.image && i.image !== 'none') || items[0];
    const packMap = new Map<string, PackDetail>();

    for (const item of items) {
      const isRetail = isRetailItem(item);
      const cleanWeight = formatCleanWeight(item.weight || (isRetail ? '400g' : '1kg'));
      const key = cleanWeight.toLowerCase();

      if (!packMap.has(key)) {
        packMap.set(key, {
          type: isRetail ? 'retail' : 'regular',
          label: isRetail ? `Retail (${cleanWeight})` : `Regular (${cleanWeight})`,
          weight: cleanWeight,
          price: item.price,
          mrp: item.mrp ?? item.price,
          id: item.id,
        });
      }
    }

    const allPacks = Array.from(packMap.values()).sort((a, b) => a.price - b.price);
    const hasBothPacks = allPacks.length > 1;
    const regularPack = allPacks.find((p) => p.type === 'regular') || (hasBothPacks ? allPacks[allPacks.length - 1] : undefined);
    const retailPack = allPacks.find((p) => p.type === 'retail') || (hasBothPacks ? allPacks[0] : undefined);

    const prices = allPacks.map((p) => p.price);
    const mrps = allPacks.map((p) => p.mrp);

    const minPrice = prices.length ? Math.min(...prices) : primaryItem.price;
    const maxPrice = prices.length ? Math.max(...prices) : primaryItem.price;
    const minMrp = mrps.length ? Math.min(...mrps) : (primaryItem.mrp ?? primaryItem.price);
    const maxMrp = mrps.length ? Math.max(...mrps) : (primaryItem.mrp ?? primaryItem.price);

    const isPopular = items.some((i: ProductType) => i.isPopular);

    uniqueList.push({
      ...primaryItem,
      name: formatProductDisplayName(baseKey || primaryItem.name),
      isPopular,
      baseKey,
      hasBothPacks,
      hasRegularPack: Boolean(regularPack && hasBothPacks),
      hasRetailPack: Boolean(retailPack && hasBothPacks),
      regularPack,
      retailPack,
      allPacks,
      minPrice,
      maxPrice,
      minMrp,
      maxMrp,
    });
  }

  return uniqueList.sort((a, b) => {
    if (a.isPopular && !b.isPopular) return -1;
    if (!a.isPopular && b.isPopular) return 1;
    return a.name.localeCompare(b.name);
  });
}

export default function StorefrontHomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [heroDishIndex, setHeroDishIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [topProducts, setTopProducts] = useState<UnifiedProduct[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<{ name: string; img: string; subtitle?: string }[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [savedProducts, setSavedProducts] = useState<Record<string, boolean>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    authorName: '',
    location: '',
    rating: 5,
    comment: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const recipeScrollRef = useRef<HTMLDivElement>(null);

  // Auto-rotating Hero Banner Slider
  useEffect(() => {
    if (isHeroHovered) return;
    const interval = setInterval(() => {
      setHeroDishIndex((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHeroHovered]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, revRes] = await Promise.all([
          fetchApi('/products'),
          fetchApi('/categories'),
          fetchApi('/reviews'),
        ]);

        if (prodRes.success && Array.isArray(prodRes.data)) {
          const processed = processUniqueProducts(prodRes.data);
          setTopProducts(processed);
        }

        if (catRes.success && Array.isArray(catRes.data)) {
          const cats = catRes.data.map((c: any) => ({
            name: c.name,
            img: c.image || '',
            subtitle: c.description || '100% Plant-Based',
          }));
          setFeaturedCategories(cats);
        }

        if (revRes.success && Array.isArray(revRes.data)) {
          setReviews(revRes.data);
        }
      } catch (err) {
        console.error('Error fetching homepage data from backend:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleSaveProduct = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedProducts((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!savedProducts[id]) showToast('Saved to favorites!', 'success');
  };

  const handleAddToCart = (product: UnifiedProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`Added ${product.name} to cart!`, 'success');
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const nextHeroSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHeroDishIndex((prev) => (prev + 1) % HERO_BANNERS.length);
  };

  const prevHeroSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHeroDishIndex((prev) => (prev > 0 ? prev - 1 : HERO_BANNERS.length - 1));
  };

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.authorName || !reviewForm.comment) {
      showToast('Please fill in your Name and Review comment.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetchApi('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          ...reviewForm,
          isGoogleReview: true,
          dateText: 'Just now',
        }),
      });

      if (res.success) {
        setReviews((prev) => [res.data, ...prev]);
        showToast('Thank you! Your Review has been posted.', 'success');
        setIsReviewModalOpen(false);
        setReviewForm({ authorName: '', location: '', rating: 5, comment: '' });
      } else {
        showToast('Failed to post review: ' + res.error, 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error posting review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const displayReviews = reviews.length > 0 ? reviews : [
    {
      authorName: 'Priya S.',
      location: 'Chennai',
      rating: 5,
      comment: 'The taste and texture are amazing! Finally a plant-based option that feels like real meat. My whole family loves it.',
      avatar: '',
      dateText: '1 week ago',
    },
    {
      authorName: 'Arjun Verma',
      location: 'Bengaluru',
      rating: 5,
      comment: 'Sakthi Mock Mutton is a game-changer! The texture absorbs Chettinad spices deeply without crumbling.',
      avatar: '',
      dateText: '2 weeks ago',
    },
    {
      authorName: 'Divya N.',
      location: 'Coimbatore',
      rating: 5,
      comment: 'Crispy Veg Chicken Cutlets are our kid’s absolute favorite evening snack. Clean ingredients and zero guilt.',
      avatar: '',
      dateText: '3 weeks ago',
    }
  ];

  const currentHeroBanner = HERO_BANNERS[heroDishIndex] || HERO_BANNERS[0];

  return (
    <div className="min-h-screen bg-[#FBFDF5] text-[#1E201D] flex flex-col font-sans selection:bg-[#2F3D27] selection:text-white relative">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative bg-[#FBFDF5] overflow-hidden border-b border-stone-200/60">
          
          {/* ======================= MOBILE & TABLET LAYOUT (< lg) ======================= */}
          <div className="lg:hidden px-4 sm:px-6 pt-5 pb-6 space-y-4">
            
            {/* Mobile Header Copy */}
            <div className="text-left space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2E3] text-[#2E7D32] text-xs font-extrabold uppercase tracking-wider w-fit shadow-2xs">
                <Leaf className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>100% Plant-Based</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-[1.1] text-[#1E201D] font-display">
                Authentic Taste, <br />
                <span className="text-[#2F3D27]">A Kinder Tomorrow.</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#5A6355] font-medium leading-relaxed max-w-md">
                Enjoy rich taste and satisfying texture made purely from plants — for a healthier you and planet.
              </p>
            </div>

            {/* Mobile Full-Width Uncropped Banner Carousel */}
            <div
              className="relative w-full aspect-[4/3] xs:aspect-[16/11] sm:aspect-[16/10] max-h-[380px] rounded-2xl overflow-hidden shadow-xl bg-black/90 group select-none"
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            >
              <img
                src={currentHeroBanner.image}
                alt={currentHeroBanner.title}
                className="w-full h-full object-cover object-center transition-all duration-700"
              />

              {/* Bottom Gradient for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

              {/* Slider Prev / Next Controls */}
              <button
                onClick={prevHeroSlide}
                aria-label="Previous Slide"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center shadow-lg active:scale-95 z-20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextHeroSlide}
                aria-label="Next Slide"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center shadow-lg active:scale-95 z-20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Bottom Bar: Dish Info + Floating Shop Now CTA + Dots */}
              <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-extrabold text-white block truncate">
                    {currentHeroBanner.title}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#4ADE80] font-bold block truncate">
                    {currentHeroBanner.subtitle}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={currentHeroBanner.link || "/shop"}
                    className="px-3.5 py-1.5 rounded-full bg-[#2E7D32] hover:bg-[#1EA74F] text-white font-extrabold text-xs shadow-md active:scale-95 flex items-center gap-1"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* Indicator Dots */}
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                    {HERO_BANNERS.map((banner, dotIdx) => (
                      <button
                        key={banner.id}
                        onClick={() => setHeroDishIndex(dotIdx)}
                        className={`transition-all duration-300 rounded-full ${
                          heroDishIndex === dotIdx
                            ? 'w-4 h-1.5 bg-[#4ADE80]'
                            : 'w-1.5 h-1.5 bg-white/50'
                        }`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Dish Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {HERO_BANNERS.map((banner, idx) => (
                <button
                  key={banner.id}
                  onClick={() => setHeroDishIndex(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    heroDishIndex === idx
                      ? 'bg-[#202D1B] text-white shadow-sm'
                      : 'bg-stone-200/80 hover:bg-stone-300 text-stone-700'
                  }`}
                >
                  {banner.title}
                </button>
              ))}
            </div>

            {/* 4 Feature Badges Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D3527]">
                <div className="w-6 h-6 rounded-full bg-[#EAF2E3] text-[#2E7D32] flex items-center justify-center shrink-0">
                  <Leaf className="w-3 h-3" />
                </div>
                <span>100% Plant Based</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D3527]">
                <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                </div>
                <span>No Hormones</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D3527]">
                <div className="w-6 h-6 rounded-full bg-[#EAF2E3] text-[#2E7D32] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span>Good for Planet</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D3527]">
                <div className="w-6 h-6 rounded-full bg-[#EAF2E3] text-[#2E7D32] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span>Rich in Protein</span>
              </div>
            </div>

          </div>

          {/* ======================= DESKTOP LAYOUT (>= lg) ======================= */}
          <div className="hidden lg:grid w-full max-w-[1440px] mx-auto grid-cols-12 min-h-[660px]">
            
            {/* Left Column: Copy, Actions, Trust Badges & Product Tabs */}
            <div className="col-span-6 flex flex-col justify-center py-16 pl-12 pr-8 text-left z-10 space-y-6">
              
              {/* 100% Plant-Based Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF2E3] text-[#2E7D32] text-xs font-extrabold uppercase tracking-wider w-fit shadow-2xs">
                <Leaf className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>100% Plant-Based</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl lg:text-[54px] xl:text-[60px] font-black tracking-tight leading-[1.08] text-[#1E201D] font-display">
                Authentic Taste <br />
                <span className="text-[#2F3D27]">A Kinder Tomorrow.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base text-[#5A6355] max-w-lg font-medium leading-relaxed">
                Enjoy the same rich taste and satisfying texture as real meat — made from plants, for a healthier you and a healthier planet.
              </p>

              {/* CTA Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-4">
                <Link
                  href="/shop"
                  className="px-8 py-3.5 rounded-full bg-[#202D1B] hover:bg-[#151F12] text-white font-black text-sm transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-its-made"
                  className="px-7 py-3.5 rounded-full bg-white hover:bg-[#F2F6ED] text-[#1E201D] font-bold text-sm border border-stone-300 transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-[#202D1B] text-[#202D1B]" />
                  <span>Watch Our Story</span>
                </a>
              </div>

              {/* 4 Feature Badges Row */}
              <div className="pt-4 grid grid-cols-4 gap-3 border-t border-stone-200">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D3527]">
                  <div className="w-7 h-7 rounded-full bg-[#EAF2E3] text-[#2E7D32] flex items-center justify-center shrink-0">
                    <Leaf className="w-3.5 h-3.5" />
                  </div>
                  <span>100% Plant Based</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#2D3527]">
                  <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  </div>
                  <span>No Hormones</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#2D3527]">
                  <div className="w-7 h-7 rounded-full bg-[#EAF2E3] text-[#2E7D32] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span>Good for Planet</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#2D3527]">
                  <div className="w-7 h-7 rounded-full bg-[#EAF2E3] text-[#2E7D32] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Rich in Protein</span>
                </div>
              </div>

              {/* Quick Product Tabs Selector */}
              <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {HERO_BANNERS.map((banner, idx) => (
                  <button
                    key={banner.id}
                    onClick={() => setHeroDishIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      heroDishIndex === idx
                        ? 'bg-[#202D1B] text-white shadow-sm'
                        : 'bg-stone-200/80 hover:bg-stone-300 text-stone-700'
                    }`}
                  >
                    {banner.title}
                  </button>
                ))}
              </div>

            </div>

            {/* Right Column: Full-Height, Full-Width Edge-to-Edge Image Showcase */}
            <div
              className="col-span-6 relative w-full h-full min-h-[660px] overflow-hidden group select-none"
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            >
              {/* Full Bleed Image */}
              <img
                src={currentHeroBanner.image}
                alt={currentHeroBanner.title}
                className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-103"
              />

              {/* Subtle Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#FBFDF5]/20 via-transparent to-transparent pointer-events-none" />

              {/* Slider Prev / Next Controls */}
              <button
                onClick={prevHeroSlide}
                aria-label="Previous Slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center shadow-xl transition-all opacity-0 group-hover:opacity-100 active:scale-95 z-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextHeroSlide}
                aria-label="Next Slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center shadow-xl transition-all opacity-0 group-hover:opacity-100 active:scale-95 z-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Bottom Overlay Info & Slide Indicator Dots */}
              <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-white border border-white/20 shadow-lg text-left">
                  <span className="text-sm font-extrabold block">
                    {currentHeroBanner.title}
                  </span>
                  <span className="text-xs text-[#4ADE80] font-bold block">
                    {currentHeroBanner.subtitle}
                  </span>
                </div>

                {/* Indicator Dots */}
                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-2 rounded-full border border-white/20">
                  {HERO_BANNERS.map((banner, dotIdx) => (
                    <button
                      key={banner.id}
                      onClick={() => setHeroDishIndex(dotIdx)}
                      className={`transition-all duration-300 rounded-full ${
                        heroDishIndex === dotIdx
                          ? 'w-6 h-2 bg-[#4ADE80]'
                          : 'w-2 h-2 bg-white/50 hover:bg-white'
                      }`}
                      aria-label={`Go to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SHOP BY CATEGORY SECTION (Horizontal Slider on Mobile & Desktop) */}
        {/* ========================================================================= */}
        <section className="py-10 md:py-14 site-shell">
          {/* Header Row */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E201D] tracking-tight font-display">
                Shop by Category
              </h2>
              <p className="text-xs sm:text-sm text-[#61665D] mt-0.5">
                Delicious plant-based options for every meal.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/shop" className="text-xs font-extrabold text-[#202D1B] hover:underline flex items-center gap-1">
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollContainer(categoryScrollRef, 'left')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollContainer(categoryScrollRef, 'right')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories Horizontal Carousel */}
          <div
            ref={categoryScrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {(featuredCategories.length > 0
              ? featuredCategories
              : [
                  { name: 'Mock Mutton', subtitle: 'Rich & Spicy', img: '/assets/mock-mutton.jpg' },
                  { name: 'Kebabs & Cutlets', subtitle: 'Ready to Cook', img: '/assets/dish-crispy-cutlets.jpg' },
                  { name: 'Chunks', subtitle: 'Versatile & Juicy', img: '/assets/corn-cheese-balls.jpg' },
                  { name: 'Minced', subtitle: 'Perfect for Recipes', img: '/assets/dish-mock-meat-curry.jpg' },
                  { name: 'Sausages', subtitle: 'High Protein', img: '/assets/french-fries.jpg' },
                  { name: 'Nuggets & Bites', subtitle: 'Kids Favorite', img: '/assets/sweet-corn.jpg' },
                ]
            ).map((cat, idx) => (
              <Link
                key={idx}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all p-3 flex flex-col justify-between w-[150px] sm:w-[180px] shrink-0 snap-start hover:-translate-y-0.5"
              >
                {/* Category Image Box */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-50 mb-2.5 flex items-center justify-center border border-stone-100">
                  {cat.img ? (
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#F4F7F0]">
                      <Utensils className="w-6 h-6 text-[#2E7D32] mb-1" />
                      <span className="text-[10px] font-bold text-[#2E7D32]">{cat.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-extrabold text-xs sm:text-sm text-[#1E201D] group-hover:text-[#202D1B] transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-[#202D1B] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-[10px] text-[#61665D] mt-0.5 line-clamp-1">{cat.subtitle || '100% Pure Veg'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. "GOOD FOOD DOES GOOD" & 3 IMPACT STATS (Exact Figma Layout & Colors) */}
        {/* ========================================================================= */}
        <section className="py-6 md:py-10 site-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left Card: Good Food Does Good (Spans 7 Cols with Organic Plate Backdrop) */}
            <div className="lg:col-span-7 bg-[#EAF3E7] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center gap-6 lg:gap-8 shadow-xs border border-[#DFEBE0] text-left relative overflow-hidden">
              
              {/* Organic Watercolor Green Backdrop Splash & Plate */}
              <div className="relative shrink-0 flex items-center justify-center w-44 sm:w-52 md:w-60 aspect-square">
                {/* Custom organic watercolor blob background behind plate */}
                <div className="absolute inset-0 bg-[#CDE8C9]/70 rounded-[40%_60%_70%_30%_/_40%_50%_60%_55%] blur-sm scale-110 pointer-events-none" />
                <div className="absolute -top-3 -left-3 w-24 h-24 bg-[#B8E2B2]/60 rounded-[60%_40%_30%_70%_/_50%_60%_40%_50%] blur-md pointer-events-none" />
                <div className="absolute -bottom-2 -right-2 w-28 h-28 bg-[#D6EED2]/80 rounded-[50%_50%_60%_40%_/_60%_40%_50%_50%] blur-sm pointer-events-none" />
                
                {/* Plate Image with transparent/seamless blending */}
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-xl z-10">
                  <img
                    src="/assets/good-food-plate.jpg"
                    alt="Good Food Does Good"
                    className="w-full h-full object-cover object-center scale-105 hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-3 flex-1 z-10">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#DFEDE0] border border-[#2E7D32]/25 text-[#2E7D32] text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                  <Leaf className="w-3 h-3 text-[#2E7D32]" />
                  <span>Why Sakthi!</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#182B17] font-display tracking-tight leading-tight">
                  Good Food Does Good
                </h3>

                <p className="text-xs sm:text-sm text-[#4E5E4C] leading-relaxed font-medium">
                  We create plant-based meats that taste amazing, nourish your body, and reduce environmental impact.
                </p>

                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-stone-50 text-[#182B17] font-extrabold text-xs shadow-md shadow-black/5 border border-stone-200/80 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2E7D32] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Card: Unified Single Card for 3 Planet Impact Metrics */}
            <div className="lg:col-span-5 bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between gap-6">
              
              {/* Top Row: 2 Metrics (Land & Water) with Custom Organic Radius Badges */}
              <div className="grid grid-cols-2 gap-4">
                {/* 90% Less Land Usage */}
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <div className="w-13 h-13 rounded-[16px_24px_18px_26px] bg-[#E6F4EA] text-[#2E7D32] flex items-center justify-center mb-2.5 shadow-2xs">
                    <svg className="w-6 h-6 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 2L5 10h4l-3 6h5v4h2v-4h5l-3-6h4L12 2z" />
                    </svg>
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#182B17] font-display tracking-tight">90%</span>
                  <span className="text-xs font-bold text-[#556953] mt-0.5">Less Land Usage</span>
                </div>

                {/* 85% Less Fresh Water */}
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <div className="w-13 h-13 rounded-[24px_16px_26px_18px] bg-[#E1F3FE] text-[#0288D1] flex items-center justify-center mb-2.5 shadow-2xs">
                    <svg className="w-6 h-6 text-[#0288D1]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#182B17] font-display tracking-tight">85%</span>
                  <span className="text-xs font-bold text-[#556953] mt-0.5">Less Fresh Water</span>
                </div>
              </div>

              {/* Bottom Row: 1 Centered Metric (80% Lower CO2 Emissions) with Custom Organic Badge */}
              <div className="flex flex-col items-center justify-center text-center pb-2">
                <div className="w-13 h-13 rounded-[20px_26px_16px_24px] bg-[#FDEEE9] text-[#E65100] flex items-center justify-center mb-2 shadow-2xs">
                  <svg className="w-6 h-6 text-[#E65100]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z" />
                    <path d="M9 12.5h1.5a1.5 1.5 0 011.5 1.5v0a1.5 1.5 0 01-1.5 1.5H8" />
                    <path d="M13 12.5h1a1.5 1.5 0 011.5 1.5v0a1.5 1.5 0 01-1.5 1.5h-1" />
                  </svg>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#182B17] font-display tracking-tight">80%</span>
                <span className="text-xs font-bold text-[#556953] mt-0.5">Lower CO₂ Emissions</span>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. FEATURED PRODUCTS SECTION (Mobile Horizontal Scroll / Desktop 4-Col Grid) */}
        {/* ========================================================================= */}
        <section className="py-10 md:py-14 site-shell">
          {/* Header Row */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E201D] tracking-tight font-display">
                Featured Products
              </h2>
              <p className="text-xs sm:text-sm text-[#61665D] mt-0.5">
                Our most-loved plant-based meats, chosen by customers like you.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/shop" className="text-xs font-extrabold text-[#202D1B] hover:underline flex items-center gap-1">
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollContainer(productScrollRef, 'left')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollContainer(productScrollRef, 'right')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Cards: Horizontal Swipeable on Mobile, 4-Col Grid on Large */}
          <div
            ref={productScrollRef}
            className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-hide"
          >
            {topProducts.slice(0, 4).map((p, idx) => (
              <div
                key={p.id || idx}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all p-3.5 flex flex-col justify-between group relative w-[220px] sm:w-auto shrink-0 snap-start"
              >
                {/* Product Image Box */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-50 mb-3 border border-stone-100 flex items-center justify-center">
                  <Link href={`/product/${p.id}`} className="w-full h-full block">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#F4F7F0]">
                        <Utensils className="w-8 h-8 text-[#2E7D32]/60 mb-2" />
                        <span className="text-xs font-bold text-[#2E7D32]">{p.name}</span>
                      </div>
                    )}
                  </Link>

                  {/* Heart Save Button */}
                  <button
                    onClick={(e) => toggleSaveProduct(e, p.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-rose-600 transition-colors shadow-2xs"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${savedProducts[p.id] ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-1 mb-3">
                  <Link href={`/product/${p.id}`}>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#1E201D] group-hover:text-[#202D1B] transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-[11px] text-[#61665D] line-clamp-1">
                    {p.description || 'Juicy, tender and full of authentic flavor.'}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-black text-sm text-[#1E201D]">₹{p.price}</span>
                      {p.mrp && p.mrp > p.price && (
                        <span className="text-[10px] text-stone-400 line-through">₹{p.mrp}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>4.8 (120)</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => handleAddToCart(p, e)}
                  className="w-full py-2.5 rounded-xl bg-[#202D1B] hover:bg-[#151F12] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. "HOW SAKTHI MOCK MEAT IS MADE" (Clean Horizontal Ribbon on Mobile & Desktop) */}
        {/* ========================================================================= */}
        <section id="how-its-made" className="py-4 md:py-6 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full bg-[#0D2413] text-white rounded-[20px] sm:rounded-[24px] py-4 sm:py-5 px-4 sm:px-8 lg:px-10 relative overflow-hidden shadow-xl border border-[#1A3D21]">
            
            {/* Background Botanical Leaf Silhouettes & Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
              <div className="absolute -left-16 -top-16 w-48 h-48 bg-[#34D399]/20 rounded-full blur-3xl" />
              <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-60 h-60 bg-[#25D366]/15 rounded-full blur-3xl" />
            </div>

            {/* Always Horizontal Layout: Left Content & Right Patty Graphic */}
            <div className="relative z-10 flex flex-row items-center justify-between gap-2.5 sm:gap-6 lg:gap-8">
              
              {/* Left & Center: Title + 4 Step Pipeline */}
              <div className="flex-1 min-w-0 space-y-2 sm:space-y-3 text-left">
                
                {/* Header Tagline & Title */}
                <div>
                  <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-[#13331A] border border-[#2EA043]/40 text-[#4ADE80] text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#4ADE80]" />
                    <span>From Plants to Your Plate</span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-x-2 sm:gap-x-3 gap-y-0.5 mt-0.5 sm:mt-1">
                    <h2 className="text-sm xs:text-base sm:text-2xl lg:text-[26px] font-black text-white tracking-tight font-display leading-tight">
                      How Sakthi Mock Meat Is Made
                    </h2>
                    <span className="text-[10px] sm:text-xs text-[#B4CEB1] font-medium hidden md:inline-block">
                      — Simple ingredients. Advanced processes. Real taste.
                    </span>
                  </div>
                </div>

                {/* 4 Process Steps in Balanced Grid (Zero Empty Gaps) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 pt-1.5 sm:pt-2.5 border-t border-[#1F4525]/60">
                  
                  {/* Step 01 */}
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 rounded-full bg-[#1EA74F] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 mt-0.5">
                      <Leaf className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-black text-[#4ADE80] uppercase tracking-wider block">01</span>
                      <h4 className="font-extrabold text-[9px] xs:text-[10px] sm:text-[13px] text-white leading-tight truncate">
                        Select Proteins
                      </h4>
                      <p className="hidden xs:block text-[8px] xs:text-[9px] sm:text-[11px] text-[#A6BAA2] leading-none sm:leading-snug font-normal truncate">
                        Soy &amp; pea isolate.
                      </p>
                    </div>
                  </div>

                  {/* Step 02 */}
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 rounded-full bg-[#1EA74F] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 mt-0.5">
                      <Settings className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-black text-[#4ADE80] uppercase tracking-wider block">02</span>
                      <h4 className="font-extrabold text-[9px] xs:text-[10px] sm:text-[13px] text-white leading-tight truncate">
                        Process &amp; Blend
                      </h4>
                      <p className="hidden xs:block text-[8px] xs:text-[9px] sm:text-[11px] text-[#A6BAA2] leading-none sm:leading-snug font-normal truncate">
                        Creating real texture.
                      </p>
                    </div>
                  </div>

                  {/* Step 03 */}
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 rounded-full bg-[#1EA74F] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 mt-0.5">
                      <ChefHat className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-black text-[#4ADE80] uppercase tracking-wider block">03</span>
                      <h4 className="font-extrabold text-[9px] xs:text-[10px] sm:text-[13px] text-white leading-tight truncate">
                        Shape &amp; Season
                      </h4>
                      <p className="hidden xs:block text-[8px] xs:text-[9px] sm:text-[11px] text-[#A6BAA2] leading-none sm:leading-snug font-normal truncate">
                        Pure natural spices.
                      </p>
                    </div>
                  </div>

                  {/* Step 04 */}
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 rounded-full bg-[#1EA74F] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20 mt-0.5">
                      <Package className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-black text-[#4ADE80] uppercase tracking-wider block">04</span>
                      <h4 className="font-extrabold text-[9px] xs:text-[10px] sm:text-[13px] text-white leading-tight truncate">
                        Pack with Care
                      </h4>
                      <p className="hidden xs:block text-[8px] xs:text-[9px] sm:text-[11px] text-[#A6BAA2] leading-none sm:leading-snug font-normal truncate">
                        Retaining fresh aroma.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Side: Patty Cutout Graphic + Attached Doodle with Zero Gap */}
              <div className="relative shrink-0 flex items-center justify-center">
                
                {/* Patty Container */}
                <div className="relative w-24 xs:w-28 sm:w-36 md:w-44 h-24 xs:h-28 sm:h-36 md:h-44 flex items-center justify-center">
                  
                  {/* Chalk Doodle Annotation directly positioned with arrow pointing into top patty */}
                  <div className="absolute top-0 -left-6 xs:-left-8 sm:-left-10 z-20 text-left pointer-events-none select-none">
                    <div className="font-serif italic leading-none space-y-0.5">
                      <span className="text-[#6EE7B7] text-[8px] xs:text-[9px] sm:text-[11px] font-bold block whitespace-nowrap drop-shadow-sm">
                        * Real Taste
                      </span>
                      <span className="text-white text-[8px] xs:text-[9px] sm:text-[11px] font-extrabold block whitespace-nowrap drop-shadow-sm">
                        Plant Power
                      </span>
                    </div>
                    {/* Chalk arrow directly pointing into the top burger patty */}
                    <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 text-white stroke-current fill-none -rotate-6 mt-0.5 ml-1 drop-shadow-sm" viewBox="0 0 54 54">
                      <path
                        d="M 6 8 C 18 16, 24 32, 18 42 C 22 46, 34 44, 48 36"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M 36 32 L 48 36 L 42 48"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Patty Graphic */}
                  <TransparentPattyGraphic
                    src="/assets/sakthi-mock-meat-exact.jpg"
                    alt="Real Taste Plant Power Mock Meat Patties"
                    className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-300"
                  />
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. "TASTY RECIPES" SECTION (Horizontal Mobile Slider) */}
        {/* ========================================================================= */}
        <section className="py-10 md:py-14 site-shell">
          {/* Header Row */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E201D] tracking-tight font-display">
                Tasty Recipes
              </h2>
              <p className="text-xs sm:text-sm text-[#61665D] mt-0.5">
                Simple recipes with big flavors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/shop" className="text-xs font-extrabold text-[#202D1B] hover:underline flex items-center gap-1">
                <span>View All Recipes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollContainer(recipeScrollRef, 'left')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollContainer(recipeScrollRef, 'right')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Recipes 4-Column Grid / Mobile Horizontal Scroll */}
          <div
            ref={recipeScrollRef}
            className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-hide"
          >
            {RECIPES.map((recipe, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all p-3 flex flex-col group cursor-pointer w-[220px] sm:w-auto shrink-0 snap-start"
              >
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-50 mb-2.5">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-[#202D1B]/90 backdrop-blur-xs text-white text-[10px] font-bold">
                    {recipe.category}
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-[#1E201D] group-hover:text-[#202D1B] transition-colors mb-1 line-clamp-1">
                  {recipe.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-[#61665D] font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#2E7D32]" />
                    {recipe.time}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="w-3.5 h-3.5 text-[#2E7D32]" />
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. "LOVED BY CUSTOMERS" & "FAQS" 2-COLUMN SECTION (Exact Figma Connected Layout) */}
        {/* ========================================================================= */}
        <section className="py-10 md:py-14 site-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            {/* Left Column: Loved by Customers (Sage Container with Floating White Card) */}
            <div className="lg:col-span-5 bg-[#EAF3E7] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border border-[#DFEBE0] shadow-xs flex flex-col justify-between text-left relative overflow-hidden">
              
              {/* Header */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#182B17] tracking-tight font-display">
                  Loved by Customers
                </h2>
                <p className="text-xs sm:text-sm text-[#4E5E4C] font-medium">
                  Join thousands of happy customers choosing a healthier lifestyle.
                </p>
              </div>

              {/* Floating White Review Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs border border-stone-200/80 my-5 relative">
                {/* 5 Gold Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(displayReviews[activeReviewIndex]?.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-[#2C382A] font-medium leading-relaxed italic">
                  &ldquo;{displayReviews[activeReviewIndex]?.comment}&rdquo;
                </p>

                {/* Author Info & Navigation Arrows */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E0ECE0] text-[#2E7D32] font-black text-xs flex items-center justify-center border border-[#2E7D32]/30 overflow-hidden shadow-2xs shrink-0">
                      {displayReviews[activeReviewIndex]?.authorName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-[#182B17] leading-tight">
                        {displayReviews[activeReviewIndex]?.authorName}
                      </h4>
                      <p className="text-[11px] text-[#61665D]">
                        {displayReviews[activeReviewIndex]?.location || 'Chennai'}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setActiveReviewIndex((prev) => (prev > 0 ? prev - 1 : displayReviews.length - 1))
                      }
                      className="w-7 h-7 rounded-full bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-stone-700 hover:bg-stone-50 hover:text-black transition-colors"
                      aria-label="Previous review"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveReviewIndex((prev) => (prev + 1) % displayReviews.length)
                      }
                      className="w-7 h-7 rounded-full bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-stone-700 hover:bg-stone-50 hover:text-black transition-colors"
                      aria-label="Next review"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Carousel Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {displayReviews.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveReviewIndex(dotIdx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeReviewIndex === dotIdx ? 'w-5 bg-[#182B17]' : 'w-1.5 bg-stone-300'
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Frequently Asked Questions */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="flex items-end justify-between">
                <div className="text-left space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#182B17] tracking-tight font-display">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4E5E4C] font-medium">
                    Find answers to common questions.
                  </p>
                </div>
                <Link href="/shop" className="text-xs font-extrabold text-[#182B17] hover:text-[#2E7D32] flex items-center gap-1 transition-colors pb-1">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Accordion List */}
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-stone-200/80 bg-white shadow-2xs transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 sm:p-4.5 text-left font-bold text-xs sm:text-sm text-[#182B17] flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#182B17] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-[#4ADE80]" />
                          </div>
                          <span className="font-extrabold text-[#182B17] group-hover:text-[#2E7D32] transition-colors">
                            {faq.q}
                          </span>
                        </div>
                        <span className="text-[#182B17] font-extrabold text-base shrink-0">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 text-xs text-[#555C52] leading-relaxed border-t border-stone-100 text-left">
                          <p className="pt-2">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. "JOIN OUR SAKTHI WHATSAPP COMMUNITY" (Sleek Horizontal on Mobile & Desktop) */}
        {/* ========================================================================= */}
        <section className="pb-10 md:pb-16 site-shell">
          <div className="w-full rounded-[24px] sm:rounded-[36px] bg-[#182D18] text-white py-4 sm:py-5 px-4 sm:px-8 lg:px-10 border border-[#244224] shadow-2xl relative overflow-hidden flex flex-row items-center justify-between gap-3 sm:gap-6 lg:gap-8">
            
            {/* Background Ambient Glow & Subtle Leaf SVGs for organic texture */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
              <div className="absolute -left-16 -top-16 w-64 h-64 bg-[#34D399]/20 rounded-full blur-3xl" />
              <div className="absolute right-1/3 top-1/2 -translate-y-1/2 w-64 h-64 bg-[#25D366]/15 rounded-full blur-3xl" />
              {/* Subtle decorative leaf silhouette paths */}
              <svg className="absolute left-1/4 -bottom-10 w-44 h-44 text-[#284926]/40 rotate-12" viewBox="0 0 200 200" fill="currentColor">
                <path d="M44.5,150.8C-5.5,100.8,12.2,22.2,95.5,5.5c83.3-16.7,111.1,66.7,61.1,116.7C106.6,172.2,94.5,200.8,44.5,150.8z" />
              </svg>
            </div>

            {/* Left Side: WhatsApp Logo + Headline & CTA Button in compact layout */}
            <div className="flex-1 min-w-0 z-10 text-left space-y-2">
              <div className="flex items-center gap-2.5 sm:gap-4">
                <div className="w-8 h-8 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#25D366]/40 border border-white/20">
                  <WhatsAppIcon className="w-4 h-4 sm:w-7 sm:h-7 text-white drop-shadow-xs" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-lg lg:text-2xl font-extrabold text-white font-display tracking-tight leading-tight">
                    Join Our WhatsApp
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#CDE0CB] line-clamp-1 mt-0.5 font-medium">
                    Updates, recipes &amp; offers.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-0.5 sm:pt-1">
                <a
                  href="https://wa.me/919876543210?text=Hi%20Sakthi%20Plant%20Meats!%20I%20want%20to%20join%20the%20WhatsApp%20community."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full bg-[#F4F7F2] hover:bg-white text-[#182D18] font-extrabold text-[11px] sm:text-xs transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 group"
                >
                  <span>Join Group</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#182D18] group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Right Side: Seamless Hand Holding Smartphone with Fresh Mint Leaves (Transparent Cutout) */}
            <div className="relative shrink-0 flex items-center justify-end z-10 -my-4 -mr-3 sm:-mr-6 lg:-mr-8">
              <div className="w-28 sm:w-44 md:w-56 lg:w-64 h-24 sm:h-36 md:h-40 overflow-visible flex items-center justify-end">
                <img
                  src="/assets/whatsapp-phone-nobg.png"
                  alt="Sakthi WhatsApp Community on Smartphone"
                  className="w-full h-full object-contain object-right scale-105 hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200">
            <div className="bg-[#202D1B] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#4ADE80]" />
                <h3 className="font-bold text-sm">Write a Customer Review</h3>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1E201D] mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={reviewForm.authorName}
                  onChange={(e) => setReviewForm({ ...reviewForm, authorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#202D1B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1E201D] mb-1">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai, Tamil Nadu"
                  value={reviewForm.location}
                  onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#202D1B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1E201D] mb-1">Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewForm.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-extrabold text-[#1E201D] text-xs ml-2">{reviewForm.rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1E201D] mb-1">Your Review *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share your experience cooking Sakthi Plant-Based Meats..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#202D1B]"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 text-[#1E201D] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-xl bg-[#202D1B] text-white font-bold text-xs hover:bg-[#151F12] transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
