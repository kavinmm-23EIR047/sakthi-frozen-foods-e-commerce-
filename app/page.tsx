'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { ProductType } from '@/lib/seedData';
import { fetchApi } from '@/lib/apiConfig';
import {
  Plus,
  Eye,
  ShieldCheck,
  Flame,
  Truck,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Award,
  Leaf,
  Zap,
  Heart,
  Utensils,
  MessageSquare,
  Gift,
  ShoppingBag,
  RefreshCw,
  ThumbsUp,
  X,
  PlusCircle,
  MapPin,
  Clock,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { handleImageError } from '@/lib/imageCompressor';

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

// Official Google Logo Icon Component
function GoogleGLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// Official WhatsApp Icon Component
function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

// Background Decorative Icons & Pattern Watermarks Component
function DecorativeBackgroundElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Abstract Background SVG Grid Pattern */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1.5" fill="#1E201D" />
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E201D" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Floating Geometric Orbs & Icon Watermarks */}
      <div className="absolute top-12 left-[5%] text-[#4D583F]/10 animate-bounce duration-[6000ms]">
        <Leaf className="w-24 h-24 rotate-12" />
      </div>
      <div className="absolute top-96 right-[4%] text-[#8E9D64]/10 animate-pulse duration-[8000ms]">
        <Flame className="w-32 h-32 -rotate-12" />
      </div>
      <div className="absolute bottom-32 left-[8%] text-[#4D583F]/10">
        <Utensils className="w-28 h-28 rotate-45" />
      </div>
      <div className="absolute bottom-10 right-[10%] text-[#8E9D64]/10 animate-bounce duration-[7000ms]">
        <Award className="w-24 h-24" />
      </div>

      {/* Geometric Ring Dividers */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] border border-[#4D583F]/5 rounded-full" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] border border-[#4D583F]/5 rounded-full" />
    </div>
  );
}

// FAQs Data
const FAQS = [
  {
    q: 'Does Sakthi Plant-Based Meat taste like real meat?',
    a: 'Yes! Our products are engineered using non-GMO soy and pea protein isolate, giving them the exact fibrous texture, chewiness, and rich masala absorption of authentic meat.',
  },
  {
    q: 'How should I store and cook frozen plant-based meats?',
    a: 'Keep the packet stored at -18°C in your freezer. When ready to cook, thaw for 10 minutes at room temperature, then pan-fry, air-fry, or simmer directly into your curries & biryanis.',
  },
  {
    q: 'What is the shelf life of Sakthi Frozen products?',
    a: 'All Sakthi Frozen products have a freezer shelf life of 12 months from the date of manufacturing without losing nutrition or flavor.',
  },
  {
    q: 'Is cold-chain delivery available across India?',
    a: 'Yes! We ship all orders in temperature-controlled insulated thermal boxes with dry ice to ensure your items arrive deeply frozen at your doorstep.',
  },
];

// Hero Dishes Data for Showcase Frame
const HERO_DISHES = [
  {
    name: 'Sakthi Veg Mutton Biryani Cut',
    category: 'Mutton Alternatives',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    tag: '#1 Plant Mutton',
  },
  {
    name: 'Sakthi Crispy Veg Fish Finger',
    category: 'Seafood Alternatives',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80',
    tag: 'Seafood Favorite',
  },
  {
    name: 'Sakthi Tender Chicken Strips',
    category: 'Poultry Alternatives',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1000&q=80',
    tag: 'High Protein',
  },
];

export default function StorefrontHomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [heroDishIndex, setHeroDishIndex] = useState(0);
  const [topProducts, setTopProducts] = useState<ProductType[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<{ name: string; img: string }[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewSlideIndex, setReviewSlideIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  // Auto-rotating Hero Image Slider
  useEffect(() => {
    const heroInterval = setInterval(() => {
      setHeroDishIndex((prev) => (prev + 1) % HERO_DISHES.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(heroInterval);
  }, []);

  // Responsive cards per view state (Wider cards on Desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1536) setCardsPerPage(4);
      else if (window.innerWidth >= 960) setCardsPerPage(3);
      else if (window.innerWidth >= 640) setCardsPerPage(2);
      else setCardsPerPage(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxSlideIndex = Math.max(0, reviews.length - cardsPerPage);

  // Continuous circular automatic rotation timer
  useEffect(() => {
    if (reviews.length <= cardsPerPage) return;
    const interval = setInterval(() => {
      setReviewSlideIndex((prev) => (prev < maxSlideIndex ? prev + 1 : 0));
    }, 4500);
    return () => clearInterval(interval);
  }, [reviews.length, cardsPerPage, maxSlideIndex]);

  const nextReviewSlide = () => {
    setReviewSlideIndex((prev) => (prev < maxSlideIndex ? prev + 1 : 0));
  };

  const prevReviewSlide = () => {
    setReviewSlideIndex((prev) => (prev > 0 ? prev - 1 : maxSlideIndex));
  };

  // Exact Gapless Transform Calculation
  const getReviewTransform = () => {
    if (cardsPerPage === 4) return `calc(-${reviewSlideIndex} * (25% + 6px))`;
    if (cardsPerPage === 3) return `calc(-${reviewSlideIndex} * (33.3333% + 8px))`;
    if (cardsPerPage === 2) return `calc(-${reviewSlideIndex} * (50% + 12px))`;
    // Mobile (1 card per view): Shift by 100% container width + 24px gap for perfect center alignment
    return `calc(-${reviewSlideIndex} * (100% + 24px))`;
  };
  
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Mutton' | 'Seafood' | 'Poultry' | 'Snacks'>('All');
  const [activeCatIndex, setActiveCatIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [savedProducts, setSavedProducts] = useState<Record<string, boolean>>({});

  const toggleSaveProduct = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedProducts(prev => ({ ...prev, [id]: !prev[id] }));
    if (!savedProducts[id]) showToast('Item saved to favorites!', 'success');
  };

  // Add Google Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    authorName: '',
    location: '',
    rating: 5,
    comment: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
          const popular = prodRes.data.filter((p: ProductType) => p.isPopular);
          setTopProducts(popular);
        }

        if (catRes.success && Array.isArray(catRes.data)) {
          const cats = catRes.data.map((c: any) => ({
            name: c.name,
            img: c.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
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

  // Filtered Products for Best Sellers section
  const filteredProducts = topProducts.filter((p) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Mutton') return p.category.toLowerCase().includes('mutton');
    if (selectedFilter === 'Seafood') return p.category.toLowerCase().includes('sea') || p.category.toLowerCase().includes('fish');
    if (selectedFilter === 'Poultry') return p.category.toLowerCase().includes('poultry') || p.category.toLowerCase().includes('chicken');
    if (selectedFilter === 'Snacks') return p.category.toLowerCase().includes('snack') || p.name.toLowerCase().includes('nugget') || p.name.toLowerCase().includes('cutlet');
    return true;
  });

  const handleAddToCart = (product: ProductType, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`Added ${product.name} to cart!`, 'success');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Thank you for subscribing to Sakthi Frozen Foods newsletter!', 'success');
    setEmailInput('');
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
        showToast('Thank you! Your Google Review has been submitted successfully.', 'success');
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

  const toggleLikeReview = (id: string) => {
    setLikedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#E8EEE0] text-[#1E201D] flex flex-col font-sans selection:bg-[#4D583F] selection:text-white relative">
      <Navbar />

      {/* NEW HERO SECTION: Organic Gourmet Interactive Split Hero */}
      <section className="relative overflow-hidden bg-[#FBFDF2] py-10 md:py-14 border-b border-[#676662]/15">
        {/* Subtle Ambient Decorative Gradient Glows */}
        <div className="absolute top-10 right-10 w-[550px] h-[550px] bg-[#4D583F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-[#8E9D64]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#4D583F_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="site-shell relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left flex flex-col items-center lg:items-start">
              
              {/* Highlight Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4D583F] text-white text-sm font-extrabold shadow-md">
                <Leaf className="w-4 h-4 text-emerald-300" />
                <span>100% Plant-Based • Zero Cholesterol • High Protein</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-[#1E201D] font-display">
                Authentic Taste. <br />
                <span className="bg-gradient-to-r from-[#4D583F] via-[#363E2C] to-[#687654] bg-clip-text text-transparent">
                  100% Plant-Based.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-[#52574E] max-w-2xl font-medium leading-relaxed">
                Indulge in juicy Veg Mutton, Veg Fish, Veg Prawns & Chicken Strips. Crafted with non-GMO soy & pea protein for rich spice absorption & identical fibrous meaty texture.
              </p>

              {/* Quick Category Jump Chips */}
              <div className="w-full text-center lg:text-left pt-1 space-y-2">
                <span className="text-sm font-bold text-[#1E201D] block">Popular Varieties:</span>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <Link
                    href="/shop?category=Mutton%20Alternatives"
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#4F534C]/20 text-xs sm:text-sm font-bold text-[#1E201D] hover:bg-[#4D583F] hover:text-white transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4D583F]" />
                    <span>Veg Mutton</span>
                  </Link>
                  <Link
                    href="/shop?category=Seafood%20Alternatives"
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#4F534C]/20 text-xs sm:text-sm font-bold text-[#1E201D] hover:bg-[#4D583F] hover:text-white transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4D583F]" />
                    <span>Veg Fish</span>
                  </Link>
                  <Link
                    href="/shop?category=Poultry%20Alternatives"
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#4F534C]/20 text-xs sm:text-sm font-bold text-[#1E201D] hover:bg-[#4D583F] hover:text-white transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4D583F]" />
                    <span>Chicken Strips</span>
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-2 w-full sm:w-auto">
                <Link
                  href="/shop"
                  className="flex-1 sm:flex-none px-2 sm:px-8 py-3 sm:py-4 rounded-xl bg-[#4D583F] hover:bg-[#3d4732] text-white font-black text-[12px] sm:text-base transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-1.5 sm:gap-3 group active:scale-95 text-center"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span><span className="hidden sm:inline">Explore Full Menu</span><span className="sm:hidden">Full Menu</span></span>
                </Link>

                <a
                  href="#why-switch"
                  className="flex-1 sm:flex-none px-2 sm:px-7 py-3 sm:py-4 rounded-xl bg-white hover:bg-[#EAF0E5] text-[#1E201D] font-bold text-[12px] sm:text-base transition-all border border-[#4F534C]/20 shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 text-center"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-amber-600" />
                  <span><span className="hidden sm:inline">Why Switch to Plant Meat?</span><span className="sm:hidden">Why Switch?</span></span>
                </a>
              </div>

              {/* Key Trust Metric Cards */}
              <div className="grid grid-cols-3 gap-3 md:gap-6 pt-6 max-w-lg w-full border-t border-[#4F534C]/15">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-[#4F534C]/15 shadow-xs text-center lg:text-left">
                  <span className="block text-2xl md:text-3xl font-black text-[#4D583F]">25,000+</span>
                  <span className="text-xs md:text-sm text-[#4D583F] font-bold">Happy Foodies</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 border border-[#4F534C]/15 shadow-xs text-center lg:text-left">
                  <span className="block text-2xl md:text-3xl font-black text-[#4D583F]">100%</span>
                  <span className="text-xs md:text-sm text-[#4D583F] font-bold">Cholesterol Free</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 border border-[#4F534C]/15 shadow-xs text-center lg:text-left">
                  <span className="block text-2xl md:text-3xl font-black text-[#4D583F]">-18°C</span>
                  <span className="text-xs md:text-sm text-[#4D583F] font-bold">Cold Express</span>
                </div>
              </div>

            </div>

            {/* Right Column: Sleek Pure Image Showcase Frame */}
            <div className="lg:col-span-5 relative w-full max-w-[500px] mx-auto lg:max-w-none">
              
              {/* Inject Slider Animation Keyframes */}
              <style>{`
                @keyframes sliderProgress {
                  0% { width: 0%; opacity: 0.5; }
                  100% { width: 100%; opacity: 0; }
                }
              `}</style>

              {/* Image Showcase Selector Tabs */}
              <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { name: 'Veg Mutton', icon: Utensils },
                  { name: 'Veg Fish', icon: Sparkles },
                  { name: 'Chicken Strips', icon: Flame },
                ].map((tab, idx) => {
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setHeroDishIndex(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs relative overflow-hidden ${
                        heroDishIndex === idx
                          ? 'bg-[#4D583F] text-white shadow-md scale-105'
                          : 'bg-white text-[#61665D] hover:bg-[#EAF0E5] border border-[#4F534C]/15'
                      }`}
                    >
                      {/* Auto-slide Progress Bar */}
                      {heroDishIndex === idx && (
                        <div 
                          className="absolute bottom-0 left-0 h-full bg-white/20" 
                          style={{ animation: 'sliderProgress 5s linear infinite' }}
                        />
                      )}
                      <IconComp className={`w-3.5 h-3.5 shrink-0 relative z-10 ${heroDishIndex === idx ? 'text-white' : 'text-[#4D583F]'}`} />
                      <span className="relative z-10 whitespace-nowrap">{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Clean Framed Hero Showcase Image (Auto-Sliding Crossfade) */}
              <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.12)] border-4 border-white bg-white group aspect-[4/3]">
                {HERO_DISHES.map((dish, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      heroDishIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <div className="w-full h-full relative overflow-hidden bg-[#EAF0E5]">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        onError={handleImageError}
                        className={`w-full h-full object-cover transition-transform duration-[5000ms] ease-out ${
                           heroDishIndex === idx ? 'scale-110' : 'scale-100'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1E201D]/90 via-[#1E201D]/20 to-transparent opacity-90" />
                      
                      {/* Top Floating Badge */}
                      <div className={`absolute top-4 left-4 flex items-center gap-2 transition-all duration-700 delay-100 ${heroDishIndex === idx ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
                        <span className="px-3 py-1.5 rounded-full bg-[#4D583F]/90 backdrop-blur-md text-white font-black text-xs shadow-lg flex items-center gap-1.5 border border-white/20">
                          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{dish.tag}</span>
                        </span>
                      </div>



                      {/* Clean Bottom Title Bar (Animated Entry) */}
                      <div className={`absolute bottom-0 inset-x-0 p-5 sm:p-7 space-y-1.5 transform transition-all duration-700 delay-200 ${heroDishIndex === idx ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-[#A5B889] block drop-shadow-sm">
                          {dish.category}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-white font-display leading-tight shadow-sm drop-shadow-md">
                          {dish.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating Bottom Trust Ribbon */}
              <div className="mt-5 p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#4F534C]/15 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-[#1E201D] font-bold hover:shadow-lg transition-all">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                  <span>100% Non-GMO Soy & Pea Protein</span>
                </div>
                <span className="text-[#4D583F] font-extrabold flex items-center gap-1 bg-[#E8EEE0] px-2.5 py-1.5 rounded-lg border border-[#4F534C]/10">
                  <ShieldCheck className="w-4 h-4" /> FSSAI Certified
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Decorative Background Elements Wrapper for Body Content */}
      <div className="relative">

        {/* Feature Highlights Bar - Zapeo Inspired Strategic Cards */}
        <section className="bg-transparent py-10 md:py-14 w-full relative z-10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-[#1E201D] tracking-tight">Built for a Better Lifestyle</h2>
              <p className="text-sm text-[#61665D] mt-2">Delivering uncompromising quality and nutrition with zero hassle.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
                  <Leaf className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-base text-[#1E201D] mb-1.5">100% Cruelty-Free</h4>
                <p className="text-sm text-[#4F534C] font-medium leading-relaxed">Made purely from non-GMO soy and pea plant protein. Zero animal ingredients.</p>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-base text-[#1E201D] mb-1.5">Zero Cholesterol</h4>
                <p className="text-sm text-[#4F534C] font-medium leading-relaxed">Enjoy the meaty texture you crave without compromising your heart health.</p>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-base text-[#1E201D] mb-1.5">Express Shipping</h4>
                <p className="text-sm text-[#4F534C] font-medium leading-relaxed">We ship frozen at -18°C. Enjoy free overnight delivery on orders over ₹999.</p>
              </div>

              {/* Card 4 */}
              <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-base text-[#1E201D] mb-1.5">FSSAI Certified</h4>
                <p className="text-sm text-[#4F534C] font-medium leading-relaxed">Manufactured in ISO 22000 certified facilities ensuring the highest food safety.</p>
              </div>

            </div>
          </div>
        </section>

        {/* Featured Categories Showcase */}
        {featuredCategories.length > 0 && (
          <section className="site-shell py-10 md:py-14 relative z-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EAF0E5] text-[#4D583F] text-xs font-black uppercase tracking-widest mb-2">
                  <Leaf className="w-3.5 h-3.5" /> Explore Varieties
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-[#1E201D] font-display">Featured Categories</h2>
              </div>
              <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-extrabold text-[#4D583F] hover:underline">
                Browse All Categories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div 
              className="flex overflow-x-auto gap-5 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:pb-0 snap-x snap-mandatory scrollbar-none"
              onScroll={(e) => setActiveCatIndex(Math.round(e.currentTarget.scrollLeft / (e.currentTarget.scrollWidth / (featuredCategories.length || 1))))}
            >
              {featuredCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group block relative rounded-3xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-2xl transition-all border border-[#4F534C]/15 min-w-[80vw] sm:min-w-0 snap-center shrink-0 hover:-translate-y-1 bg-white"
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E201D]/90 via-[#1E201D]/30 to-transparent flex flex-col justify-end p-6">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#A5B889] mb-1">
                      100% Plant Based
                    </span>
                    <h3 className="text-white font-black text-lg sm:text-xl flex items-center justify-between gap-2 font-display">
                      <span className="line-clamp-2">{cat.name}</span>
                      <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-[#4D583F] group-hover:text-white transition-all shadow-md">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Carousel Indicators */}
            <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
              {featuredCategories.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeCatIndex === i ? 'w-5 bg-[#4D583F]' : 'w-1.5 bg-[#4F534C]/20'}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Top Best Sellers Section with Category Filter Tabs */}
        <section className="py-10 md:py-14 w-full relative z-10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header & Filter Pills */}
            <div className="flex flex-col mb-10 gap-6">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E201D] tracking-tight mb-2">Customer Favorites</h2>
                <p className="text-sm text-[#61665D]">Discover our most loved plant-based essentials.</p>
              </div>

              {/* Minimalist Filter Pills */}
              <div className="flex items-center sm:justify-start gap-2 overflow-x-auto pb-2 scrollbar-none">
                {(['All', 'Mutton', 'Seafood', 'Poultry', 'Snacks'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedFilter === filter
                        ? 'bg-[#1E201D] text-white'
                        : 'bg-transparent border border-[#4F534C]/25 text-[#3C403D] hover:border-[#4F534C]/50'
                    }`}
                  >
                    {filter === 'All' ? 'All' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid - Clean Minimal Style */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse space-y-3">
                    <div className="bg-[#4F534C]/10 h-56 sm:h-72 rounded-2xl w-full" />
                    <div className="space-y-2">
                      <div className="bg-[#4F534C]/10 h-3 rounded w-1/3" />
                      <div className="bg-[#4F534C]/10 h-4 rounded w-3/4" />
                      <div className="bg-[#4F534C]/10 h-4 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 rounded-3xl border border-dashed border-[#4F534C]/20">
                <p className="text-sm font-bold text-[#61665D]">No items found under &quot;{selectedFilter}&quot;</p>
                <button
                  onClick={() => setSelectedFilter('All')}
                  className="mt-4 px-6 py-2.5 bg-[#1E201D] text-white text-xs font-bold rounded-full hover:bg-[#4D583F] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.slice(0, 8).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-[#4F534C]/8"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Best Seller Badge */}
                      {product.isPopular && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-[#4D583F] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Best Seller
                          </span>
                        </div>
                      )}

                      {/* Heart Button */}
                      <button
                        onClick={(e) => toggleSaveProduct(e, product.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-[#4F534C]/15 flex items-center justify-center text-[#4D583F] active:scale-95 z-10"
                        aria-label="Save to favorites"
                      >
                        <Heart className={`w-4 h-4 ${savedProducts[product.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-2">
                      {/* Category */}
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#4D583F]">
                        {product.category.replace(' Alternatives', '')}
                      </span>

                      {/* Product Name */}
                      <h3 className="text-sm font-semibold text-[#1E201D] leading-snug line-clamp-1">
                        {product.name}
                      </h3>

                      {/* 100% Plant-Based Badge */}
                      <div className="flex items-center gap-1.5 text-[11px] text-[#4D583F] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4D583F]" />
                        <span>100% Plant-Based</span>
                      </div>

                      {/* Price & Weight */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-base font-extrabold text-[#1E201D]">₹{product.price}</span>
                        <span className="text-[11px] text-[#61665D] font-bold">{product.weight}</span>
                      </div>

                      {/* Quick Add Button + Plus Icon */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex-1 py-2 sm:py-2.5 px-2 bg-[#4D583F] text-white font-bold text-[11px] sm:text-xs rounded-xl flex items-center justify-center gap-1 sm:gap-2 active:scale-95 whitespace-nowrap"
                        >
                          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span className="hidden sm:inline">Quick Add</span>
                          <span className="sm:hidden">Add</span>
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl border border-[#4F534C]/20 flex items-center justify-center text-[#1E201D] active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-16 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-10 py-4 rounded-full border border-[#4F534C]/25 text-[#1E201D] font-bold text-sm hover:border-[#1E201D] hover:bg-[#1E201D] hover:text-white transition-all"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* Why Switch to Sakthi Plant-Based Meats Comparison Section */}
        <section id="why-switch" className="site-shell py-12 md:py-16 relative z-10 bg-transparent">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-widest inline-block border border-emerald-100 uppercase">
                Health & Sustainability
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1E201D] tracking-tight">
                Why Switch to Sakthi Vegan Meats?
              </h2>
              <p className="text-base text-[#61665D]">
                Experience the identical taste and texture of your favorite meats, upgraded with superior plant-based nutrition, zero cholesterol, and a cruelty-free footprint.
              </p>
            </div>

            {/* Zapeo-Inspired Grid Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Metric 1 */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <h3 className="text-xl font-extrabold text-[#1E201D] mb-6 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-emerald-500" /> Protein Content
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#F4F5F2] p-4 rounded-2xl shadow-sm border border-emerald-50">
                    <span className="text-sm font-bold text-[#1E201D]">Sakthi Vegan</span>
                    <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">24g / 100g</span>
                  </div>
                  <div className="flex justify-between items-center opacity-60 px-4 py-2">
                    <span className="text-sm font-medium text-[#61665D]">Animal Meat</span>
                    <span className="text-sm font-semibold text-[#61665D]">20g / 100g</span>
                  </div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <h3 className="text-xl font-extrabold text-[#1E201D] mb-6 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-500" /> Cholesterol
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#F4F5F2] p-4 rounded-2xl shadow-sm border border-blue-50">
                    <span className="text-sm font-bold text-[#1E201D]">Sakthi Vegan</span>
                    <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">0 mg (Safe)</span>
                  </div>
                  <div className="flex justify-between items-center opacity-60 px-4 py-2">
                    <span className="text-sm font-medium text-[#61665D]">Animal Meat</span>
                    <span className="text-sm font-semibold text-[#61665D]">90 mg (High)</span>
                  </div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <h3 className="text-xl font-extrabold text-[#1E201D] mb-6 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-amber-500" /> Dietary Fiber
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#F4F5F2] p-4 rounded-2xl shadow-sm border border-amber-50">
                    <span className="text-sm font-bold text-[#1E201D]">Sakthi Vegan</span>
                    <span className="text-sm font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">6g Fiber</span>
                  </div>
                  <div className="flex justify-between items-center opacity-60 px-4 py-2">
                    <span className="text-sm font-medium text-[#61665D]">Animal Meat</span>
                    <span className="text-sm font-semibold text-[#61665D]">0g Fiber</span>
                  </div>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <h3 className="text-xl font-extrabold text-[#1E201D] mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-500" /> Antibiotics & Hormones
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-[#F4F5F2] p-4 rounded-2xl shadow-sm border border-purple-50">
                    <span className="text-sm font-bold text-[#1E201D]">Sakthi Vegan</span>
                    <span className="text-sm font-extrabold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">100% Free</span>
                  </div>
                  <div className="flex justify-between items-center opacity-60 px-4 py-2">
                    <span className="text-sm font-medium text-[#61665D]">Animal Meat</span>
                    <span className="text-sm font-semibold text-[#61665D]">Traces Present</span>
                  </div>
                </div>
              </div>

              {/* Metric 5 (Spans 2 columns on lg) */}
              <div className="bg-[#4D583F] rounded-[2rem] p-8 shadow-xl lg:col-span-2 relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
                  <Leaf className="w-64 h-64 text-emerald-400" />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" /> Environmental Footprint
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                    <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Sakthi Vegan</h4>
                    <p className="text-white font-semibold text-sm">Requires 90% less land and water. Generates drastically less CO₂ emissions.</p>
                  </div>
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-[#A5B889] text-xs font-bold uppercase tracking-widest mb-1">Animal Meat</h4>
                    <p className="text-gray-300 font-medium text-sm">Major contributor to global warming, deforestation, and massive water depletion.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* How to Cook - Zapeo Style Floating Workflow */}
        <section className="bg-transparent border-y border-[#4F534C]/10 py-12 md:py-16 w-full relative z-10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-[#1E201D] text-xs font-bold uppercase tracking-widest shadow-sm">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Simple 10-Minute Prep</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#1E201D] tracking-tight">
                How to Cook Sakthi Frozen Meats
              </h2>
              <p className="text-sm text-[#61665D]">
                No complicated prep required! Enjoy juicy, restaurant-quality plant meat in 3 effortless steps.
              </p>
            </div>

            {/* 3 Step Floating Workflow */}
            <div className="relative max-w-5xl mx-auto">
              
              {/* Desktop Horizontal Process Connecting Line */}
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent pointer-events-none z-0" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                
                {/* Step 1 Card */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center space-y-6 group hover:-translate-y-2 relative">
                  <div className="w-20 h-20 rounded-full bg-[#E8EEE0] flex items-center justify-center relative shadow-inner">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#4D583F] text-white flex items-center justify-center font-black text-sm shadow-md">
                      1
                    </div>
                    <Clock className="w-8 h-8 text-emerald-600" />
                  </div>

                  <div>
                    <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest block mb-2">
                      10 Mins
                    </span>
                    <h3 className="font-extrabold text-lg text-[#1E201D]">Thaw at Room Temp</h3>
                    <p className="text-[15px] text-[#4D534B] leading-relaxed mt-2">
                      Remove your packet from the freezer and thaw at room temperature for 10 minutes (or lightly microwave for 30 seconds).
                    </p>
                  </div>
                </div>

                {/* Step 2 Card */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center space-y-6 group hover:-translate-y-2 relative">
                  <div className="w-20 h-20 rounded-full bg-[#E8EEE0] flex items-center justify-center relative shadow-inner">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#4D583F] text-white flex items-center justify-center font-black text-sm shadow-md">
                      2
                    </div>
                    <Flame className="w-8 h-8 text-amber-500" />
                  </div>

                  <div>
                    <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest block mb-2">
                      5-8 Mins
                    </span>
                    <h3 className="font-extrabold text-lg text-[#1E201D]">Sizzle & Spice</h3>
                    <p className="text-[15px] text-[#4D534B] leading-relaxed mt-2">
                      Pan-fry in oil until golden crispy, or toss directly into simmering curry gravies, korma, and biryani pots for deep spice absorption.
                    </p>
                  </div>
                </div>

                {/* Step 3 Card */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center space-y-6 group hover:-translate-y-2 relative">
                  <div className="w-20 h-20 rounded-full bg-[#E8EEE0] flex items-center justify-center relative shadow-inner">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#4D583F] text-white flex items-center justify-center font-black text-sm shadow-md">
                      3
                    </div>
                    <Utensils className="w-8 h-8 text-[#4D583F]" />
                  </div>

                  <div>
                    <span className="text-[#1E201D] text-[10px] font-bold uppercase tracking-widest block mb-2">
                      Ready to Serve
                    </span>
                    <h3 className="font-extrabold text-lg text-[#1E201D]">Savor Every Bite</h3>
                    <p className="text-[15px] text-[#4D534B] leading-relaxed mt-2">
                      Serve hot with rice, parothas, or naan. Enjoy the authentic fibrous meaty chew packed with 100% plant protein goodness!
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Pro Chef Tip Banner */}
            <div className="max-w-3xl mx-auto mt-16 p-6 rounded-[1.5rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left transition-transform hover:-translate-y-1 duration-300">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-[13px] text-[#61665D] leading-relaxed">
                <span className="font-extrabold text-[#1E201D] block sm:inline mr-1">Chef's Secret Tip:</span>
                For biryanis and gravies, add thawed Veg Mutton directly into the boiling masala so it absorbs authentic South Indian spices deeply.
              </div>
            </div>

          </div>
        </section>

        {/* GOOGLE REVIEWS SECTION */}
        <section className="site-shell py-12 md:py-16 relative z-10">
          <div className="max-w-7xl mx-auto space-y-10 relative z-10">
            
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#4F534C]/8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                {/* Google Logo */}
                <div className="w-16 h-16 rounded-2xl bg-[#E8EEE0] border border-[#4F534C]/10 flex items-center justify-center shrink-0">
                  <GoogleGLogo className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E201D] tracking-tight">Google Reviews</h2>
                  <p className="text-sm text-[#61665D]">Trusted by our amazing customers</p>
                  
                  {/* Rating & Count */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 fill-[#FBBC05] text-[#FBBC05]" />
                      <span className="text-xl font-black text-[#1E201D]">4.9</span>
                    </div>
                    <span className="text-sm text-[#61665D] font-medium border-l border-[#4F534C]/15 pl-3">
                      {reviews.length > 0 ? `${reviews.length} Reviews` : 'No reviews yet'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#A7ADA9] font-medium flex items-center justify-center sm:justify-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Sakthi Frozen Foods • Verified Google Business Profile
                  </p>
                </div>
              </div>

              {/* Write Review CTA */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-6 py-3 rounded-xl bg-[#34A853] text-white font-bold text-sm flex items-center gap-2.5 active:scale-95 shadow-sm"
                >
                  <GoogleGLogo className="w-4 h-4" />
                  Write a Google Review
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-[#61665D] font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Join our happy customers
                </span>
              </div>
            </div>

            {/* Reviews Carousel */}
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-[#4F534C]/15 space-y-3">
                <GoogleGLogo className="w-10 h-10 mx-auto opacity-25" />
                <p className="font-bold text-sm text-[#1E201D]">No Reviews Yet</p>
                <p className="text-xs text-[#61665D]">Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="relative space-y-6">
                
                {/* Sub-header with Navigation */}
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-base font-bold text-[#1E201D] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#4D583F]" />
                      Real customer experiences
                    </h3>
                    <p className="text-xs text-[#61665D] mt-0.5">See why our customers love our plant-based products.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevReviewSlide}
                      className="w-10 h-10 rounded-full bg-white border border-[#4F534C]/12 shadow-sm flex items-center justify-center text-[#1E201D] active:scale-90"
                      aria-label="Previous Review"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextReviewSlide}
                      className="w-10 h-10 rounded-full bg-white border border-[#4F534C]/12 shadow-sm flex items-center justify-center text-[#1E201D] active:scale-90"
                      aria-label="Next Review"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Review Cards Slider */}
                <div className="overflow-hidden rounded-2xl">
                  <div
                    className="flex transition-transform duration-600 ease-out gap-4 sm:gap-5"
                    style={{ transform: `translateX(${getReviewTransform()})` }}
                  >
                    {reviews.map((rev, idx) => (
                      <div
                        key={rev._id || rev.id || idx}
                        className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] 2xl:w-[calc(25%-15px)] shrink-0 bg-white rounded-2xl p-5 sm:p-6 border border-[#4F534C]/8 shadow-sm flex flex-col"
                      >
                        <div className="flex-1 space-y-4">
                          {/* User Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {rev.avatar ? (
                                <img
                                  src={rev.avatar}
                                  alt={rev.authorName}
                                  className="w-11 h-11 rounded-full object-cover border-2 border-[#E8EEE0] shrink-0"
                                  onError={handleImageError}
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-full bg-[#4D583F] text-white font-bold text-sm flex items-center justify-center shrink-0">
                                  {rev.authorName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-sm text-[#1E201D] flex items-center gap-1.5">
                                  {rev.authorName}
                                  <GoogleGLogo className="w-3.5 h-3.5" />
                                </h4>
                                <span className="text-[11px] text-[#61665D] flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {rev.location || 'India'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stars & Date */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-0.5">
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-[#FBBC05] text-[#FBBC05]" />
                              ))}
                            </div>
                            <span className="text-[11px] text-[#A7ADA9] font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {rev.dateText || 'Recently'}
                            </span>
                          </div>

                          {/* Review Text */}
                          <p className="text-[15px] text-[#2F342F] leading-relaxed line-clamp-5">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Bottom Bar */}
                        <div className="pt-4 mt-4 border-t border-[#4F534C]/8 flex items-center justify-between">
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                          <button
                            onClick={() => toggleLikeReview(rev._id || rev.authorName)}
                            className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                              likedReviews[rev._id || rev.authorName]
                                ? 'bg-blue-50 text-[#4285F4]'
                                : 'bg-gray-50 text-[#61665D]'
                            }`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${likedReviews[rev._id || rev.authorName] ? 'fill-[#4285F4]' : ''}`} />
                            Helpful
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center items-center gap-1.5 pt-2">
                  {[...Array(maxSlideIndex + 1)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setReviewSlideIndex(i)}
                      className={`h-2 rounded-full transition-all duration-400 ${
                        reviewSlideIndex === i ? 'w-8 bg-[#4D583F]' : 'w-2 bg-[#4F534C]/20'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

              </div>
            )}
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="bg-transparent border-y border-[#4F534C]/15 py-12 md:py-16 w-full relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-3xl font-black text-[#1E201D] font-display">Frequently Asked Questions</h2>
              <p className="text-xs text-[#61665D] mt-2">Got questions? We've got answers.</p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#4F534C]/20 bg-[#FAFAF5] overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 text-left font-bold text-sm text-[#1E201D] flex items-center justify-between gap-4"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#4D583F] shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#61665D] shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-[#61665D] leading-relaxed border-t border-[#4F534C]/10 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* WhatsApp VIP Community Section */}
        <section className="site-shell py-10 md:py-14 relative z-10">
          <div className="rounded-3xl bg-gradient-to-r from-[#1E201D] via-[#122A1E] to-[#1E201D] text-white p-8 md:p-14 shadow-2xl border border-[#25D366]/30 relative overflow-hidden">
            {/* Ambient Green Glow */}
            <div className="absolute top-0 right-10 w-72 h-72 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#25D366]/30">
                <WhatsAppIcon className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <span className="px-3.5 py-1 rounded-full bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-xs font-black uppercase tracking-wider inline-block">
                  VIP WhatsApp Group
                </span>
                <h2 className="text-3xl md:text-5xl font-black font-display">
                  Join Our Sakthi WhatsApp Community
                </h2>
              </div>

              <p className="text-xs md:text-sm text-[#C5C8C4] max-w-lg mx-auto leading-relaxed">
                Connect directly with 10,000+ plant-based foodies! Get instant stock updates, delicious cooking recipes, and fast customer support on WhatsApp.
              </p>

              <div className="pt-2 flex flex-row items-center justify-center gap-2 sm:gap-4 w-full">
                <a
                  href="https://wa.me/919876543210?text=Hi%20Sakthi%20Frozen%20Foods!%20I%20want%20to%20join%20the%20WhatsApp%20VIP%20Community."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-2 sm:px-8 py-3 sm:py-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-[12px] sm:text-base transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-1.5 sm:gap-3 active:scale-95 border border-emerald-400/30 text-center"
                >
                  <WhatsAppIcon className="w-4 h-4 sm:w-6 sm:h-6 shrink-0" />
                  <span><span className="hidden sm:inline">Join Official WhatsApp Group</span><span className="sm:hidden">Join Group</span></span>
                </a>

                <a
                  href="https://wa.me/919876543210?text=Hi%20Sakthi%20Frozen%20Foods!%20I%20have%20a%20question%20about%20your%20products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-2 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[12px] sm:text-sm transition-all backdrop-blur-md border border-white/15 flex items-center justify-center gap-1.5 sm:gap-2 text-center"
                >
                  <MessageSquare className="w-4 h-4 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span><span className="hidden sm:inline">Chat on WhatsApp</span><span className="sm:hidden">Chat</span></span>
                </a>
              </div>

              <div className="pt-4 flex items-center justify-center gap-2 text-xs text-[#A7ADA9]">
                <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                <span>Zero Spam • Instant Community Support • Free Recipe Updates</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal: Write & Save Google Review to MongoDB */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#4F534C]/20">
            <div className="bg-[#4285F4] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GoogleGLogo className="w-5 h-5 bg-white rounded-full p-0.5" />
                <h3 className="font-bold text-base">Write a Google Review</h3>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1E201D] mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={reviewForm.authorName}
                  onChange={(e) => setReviewForm({ ...reviewForm, authorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1E201D] mb-1">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai, Tamil Nadu"
                  value={reviewForm.location}
                  onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
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
                        className={`w-6 h-6 ${
                          star <= reviewForm.rating
                            ? 'fill-[#FBBC05] text-[#FBBC05]'
                            : 'text-gray-300'
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
                  className="w-full px-3.5 py-2 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/20 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                />
              </div>

              <div className="pt-3 border-t border-[#4F534C]/15 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-200 text-[#1E201D] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-xl bg-[#4285F4] text-white font-bold text-xs hover:bg-[#3367D6] transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting Review...' : 'Post Google Review'}
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
