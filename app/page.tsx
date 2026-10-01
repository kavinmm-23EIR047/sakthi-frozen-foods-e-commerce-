'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransparentPattyGraphic from '@/components/TransparentPattyGraphic';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductType } from '@/lib/types';
import { fetchApi } from '@/lib/apiConfig';
import {
  LayoutGrid,
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
  Check,
  Truck,
  Award
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

// 5 Official Full-Art Banner Images from Workspace Assets
const HERO_BANNERS = [
  {
    id: 'corn-cheese-balls',
    image: '/assets/813a46d7-0030-47c9-af6a-3db11c6edbc7.jpg',
    title: 'Crispy Corn Cheese Balls',
    subtitle: '100% Veg. 100% Delicious.',
    category: 'Snacks & Starters',
    link: '/shop?category=Snacks%20%26%20Starters',
    thumbLabel: 'Crispy Corn Cheese Balls',
    thumbImage: '/assets/813a46d7-0030-47c9-af6a-3db11c6edbc7.jpg',
  },
  {
    id: 'mock-mutton',
    image: '/assets/0e18a4d9-5d57-4c36-8768-8e7d790a4b5d.jpg',
    title: 'Flavorful Mock Mutton',
    subtitle: '100% VEG. 100% DELICIOUS.',
    category: 'Mutton Alternatives',
    link: '/shop?category=Mutton%20Alternatives',
    thumbLabel: 'Mock Mutton Curry',
    thumbImage: '/assets/0e18a4d9-5d57-4c36-8768-8e7d790a4b5d.jpg',
  },
  {
    id: 'veg-chicken-cutlet',
    image: '/assets/928db126-f62c-4d88-a874-f3d8c08d68bd.jpg',
    title: 'Veg Chicken Cutlet',
    subtitle: '100% Veg. 100% Delicious.',
    category: 'Snacks & Starters',
    link: '/shop?category=Snacks%20%26%20Starters',
    thumbLabel: 'Veg Starters',
    thumbImage: '/assets/928db126-f62c-4d88-a874-f3d8c08d68bd.jpg',
  },
  {
    id: 'sweet-corn',
    image: '/assets/c0410062-941f-4ab6-bcc8-b9b2ffd98cc1.jpg',
    title: 'Golden Sweet Corn',
    subtitle: '100% Veg. 100% Delicious.',
    category: 'Frozen Veggies',
    link: '/shop?category=Snacks%20%26%20Starters',
    thumbLabel: 'Sweet Corn',
    thumbImage: '/assets/c0410062-941f-4ab6-bcc8-b9b2ffd98cc1.jpg',
  },
  {
    id: 'french-fries',
    image: '/assets/a677a7a9-c56a-4885-a823-51be3e0177b3.jpg',
    title: 'Crispy French Fries',
    subtitle: 'Golden, Hot & Crunchy',
    category: 'Snacks & Starters',
    link: '/shop?category=Snacks%20%26%20Starters',
    thumbLabel: 'French Fries',
    thumbImage: '/assets/a677a7a9-c56a-4885-a823-51be3e0177b3.jpg',
  },
];

// Category Image Fallback Helper
function getCategoryFallbackImage(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('mutton') || n.includes('meat') || n.includes('vegan')) return '/assets/mock-mutton.jpg';
  if (n.includes('cheese') || n.includes('ball') || n.includes('starter') || n.includes('snack')) return '/assets/corn-cheese-balls.jpg';
  if (n.includes('cutlet') || n.includes('chicken') || n.includes('combo')) return '/assets/dish-crispy-cutlets.jpg';
  if (n.includes('corn') || n.includes('veggie') || n.includes('frozen')) return '/assets/sweet-corn.jpg';
  if (n.includes('fry') || n.includes('fries') || n.includes('french')) return '/assets/french-fries.jpg';
  if (n.includes('retail')) return '/assets/c0410062-941f-4ab6-bcc8-b9b2ffd98cc1.jpg';
  return '/assets/mock-mutton.jpg';
}

interface CategoryItem {
  id?: string;
  name: string;
  shortName?: string;
  link: string;
  img: string;
  description?: string;
}

// 5 Official Default Categories matching the design mockup
const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    name: 'Vegan Meat',
    shortName: 'Vegan Meat',
    link: '/shop?category=Mutton%20Alternatives',
    img: '/assets/mock-mutton.jpg',
  },
  {
    name: 'Starters',
    shortName: 'Starters',
    link: '/shop?category=Snacks%20%26%20Starters',
    img: '/assets/corn-cheese-balls.jpg',
  },
  {
    name: 'Retail Packs',
    shortName: 'Retail Packs',
    link: '/shop?category=Retail%20Packs',
    img: '/assets/c0410062-941f-4ab6-bcc8-b9b2ffd98cc1.jpg',
  },
  {
    name: 'Combo Packs',
    shortName: 'Combo Packs',
    link: '/shop?category=Combos',
    img: '/assets/dish-crispy-cutlets.jpg',
  },
  {
    name: 'Frozen Veggies',
    shortName: 'Frozen Veggies',
    link: '/shop?category=Snacks%20%26%20Starters',
    img: '/assets/sweet-corn.jpg',
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
          label: isRetail ? `Retail (${cleanWeight})` : `Wholesale (${cleanWeight})`,
          weight: cleanWeight,
          price: item.price,
          mrp: item.mrp ?? Math.round(item.price * 1.25),
          id: item.id,
        });
      }

      if (item.variants && Array.isArray(item.variants)) {
        item.variants.forEach((v) => {
          const vClean = formatCleanWeight(v.weight);
          const vKey = vClean.toLowerCase();
          const vIsRetail = vClean.includes('200') || vClean.includes('250') || vClean.includes('300') || vClean.includes('400') || vClean.includes('500');
          if (!packMap.has(vKey)) {
            packMap.set(vKey, {
              type: vIsRetail ? 'retail' : 'regular',
              label: vIsRetail ? `Retail (${vClean})` : `Wholesale (${vClean})`,
              weight: vClean,
              price: Number(v.price),
              mrp: Math.round(Number(v.price) * 1.25),
              id: item.id,
            });
          }
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
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [heroDishIndex, setHeroDishIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [topProducts, setTopProducts] = useState<UnifiedProduct[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
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

  // Pointer / Touch Drag State for Category Carousel on Tab and Mobile
  const [isDraggingCategory, setIsDraggingCategory] = useState(false);
  const [categoryStartX, setCategoryStartX] = useState(0);
  const [categoryScrollStart, setCategoryScrollStart] = useState(0);
  const [categoryMoved, setCategoryMoved] = useState(false);

  const handleCategoryPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (!categoryScrollRef.current) return;
    setIsDraggingCategory(true);
    setCategoryMoved(false);
    setCategoryStartX(e.clientX);
    setCategoryScrollStart(categoryScrollRef.current.scrollLeft);
  };

  const handleCategoryPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (!isDraggingCategory || !categoryScrollRef.current) return;
    const diff = e.clientX - categoryStartX;
    if (Math.abs(diff) > 4) {
      setCategoryMoved(true);
      categoryScrollRef.current.scrollLeft = categoryScrollStart - diff;
    }
  };

  const handleCategoryPointerUpOrCancel = () => {
    setIsDraggingCategory(false);
  };

  const handleCategoryWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!categoryScrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      categoryScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleCategoryItemClick = (e: React.MouseEvent, link: string) => {
    if (categoryMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    router.push(link);
  };

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

        if (catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
          const cats: CategoryItem[] = catRes.data.map((c: any) => ({
            id: c.id || c._id,
            name: c.name,
            shortName: c.name,
            link: `/shop?category=${encodeURIComponent(c.name)}`,
            img: c.image && c.image.trim() !== '' ? c.image : getCategoryFallbackImage(c.name),
            description: c.description || '100% Plant-Based',
          }));
          setCategoriesList(cats);
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

  const toggleSaveProduct = (e: React.MouseEvent, product: UnifiedProduct) => {
    e.stopPropagation();
    toggleWishlist(product);
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
        {/* 1. HERO SECTION (Leaf Garnishes, Natural Content Flow & Clean Artwork Card) */}
        {/* ========================================================================= */}
        <section className="relative w-full py-2 sm:py-4 lg:py-6 overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
            <div className="relative w-full bg-[#FAFDF6] rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-white/80 shadow-xs overflow-hidden isolate">

              {/* Botanical Leaf SVG Corner Garnishes */}
              <svg className="absolute -top-6 -left-6 w-24 h-24 sm:w-32 sm:h-32 text-[#656B4F]/15 pointer-events-none -z-10 rotate-12" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 0 C20 30 10 60 50 100 C90 60 80 30 50 0 Z M50 20 C60 40 65 60 50 85 C35 60 40 40 50 20 Z" />
              </svg>
              <svg className="absolute -bottom-8 -right-8 w-28 h-28 sm:w-36 sm:h-36 text-[#86EFAC]/20 pointer-events-none -z-10 -rotate-45" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 0 C20 30 10 60 50 100 C90 60 80 30 50 0 Z" />
              </svg>

              {/* Ambient Background Glows */}
              <div className="absolute top-0 left-0 w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] bg-gradient-to-br from-[#86EFAC]/20 via-[#BBF7D0]/10 to-transparent rounded-full blur-[60px] sm:blur-[90px] pointer-events-none -z-10" />
              <div className="absolute bottom-0 left-1/4 w-[240px] sm:w-[360px] h-[240px] sm:h-[360px] bg-gradient-to-tr from-[#FEF08A]/15 via-[#FEF9C3]/8 to-transparent rounded-full blur-[60px] sm:blur-[80px] pointer-events-none -z-10" />

              {/* Responsive Grid Layout - Side-by-Side Left & Right on PC/Desktop (lg:) & Full Width on Tablet/Mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-0 lg:min-h-[500px]">

                {/* Left Column: Headline, Highlights, CTA Buttons, and Trust Strip */}
                <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between p-4 sm:p-7 lg:p-10 text-left z-10 space-y-4 sm:space-y-5">

                  {/* Top Text Block */}
                  <div className="space-y-2.5 sm:space-y-3.5">
                    {/* Pulsing Brand Tagline */}
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:py-1 rounded-full bg-[#EAF0E5] border border-white text-[#50563D] text-[10px] sm:text-xs font-black uppercase tracking-wider w-fit shadow-2xs">
                      <span className="relative flex h-1.5 sm:h-2 w-1.5 sm:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#656B4F] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 sm:h-2 w-1.5 sm:w-2 bg-[#656B4F]"></span>
                      </span>
                      <span>100% VEGETARIAN • PLANT-BASED MEATS</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[44px] font-black tracking-tight leading-[1.12]">
                      <span className="text-[#50563D] block">Authentic Taste</span>
                      <span className="bg-gradient-to-r from-[#50563D] via-[#656B4F] to-[#7B8361] bg-clip-text text-transparent">
                        A Kinder{' '}
                      </span>
                      <span className="bg-gradient-to-r from-[#D97706] to-[#CA8A04] bg-clip-text text-transparent">
                        Tomorrow.
                      </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[11px] sm:text-xs lg:text-sm text-[#656B4F] max-w-lg font-medium leading-relaxed">
                      Enjoy the same rich taste and satisfying texture as real meat — made from plants, for a healthier you and a healthier planet.
                    </p>

                    {/* 4 Feature Badges in Full Horizontal Row spanning full width */}
                    <div className="py-1 sm:py-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full">
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 border border-[#656B4F]/20 px-2.5 py-1.5 rounded-xl shadow-2xs">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center shrink-0 shadow-2xs">
                          <Leaf className="w-3.5 h-3.5 text-[#656B4F] fill-[#656B4F]/20" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] sm:text-xs font-black text-[#50563D] block leading-tight">100%</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-[#656B4F] block leading-tight truncate">Plant Based</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 border border-[#DC2626]/15 px-2.5 py-1.5 rounded-xl shadow-2xs">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FEEBEA] text-[#DC2626] flex items-center justify-center shrink-0 shadow-2xs">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] sm:text-xs font-black text-[#5C1616] block leading-tight truncate">No Hormones</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-[#6E4848] block leading-tight truncate">No Antibiotics</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 border border-[#0D9488]/15 px-2.5 py-1.5 rounded-xl shadow-2xs">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E2F7F2] text-[#0D9488] flex items-center justify-center shrink-0 shadow-2xs">
                          <Utensils className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] sm:text-xs font-black text-[#0B4842] block leading-tight truncate">Ready to Cook</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-[#3D6460] block leading-tight truncate">Quick & Easy</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 border border-[#E11D48]/15 px-2.5 py-1.5 rounded-xl shadow-2xs">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FCE8E6] text-[#E11D48] flex items-center justify-center shrink-0 shadow-2xs">
                          <Heart className="w-3.5 h-3.5 text-[#E11D48] fill-[#E11D48]/20" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] sm:text-xs font-black text-[#591422] block leading-tight truncate">Rich in</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-[#733F4A] block leading-tight truncate">Protein & Fiber</span>
                        </div>
                      </div>
                    </div>

                    {/* Perfectly Aligned Horizontal Action Buttons */}
                    <div className="pt-1 flex flex-row items-center gap-2.5 sm:gap-3 w-full">
                      <Link
                        href="/shop"
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#50563D] hover:bg-[#3D422E] text-white font-black text-xs sm:text-sm transition-all shadow-md hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 text-center whitespace-nowrap"
                      >
                        <span>Shop Now</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>

                      <a
                        href="#how-its-made"
                        className="flex-1 sm:flex-none px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white hover:bg-[#F2F6ED] text-[#50563D] font-bold text-xs sm:text-sm border border-stone-200 transition-all shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 text-center whitespace-nowrap"
                      >
                        <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#50563D] text-[#50563D]" />
                        <span>Watch Story</span>
                      </a>
                    </div>
                  </div>

                  {/* Brand Value Grid Bar - Full Width Horizontal */}
                  <div className="pt-2.5 border-t border-[#E1EFE0] grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left w-full">
                    <div className="flex items-center gap-1.5 min-w-0 bg-white/60 sm:bg-transparent p-1.5 sm:p-0 rounded-lg">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center shrink-0 shadow-2xs">
                        <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold text-[#50563D] block leading-tight whitespace-nowrap">Cold-Chain</span>
                        <span className="text-[8px] sm:text-[10px] text-[#656B4F] block leading-tight whitespace-nowrap">Frozen Express</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0 bg-white/60 sm:bg-transparent p-1.5 sm:p-0 rounded-lg">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center shrink-0 shadow-2xs">
                        <Award className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold text-[#50563D] block leading-tight whitespace-nowrap">Premium</span>
                        <span className="text-[8px] sm:text-[10px] text-[#656B4F] block leading-tight whitespace-nowrap">Non-GMO</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0 bg-white/60 sm:bg-transparent p-1.5 sm:p-0 rounded-lg">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center shrink-0 shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold text-[#50563D] block leading-tight whitespace-nowrap">100% Hygienic</span>
                        <span className="text-[8px] sm:text-[10px] text-[#656B4F] block leading-tight whitespace-nowrap">FSSAI Certified</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0 bg-white/60 sm:bg-transparent p-1.5 sm:p-0 rounded-lg">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center shrink-0 shadow-2xs">
                        <Flame className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold text-[#50563D] block leading-tight whitespace-nowrap">Real Spices</span>
                        <span className="text-[8px] sm:text-[10px] text-[#656B4F] block leading-tight whitespace-nowrap">Authentic Flavor</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Hero Banner Image Slider - Edge-to-Edge Full Cover Image */}
                <div className="lg:col-span-6 xl:col-span-6 p-2 sm:p-4 lg:p-0 flex items-center justify-center">
                  <div
                    className="relative w-full h-[280px] xs:h-[340px] sm:h-[420px] lg:h-full min-h-[280px] xs:min-h-[340px] sm:min-h-[420px] lg:min-h-[500px] rounded-2xl sm:rounded-3xl lg:rounded-r-[32px] lg:rounded-l-none border-2 sm:border-4 border-white shadow-md overflow-hidden group select-none flex items-center justify-center"
                    onMouseEnter={() => setIsHeroHovered(true)}
                    onMouseLeave={() => setIsHeroHovered(false)}
                  >
                    <img
                      src={currentHeroBanner.image}
                      alt={currentHeroBanner.title}
                      className="w-full h-full object-cover object-center transition-all duration-700 pointer-events-none"
                    />

                    {/* Gradient Overlay for Sleek Controls Visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

                    {/* Slider Navigation Controls */}
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-5 z-20 bg-black/75 backdrop-blur-md px-3 py-1 sm:py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-2 sm:gap-2.5">
                      <button
                        onClick={prevHeroSlide}
                        aria-label="Previous Slide"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center shadow-xs active:scale-90 transition-all"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>

                      <div className="flex items-center gap-1 sm:gap-1.5 px-0.5">
                        {HERO_BANNERS.map((banner, dotIdx) => (
                          <button
                            key={banner.id}
                            onClick={() => setHeroDishIndex(dotIdx)}
                            className={`transition-all duration-300 rounded-full ${heroDishIndex === dotIdx
                                ? 'w-4 sm:w-5 h-1.5 sm:h-2 bg-[#4ADE80]'
                                : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/80'
                              }`}
                            aria-label={`Go to slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={nextHeroSlide}
                        aria-label="Next Slide"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center shadow-xs active:scale-90 transition-all"
                      >
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SHOP BY CATEGORY SECTION (Connected to Backend, Full Medium Width & Smooth Mobile/Tab Swipe) */}
        {/* ========================================================================= */}
        <section className="py-6 sm:py-8 lg:py-10 max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1E201D] tracking-tight font-display">
                Shop by Category
              </h2>
              <p className="text-xs sm:text-sm text-[#657563] font-medium mt-0.5">
                Explore our full line of delicious 100% plant-based frozen favorites
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
              {/* Left/Right Floating Scroll Buttons for touch & mouse convenience */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => scrollContainer(categoryScrollRef, 'left')}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-200 bg-white hover:bg-[#EAF0E5] hover:border-[#656B4F]/40 flex items-center justify-center text-stone-700 transition-all shadow-xs active:scale-95"
                  aria-label="Scroll Categories Left"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
                <button
                  onClick={() => scrollContainer(categoryScrollRef, 'right')}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-stone-200 bg-white hover:bg-[#EAF0E5] hover:border-[#656B4F]/40 flex items-center justify-center text-stone-700 transition-all shadow-xs active:scale-95"
                  aria-label="Scroll Categories Right"
                >
                  <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
              </div>

              <Link
                href="/shop"
                className="text-xs sm:text-sm font-black text-[#50563D] hover:text-[#3E442F] flex items-center gap-1 transition-colors px-3.5 py-1.5 rounded-full bg-[#EAF0E5] hover:bg-[#DDE8D6] border border-[#656B4F]/20 shadow-2xs whitespace-nowrap"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Full Medium Width Container on Laptop / Desktop & Smooth Drag/Touch Swipe on Mobile/Tablet */}
          <div
            ref={categoryScrollRef}
            onPointerDown={handleCategoryPointerDown}
            onPointerMove={handleCategoryPointerMove}
            onPointerUp={handleCategoryPointerUpOrCancel}
            onPointerCancel={handleCategoryPointerUpOrCancel}
            onWheel={handleCategoryWheel}
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
              overscrollBehaviorX: 'contain',
              scrollBehavior: 'smooth',
            }}
            className="w-full flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible md:cursor-default md:active:cursor-default"
          >
            {/* All Categories Item */}
            <div
              onClick={(e) => handleCategoryItemClick(e, '/shop')}
              className="group flex w-[132px] sm:w-[160px] md:w-auto min-w-0 bg-[#50563D] hover:bg-[#3E442F] text-white rounded-2xl p-3 sm:p-4 flex-col items-center justify-center shrink-0 md:shrink h-28 sm:h-32 md:h-36 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] cursor-pointer snap-start border border-[#50563D]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-[#EAF0E5]" />
              </div>
              <span className="text-xs sm:text-sm font-black text-white text-center leading-tight">
                All Products
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#EAF0E5]/80 mt-0.5 font-semibold">
                Explore
              </span>
            </div>

            {/* Dynamic Category Items Connected to Backend */}
            {categoriesList.map((cat, idx) => (
              <div
                key={cat.id || idx}
                onClick={(e) => handleCategoryItemClick(e, cat.link)}
                className="group flex w-[132px] sm:w-[160px] md:w-auto min-w-0 bg-white hover:bg-[#F9FCF7] rounded-2xl p-2.5 sm:p-3.5 flex-col items-center justify-center shrink-0 md:shrink h-28 sm:h-32 md:h-36 shadow-xs hover:shadow-md border border-stone-200/80 hover:border-[#656B4F]/40 transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer snap-start"
              >
                <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full overflow-hidden p-0.5 bg-stone-100 border-2 border-white shadow-xs group-hover:scale-110 group-hover:border-[#656B4F]/40 transition-all shrink-0">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full rounded-full object-cover pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getCategoryFallbackImage(cat.name);
                    }}
                  />
                </div>
                <span className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-extrabold text-[#1E201D] group-hover:text-[#50563D] transition-colors text-center leading-tight line-clamp-2 px-1">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. GOOD FOOD DOES GOOD & 3 IMPACT STATS */}
        {/* ========================================================================= */}
        <section className="py-6 md:py-10 site-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

            <div className="lg:col-span-7 bg-[#EAF0E5] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center gap-6 lg:gap-8 shadow-xs border border-[#D4DBC9] text-left relative overflow-hidden">
              <div className="relative shrink-0 flex items-center justify-center w-44 sm:w-52 md:w-60 aspect-square">
                <div className="absolute inset-0 bg-[#D4DBC9]/70 rounded-[40%_60%_70%_30%_/_40%_50%_60%_55%] blur-sm scale-110 pointer-events-none" />
                <div className="absolute -top-3 -left-3 w-24 h-24 bg-[#EAF0E5]/60 rounded-[60%_40%_30%_70%_/_50%_60%_40%_50%] blur-md pointer-events-none" />
                <div className="absolute -bottom-2 -right-2 w-28 h-28 bg-[#D4DBC9]/80 rounded-[50%_50%_60%_40%_/_60%_40%_50%_50%] blur-sm pointer-events-none" />

                <div className="relative w-full h-full rounded-full overflow-hidden shadow-xl z-10">
                  <img
                    src="/assets/good-food-plate.jpg"
                    alt="Good Food Does Good"
                    className="w-full h-full object-cover object-center scale-105 hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>

              <div className="space-y-3 flex-1 z-10">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 border border-[#656B4F]/25 text-[#50563D] text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                  <Leaf className="w-3 h-3 text-[#656B4F]" />
                  <span>Why Sakthi!</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#50563D] font-display tracking-tight leading-tight">
                  Good Food Does Good
                </h3>

                <p className="text-xs sm:text-sm text-[#4E5E4C] leading-relaxed font-medium">
                  We create plant-based meats that taste amazing, nourish your body, and reduce environmental impact.
                </p>

                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-stone-50 text-[#50563D] font-extrabold text-xs shadow-md shadow-black/5 border border-stone-200/80 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#656B4F] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <div className="w-13 h-13 rounded-[16px_24px_18px_26px] bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center mb-2.5 shadow-2xs">
                    <svg className="w-6 h-6 text-[#656B4F]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 2L5 10h4l-3 6h5v4h2v-4h5l-3-6h4L12 2z" />
                    </svg>
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#50563D] font-display tracking-tight">90%</span>
                  <span className="text-xs font-bold text-[#656B4F] mt-0.5">Less Land Usage</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center p-2">
                  <div className="w-13 h-13 rounded-[24px_16px_26px_18px] bg-[#E1F3FE] text-[#0288D1] flex items-center justify-center mb-2.5 shadow-2xs">
                    <svg className="w-6 h-6 text-[#0288D1]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#50563D] font-display tracking-tight">85%</span>
                  <span className="text-xs font-bold text-[#656B4F] mt-0.5">Less Fresh Water</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center pb-2">
                <div className="w-13 h-13 rounded-[20px_26px_16px_24px] bg-[#FDEEE9] text-[#E65100] flex items-center justify-center mb-2 shadow-2xs">
                  <svg className="w-6 h-6 text-[#E65100]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z" />
                    <path d="M9 12.5h1.5a1.5 1.5 0 011.5 1.5v0a1.5 1.5 0 01-1.5 1.5H8" />
                    <path d="M13 12.5h1a1.5 1.5 0 011.5 1.5v0a1.5 1.5 0 01-1.5 1.5h-1" />
                  </svg>
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#50563D] font-display tracking-tight">80%</span>
                <span className="text-xs font-bold text-[#656B4F] mt-0.5">Lower CO₂ Emissions</span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. FEATURED PRODUCTS SECTION */}
        {/* ========================================================================= */}
        <section className="py-10 md:py-14 site-shell">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1E201D] tracking-tight font-display">
                Featured Products
              </h2>
              <p className="text-xs sm:text-sm text-[#61665D] mt-0.5">
                Our most-loved plant-based meats, chosen by customers like you.
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
              <Link
                href="/shop"
                className="text-xs sm:text-sm font-black text-[#50563D] hover:text-[#3E442F] flex items-center gap-1 transition-colors px-3.5 py-1.5 rounded-full bg-[#EAF0E5] hover:bg-[#DDE8D6] border border-[#656B4F]/20 shadow-2xs whitespace-nowrap"
              >
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => scrollContainer(productScrollRef, 'left')}
                  className="w-8 h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors shadow-2xs active:scale-95"
                  aria-label="Previous products"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollContainer(productScrollRef, 'right')}
                  className="w-8 h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors shadow-2xs active:scale-95"
                  aria-label="Next products"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={productScrollRef}
            className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none scrollbar-hide no-scrollbar"
          >
            {topProducts.slice(0, 4).map((p, idx) => (
              <div
                key={p.id || idx}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all p-3.5 flex flex-col justify-between group relative w-[220px] xs:w-[240px] sm:w-auto shrink-0 snap-start"
              >
                <div className="relative w-full aspect-square max-h-[240px] rounded-xl overflow-hidden bg-stone-50 mb-3 border border-stone-100 flex items-center justify-center">
                  <Link href={`/product/${p.id}`} className="w-full h-full block">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#F4F7F0]">
                        <Utensils className="w-8 h-8 text-[#656B4F]/60 mb-2" />
                        <span className="text-xs font-bold text-[#50563D]">{p.name}</span>
                      </div>
                    )}
                  </Link>

                  <button
                    onClick={(e) => toggleSaveProduct(e, p)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-rose-600 transition-colors shadow-2xs"
                    title={isInWishlist(p.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                    aria-label={isInWishlist(p.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${isInWishlist(p.id) ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                  </button>
                </div>

                <div className="space-y-1 mb-3">
                  <Link href={`/product/${p.id}`}>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#1E201D] group-hover:text-[#50563D] transition-colors line-clamp-2 min-h-[44px] leading-snug">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#61665D] line-clamp-2 min-h-[32px] leading-relaxed">
                    {p.description || 'Juicy, tender and full of authentic flavor.'}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-black text-sm text-[#1E201D]">₹{p.price}</span>
                      {p.mrp && p.mrp > p.price && (
                        <span className="text-[10px] text-stone-400 line-through">₹{p.mrp}</span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-[#50563D] bg-[#EAF0E5] px-2 py-0.5 rounded-full border border-[#656B4F]/20">
                      {p.weight || '1 KG'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleAddToCart(p, e)}
                  className="w-full py-2.5 rounded-xl bg-[#50563D] hover:bg-[#151F12] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. HOW SAKTHI MOCK MEAT IS MADE */}
        {/* ========================================================================= */}
        <section id="how-its-made" className="py-4 md:py-6 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full bg-[#0D2413] text-white rounded-[20px] sm:rounded-[24px] py-4 sm:py-5 px-4 sm:px-8 lg:px-10 relative overflow-hidden shadow-xl border border-[#1A3D21]">
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
              <div className="absolute -left-16 -top-16 w-48 h-48 bg-[#34D399]/20 rounded-full blur-3xl" />
              <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-60 h-60 bg-[#25D366]/15 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-row items-center justify-between gap-2.5 sm:gap-6 lg:gap-8">
              <div className="flex-1 min-w-0 space-y-2 sm:space-y-3 text-left">
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 pt-1.5 sm:pt-2.5 border-t border-[#1F4525]/60">
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

              <div className="relative shrink-0 flex items-center justify-center">
                <div className="relative w-24 xs:w-28 sm:w-36 md:w-44 h-24 xs:h-28 sm:h-36 md:h-44 flex items-center justify-center">
                  <div className="absolute top-0 -left-6 xs:-left-8 sm:-left-10 z-20 text-left pointer-events-none select-none">
                    <div className="font-serif italic leading-none space-y-0.5">
                      <span className="text-[#6EE7B7] text-[8px] xs:text-[9px] sm:text-[11px] font-bold block whitespace-nowrap drop-shadow-sm">
                        * Real Taste
                      </span>
                      <span className="text-white text-[8px] xs:text-[9px] sm:text-[11px] font-extrabold block whitespace-nowrap drop-shadow-sm">
                        Plant Power
                      </span>
                    </div>
                    <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 text-white stroke-current fill-none -rotate-6 mt-0.5 ml-1 drop-shadow-sm" viewBox="0 0 54 54">
                      <path d="M 6 8 C 18 16, 24 32, 18 42 C 22 46, 34 44, 48 36" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 36 32 L 48 36 L 42 48" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

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
        {/* 6. TASTY RECIPES */}
        {/* ========================================================================= */}
        <section className="py-10 md:py-14 site-shell">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1E201D] tracking-tight font-display">
                Tasty Recipes
              </h2>
              <p className="text-xs sm:text-sm text-[#61665D] mt-0.5">
                Simple recipes with big flavors.
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
              <Link
                href="/shop"
                className="text-xs sm:text-sm font-black text-[#50563D] hover:text-[#3E442F] flex items-center gap-1 transition-colors px-3.5 py-1.5 rounded-full bg-[#EAF0E5] hover:bg-[#DDE8D6] border border-[#656B4F]/20 shadow-2xs whitespace-nowrap"
              >
                <span>View All Recipes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => scrollContainer(recipeScrollRef, 'left')}
                  className="w-8 h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors shadow-2xs active:scale-95"
                  aria-label="Previous recipes"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollContainer(recipeScrollRef, 'right')}
                  className="w-8 h-8 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-colors shadow-2xs active:scale-95"
                  aria-label="Next recipes"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={recipeScrollRef}
            className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none scrollbar-hide no-scrollbar"
          >
            {RECIPES.map((recipe, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all p-3 flex flex-col group cursor-pointer w-[220px] xs:w-[240px] sm:w-auto shrink-0 snap-start"
              >
                <div className="relative w-full aspect-[4/3] max-h-[190px] rounded-xl overflow-hidden bg-stone-50 mb-2.5">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-[#50563D]/90 backdrop-blur-xs text-white text-[10px] font-bold">
                    {recipe.category}
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-[#1E201D] group-hover:text-[#50563D] transition-colors mb-1 line-clamp-1">
                  {recipe.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-[#61665D] font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#656B4F]" />
                    {recipe.time}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="w-3.5 h-3.5 text-[#656B4F]" />
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. LOVED BY CUSTOMERS & FAQS */}
        {/* ========================================================================= */}
        <section className="py-10 md:py-14 site-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

            <div className="lg:col-span-5 bg-[#EAF3E7] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border border-[#DFEBE0] shadow-xs flex flex-col justify-between text-left relative overflow-hidden">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#50563D] tracking-tight font-display">
                  Loved by Customers
                </h2>
                <p className="text-xs sm:text-sm text-[#4E5E4C] font-medium">
                  Join thousands of happy customers choosing a healthier lifestyle.
                </p>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs border border-stone-200/80 my-5 relative">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(displayReviews[activeReviewIndex]?.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#2C382A] font-medium leading-relaxed italic">
                  &ldquo;{displayReviews[activeReviewIndex]?.comment}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EAF0E5] text-[#656B4F] font-black text-xs flex items-center justify-center border border-[#656B4F]/30 overflow-hidden shadow-2xs shrink-0">
                      {displayReviews[activeReviewIndex]?.authorName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-[#50563D] leading-tight">
                        {displayReviews[activeReviewIndex]?.authorName}
                      </h4>
                      <p className="text-[11px] text-[#61665D]">
                        {displayReviews[activeReviewIndex]?.location || 'Chennai'}
                      </p>
                    </div>
                  </div>

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

              <div className="flex items-center justify-center gap-1.5 pt-1">
                {displayReviews.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveReviewIndex(dotIdx)}
                    className={`h-1.5 rounded-full transition-all ${activeReviewIndex === dotIdx ? 'w-5 bg-[#50563D]' : 'w-1.5 bg-stone-300'
                      }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="flex items-start sm:items-end justify-between gap-3">
                <div className="text-left space-y-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#50563D] tracking-tight font-display">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4E5E4C] font-medium">
                    Find answers to common questions.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="text-xs sm:text-sm font-extrabold text-[#50563D] hover:text-[#3E442F] inline-flex items-center gap-1.5 transition-colors shrink-0 whitespace-nowrap pb-1 mt-1 sm:mt-0"
                >
                  <span className="whitespace-nowrap">View All</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              </div>

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
                        className="w-full p-4 sm:p-4.5 text-left font-bold text-xs sm:text-sm text-[#50563D] flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#50563D] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-[#EAF0E5]" />
                          </div>
                          <span className="font-extrabold text-[#50563D] group-hover:text-[#3E442F] transition-colors">
                            {faq.q}
                          </span>
                        </div>
                        <span className="text-[#50563D] font-extrabold text-base shrink-0">
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
        {/* 8. JOIN WHATSAPP COMMUNITY */}
        {/* ========================================================================= */}
        <section className="pb-10 md:pb-16 site-shell">
          <div className="w-full rounded-[24px] sm:rounded-[36px] bg-[#50563D] text-white py-4 sm:py-5 px-4 sm:px-8 lg:px-10 border border-[#244224] shadow-2xl relative overflow-hidden flex flex-row items-center justify-between gap-3 sm:gap-6 lg:gap-8">
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
              <div className="absolute -left-16 -top-16 w-64 h-64 bg-[#34D399]/20 rounded-full blur-3xl" />
              <div className="absolute right-1/3 top-1/2 -translate-y-1/2 w-64 h-64 bg-[#25D366]/15 rounded-full blur-3xl" />
              <svg className="absolute left-1/4 -bottom-10 w-44 h-44 text-[#284926]/40 rotate-12" viewBox="0 0 200 200" fill="currentColor">
                <path d="M44.5,150.8C-5.5,100.8,12.2,22.2,95.5,5.5c83.3-16.7,111.1,66.7,61.1,116.7C106.6,172.2,94.5,200.8,44.5,150.8z" />
              </svg>
            </div>

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

              <div className="pt-0.5 sm:pt-1">
                <a
                  href="https://wa.me/919876543210?text=Hi%20Sakthi%20Plant%20Meats!%20I%20want%20to%20join%20the%20WhatsApp%20community."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full bg-[#F4F7F2] hover:bg-white text-[#50563D] font-extrabold text-[11px] sm:text-xs transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 group"
                >
                  <span>Join Group</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#50563D] group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

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
            <div className="bg-[#50563D] px-6 py-4 text-white flex items-center justify-between">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#50563D]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1E201D] mb-1">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai, Tamil Nadu"
                  value={reviewForm.location}
                  onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#50563D]"
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
                        className={`w-5 h-5 ${star <= reviewForm.rating
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
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#50563D]"
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
                  className="px-5 py-2.5 rounded-xl bg-[#50563D] text-white font-bold text-xs hover:bg-[#151F12] transition-colors shadow-md disabled:opacity-50"
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
