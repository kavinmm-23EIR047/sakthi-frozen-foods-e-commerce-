'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Sprout,
  UserRound
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
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
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);

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
    { text: '100% Plant-Based Essentials', Icon: Leaf },
    { text: 'No Hormones & Antibiotic-Free', Icon: Ban },
    { text: 'Sustainably Sourced & Pure Veg', Icon: Sprout },
    { text: 'Need help? Call +91 98765 43210', Icon: PhoneCall },
  ];

  return (
    <>
      <header className="relative z-40 bg-white border-b border-gray-200 shadow-xs">

        {/* TOP SLIDING / MOVING ANNOUNCEMENT STRIP */}
        <div className="bg-[#656B4F] text-[#E8F0E5] overflow-hidden py-2 text-xs font-semibold border-b border-[#2d523f]">
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
                    SAKTHI FROZEN FOODS
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-[#6B7566] uppercase block">
                    PLANT BASED ESSENTIALS
                  </span>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 min-w-[120px] max-w-sm lg:max-w-lg shrink mx-1 lg:mx-2">
              <SearchOverlay />
            </div>

            {/* Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 2xl:gap-2 font-semibold text-xs text-[#3E473B] shrink-0">
              <Link href="/" className="px-3 py-2 rounded-lg hover:text-[#656B4F] hover:bg-gray-100 transition-all">
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
                  className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-[#656B4F] hover:bg-gray-100 transition-all"
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

              <a href="#about" className="px-3 py-2 rounded-lg hover:text-[#656B4F] hover:bg-gray-100 transition-all">
                About
              </a>
              <a href="#contact" className="px-3 py-2 rounded-lg hover:text-[#656B4F] hover:bg-gray-100 transition-all">
                Contact
              </a>
            </nav>

            {/* Right Header Controls */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <Link
                href="/shop"
                className="relative p-1.5 sm:p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all hidden sm:flex items-center"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                <span className="absolute top-1 right-1 bg-orange-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
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

              {/* Cart Button */}
              <button
                onClick={() => router.push('/cart')}
                className="relative px-2.5 sm:px-3.5 py-2 rounded-full bg-[#656B4F] text-white hover:bg-[#50563D] transition-all flex items-center gap-1.5 sm:gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="font-bold text-xs hidden sm:inline">Cart</span>
                <span className="bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Search Overlay */}
          <div className="md:hidden pb-3">
            <SearchOverlay />
          </div>
          <div className="hidden md:flex xl:hidden pb-2">
            <SearchOverlay />
          </div>
        </div>

        {/* BOTTOM QUICK INFO STRIP */}
        <div className="bg-[#F4F8F1] border-t border-gray-200/80 px-3 sm:px-4 py-2 text-xs text-[#2D4030]">
          <div className="max-w-[1440px] mx-auto flex flex-col items-center justify-center gap-y-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-4 lg:justify-between lg:gap-x-5">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-5">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#656B4F] whitespace-nowrap">
                <span className="w-3.5 h-3.5 rounded-xs border border-green-700 flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 bg-green-700 rounded-full block"></span>
                </span>
                100% Pure Veg
              </span>

              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-gray-700 whitespace-nowrap">
                <Leaf className="w-3.5 h-3.5 text-green-600" /> Plant-Based
              </span>

              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-gray-700 whitespace-nowrap">
                <Ban className="w-3.5 h-3.5 text-green-600" /> No Hormones / Antibiotics
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] sm:text-[11px] font-semibold">
              <a href="#contact" className="inline-flex items-center gap-1 text-gray-700 hover:text-[#656B4F] transition-colors">
                <HelpCircle className="w-3.5 h-3.5 text-green-700" /> Help Center
              </a>
              <a href="tel:+919876543210" className="inline-flex items-center gap-1 text-[#656B4F] font-bold hover:underline">
                <PhoneCall className="w-3.5 h-3.5 text-green-700" /> +91 98765 43210
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
                  <span><strong className="block text-sm text-[#50563D]">SAKTHI FROZEN FOODS</strong><small className="text-[9px] font-semibold tracking-wider text-[#748071]">PLANT BASED ESSENTIALS</small></span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="rounded-full p-2 text-gray-600 hover:bg-gray-100"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="mb-4 rounded-2xl bg-[#EAF3E7] p-3">
                  <p className="text-xs font-bold text-[#50563D]">Welcome{user?.name ? `, ${user.name}` : ' to Sakthi'}</p>
                  <p className="mt-1 text-[11px] text-[#647160]">Pure vegetarian - Plant based - Delivered frozen</p>
                </div>
                <nav className="space-y-1">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#26362a] hover:bg-[#edf3e9]"><Home className="h-4 w-4" />Home</Link>
                  <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#26362a] hover:bg-[#edf3e9]"><Store className="h-4 w-4" />Shop all products<ArrowRight className="ml-auto h-4 w-4" /></Link>
                  <Link href={user ? '/orders' : '/login'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#26362a] hover:bg-[#edf3e9]"><UserRound className="h-4 w-4" />{user ? 'My account & orders' : 'Sign in / Create account'}</Link>
                  <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#26362a] hover:bg-[#edf3e9]"><Leaf className="h-4 w-4" />About Sakthi</a>
                  <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#26362a] hover:bg-[#edf3e9]"><HelpCircle className="h-4 w-4" />Help & contact</a>
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

      {/* Mobile Bottom Navigation Bar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 flex items-center justify-around py-2 px-2 transition-transform duration-300 ${isFooterVisible ? 'translate-y-full' : 'translate-y-0'
          }`}
      >
        <Link href="/" className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#656B4F]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link href="/shop" className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#656B4F]">
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Shop</span>
        </Link>
        <a href="#contact" className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#656B4F]">
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Contact</span>
        </a>
        <Link href="/account" className={`flex flex-col items-center gap-1 ${user ? 'text-[#656B4F]' : 'text-gray-600'} hover:text-[#656B4F]`}>
          <UserRound className="w-5 h-5" />
          <span className="text-[10px] font-semibold">My Account</span>
        </Link>
      </div>
    </>
  );
}
