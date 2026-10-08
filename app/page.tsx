'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransparentPattyGraphic from '@/components/TransparentPattyGraphic';
import SeoCoverageSection from '@/components/SeoCoverageSection';
import GoogleReviewSummary, { GoogleGIcon, GOOGLE_MAPS_REVIEW_URL } from '@/components/GoogleReviewSummary';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductType } from '@/lib/types';
import { fetchApi, fetchCachedApi, getCachedData, setCachedData } from '@/lib/apiConfig';
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
  Award,
  Minus,
  Plus,
  Loader2
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

function formatCategoryTitle(name: string): string {
  if (!name) return '';
  const clean = name.trim();
  if (clean === clean.toUpperCase()) {
    return clean
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(' Retail Pack', ' (Retail)')
      .replace(' Alternatives', '');
  }
  return clean.replace(' Retail Pack', ' (Retail)').replace(' Alternatives', '');
}

// Default Authentic Brand Categories for Immediate Rendering
const DEFAULT_HOMEPAGE_CATEGORIES: CategoryItem[] = [
  {
    name: 'Mock Meat',
    link: '/shop?category=Mock%20Meat',
    img: '/assets/0e18a4d9-5d57-4c36-8768-8e7d790a4b5d.jpg',
    description: '100% Plant-Based Mutton & Chicken',
  },
  {
    name: 'Mock Seafood',
    link: '/shop?category=Mock%20Seafood',
    img: 'https://res.cloudinary.com/thk8htfr/image/upload/v1783830077/thenggiri_fish_qsc1ey.png',
    description: 'Vanjaram Fish & Prawn Alternatives',
  },
  {
    name: 'Veg Starters',
    link: '/shop?category=Veg%20Starters',
    img: '/assets/813a46d7-0030-47c9-af6a-3db11c6edbc7.jpg',
    description: 'Crisp Corn Cheese Balls & Kebabs',
  },
  {
    name: 'Hand Made Starters',
    link: '/shop?category=Hand%20Made%20Starters',
    img: '/assets/928db126-f62c-4d88-a874-f3d8c08d68bd.jpg',
    description: 'Paneer Lollipops & Veg Cutlets',
  },
  {
    name: 'Frozen Foods',
    link: '/shop?category=Frozen%20Foods',
    img: '/assets/c0410062-941f-4ab6-bcc8-b9b2ffd98cc1.jpg',
    description: 'Sweet Corn, Green Peas & Fries',
  },
  {
    name: 'Frozen Snacks',
    link: '/shop?category=Frozen%20Snacks',
    img: '/assets/a677a7a9-c56a-4885-a823-51be3e0177b3.jpg',
    description: 'Samosas, Rolls & Momos',
  },
];

// FAQs Data
const FAQS = [
  {
    q: 'Is Sakthi Frozen mock meat completely plant-based?',
    a: 'Yes, all our products are 100% plant-based and contain no animal meat, artificial preservatives or additives. Made purely with non-GMO soy, pea isolate, and authentic botanical spices.',
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
    title: 'Mock Mutton Pepper Chukka',
    time: '20 Mins',
    difficulty: 'Easy',
    image: '/assets/0e18a4d9-5d57-4c36-8768-8e7d790a4b5d.jpg',
    category: 'Mock Mutton',
    product: 'Mock Mutton',
    tip: 'Pan-fry with curry leaves, sliced onion, crushed pepper and a squeeze of lemon. Add the product near the end so it stays juicy.',
  },
  {
    title: 'Plant Mutton Dum Biryani',
    time: '35 Mins',
    difficulty: 'Medium',
    image: '/assets/plant-mutton-dum-biryani.png',
    category: '',
    product: 'Mock Mutton',
    tip: 'Brown the mock meat with biryani masala first, layer with ¾-cooked basmati rice, then steam covered on low heat until fragrant.',
  },
  {
    title: 'Veg Chicken Cutlet Chaat',
    time: '15 Mins',
    difficulty: 'Easy',
    image: '/assets/928db126-f62c-4d88-a874-f3d8c08d68bd.jpg',
    category: 'Veg Chicken Cutlet',
    product: 'Veg Chicken Cutlet',
    tip: 'Cook cutlets until crisp on both sides. Top with chopped onion, coriander, a little yogurt chutney and chaat masala.',
  },
  {
    title: 'Crispy Corn Cheese Ball Bites',
    time: '10 Mins',
    difficulty: 'Easy',
    image: '/assets/813a46d7-0030-47c9-af6a-3db11c6edbc7.jpg',
    category: 'Corn Cheese Balls',
    product: 'Corn Cheese Balls',
    tip: 'Cook from frozen in hot oil or an air fryer until golden and crisp. Rest briefly, then serve with mint chutney or tomato dip.',
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

// Top 7 Verified Google Reviews
const HARDCODED_GOOGLE_REVIEWS: ReviewType[] = [
  {
    id: '6abd3b5d5ba05dd78c577cbf',
    authorName: 'vasanthan',
    location: 'Dindukkal',
    rating: 5,
    comment: 'Recently brought some frozen food which is good especially those vegan foods. The quality and pricing of the products are good. They are doing bulk orders also for marriage function and more.',
    avatar: '',
    dateText: '8 months ago',
    isGoogleReview: true,
  },
  {
    id: '6abd3b5d5ba05dd78c577cc0',
    authorName: 'DHARSHAN S',
    location: 'Nilgiris',
    rating: 5,
    comment: 'I recently visited a place near Kavundapalayam. The products were really good—veg fish, veg chicken, and veg mutton. The taste was exactly like non-veg. Everyone should definitely visit this place and explore it.',
    avatar: '',
    dateText: '8 months ago',
    isGoogleReview: true,
  },
  {
    id: '6abd3b5d5ba05dd78c577cc1',
    authorName: 'Kiruthika Ganesan',
    location: 'Coimbatore',
    rating: 5,
    comment: 'I tried food at mock meat,It was an amazing experience that I first time tried a very different food amazed by its taste. I love this new concept they tried in food. I think even a crazy non-veg lovers also fell in love with this taste.',
    avatar: '',
    dateText: '2 years ago',
    isGoogleReview: true,
  },
  {
    id: '6abd3b5d5ba05dd78c577cc2',
    authorName: 'Sathish Kumar',
    location: 'Coimbatore',
    rating: 5,
    comment: 'Food quality is very good. French fries and samosa must try. Cheap and best service very affordable',
    avatar: '',
    dateText: 'a year ago',
    isGoogleReview: true,
  },
  {
    id: '6abd3b5d5ba05dd78c577cc3',
    authorName: 'sathyapushpavanam sathyapushpavanam',
    location: 'Coimbatore',
    rating: 5,
    comment: 'Very friendly shop, lot of mock meat and frozen foods, taste and quality is soo good very useful shop for veg food shops and catering people',
    avatar: '',
    dateText: 'a year ago',
    isGoogleReview: true,
  },
  {
    id: '6abd3b5d5ba05dd78c577cc4',
    authorName: 'Tarun Teja',
    location: 'Vijayawada',
    rating: 5,
    comment: 'Best place to buy Vegan products in Coimbatore and Frozen snacks also available at excellent prices along with good quality',
    avatar: '',
    dateText: 'a year ago',
    isGoogleReview: true,
  },
  {
    id: '6abd3b5d5ba05dd78c577cc5',
    authorName: 'Pushpa Valli',
    location: 'Coimbatore',
    rating: 5,
    comment: 'Very nice product. Excellent taste and fresh also. Very easy to cook',
    avatar: '',
    dateText: 'a year ago',
    isGoogleReview: true,
  },
];

export default function StorefrontHomePage() {
  const router = useRouter();
  const { cart, addToCart, updateQuantity } = useCart();
  const { showToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [heroDishIndex, setHeroDishIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [topProducts, setTopProducts] = useState<UnifiedProduct[]>([]);
  const featuredProducts = topProducts.filter((product) => product.isPopular);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(DEFAULT_HOMEPAGE_CATEGORIES);
  const [reviews, setReviews] = useState<ReviewType[]>(HARDCODED_GOOGLE_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
    // 1. Instant Cache Hydration on Client (runs after initial hydration match)
    const cachedProds = getCachedData<ProductType[]>('home_products_cache') || getCachedData<ProductType[]>('shop_products_cache');
    if (cachedProds && Array.isArray(cachedProds) && cachedProds.length > 0) {
      setTopProducts(processUniqueProducts(cachedProds));
      setLoading(false);
    }
    const cachedCats = getCachedData<any[]>('home_cats_cache') || getCachedData<any[]>('shop_categories_cache');
    if (cachedCats && Array.isArray(cachedCats) && cachedCats.length > 0) {
      const cats: CategoryItem[] = cachedCats.map((c: any) => ({
        id: c.id || c._id,
        name: c.name,
        shortName: c.name,
        link: `/shop?category=${encodeURIComponent(c.name)}`,
        img: c.image && c.image.trim() !== '' ? c.image : getCategoryFallbackImage(c.name),
        description: c.description || '100% Plant-Based',
      }));
      setCategoriesList(cats);
    }

    const loadData = async () => {
      if (!cachedProds || cachedProds.length === 0) {
        setLoading(true);
      }
      try {
        // Disabled remote reviews fetching to use the 7 authentic hardcoded Google reviews.
        // If live API fetching is needed later, uncomment the review fetcher.
        const [prodRes, catRes] = await Promise.all([
          fetchCachedApi<ProductType[]>('/products', { cacheKey: 'home_products_cache', ttlMs: 120000 }),
          fetchCachedApi<any[]>('/categories', { cacheKey: 'home_cats_cache', ttlMs: 180000 }),
          // fetchCachedApi<ReviewType[]>('/reviews', { cacheKey: 'home_revs_cache', ttlMs: 120000 }),
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
      } catch (err) {
        console.error('Error fetching homepage data from backend:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [navigatingProductId, setNavigatingProductId] = useState<string | null>(null);

  const handleProductNavigate = (product: UnifiedProduct) => {
    const prodId = product.id || (product as any)._id;
    if (!prodId) return;
    setNavigatingProductId(prodId);
    setCachedData(`product_detail_${prodId}`, product);
    router.push(`/product/${prodId}`);
  };

  const handleProductPrefetch = (product: UnifiedProduct) => {
    const prodId = product.id || (product as any)._id;
    if (!prodId) return;
    setCachedData(`product_detail_${prodId}`, product);
    router.prefetch(`/product/${prodId}`);
  };

  const toggleSaveProduct = (e: React.MouseEvent, product: UnifiedProduct) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (product: UnifiedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
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

  const displayReviews = reviews;

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
                    {/* Pulsing Brand Tagline & Google Rating Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:py-1 rounded-full bg-[#EAF0E5] border border-white text-[#50563D] text-[10px] sm:text-xs font-black uppercase tracking-wider w-fit shadow-2xs">
                        <span className="relative flex h-1.5 sm:h-2 w-1.5 sm:w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#656B4F] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 sm:h-2 w-1.5 sm:w-2 bg-[#656B4F]"></span>
                        </span>
                        <span>100% VEGETARIAN • PLANT-BASED MEATS</span>
                      </div>

                      <GoogleReviewSummary variant="hero-badge" />
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
                    <div className="py-1 sm:py-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full">
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 border border-[#656B4F]/20 px-2 sm:px-2.5 py-1.5 rounded-xl shadow-2xs">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EAF0E5] text-[#656B4F] flex items-center justify-center shrink-0 shadow-2xs">
                          <Leaf className="w-3.5 h-3.5 text-[#656B4F] fill-[#656B4F]/20" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10.5px] sm:text-xs font-black text-[#50563D] block leading-tight">100%</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-[#656B4F] block leading-tight">Plant Based</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 border border-[#DC2626]/15 px-2 sm:px-2.5 py-1.5 rounded-xl shadow-2xs">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FEEBEA] text-[#DC2626] flex items-center justify-center shrink-0 shadow-2xs">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10.5px] sm:text-xs font-black text-[#5C1616] block leading-tight">No Preservatives</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-[#6E4848] block leading-tight">100% Natural</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 border border-[#0D9488]/15 px-2 sm:px-2.5 py-1.5 rounded-xl shadow-2xs">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E2F7F2] text-[#0D9488] flex items-center justify-center shrink-0 shadow-2xs">
                          <Utensils className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10.5px] sm:text-xs font-black text-[#0B4842] block leading-tight">Ready to Cook</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-[#3D6460] block leading-tight">Quick &amp; Easy</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 border border-[#E11D48]/15 px-2 sm:px-2.5 py-1.5 rounded-xl shadow-2xs">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FCE8E6] text-[#E11D48] flex items-center justify-center shrink-0 shadow-2xs">
                          <Heart className="w-3.5 h-3.5 text-[#E11D48] fill-[#E11D48]/20" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10.5px] sm:text-xs font-black text-[#591422] block leading-tight">Rich in</span>
                          <span className="text-[9px] sm:text-[10px] font-semibold text-[#733F4A] block leading-tight">Protein &amp; Fiber</span>
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
            className="w-full flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-visible md:cursor-default md:active:cursor-default"
          >
            {/* All Categories Item */}
            <div
              onClick={(e) => handleCategoryItemClick(e, '/shop')}
              className="flex w-[104px] sm:w-[120px] md:w-auto min-w-0 bg-[#50563D] text-white rounded-2xl p-2 sm:p-2.5 flex-col items-center justify-center shrink-0 md:shrink h-[114px] sm:h-[124px] md:h-[134px] shadow-xs border border-[#50563D] active:scale-[0.98] cursor-pointer snap-start transition-transform"
            >
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20 shadow-2xs shrink-0 mb-1.5">
                <LayoutGrid className="w-6 h-6 text-[#EAF0E5]" />
              </div>
              <span className="text-[11px] sm:text-xs font-black text-white leading-tight tracking-tight text-center">
                All Products
              </span>
            </div>

            {/* Clean Category Items with Larger Food Image */}
            {categoriesList.map((cat, idx) => (
              <div
                key={cat.id || cat.name || idx}
                onClick={(e) => handleCategoryItemClick(e, cat.link)}
                className="flex w-[104px] sm:w-[120px] md:w-auto min-w-0 bg-white rounded-2xl p-2 sm:p-2.5 flex-col items-center justify-center shrink-0 md:shrink h-[114px] sm:h-[124px] md:h-[134px] shadow-2xs border border-[#DFE7DB] active:scale-[0.98] cursor-pointer snap-start transition-transform hover:border-[#656B4F]/40"
              >
                {/* Large Prominent Circular Food Image */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-[#FAFBF7] border border-[#D5DFD0] shadow-xs shrink-0 mb-1.5 overflow-hidden">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full rounded-full object-cover pointer-events-none scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getCategoryFallbackImage(cat.name);
                    }}
                  />
                </div>

                {/* Clean Category Title */}
                <span className="text-[11px] sm:text-xs font-black text-[#1E201D] leading-tight line-clamp-2 px-0.5 text-center tracking-tight">
                  {formatCategoryTitle(cat.name)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SAKTHI FROZEN PRODUCT SHOWCASE: RAW MEATS & READY-TO-FRY STARTERS */}
        {/* ========================================================================= */}
        <section className="py-6 md:py-10 site-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

            {/* Left Card: Sakthi Frozen Brand & Food Banner */}
            <div className="lg:col-span-7 bg-[#EAF0E5] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center gap-6 lg:gap-8 shadow-xs border border-[#D4DBC9] text-left relative overflow-hidden">
              {/* Organic Decorative Background Art */}
              <div className="absolute -top-12 -left-12 w-44 h-44 bg-white/40 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 right-0 w-60 h-60 bg-[#D4DBC9]/50 rounded-full blur-3xl pointer-events-none" />
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25 mix-blend-multiply" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 400 300">
                <path d="M-20 80 Q 100 20, 220 100 T 420 60" fill="none" stroke="#656B4F" strokeWidth="1.2" strokeDasharray="3 4" />
                <path d="M-10 240 Q 140 180, 260 260 T 430 200" fill="none" stroke="#50563D" strokeWidth="1.5" />
              </svg>

              <div className="relative shrink-0 flex items-center justify-center w-44 sm:w-52 md:w-60 aspect-square">
                <div className="absolute inset-0 bg-[#D4DBC9]/70 rounded-[40%_60%_70%_30%_/_40%_50%_60%_55%] blur-sm scale-110 pointer-events-none" />
                <div className="absolute -top-3 -left-3 w-24 h-24 bg-[#EAF0E5]/60 rounded-[60%_40%_30%_70%_/_50%_60%_40%_50%] blur-md pointer-events-none" />
                <div className="absolute -bottom-2 -right-2 w-28 h-28 bg-[#D4DBC9]/80 rounded-[50%_50%_60%_40%_/_60%_40%_50%_50%] blur-sm pointer-events-none" />

                <div className="relative w-full h-full rounded-full overflow-hidden shadow-xl z-10">
                  <img
                    src="/assets/good-food-plate.jpg"
                    alt="Sakthi Frozen Foods"
                    className="w-full h-full object-cover object-center scale-105 hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>

              <div className="space-y-3 flex-1 z-10">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 border border-[#656B4F]/25 text-[#50563D] text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                    <Leaf className="w-3 h-3 text-[#656B4F]" />
                    <span>Sakthi Frozen</span>
                  </div>
                  <span className="font-script text-base text-[#50563D] font-bold">100% Plant Meat ✨</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#50563D] tracking-tight leading-tight">
                  Good Food <span className="font-serif-italic font-normal text-[#363B26]">Does Good</span>
                </h3>

                <p className="text-xs sm:text-sm text-[#4E5E4C] leading-relaxed font-medium">
                  Authentic plant-based meats that taste delicious, nourish your body, and bring pure culinary joy to every meal.
                </p>

                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-stone-50 text-[#50563D] font-black text-xs shadow-md shadow-black/5 border border-stone-200/80 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#656B4F] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: 2 Dedicated Product Categories (Raw Meats & Ready-to-Fry Starters) */}
            <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
              
              {/* Card 1: Raw Meat Cooking Base */}
              <div className="flex-1 bg-gradient-to-br from-[#FCFDF9] via-[#F4F8EE] to-[#EAF0E5] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#656B4F]/25 shadow-xs flex flex-col justify-between gap-3 text-left relative overflow-hidden group hover:shadow-md hover:border-[#656B4F]/40 transition-all duration-300">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#656B4F]/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
                
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-[#656B4F]/25 text-[#50563D] text-[10px] font-black uppercase tracking-wider shadow-2xs">
                      <Utensils className="w-3 h-3 text-[#656B4F]" />
                      <span>Raw Cooking Base</span>
                    </div>
                    <span className="font-script text-base text-[#50563D] font-bold">Chef's Choice 🌿</span>
                  </div>

                  <div>
                    <h4 className="text-lg sm:text-xl font-black text-[#1E201D] tracking-tight">
                      Raw Cooking <span className="font-serif-italic font-normal text-[#50563D]">Cuts</span>
                    </h4>
                    <p className="text-xs text-[#4E5E4C] leading-relaxed font-medium mt-1">
                      Cooks just like tender meat. Deeply absorbs spices for rich home gravies, biryani &amp; roasts.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-extrabold text-[#50563D] bg-white/90 border border-[#656B4F]/20 px-2.5 py-0.5 rounded-md shadow-2xs">
                      🥘 Rich Gravy &amp; Biryani
                    </span>
                    <span className="text-[10px] font-extrabold text-[#50563D] bg-white/90 border border-[#656B4F]/20 px-2.5 py-0.5 rounded-md shadow-2xs">
                      🥩 High Protein
                    </span>
                  </div>
                </div>

                <Link
                  href="/shop?category=Mock%20Meat"
                  className="relative z-10 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#50563D] hover:bg-[#3E432E] text-white font-extrabold text-xs shadow-xs transition-all hover:scale-[1.01] active:scale-98 group/btn"
                >
                  <span>Shop Raw Cuts</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Card 2: Ready to Fry Starters */}
              <div className="flex-1 bg-gradient-to-br from-[#FFFDF8] via-[#FEF6EC] to-[#FDEEE9] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-[#EA580C]/25 shadow-xs flex flex-col justify-between gap-3 text-left relative overflow-hidden group hover:shadow-md hover:border-[#EA580C]/40 transition-all duration-300">
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#EA580C]/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-[#EA580C]/25 text-[#EA580C] text-[10px] font-black uppercase tracking-wider shadow-2xs">
                      <Flame className="w-3 h-3 text-[#EA580C]" />
                      <span>Ready to Fry</span>
                    </div>
                    <span className="font-script text-base text-[#EA580C] font-bold">Ready in 3 Mins! ⚡</span>
                  </div>

                  <div>
                    <h4 className="text-lg sm:text-xl font-black text-[#1E201D] tracking-tight">
                      Crispy <span className="font-serif-italic font-normal text-[#EA580C]">Starters</span>
                    </h4>
                    <p className="text-xs text-[#7C2D12] leading-relaxed font-medium mt-1">
                      Zero marination needed. Flash-fry or air-fry for instant hot, crunchy &amp; juicy snacks.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-extrabold text-[#9A3412] bg-white/90 border border-[#EA580C]/20 px-2.5 py-0.5 rounded-md shadow-2xs">
                      ⚡ 3-Min Flash Fry
                    </span>
                    <span className="text-[10px] font-extrabold text-[#9A3412] bg-white/90 border border-[#EA580C]/20 px-2.5 py-0.5 rounded-md shadow-2xs">
                      🚫 Zero Prep Needed
                    </span>
                  </div>
                </div>

                <Link
                  href="/shop?category=Veg%20Starters"
                  className="relative z-10 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs shadow-xs transition-all hover:scale-[1.01] active:scale-98 group/btn"
                >
                  <span>Shop Starters</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
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
            {loading && topProducts.length === 0 ? (
              [1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-stone-200/70 p-3.5 flex flex-col justify-between w-[220px] xs:w-[240px] sm:w-auto shrink-0 snap-start animate-pulse space-y-3"
                >
                  <div className="w-full aspect-square rounded-xl bg-stone-200" />
                  <div className="space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-3 bg-stone-200 rounded w-full" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-4 bg-stone-200 rounded w-1/3" />
                      <div className="h-4 bg-stone-200 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-9 bg-stone-200 rounded-xl w-full" />
                </div>
              ))
            ) : featuredProducts.length === 0 ? (
              <div className="w-full rounded-xl border border-stone-200 bg-white px-5 py-8 text-center text-sm font-semibold text-[#61665D] sm:col-span-full">
                No best sellers are featured right now.
              </div>
            ) : (
              featuredProducts.filter((p) => p.isAvailable !== false).slice(0, 4).map((p, idx) => {
                const prodId = p.id || (p as any)._id || '';
                const isNavigating = navigatingProductId === prodId;
                return (
                  <div
                    key={prodId || idx}
                    onClick={() => prodId && handleProductNavigate(p)}
                    onMouseEnter={() => prodId && handleProductPrefetch(p)}
                    onTouchStart={() => prodId && handleProductPrefetch(p)}
                    className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all p-3.5 flex flex-col justify-between group relative w-[220px] xs:w-[240px] sm:w-auto shrink-0 snap-start cursor-pointer active:scale-[0.98]"
                  >
                    {/* Instant Loading Feedback Badge */}
                    {isNavigating && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 rounded-2xl flex flex-col items-center justify-center gap-2 animate-in fade-in duration-150">
                        <div className="bg-[#50563D] text-white px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-2 shadow-lg shadow-[#50563D]/20 animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A9F2B7]" />
                          <span>Opening...</span>
                        </div>
                      </div>
                    )}

                    <div className="relative w-full aspect-square max-h-[240px] rounded-xl overflow-hidden bg-stone-50 mb-3 border border-stone-100 flex items-center justify-center">
                      <Link
                        href={`/product/${prodId}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleProductNavigate(p);
                        }}
                        className="w-full h-full block"
                      >
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
                        type="button"
                        onClick={(e) => toggleSaveProduct(e, p)}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-600 hover:text-rose-600 transition-colors shadow-2xs cursor-pointer"
                        title={isInWishlist(prodId) ? 'Remove from wishlist' : 'Save to wishlist'}
                        aria-label={isInWishlist(prodId) ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isInWishlist(prodId) ? 'fill-rose-500 text-rose-500' : ''}`}
                        />
                      </button>
                    </div>

                    <div className="space-y-1 mb-3">
                      <Link
                        href={`/product/${prodId}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleProductNavigate(p);
                        }}
                      >
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

                      {(p.isAvailable === false || (p.isAvailable === undefined && p.stock <= 0)) ? (
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const isOutOfStock = p.isAvailable === false || (p.isAvailable === undefined && p.stock <= 0);
                    if (isOutOfStock) {
                      return (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-stone-200 text-stone-500 cursor-not-allowed opacity-75"
                        >
                          <span>Out of Stock</span>
                        </button>
                      );
                    }

                    const cartItem = cart.find(
                      (item) => item.productId === p.id && (item.weight === p.weight || !item.weight)
                    );
                    const inCartQty = cartItem ? cartItem.quantity : 0;

                    if (inCartQty > 0) {
                      return (
                        <div
                          className="w-full flex items-center justify-between bg-[#50563D] text-white rounded-xl p-1 shadow-sm border border-[#50563D] animate-in fade-in zoom-in-95 duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(p.id, p.weight || '1kg', inCartQty - 1);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-all cursor-pointer text-white"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <span className="text-xs font-black px-2 select-none tracking-tight flex items-center gap-1">
                            <span>{inCartQty}</span>
                            <span className="text-[10px] font-bold text-white/80">in cart</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(p.id, p.weight || '1kg', inCartQty + 1);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 active:scale-90 transition-all cursor-pointer text-white"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(p, e)}
                        className="w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer bg-[#50563D] hover:bg-[#151F12] text-white group"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Add to Cart</span>
                      </button>
                    );
                  })()}
                </div>
              );
            })
          )}
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
                      How Sakthi Frozen Mock Meat Is Made
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
                      <h4 className="font-extrabold text-[9px] xs:text-[10px] sm:text-[13px] text-white leading-tight">
                        Select Proteins
                      </h4>
                      <p className="hidden xs:block text-[8px] xs:text-[9px] sm:text-[11px] text-[#A6BAA2] leading-none sm:leading-snug font-normal">
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
                      <h4 className="font-extrabold text-[9px] xs:text-[10px] sm:text-[13px] text-white leading-tight">
                        Process &amp; Blend
                      </h4>
                      <p className="hidden xs:block text-[8px] xs:text-[9px] sm:text-[11px] text-[#A6BAA2] leading-none sm:leading-snug font-normal">
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
                      <h4 className="font-extrabold text-[9px] xs:text-[10px] sm:text-[13px] text-white leading-tight">
                        Shape &amp; Season
                      </h4>
                      <p className="hidden xs:block text-[8px] xs:text-[9px] sm:text-[11px] text-[#A6BAA2] leading-none sm:leading-snug font-normal">
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
                      <h4 className="font-extrabold text-[9px] xs:text-[10px] sm:text-[13px] text-white leading-tight">
                        Pack with Care
                      </h4>
                      <p className="hidden xs:block text-[8px] xs:text-[9px] sm:text-[11px] text-[#A6BAA2] leading-none sm:leading-snug font-normal">
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
                <span>Shop Recipe Products</span>
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
              <article
                key={idx}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all p-3 flex flex-col group w-[260px] xs:w-[280px] sm:w-auto shrink-0 snap-start"
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

                <p className="mb-3 text-xs leading-relaxed text-[#61665D]">{recipe.tip}</p>

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
              </article>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. LOVED BY CUSTOMERS & FAQS */}
        {/* ========================================================================= */}
        <section className="py-10 md:py-14 site-shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            <div className="lg:col-span-5 bg-[#EAF3E7] rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 border border-[#DFEBE0] shadow-xs flex flex-col justify-between text-left relative overflow-hidden space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#50563D] tracking-tight font-display">
                    Loved by Customers
                  </h2>
                  <a
                    href={GOOGLE_MAPS_REVIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#50563D] hover:bg-[#3D422E] text-white rounded-full text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 hover:scale-105 active:scale-95"
                  >
                    <GoogleGIcon className="w-3.5 h-3.5 bg-white rounded-full p-0.5" />
                    <span>Review on Google</span>
                  </a>
                </div>
                <p className="text-xs sm:text-sm text-[#4E5E4C] font-medium">
                  Join thousands of happy customers choosing a healthier plant-based lifestyle.
                </p>
              </div>

              {/* Official Google Review Summary Card with Overall 4.9 Ranking, Star Breakdown & Direct Link */}
              <GoogleReviewSummary variant="card" />

              {/* Customer Testimonial Slider */}
              {reviewsLoading && displayReviews.length === 0 ? (
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-stone-200/80 animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className="w-3.5 h-3.5 rounded bg-stone-200" />
                      ))}
                    </div>
                    <div className="h-4 w-24 bg-stone-200 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3.5 bg-stone-200 rounded w-full" />
                    <div className="h-3.5 bg-stone-200 rounded w-4/5" />
                  </div>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-stone-100">
                    <div className="w-7 h-7 rounded-full bg-stone-200 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <div className="h-3 w-24 bg-stone-200 rounded" />
                      <div className="h-2.5 w-16 bg-stone-200 rounded" />
                    </div>
                  </div>
                </div>
              ) : displayReviews.length === 0 ? (
                <div className="bg-white rounded-2xl p-5 shadow-xs border border-dashed border-[#656B4F]/30 text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF0E5] text-[#50563D] text-xs font-black shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#50563D]" />
                    <span>You are the first to put a review!</span>
                  </div>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className="w-4 h-4 text-stone-300" />
                    ))}
                  </div>
                  <p className="text-xs text-[#61665D] max-w-xs mx-auto font-medium">
                    Be the first to share your experience with Sakthi Frozen Plant-Based Foods on Google!
                  </p>
                  <a
                    href={GOOGLE_MAPS_REVIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#50563D] hover:bg-[#3D422E] text-white rounded-xl text-xs font-black transition-all shadow-xs hover:scale-105 active:scale-95"
                  >
                    <GoogleGIcon className="w-3.5 h-3.5 bg-white rounded-full p-0.5" />
                    <span>Write the First Review</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-stone-200/80 relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(displayReviews[activeReviewIndex]?.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#50563D] bg-[#EAF0E5] px-2 py-0.5 rounded-full">
                        <GoogleGIcon className="w-3 h-3" />
                        Verified Customer
                      </span>
                    </div>

                    <p className="text-xs sm:text-[13px] text-[#2C382A] font-medium leading-relaxed italic">
                      &ldquo;{displayReviews[activeReviewIndex]?.comment}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-stone-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#EAF0E5] text-[#656B4F] font-black text-xs flex items-center justify-center border border-[#656B4F]/30 overflow-hidden shadow-2xs shrink-0">
                          {displayReviews[activeReviewIndex]?.authorName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-[#50563D] leading-tight">
                            {displayReviews[activeReviewIndex]?.authorName}
                          </h4>
                          <p className="text-[10px] text-[#61665D]">
                            {displayReviews[activeReviewIndex]?.location || 'Verified Buyer'}
                          </p>
                        </div>
                      </div>

                      {displayReviews.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setActiveReviewIndex((prev) => (prev > 0 ? prev - 1 : displayReviews.length - 1))
                            }
                            className="w-6 h-6 rounded-full bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-stone-700 hover:bg-stone-50 hover:text-black transition-colors"
                            aria-label="Previous review"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              setActiveReviewIndex((prev) => (prev + 1) % displayReviews.length)
                            }
                            className="w-6 h-6 rounded-full bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-stone-700 hover:bg-stone-50 hover:text-black transition-colors"
                            aria-label="Next review"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {displayReviews.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-0.5">
                      {displayReviews.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setActiveReviewIndex(dotIdx)}
                          className={`h-1.5 rounded-full transition-all ${
                            activeReviewIndex === dotIdx ? 'w-5 bg-[#50563D]' : 'w-1.5 bg-stone-300'
                          }`}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-7 flex flex-col space-y-4">
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

              <div className="space-y-3">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-stone-200/80 bg-white shadow-2xs transition-all overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 sm:p-4.5 text-left font-bold text-xs sm:text-sm text-[#50563D] flex items-center justify-between gap-3 group cursor-pointer"
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
        {/* 7.5. INDIA'S BEST MOCK MEAT SEO & COIMBATORE DISTRICTS COVERAGE */}
        {/* ========================================================================= */}
        <SeoCoverageSection />

        {/* ========================================================================= */}
        {/* 8. DIRECT WHATSAPP ASSISTANCE & CLARIFICATION */}
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
                    Direct WhatsApp Support
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#CDE0CB] line-clamp-1 mt-0.5 font-medium">
                    Need technical assistance or any clarification? Feel free to WhatsApp us directly.
                  </p>
                </div>
              </div>

              <div className="pt-0.5 sm:pt-1">
                <a
                  href="https://wa.me/918056389214?text=Hi%20Sakthi%20Frozen%20Foods!%20I%20need%20assistance%20or%20clarification%20regarding%20products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-full bg-[#F4F7F2] hover:bg-white text-[#50563D] font-extrabold text-[11px] sm:text-xs transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 group"
                >
                  <span>Chat on WhatsApp</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#50563D] group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="relative shrink-0 flex items-center justify-end z-10 -my-4 -mr-3 sm:-mr-6 lg:-mr-8">
              <div className="w-28 sm:w-44 md:w-56 lg:w-64 h-24 sm:h-36 md:h-40 overflow-visible flex items-center justify-end">
                <img
                  src="/assets/whatsapp-phone-nobg.png"
                  alt="Sakthi Frozen WhatsApp Direct Assistance on Smartphone"
                  className="w-full h-full object-contain object-right scale-105 hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
