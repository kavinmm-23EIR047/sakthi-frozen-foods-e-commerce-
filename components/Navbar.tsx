'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '../logo.png';
import { ShoppingBag, ShieldCheck, LayoutDashboard, Leaf, Home, Store, User, LogOut, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import SearchOverlay from './SearchOverlay';

interface NavbarProps {
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

export default function Navbar({
  activeCategory = 'All',
  onSelectCategory,
}: NavbarProps) {
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { root: null, threshold: 0.1 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  
  return (
    <>
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#676662]/15 transition-all">
      {/* Top Banner Notice */}
      <div className="bg-[#656B4F] text-[#FBFDF2] px-4 py-2 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2 sm:text-sm">
        <ShieldCheck className="w-4 h-4 text-green-300 hidden sm:block" />
        <span className="truncate">Plant-based frozen foods, delivered with care. Free delivery on orders over ₹999.</span>
      </div>

      <div className="site-shell">
        <div className="flex h-16 items-center justify-between gap-2 sm:h-[4.5rem] sm:gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="relative w-16 h-10 sm:w-20 sm:h-12 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image src={logo} alt="Sakthi Frozen Foods" fill sizes="(max-width: 768px) 100vw, 200px" className="object-contain" priority />
            </div>
            <div className="hidden sm:block">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#1E201D] block leading-none">
                SAKTHI FROZEN FOODS
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-[#676662] uppercase block mt-1">
                Plant-based essentials
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative mx-4">
            <SearchOverlay />
          </div>

          {/* Right Controls */}
          <div className="flex items-center justify-end gap-1 sm:gap-3 shrink-0">
            
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 mr-2">
              <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#61665D] hover:text-[#1E201D] hover:bg-[#E8EEE0] transition-all">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link href="/shop" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#61665D] hover:text-[#1E201D] hover:bg-[#E8EEE0] transition-all">
                <Store className="w-4 h-4" />
                <span>Shop</span>
              </Link>
            </nav>

            {/* User Controls */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/orders"
                  title="My Orders"
                  className="p-2 sm:px-3 sm:py-2 rounded-xl text-[#4D583F] bg-[#EAF0E5] hover:bg-[#4D583F] hover:text-white transition-all flex items-center gap-1.5 border border-[#4D583F]/20"
                >
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline text-xs font-bold">Orders</span>
                </Link>

                {user.role === 'Admin' && (
                  <Link
                    href="/admin"
                    title="Admin Dashboard"
                    className="p-2 sm:px-3 sm:py-2 rounded-xl text-[#4D583F] bg-[#EAF0E5] hover:bg-[#4D583F] hover:text-white transition-all flex items-center gap-1.5 border border-[#4D583F]/20"
                  >
                    <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden lg:inline text-xs font-bold">Admin</span>
                  </Link>
                )}

                <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-[#E8EEE0] border border-[#4F534C]/20 text-[#1E201D] font-black uppercase text-sm" title={user.name}>
                  {user.name.charAt(0)}
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 sm:px-3 sm:py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline text-xs font-bold">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="p-2 sm:px-4 sm:py-2.5 rounded-xl text-[#1E201D] bg-white hover:bg-[#E8EEE0] transition-all flex items-center gap-1.5 border border-[#4F534C]/20 shadow-sm mr-1"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-xs font-bold">Sign In</span>
              </Link>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-[#4F534C]/20 mx-1 hidden sm:block"></div>

            {/* Cart Button */}
            <button
              onClick={() => router.push('/cart')}
              className="relative p-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#656B4F] text-white hover:bg-[#50563d] transition-all shadow-md flex items-center gap-2 group"
            >
              <ShoppingBag className="w-5 h-5 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D84315] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <SearchOverlay />
        </div>
      </div>
    </header>
    
    {/* Mobile Bottom App Bar */}
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#4F534C]/15 z-50 flex items-center justify-around py-2 px-2 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 ${isFooterVisible ? 'translate-y-full' : 'translate-y-0'}`}>
      <Link href="/" className="flex flex-col items-center gap-1 text-[#61665D] hover:text-[#4D583F] transition-colors">
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">Home</span>
      </Link>
      <Link href="/shop" className="flex flex-col items-center gap-1 text-[#61665D] hover:text-[#4D583F] transition-colors">
        <Store className="w-5 h-5" />
        <span className="text-[10px] font-bold">Shop</span>
      </Link>
      {user ? (
        <>
          <Link href="/orders" className="flex flex-col items-center gap-1 text-[#61665D] hover:text-[#4D583F] transition-colors">
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-bold">Orders</span>
          </Link>
          {user.role === 'Admin' && (
            <Link href="/admin" className="flex flex-col items-center gap-1 text-[#61665D] hover:text-[#4D583F] transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-bold">Admin</span>
            </Link>
          )}
        </>
      ) : (
        <Link href="/login" className="flex flex-col items-center gap-1 text-[#61665D] hover:text-[#4D583F] transition-colors">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Sign In</span>
        </Link>
      )}
    </div>
    </>
  );
}
