'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '../logo.png';
import {
  ShoppingBag,
  LayoutDashboard,
  Home,
  Store,
  User,
  LogOut,
  Package,
  Heart,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  PhoneCall,
  HelpCircle,
  Leaf,
  Truck,
  Ban,
  UserRound,
  Sprout,
  Beef,
  Drumstick,
  Fish,
  Cookie,
  Layers,
  UtensilsCrossed,
  Bell,
  Building2,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { MAIN_SITE_URL } from '@/lib/config';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import SearchOverlay from './SearchOverlay';
import { fetchApi } from '@/lib/apiConfig';
import { CategoryType } from '@/lib/types';

interface NavbarProps {
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

export default function Navbar({
  activeCategory = 'All',
  onSelectCategory,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);

  // Mobile quick chips slider drag & wheel state
  const mobileChipsRef = React.useRef<HTMLDivElement>(null);
  const [isChipsDragging, setIsChipsDragging] = useState(false);
  const [chipsStartX, setChipsStartX] = useState(0);
  const [chipsScrollLeft, setChipsScrollLeft] = useState(0);
  const [chipsMoved, setChipsMoved] = useState(false);

  const handleChipsPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (!mobileChipsRef.current) return;
    setIsChipsDragging(true);
    setChipsMoved(false);
    setChipsStartX(e.clientX);
    setChipsScrollLeft(mobileChipsRef.current.scrollLeft);
  };

  const handleChipsPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (!isChipsDragging || !mobileChipsRef.current) return;
    const diff = e.clientX - chipsStartX;
    if (Math.abs(diff) > 4) {
      setChipsMoved(true);
      mobileChipsRef.current.scrollLeft = chipsScrollLeft - diff;
    }
  };

  const handleChipsPointerUpOrCancel = () => {
    setIsChipsDragging(false);
  };

  const handleChipsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!mobileChipsRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      mobileChipsRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      const response = await fetchApi('/categories');
      if (active && response.success && Array.isArray(response.data)) {
        setCategories(response.data.filter((category: CategoryType) => category?.id && category?.name));
      }
    };

    loadCategories().catch((error) => console.error('Error fetching navbar categories:', error));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const updateFooterVisibility = () => {
      const footer = document.querySelector('footer');
      if (!footer) {
        setIsFooterVisible((visible) => visible ? false : visible);
        return;
      }
      const bounds = footer.getBoundingClientRect();
      const visible = bounds.top < window.innerHeight && bounds.bottom > 0;
      setIsFooterVisible((current) => current === visible ? current : visible);
    };

    updateFooterVisibility();
    window.addEventListener('scroll', updateFooterVisibility, { passive: true });
    window.addEventListener('resize', updateFooterVisibility);
    return () => {
      window.removeEventListener('scroll', updateFooterVisibility);
      window.removeEventListener('resize', updateFooterVisibility);
    };
  }, []);

  // Marquee announcement items
  const announcements = [
    { text: 'Free delivery on orders above ₹2999', Icon: Truck },
    { text: '🏢 Looking for B2B / Wholesale supply? Visit Corporate Site', Icon: Building2 },
    { text: '100% Plant-Based Essentials', Icon: Leaf },
    { text: 'No Added Preservatives & 100% Natural', Icon: Ban },
    { text: 'Sustainably Sourced & Pure Veg', Icon: Sprout },
    { text: 'Need help? Call +91 80563 89214', Icon: PhoneCall },
  ];

  return (
    <>
      <header className="relative z-50 bg-white border-b border-gray-200 shadow-xs">

        {/* TOP SLIDING / MOVING ANNOUNCEMENT STRIP */}
        <div className="bg-[#656B4F] text-[#E8F0E5] overflow-hidden py-2 text-xs font-semibold border-b border-[#50563D]">
          <div className="flex w-max whitespace-nowrap animate-marquee motion-reduce:animate-none">
            {/* Repeat list twice for seamless infinite loop */}
            {[...announcements, ...announcements].map(({ text, Icon }, idx) => (
              <span key={idx} className="mx-6 inline-flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#A9D28D]" aria-hidden="true" />
                {text}
                <span className="ml-6 text-[#4F7A62]">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* MAIN HEADER ROW */}
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8">
          <div className="flex h-14 sm:h-16 lg:h-[4.5rem] items-center justify-between gap-2 sm:gap-3 lg:gap-5">

            {/* Logo & Mobile Menu Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                  <Image src={logo} alt="Sakthi Frozen Foods" fill className="object-contain" priority />
                </div>
                <div className="hidden min-[380px]:block">
                  <span className="text-xs sm:text-sm font-extrabold tracking-tight text-[#50563D] block leading-tight">
                    MOCK MEAT &amp; FROZEN FOODS
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-[#6B7566] uppercase block">
                    SAKTHI FROZEN FOODS
                  </span>
                </div>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-lg xl:max-w-xl mx-2 lg:mx-4 relative z-50">
              <SearchOverlay />
            </div>

            {/* Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 2xl:gap-2 font-semibold text-xs text-[#3E473B] shrink-0">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg transition-all ${
                  pathname === '/'
                    ? 'text-[#50563D] bg-[#EAF0E5] font-black'
                    : 'hover:text-[#656B4F] hover:bg-gray-100'
                }`}
              >
                Home
              </Link>

              {/* Mega Menu Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
              >
                <Link
                  href="/shop"
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                    pathname.startsWith('/shop')
                      ? 'text-[#50563D] bg-[#EAF0E5] font-black'
                      : 'hover:text-[#656B4F] hover:bg-gray-100'
                  }`}
                >
                  <span>Shop</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </Link>

                {isMegaMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-[620px] bg-white border border-gray-200 shadow-2xl rounded-xl p-6 grid grid-cols-3 gap-6 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="col-span-2 grid grid-cols-2 gap-6">
                      <div className="col-span-2 space-y-3">
                        <h4 className="text-xs font-bold text-[#656B4F] uppercase tracking-wider">Shop Categories</h4>
                        {categories.length ? (
                          <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {categories.map((category) => (
                              <li key={category.id}>
                                <Link
                                  href={`/shop?category=${encodeURIComponent(category.name)}`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-xs text-gray-600 hover:text-[#656B4F] hover:font-bold transition-all block"
                                >
                                  {category.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-500">No categories available.</p>
                        )}
                      </div>
                    </div>

                    {/* Promo Box Inside Mega Menu */}
                    <div className="bg-[#EAF3E4] rounded-lg p-4 flex flex-col justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-[#656B4F] whitespace-nowrap">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Plant Specials
                        </span>
                        <p className="text-xs font-bold text-gray-800 mt-2 leading-relaxed">
                          100% Pure Veg & Sustainable Plant Meat
                        </p>
                      </div>
                      <Link
                        href="/shop"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#656B4F] hover:underline mt-4 whitespace-nowrap"
                      >
                        Browse All <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/help"
                className={`px-3 py-2 rounded-lg transition-all ${
                  pathname === '/help'
                    ? 'text-[#50563D] bg-[#EAF0E5] font-black'
                    : 'hover:text-[#656B4F] hover:bg-gray-100'
                }`}
              >
                Help
              </Link>

              <a
                href={`${MAIN_SITE_URL}/about`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-[#656B4F] hover:bg-gray-100 transition-all"
              >
                <span>About</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>

              <a
                href={`${MAIN_SITE_URL}/contact`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-[#656B4F] hover:bg-gray-100 transition-all"
              >
                <span>Contact</span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>

              {/* Corporate & Wholesale Cross-Domain Link */}
              <a
                href={MAIN_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-[#50563D] hover:text-[#656B4F] hover:bg-emerald-50 transition-all font-bold border border-emerald-600/20 bg-emerald-50/50"
              >
                <span>🏢 Corporate & B2B</span>
                <ExternalLink className="w-3 h-3 text-emerald-700" />
              </a>
            </nav>

            {/* Right Header Controls */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <Link
                href="/wishlist"
                className="relative p-1.5 sm:p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all flex items-center"
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in-50 shadow-xs">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-1">
                  <Link
                    href="/orders"
                    className="p-1.5 sm:p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all hidden sm:flex items-center"
                    title="Orders"
                  >
                    <Package className="w-5 h-5" />
                  </Link>

                  {user.role === 'Admin' && (
                    <Link
                      href="/admin"
                      className="p-1.5 sm:p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all hidden sm:flex items-center"
                      title="Admin Dashboard"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="p-1.5 sm:p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all hidden sm:flex items-center"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-2 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Clean Cart Button */}
              <button
                suppressHydrationWarning
                onClick={() => router.push('/cart')}
                className="relative p-2.5 rounded-full bg-[#656B4F] text-white hover:bg-[#50563D] transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-xs cursor-pointer group"
                title={`Shopping Cart (${totalItems} items)`}
                aria-label={`Shopping Cart with ${totalItems} items`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className={`absolute -top-1 -right-1 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white transition-all ${
                  totalItems > 0 ? 'bg-[#E06A26] scale-100' : 'bg-[#50563D] text-white/90 scale-95'
                }`}>
                  {totalItems}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Search Bar with Quick Chips */}
          <div className="lg:hidden pb-3 pt-1 space-y-2 relative z-50">
            <SearchOverlay />

            {/* Quick Category Chips Bar (Mobile / Tablet) with Vector SVG Icons */}
            <div className="w-full overflow-hidden">
              <div
                ref={mobileChipsRef}
                onPointerDown={handleChipsPointerDown}
                onPointerMove={handleChipsPointerMove}
                onPointerUp={handleChipsPointerUpOrCancel}
                onPointerCancel={handleChipsPointerUpOrCancel}
                onWheel={handleChipsWheel}
                style={{
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-x',
                  overscrollBehaviorX: 'contain',
                  scrollBehavior: 'smooth',
                }}
                className={`flex items-center gap-2 overflow-x-auto py-1 scrollbar-none scrollbar-hide no-scrollbar w-full min-w-0 select-none ${
                  isChipsDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                {categories.length > 0 ? (
                  categories.map((cat) => {
                    const getCategoryIconComponent = (name: string) => {
                      const n = (name || '').toLowerCase();
                      if (n.includes('mutton') || n.includes('meat')) return <Beef className="w-3.5 h-3.5 text-[#50563D] shrink-0" />;
                      if (n.includes('chicken') || n.includes('poultry')) return <Drumstick className="w-3.5 h-3.5 text-[#50563D] shrink-0" />;
                      if (n.includes('fish') || n.includes('sea')) return <Fish className="w-3.5 h-3.5 text-[#50563D] shrink-0" />;
                      if (n.includes('starter') || n.includes('snack')) return <Cookie className="w-3.5 h-3.5 text-[#50563D] shrink-0" />;
                      if (n.includes('retail') || n.includes('pack')) return <Package className="w-3.5 h-3.5 text-[#50563D] shrink-0" />;
                      if (n.includes('combo')) return <Layers className="w-3.5 h-3.5 text-[#50563D] shrink-0" />;
                      return <UtensilsCrossed className="w-3.5 h-3.5 text-[#50563D] shrink-0" />;
                    };
                    return (
                      <Link
                        key={cat.id || cat.name}
                        href={`/shop?category=${encodeURIComponent(cat.name)}`}
                        onClick={(e) => {
                          if (chipsMoved) {
                            e.preventDefault();
                          }
                        }}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAFAF5] hover:bg-[#EAF0E5] border border-stone-200/80 text-[11px] font-bold text-[#4F534C] hover:text-[#50563D] transition-colors shadow-2xs min-w-max whitespace-nowrap"
                      >
                        {getCategoryIconComponent(cat.name)}
                        <span>{cat.name.replace(' Alternatives', '').replace(' Retail Pack', ' Packs')}</span>
                      </Link>
                    );
                  })
                ) : (
                  [1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-7 w-28 bg-stone-200/70 animate-pulse rounded-full shrink-0" />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM QUICK INFO STRIP */}
        <div className="bg-[#F4F8F1] border-t border-gray-200/80 px-3 sm:px-4 py-1.5 text-xs text-[#2D4030]">
          <div className="max-w-[1440px] mx-auto flex items-center justify-around sm:justify-between gap-2 sm:gap-6 text-[11px] sm:text-xs w-full min-w-0">
            <div className="flex items-center justify-around sm:justify-start gap-3 sm:gap-6 w-full sm:w-auto min-w-0">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#656B4F] shrink-0">
                <span className="w-3.5 h-3.5 rounded-xs border border-[#656B4F] flex items-center justify-center p-0.5 shrink-0">
                  <span className="w-1.5 h-1.5 bg-[#656B4F] rounded-full block"></span>
                </span>
                <span>100% Pure Veg</span>
              </span>

              <span className="text-stone-300 select-none text-[9px]">•</span>

              <Link
                href="/help"
                className="inline-flex items-center gap-1.5 font-medium text-gray-700 hover:text-[#656B4F] transition-colors shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#656B4F] shrink-0" />
                <span>Help</span>
              </Link>

              <span className="text-stone-300 select-none text-[9px]">•</span>

              <a
                href={`${MAIN_SITE_URL}/contact`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#656B4F] font-bold hover:underline shrink-0"
                title="Contact Sakthi Foods"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#656B4F] shrink-0" />
                <span>Contact</span>
              </a>
            </div>

            <div className="hidden sm:flex items-center gap-4 font-semibold shrink-0">
              <a href="tel:+918056389214" className="inline-flex items-center gap-1.5 text-[#656B4F] font-bold hover:underline whitespace-nowrap">
                <PhoneCall className="w-3.5 h-3.5 text-[#656B4F] shrink-0" /> +91 80563 89214
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[60]">
            <button aria-label="Close navigation menu" onClick={() => setIsMobileMenuOpen(false)} className="absolute inset-0 bg-[#102117]/50 backdrop-blur-[2px]" />
            <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col bg-[#FBFCF8] shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between border-b border-[#e4e9df] px-5 py-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                  <span className="relative h-10 w-10"><Image src={logo} alt="" fill className="object-contain" /></span>
                  <span><strong className="block text-sm text-[#50563D]">MOCK MEAT &amp; FROZEN FOODS</strong><small className="text-[9px] font-semibold tracking-wider text-[#748071]">SAKTHI FROZEN FOODS</small></span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="rounded-full p-2 text-gray-600 hover:bg-gray-100"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="mb-4 rounded-2xl bg-[#EAF3E7] p-3">
                  <p className="text-xs font-bold text-[#50563D]">Welcome{user?.name ? `, ${user.name}` : ' to Sakthi Frozen'}</p>
                  <p className="mt-1 text-[11px] text-[#647160]">Pure vegetarian - Plant based - Delivered frozen</p>
                </div>
                <nav className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                      pathname === '/'
                        ? 'bg-[#EAF0E5] text-[#50563D] font-black shadow-2xs'
                        : 'font-semibold text-[#26362a] hover:bg-[#edf3e9]'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                      pathname.startsWith('/shop')
                        ? 'bg-[#EAF0E5] text-[#50563D] font-black shadow-2xs'
                        : 'font-semibold text-[#26362a] hover:bg-[#edf3e9]'
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    <span>Shop all products</span>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                      pathname.startsWith('/wishlist')
                        ? 'bg-[#EAF0E5] text-[#50563D] font-black shadow-2xs'
                        : 'font-semibold text-[#26362a] hover:bg-[#edf3e9]'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-[#26362a]'}`} />
                    <span>My Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={user ? '/orders' : '/login'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                      pathname.startsWith('/orders') || pathname.startsWith('/login') || pathname.startsWith('/account')
                        ? 'bg-[#EAF0E5] text-[#50563D] font-black shadow-2xs'
                        : 'font-semibold text-[#26362a] hover:bg-[#edf3e9]'
                    }`}
                  >
                    <UserRound className="h-4 w-4" />
                    <span>{user ? 'My account & orders' : 'Sign in / Create account'}</span>
                  </Link>

                  {/* Corporate & Wholesale link */}
                  <a
                    href={MAIN_SITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-emerald-900 bg-emerald-50 border border-emerald-600/20 hover:bg-emerald-100 transition"
                  >
                    <Building2 className="h-4 w-4 text-emerald-700" />
                    <span>Corporate & Wholesale Site</span>
                    <ExternalLink className="ml-auto h-3.5 w-3.5 text-emerald-600" />
                  </a>

                  <Link
                    href="/help"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                      pathname === '/help'
                        ? 'bg-[#EAF0E5] text-[#50563D] font-black shadow-2xs'
                        : 'font-semibold text-[#26362a] hover:bg-[#edf3e9]'
                    }`}
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Help & Ordering Guide</span>
                  </Link>

                  <Link
                    href="/terms"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                      pathname === '/terms'
                        ? 'bg-[#EAF0E5] text-[#50563D] font-black shadow-2xs'
                        : 'font-semibold text-[#26362a] hover:bg-[#edf3e9]'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Terms & Storage Policy</span>
                  </Link>

                  <a
                    href={`${MAIN_SITE_URL}/about`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#26362a] hover:bg-[#edf3e9]"
                  >
                    <Leaf className="h-4 w-4" />
                    <span>About Sakthi Frozen</span>
                    <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-400" />
                  </a>

                  <a
                    href={`${MAIN_SITE_URL}/contact`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#26362a] hover:bg-[#edf3e9]"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Contact Us</span>
                    <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-400" />
                  </a>
                </nav>
                <div className="mt-6 border-t border-[#e4e9df] pt-4">
                  <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#818b7c]">Shop categories</p>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.name)}`} onClick={() => setIsMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-[#465247] hover:bg-[#edf3e9]">{category.name}</Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-[#e4e9df] p-4">
                {user ? <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700"><LogOut className="h-4 w-4" />Sign out</button> : <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#50563D] px-4 py-3 text-sm font-bold text-white"><UserRound className="h-4 w-4" />Sign in to your account</Link>}
              </div>
            </aside>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar with Olive Green Active BG & White Text */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 z-50 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
          isFooterVisible ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex items-center justify-around max-w-md mx-auto w-full gap-1">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 min-w-[56px] ${
              pathname === '/'
                ? 'bg-[#50563D] text-white shadow-xs'
                : 'text-[#6F776B] hover:text-[#50563D] hover:bg-[#F3F6EF]'
            }`}
          >
            <Home className="w-4.5 h-4.5 mb-0.5" />
            <span className="text-[10px] font-bold leading-none">Home</span>
          </Link>

          {/* Shop */}
          <Link
            href="/shop"
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 min-w-[56px] ${
              pathname.startsWith('/shop')
                ? 'bg-[#50563D] text-white shadow-xs'
                : 'text-[#6F776B] hover:text-[#50563D] hover:bg-[#F3F6EF]'
            }`}
          >
            <Store className="w-4.5 h-4.5 mb-0.5" />
            <span className="text-[10px] font-bold leading-none">Shop</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 relative min-w-[56px] ${
              pathname.startsWith('/cart')
                ? 'bg-[#50563D] text-white shadow-xs'
                : 'text-[#6F776B] hover:text-[#50563D] hover:bg-[#F3F6EF]'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4.5 h-4.5 mb-0.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#E06A26] text-white text-[8px] font-black min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center ring-1 ring-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold leading-none">Cart</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 relative min-w-[56px] ${
              pathname.startsWith('/wishlist')
                ? 'bg-[#50563D] text-white shadow-xs'
                : 'text-[#6F776B] hover:text-[#50563D] hover:bg-[#F3F6EF]'
            }`}
          >
            <div className="relative">
              <Heart
                className={`w-4.5 h-4.5 mb-0.5 ${
                  wishlistCount > 0 && pathname.startsWith('/wishlist')
                    ? 'text-white fill-white'
                    : wishlistCount > 0
                    ? 'text-rose-500 fill-rose-500'
                    : ''
                }`}
              />
              {wishlistCount > 0 && !pathname.startsWith('/wishlist') && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[8px] font-black min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center ring-1 ring-white">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold leading-none">Wishlist</span>
          </Link>

          {/* Account */}
          <Link
            href={user ? '/orders' : '/login'}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 min-w-[56px] ${
              pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/login')
                ? 'bg-[#50563D] text-white shadow-xs'
                : 'text-[#6F776B] hover:text-[#50563D] hover:bg-[#F3F6EF]'
            }`}
          >
            <UserRound className="w-4.5 h-4.5 mb-0.5" />
            <span className="text-[10px] font-bold leading-none">Account</span>
          </Link>
        </div>
      </div>
    </>
  );
}

