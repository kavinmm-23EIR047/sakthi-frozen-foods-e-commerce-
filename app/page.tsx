'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { ProductType } from '@/lib/types';
import { fetchApi } from '@/lib/apiConfig';
import ScrollStackProcedure from '@/components/ScrollStackProcedure';
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
  Users,
  ChefHat,
  Droplets,
  Snowflake,
  Layers,
  Shapes,
  Play,
  Pause,
  Package
} from 'lucide-react';
import { handleImageError } from '@/lib/imageCompressor';
import OptimizedImage from '@/components/OptimizedImage';

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
    chefTip: 'Sauté with curry leaves, crushed garlic, and black pepper for an authentic Chettinad flavor!',
    tag: 'Taste & Texture',
  },
  {
    q: 'How should I store and cook frozen plant-based meats?',
    a: 'Keep the packet stored at -18°C in your freezer. When ready to cook, thaw for 10 minutes at room temperature, then pan-fry, air-fry, or simmer directly into your curries & biryanis.',
    chefTip: 'Add thawed pieces directly into boiling gravy for ultra-succulent bites that soak in all spice essence.',
    tag: 'Kitchen Prep',
  },
  {
    q: 'What is the shelf life of Sakthi Frozen products?',
    a: 'All Sakthi Frozen products have a freezer shelf life of 12 months from the date of manufacturing without losing nutrition or flavor.',
    chefTip: 'Once opened, seal tightly in an airtight freezer bag to lock in maximum kitchen freshness.',
    tag: 'Freshness & Storage',
  },
  {
    q: 'Is cold-chain delivery available across India?',
    a: 'Yes! We ship all orders in temperature-controlled insulated thermal boxes with dry ice to ensure your items arrive deeply frozen at your doorstep.',
    chefTip: 'Transfer immediately into your home freezer upon doorstep arrival to preserve peak quality.',
    tag: 'Cold Chain Delivery',
  },
];

export default function StorefrontHomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [heroDishIndex, setHeroDishIndex] = useState(0);
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

    // Collect all genuine distinct packs by normalized weight
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

      if (item.variants && Array.isArray(item.variants)) {
        for (const v of item.variants) {
          const vCleanWeight = formatCleanWeight(v.weight);
          const vKey = vCleanWeight.toLowerCase();
          if (!packMap.has(vKey)) {
            const isVarRetail = vKey.includes('400') || vKey.includes('250') || vKey.includes('200') || vKey.includes('300');
            packMap.set(vKey, {
              type: isVarRetail ? 'retail' : 'regular',
              label: isVarRetail ? `Retail (${vCleanWeight})` : `Regular (${vCleanWeight})`,
              weight: vCleanWeight,
              price: v.price,
              mrp: v.price,
              id: item.id,
            });
          }
        }
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
    if (a.hasBothPacks && !b.hasBothPacks) return -1;
    if (!a.hasBothPacks && b.hasBothPacks) return 1;
    return a.name.localeCompare(b.name);
  });
}

// Promotional Hero Banners using high-res brand artwork from assets
const HERO_BANNERS = [
  {
    id: 'mock-mutton',
    image: '/hero/0e18a4d9-5d57-4c36-8768-8e7d790a4b5d.jpg',
    title: 'Flavorful Mock Mutton',
    subtitle: '100% Veg. 100% Delicious.',
    category: 'Mutton Alternatives',
    badge: 'Best Seller',
    link: '/shop?category=Mutton%20Alternatives',
  },
  {
    id: 'corn-cheese-balls',
    image: '/hero/813a46d7-0030-47c9-af6a-3db11c6edbc7.jpg',
    title: 'Crispy Corn Cheese Balls',
    subtitle: '100% Veg. 100% Delicious.',
    category: 'Snacks & Starters',
    badge: 'Popular Favorite',
    link: '/shop?category=Snacks%20%26%20Starters',
  },
  {
    id: 'veg-chicken-cutlet',
    image: '/hero/928db126-f62c-4d88-a874-f3d8c08d68bd.jpg',
    title: 'Crispy Veg Chicken Cutlet',
    subtitle: 'Soy Protein Goodness',
    category: 'Poultry Alternatives',
    badge: 'Chef Special',
    link: '/shop?category=Poultry%20Alternatives',
  },
  {
    id: 'french-fries',
    image: '/hero/a677a7a9-c56a-4885-a823-51be3e0177b3.jpg',
    title: 'Crispy French Fries',
    subtitle: 'Golden, Hot & Crunchy',
    category: 'Snacks & Starters',
    badge: 'All-Time Favorite',
    link: '/shop?category=Snacks%20%26%20Starters',
  },
  {
    id: 'sweet-corn',
    image: '/hero/c0410062-941f-4ab6-bcc8-b9b2ffd98cc1.jpg',
    title: 'Golden Sweet Corn',
    subtitle: '100% Veg. 100% Delicious.',
    category: 'Snacks & Starters',
    badge: 'Pure Veg',
    link: '/shop?category=Snacks%20%26%20Starters',
  },
];

  const [topProducts, setTopProducts] = useState<UnifiedProduct[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<{ name: string; img: string }[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewSlideIndex, setReviewSlideIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Preload all hero banner images into browser cache immediately for instant transitions
  useEffect(() => {
    HERO_BANNERS.forEach((banner) => {
      const img = new window.Image();
      img.src = banner.image;
    });
  }, []);

  // Auto-rotating Hero Image Slider using brand assets
  useEffect(() => {
    if (isHeroHovered) return;
    const heroInterval = setInterval(() => {
      setHeroDishIndex((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 4500); // 4.5 seconds per slide
    return () => clearInterval(heroInterval);
  }, [isHeroHovered]);

  const nextHeroSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHeroDishIndex((prev) => (prev + 1) % HERO_BANNERS.length);
  };

  const prevHeroSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setHeroDishIndex((prev) => (prev > 0 ? prev - 1 : HERO_BANNERS.length - 1));
  };

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
  
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Both' | 'Mutton' | 'Poultry' | 'Seafood' | 'Snacks'>('All');
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
          const processed = processUniqueProducts(prodRes.data);
          setTopProducts(processed);
          setHeroDishIndex(0);
        }

        if (catRes.success && Array.isArray(catRes.data)) {
          const cats = catRes.data.map((c: any) => ({
            name: c.name,
            img: c.image || '',
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

  // Filtered Products for Best Sellers section with clean deduplication
  const filteredProducts = topProducts.filter((p) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Both') return p.hasBothPacks;
    if (selectedFilter === 'Mutton') return p.category.toLowerCase().includes('mutton') || p.name.toLowerCase().includes('mutton');
    if (selectedFilter === 'Seafood') return p.category.toLowerCase().includes('sea') || p.category.toLowerCase().includes('fish') || p.name.toLowerCase().includes('fish') || p.name.toLowerCase().includes('vanjaram');
    if (selectedFilter === 'Poultry') return p.category.toLowerCase().includes('poultry') || p.category.toLowerCase().includes('chicken') || p.name.toLowerCase().includes('chicken');
    if (selectedFilter === 'Snacks') return p.category.toLowerCase().includes('snack') || p.category.toLowerCase().includes('starter') || p.name.toLowerCase().includes('nugget') || p.name.toLowerCase().includes('cutlet') || p.name.toLowerCase().includes('lolipop');
    return true;
  });

  const handleAddToCart = (product: UnifiedProduct, e: React.MouseEvent) => {
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
      <section className="relative overflow-hidden bg-[#FBFDF2] py-7 sm:py-10 md:py-12 border-b border-[#676662]/15">
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
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#4D583F] text-white text-[10px] sm:text-xs md:text-sm font-extrabold shadow-md max-w-[95vw] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
                <span className="whitespace-nowrap">100% Plant-Based • Zero Cholesterol • High Protein</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-[#1E201D] font-display">
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
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-6 pt-6 max-w-lg w-full border-t border-[#4F534C]/15">
                <div className="p-2 sm:p-3.5 rounded-2xl bg-white/80 border border-[#4F534C]/15 shadow-xs text-center lg:text-left">
                  <span className="block text-lg sm:text-2xl md:text-3xl font-black text-[#1E201D] truncate">25k+</span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-[#1E201D] font-bold block truncate">Happy Foodies</span>
                </div>
                <div className="p-2 sm:p-3.5 rounded-2xl bg-white/80 border border-[#4F534C]/15 shadow-xs text-center lg:text-left">
                  <span className="block text-lg sm:text-2xl md:text-3xl font-black text-[#1E201D] truncate">100%</span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-[#1E201D] font-bold block truncate">Vegan</span>
                </div>
                <div className="p-2 sm:p-3.5 rounded-2xl bg-white/80 border border-[#4F534C]/15 shadow-xs text-center lg:text-left">
                  <span className="block text-lg sm:text-2xl md:text-3xl font-black text-[#1E201D] truncate">-18°C</span>
                  <span className="text-[10px] sm:text-xs md:text-sm text-[#1E201D] font-bold block truncate">Express</span>
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

              {/* Clean Framed Hero Showcase Image (Full Uncropped Brand Posters) */}
              <div 
                className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.14)] border-4 border-white bg-[#141613] group aspect-[1373/1145] select-none"
                onMouseEnter={() => setIsHeroHovered(true)}
                onMouseLeave={() => setIsHeroHovered(false)}
              >
                {HERO_BANNERS.map((banner, idx) => (
                  <Link
                    key={banner.id}
                    href={banner.link}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer block ${
                      heroDishIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <div className="w-full h-full relative overflow-hidden bg-[#141613]">
                      <OptimizedImage
                        src={banner.image}
                        alt={banner.title}
                        width={900}
                        priority={true}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                ))}

                {/* Left & Right Navigation Arrows on Hover */}
                <button
                  type="button"
                  onClick={prevHeroSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={nextHeroSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modern Pagination Dots */}
              <div className="flex items-center justify-center gap-2 mt-5">
                {HERO_BANNERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroDishIndex(idx)}
                    className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 overflow-hidden relative ${
                      heroDishIndex === idx
                        ? 'w-8 sm:w-10 bg-[#4F534C]/20'
                        : 'w-2 sm:w-2.5 bg-[#4F534C]/30 hover:bg-[#4F534C]/50'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    {heroDishIndex === idx && (
                      <div 
                        className="absolute inset-y-0 left-0 bg-[#4D583F] rounded-full" 
                        style={{ 
                          animation: isHeroHovered ? 'none' : 'sliderProgress 4.5s linear infinite',
                          width: isHeroHovered ? '100%' : undefined 
                        }}
                      />
                    )}
                  </button>
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
        <section className="bg-transparent py-8 md:py-10 w-full relative z-10">
          <div className="site-shell">
            
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-[#1E201D] tracking-tight">Built for a Better Lifestyle</h2>
              <p className="text-sm text-[#61665D] mt-2">Delivering uncompromising quality and nutrition with zero hassle.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1 */}
              <div className="shine-container p-6 rounded-3xl bg-white border border-[#4F534C]/12 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100 group-hover:scale-110 transition-transform">
                  <Leaf className="w-6 h-6 animate-float-subtle" />
                </div>
                <h4 className="font-black text-base text-[#1E201D] mb-1.5 font-poppins">100% Cruelty-Free</h4>
                <p className="text-sm text-[#4F534C] font-medium leading-relaxed">Made purely from non-GMO soy and pea plant protein. Zero animal ingredients.</p>
              </div>

              {/* Card 2 */}
              <div className="shine-container p-6 rounded-3xl bg-white border border-[#4F534C]/12 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 animate-scale-pulse" />
                </div>
                <h4 className="font-black text-base text-[#1E201D] mb-1.5 font-poppins">Zero Cholesterol</h4>
                <p className="text-sm text-[#4F534C] font-medium leading-relaxed">Enjoy the meaty texture you crave without compromising your heart health.</p>
              </div>

              {/* Card 3 */}
              <div className="shine-container p-6 rounded-3xl bg-white border border-[#4F534C]/12 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100 group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6 animate-float-subtle" />
                </div>
                <h4 className="font-black text-base text-[#1E201D] mb-1.5 font-poppins">Express Shipping</h4>
                <p className="text-sm text-[#4F534C] font-medium leading-relaxed">We ship frozen at -18°C. Enjoy free overnight delivery on orders over ₹999.</p>
              </div>

              {/* Card 4 */}
              <div className="shine-container p-6 rounded-3xl bg-white border border-[#4F534C]/12 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 animate-scale-pulse" />
                </div>
                <h4 className="font-black text-base text-[#1E201D] mb-1.5 font-poppins">FSSAI Certified</h4>
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
              className="flex overflow-x-auto gap-5 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              onScroll={(e) => setActiveCatIndex(Math.round(e.currentTarget.scrollLeft / (e.currentTarget.scrollWidth / (featuredCategories.length || 1))))}
            >
              {featuredCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group block relative rounded-3xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-2xl transition-all border border-[#4F534C]/15 min-w-[80vw] sm:min-w-0 snap-center shrink-0 hover:-translate-y-1 bg-white"
                >
                  <OptimizedImage
                    src={cat.img}
                    alt={cat.name}
                    width={500}
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
        <section className="py-8 md:py-12 w-full relative z-10">
          <div className="site-shell">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
              <div className="text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EAF0E5] text-[#4D583F] text-xs font-black uppercase tracking-widest mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Handcrafted Plant-Based Proteins
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E201D] tracking-tight mb-1 sm:mb-2">Customer Favorites</h2>
                <p className="text-xs sm:text-sm text-[#61665D]">
                  Unique plant-based meats available in both <span className="font-bold text-[#4D583F]">Regular (Bulk 1kg)</span> and <span className="font-bold text-[#0284C7]">Retail (400g)</span> packs.
                </p>
              </div>
              <Link href="/shop" className="shrink-0 inline-flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-bold text-[#4D583F] hover:text-[#1E201D] transition-colors hover:translate-x-1 group bg-[#EAF0E5] sm:bg-transparent px-3.5 py-2 sm:px-0 sm:py-0 rounded-full sm:rounded-none self-start md:self-auto">
                <span className="hidden sm:inline">View all products</span>
                <span className="sm:hidden">View All</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { key: 'All', label: 'All Varieties' },
                { key: 'Both', label: '🌿 Regular & Retail Packs' },
                { key: 'Mutton', label: 'Mutton' },
                { key: 'Poultry', label: 'Chicken & Poultry' },
                { key: 'Seafood', label: 'Fish & Seafood' },
                { key: 'Snacks', label: 'Snacks & Starters' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedFilter(tab.key as any)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    selectedFilter === tab.key
                      ? 'bg-[#4D583F] text-white border-[#4D583F] shadow-sm'
                      : 'bg-white text-[#61665D] border-[#4F534C]/20 hover:border-[#4D583F] hover:text-[#1E201D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Product Grid - 2x2 on Mobile, 4 columns on Desktop */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="animate-pulse space-y-2.5 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#4F534C]/10">
                    <div className="bg-[#4F534C]/10 aspect-square sm:aspect-[4/3] rounded-xl sm:rounded-2xl w-full" />
                    <div className="space-y-1.5">
                      <div className="bg-[#4F534C]/10 h-2.5 rounded w-1/3" />
                      <div className="bg-[#4F534C]/10 h-3.5 rounded w-3/4" />
                      <div className="bg-[#4F534C]/10 h-3 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 sm:py-20 rounded-2xl sm:rounded-3xl border border-dashed border-[#4F534C]/20 bg-white p-6 sm:p-8">
                <p className="text-sm font-bold text-[#61665D]">No items found under this filter.</p>
                <button
                  onClick={() => setSelectedFilter('All')}
                  className="mt-4 px-6 py-2.5 bg-[#4D583F] text-white text-xs font-bold rounded-full hover:bg-[#414b35] transition-colors"
                >
                  View All Varieties
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {filteredProducts.slice(0, 8).map((product) => {
                  const discountPercent = product.minMrp > product.minPrice
                    ? Math.round(((product.minMrp - product.minPrice) / product.minMrp) * 100)
                    : 0;

                  return (
                    <article
                      key={product.id || product.baseKey}
                      onClick={() => router.push(`/product/${product.id}`)}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-[#4F534C]/12 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#4D583F]/35 cursor-pointer"
                    >
                      {/* Top Media Container */}
                      <div className="relative aspect-[4/3] bg-[#EAF0E5] overflow-hidden">
                        <OptimizedImage
                          src={product.image}
                          alt={product.name}
                          width={520}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Subtle Bottom Gradient for Depth */}
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

                        {/* Badges Overlay - Non-overlapping, clean alignment */}
                        <div className="absolute inset-x-2 top-2 sm:inset-x-3 sm:top-3 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
                          {/* Left Badge: Pack Info */}
                          {product.hasBothPacks ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#1E281D]/90 text-white font-bold text-[9px] sm:text-[10px] shadow-xs backdrop-blur-xs flex items-center gap-1">
                              <span>🌿</span>
                              <span>2 Sizes ({product.allPacks.map((p) => p.weight).join(' / ')})</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-[#1E281D]/80 text-white font-bold text-[9px] sm:text-[10px] shadow-xs backdrop-blur-xs flex items-center gap-1">
                              <span>📦</span>
                              <span>{product.allPacks[0]?.weight || product.weight || 'Pack'}</span>
                            </span>
                          )}

                          {/* Right Badge: Popularity */}
                          {product.isPopular && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[9px] sm:text-[10px] shadow-xs flex items-center gap-0.5">
                              <span>⭐</span>
                              <span className="hidden sm:inline">Best Seller</span>
                              <span className="sm:hidden">Hot</span>
                            </span>
                          )}
                        </div>

                        {/* Desktop Hover Quick View Pill */}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                          <span className="px-3.5 py-2 rounded-xl bg-[#4D583F] text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Quick View</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 space-y-3">
                        <div className="space-y-1.5">
                          {/* Category Tag */}
                          <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800 truncate">
                            {product.category.replace(' Alternatives', '').replace(' Retail Pack', '')}
                          </div>

                          {/* Product Title */}
                          <h3 className="text-sm sm:text-base md:text-lg font-black text-[#1E201D] leading-tight group-hover:text-emerald-900 transition-colors line-clamp-1">
                            {product.name}
                          </h3>

                          {/* Short Description */}
                          <p className="text-[11px] sm:text-xs text-[#61665D] line-clamp-1 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Clean Pack Sizes Strip */}
                          {product.hasBothPacks ? (
                            <div className="pt-1 flex flex-wrap items-center gap-1.5">
                              {product.allPacks.map((pack, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-[#F4F7F0] border border-[#E0E6D8] text-[10px] sm:text-[11px] font-bold text-[#2A3123] flex items-center gap-1"
                                >
                                  <span className="font-semibold text-gray-600">{pack.weight}:</span>
                                  <span className="font-black text-[#4D583F]">₹{pack.price}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="pt-1 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-[#F4F7F0] border border-[#E0E6D8] text-[10px] font-bold text-[#2A3123]">
                                Single Pack · {product.allPacks[0]?.weight || product.weight}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Price & Action Row */}
                        <div className="pt-2.5 border-t border-[#4F534C]/10 flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-base sm:text-xl font-black text-[#1E201D]">
                                ₹{product.minPrice}
                              </span>
                              {product.hasBothPacks && product.minPrice !== product.maxPrice && (
                                <span className="text-xs sm:text-sm font-bold text-gray-500">
                                  – ₹{product.maxPrice}
                                </span>
                              )}
                            </div>

                            {discountPercent > 0 && (
                              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                                <span className="text-gray-400 line-through font-medium">₹{product.minMrp}</span>
                                <span className="font-black text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">
                                  {discountPercent}% OFF
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (product.hasBothPacks) {
                                router.push(`/product/${product.id}`);
                              } else {
                                addToCart({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  weight: product.weight,
                                  image: product.image,
                                  category: product.category,
                                }, 1);
                                showToast(`Added ${product.name} (${product.weight}) to cart!`, 'success');
                              }
                            }}
                            className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-[#4D583F] hover:bg-[#3B4430] text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{product.hasBothPacks ? 'Select Size' : 'Add'}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-14 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-10 py-3.5 rounded-full border border-[#4D583F]/30 text-[#1E201D] font-bold text-sm hover:border-[#4D583F] hover:bg-[#4D583F] hover:text-white transition-all shadow-xs"
              >
                View Complete Shop Catalog
              </Link>
            </div>
          </div>
        </section>

        {/* Why Switch to Sakthi Plant-Based Meats Comparison Section */}
        <section id="why-switch" className="site-shell py-12 md:py-16 relative z-10 bg-transparent">
          <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-black tracking-widest uppercase shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Health & Sustainability</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-[#1E201D] tracking-tight font-poppins">
                Why Switch to Sakthi Vegan Meats?
              </h2>
              <p className="text-sm sm:text-base text-[#61665D] leading-relaxed">
                Experience the authentic taste and fibrous chew of real meat, upgraded with superior plant nutrition, zero cholesterol, and a clean eco footprint.
              </p>
            </div>

            {/* Dynamic Comparison Grid with Interactive Animated Meters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Metric 1: Protein */}
              <div className="shine-container bg-white rounded-3xl p-6 sm:p-7 border border-[#4F534C]/12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-black text-[#1E201D] flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                        <Flame className="w-5 h-5 text-emerald-500 animate-pulse" />
                      </span>
                      <span>Protein Content</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                      +20% Extra
                    </span>
                  </div>

                  <div className="space-y-3 mt-4">
                    {/* Sakthi Vegan */}
                    <div className="bg-[#F4F7F0] p-3.5 rounded-2xl border border-emerald-100/80 transition-all group-hover:border-emerald-300">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-emerald-950 font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sakthi Vegan
                        </span>
                        <span className="font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          24g / 100g
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-emerald-200/60 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 w-full transition-all duration-1000 group-hover:brightness-110" />
                      </div>
                    </div>

                    {/* Animal Meat */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/60 opacity-75">
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-600 mb-1.5">
                        <span>Animal Meat</span>
                        <span className="font-bold text-gray-700">20g / 100g</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-400 w-[78%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                  <span>✨ 100% plant protein for faster muscle recovery & energy.</span>
                </div>
              </div>

              {/* Metric 2: Cholesterol */}
              <div className="shine-container bg-white rounded-3xl p-6 sm:p-7 border border-[#4F534C]/12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-black text-[#1E201D] flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
                        <Heart className="w-5 h-5 text-sky-500 animate-scale-pulse" />
                      </span>
                      <span>Cholesterol</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-black border border-sky-200">
                      100% Safe
                    </span>
                  </div>

                  <div className="space-y-3 mt-4">
                    {/* Sakthi Vegan */}
                    <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 transition-all group-hover:border-sky-300">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-sky-950 font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Sakthi Vegan
                        </span>
                        <span className="font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                          0 mg (Zero Risk)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-sky-200/60 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 w-[5%]" />
                      </div>
                    </div>

                    {/* Animal Meat */}
                    <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/60">
                      <div className="flex justify-between items-center text-xs font-semibold text-rose-900 mb-1.5">
                        <span>Animal Meat</span>
                        <span className="font-black text-rose-700">90 mg (High)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-rose-200 overflow-hidden">
                        <div className="h-full rounded-full bg-rose-500 w-[90%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-sky-800 flex items-center gap-1">
                  <span>❤️ Zero arterial clogging • Certified heart-friendly nutrition.</span>
                </div>
              </div>

              {/* Metric 3: Fiber */}
              <div className="shine-container bg-white rounded-3xl p-6 sm:p-7 border border-[#4F534C]/12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-black text-[#1E201D] flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                        <Leaf className="w-5 h-5 text-amber-500 animate-float-subtle" />
                      </span>
                      <span>Dietary Fiber</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-200">
                      Gut Friendly
                    </span>
                  </div>

                  <div className="space-y-3 mt-4">
                    {/* Sakthi Vegan */}
                    <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100 transition-all group-hover:border-amber-300">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-amber-950 font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Sakthi Vegan
                        </span>
                        <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          6g Fiber
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-amber-200/60 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 w-[85%]" />
                      </div>
                    </div>

                    {/* Animal Meat */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/60 opacity-75">
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-600 mb-1.5">
                        <span>Animal Meat</span>
                        <span className="font-bold text-gray-700">0g Fiber (Zero)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-400 w-0" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                  <span>🌿 Promotes smooth digestion with natural plant prebiotics.</span>
                </div>
              </div>

              {/* Metric 4: Antibiotics & Hormones */}
              <div className="shine-container bg-white rounded-3xl p-6 sm:p-7 border border-[#4F534C]/12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-400 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-black text-[#1E201D] flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-5 h-5 text-purple-600 animate-scale-pulse" />
                      </span>
                      <span>Hormones & Antibiotics</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
                      Clean Label
                    </span>
                  </div>

                  <div className="space-y-3 mt-4">
                    {/* Sakthi Vegan */}
                    <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100 transition-all group-hover:border-purple-300">
                      <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                        <span className="text-purple-950 font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Sakthi Vegan
                        </span>
                        <span className="font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                          100% Free & Pure
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-purple-200/60 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 w-full" />
                      </div>
                    </div>

                    {/* Animal Meat */}
                    <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/60 opacity-75">
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-600 mb-1.5">
                        <span>Animal Meat</span>
                        <span className="font-bold text-gray-700">Antibiotics / Synthetic Feeds</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-400 w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-purple-800 flex items-center gap-1">
                  <span>🛡️ Non-GMO soy & pea protein. Zero synthetic chemicals.</span>
                </div>
              </div>

              {/* Metric 5 (Spans 2 columns on lg): Environmental & Sustainability Impact */}
              <div className="bg-gradient-to-br from-[#273624] via-[#1E2B1C] to-[#141E13] rounded-3xl p-6 sm:p-8 shadow-2xl lg:col-span-2 relative overflow-hidden group border border-emerald-500/20 text-white flex flex-col justify-between">
                {/* Background Ambient Glow & Floating Icons */}
                <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none animate-float-gentle">
                  <Leaf className="w-72 h-72 text-emerald-400" />
                </div>
                <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                        <Zap className="w-6 h-6" />
                      </span>
                      <span>Environmental Footprint Savings</span>
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 backdrop-blur-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Eco-Certified Impact</span>
                    </span>
                  </div>

                  {/* 3 Animated Planet Impact Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Land Savings */}
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all group-hover:scale-[1.02]">
                      <div className="text-2xl sm:text-3xl font-black text-emerald-400 mb-1">
                        90% Less
                      </div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider">
                        Land Usage
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                        Spares forests & biodiversity compared to cattle grazing.
                      </p>
                    </div>

                    {/* Water Savings */}
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all group-hover:scale-[1.02]">
                      <div className="text-2xl sm:text-3xl font-black text-sky-400 mb-1">
                        85% Less
                      </div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider">
                        Fresh Water
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                        Saves ~1,500 litres of precious water with every single pack.
                      </p>
                    </div>

                    {/* Carbon Emissions */}
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all group-hover:scale-[1.02]">
                      <div className="text-2xl sm:text-3xl font-black text-amber-400 mb-1">
                        80% Lower
                      </div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider">
                        CO₂ Emissions
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                        Dramatically curbs methane & greenhouse warming gases.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-300 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span>🌱 Every delicious bite is a step toward a greener, kinder planet.</span>
                  </div>
                  <Link
                    href="/shop"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95"
                  >
                    Taste the Future →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* React Bits Style Scroll Stack Mock Meat Procedure Section */}
        <ScrollStackProcedure />

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
        <section className="bg-transparent border-y border-[#4F534C]/15 py-14 md:py-20 w-full relative z-10 overflow-hidden">
          {/* Subtle culinary background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#4D583F]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#4F534C]/15 text-[#4D583F] text-xs font-black uppercase tracking-wider shadow-xs">
                <ChefHat className="w-4 h-4 text-emerald-600 animate-float-subtle" />
                <span>Chef &amp; Kitchen FAQs</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1E201D] font-display tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-[#61665D] leading-relaxed">
                Got questions? We&apos;ve got answers straight from the Sakthi master kitchen.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'border-[#4D583F]/35 bg-white shadow-md'
                        : 'border-[#4F534C]/15 bg-[#FAFAF5] hover:bg-white hover:border-[#4D583F]/25 shadow-xs'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 text-left font-bold text-sm sm:text-base text-[#1E201D] flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isOpen
                            ? 'bg-[#4D583F] text-white shadow-sm'
                            : 'bg-[#E8EEE0] text-[#4D583F] group-hover:bg-[#4D583F] group-hover:text-white'
                        }`}>
                          <ChefHat className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                          <span className="font-extrabold text-[#1E201D] group-hover:text-[#4D583F] transition-colors">{faq.q}</span>
                          {faq.tag && (
                            <span className="self-start sm:self-auto text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 shrink-0">
                              {faq.tag}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? 'bg-[#E8EEE0] text-[#4D583F]' : 'bg-transparent text-[#61665D]'
                      }`}>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-[#4D583F]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 group-hover:text-[#1E201D]" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4D534B] leading-relaxed border-t border-[#4F534C]/10 space-y-3">
                        <p>{faq.a}</p>
                        
                        {faq.chefTip && (
                          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-3 text-amber-950">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              <ChefHat className="w-4 h-4 text-amber-700" />
                            </div>
                            <div className="text-[12px] sm:text-[13px] leading-relaxed">
                              <span className="font-extrabold text-amber-900 block sm:inline mr-1">Chef&apos;s Pro Tip:</span>
                              <span>{faq.chefTip}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chef Support Footer Card */}
            <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-white border border-[#4F534C]/12 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#4D583F] text-white flex items-center justify-center shrink-0 shadow-md">
                  <ChefHat className="w-6 h-6 animate-scale-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-[#1E201D]">Have a Custom Cooking or Bulk Culinary Question?</h4>
                  <p className="text-xs text-[#61665D]">Our Master Chef team is ready to help you with personalized recipes &amp; pairings.</p>
                </div>
              </div>
              <a
                href="https://wa.me/919876543210?text=Hi%20Chef!%20I%20have%20a%20culinary%20recipe%20question%20about%20Sakthi%20Frozen%20Foods."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#4D583F] hover:bg-[#3D4732] text-white text-xs font-extrabold flex items-center gap-2 shrink-0 shadow-sm active:scale-95 transition-all"
              >
                <ChefHat className="w-3.5 h-3.5" />
                Ask Master Chef
              </a>
            </div>
          </div>
        </section>

        {/* WhatsApp VIP Community Section */}
        <section className="site-shell py-10 md:py-14 relative z-10">
          <div className="rounded-3xl bg-gradient-to-r from-[#1E201D] via-[#122A1E] to-[#1E201D] text-white p-6 sm:p-8 md:p-14 shadow-2xl border border-[#25D366]/30 relative overflow-hidden">
            {/* Ambient Green Glow */}
            <div className="absolute top-0 right-10 w-72 h-72 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto text-center space-y-4 md:space-y-6 relative z-10">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#25D366] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#25D366]/30">
                <WhatsAppIcon className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>

              <div className="space-y-2">
                <span className="px-3.5 py-1 rounded-full bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-[10px] sm:text-xs font-black uppercase tracking-wider inline-block">
                  Open WhatsApp Community
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black font-display leading-tight">
                  Join Our Sakthi WhatsApp Community
                </h2>
              </div>

              <p className="text-xs md:text-sm text-[#C5C8C4] max-w-lg mx-auto leading-relaxed">
                Connect directly with 10,000+ plant-based foodies! Get instant stock updates, delicious cooking recipes, and fast customer support on WhatsApp.
              </p>

              <div className="pt-1 md:pt-2 flex flex-row items-center justify-center gap-2 sm:gap-4 w-full">
                <a
                  href="https://wa.me/919876543210?text=Hi%20Sakthi%20Frozen%20Foods!%20I%20want%20to%20join%20the%20WhatsApp%20Community."
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

              <div className="pt-3 md:pt-4 flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-[#A7ADA9] max-w-[85vw] mx-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#25D366] shrink-0" />
                <span className="whitespace-nowrap">Zero Spam • Instant Community Support • Free Recipe Updates</span>
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
