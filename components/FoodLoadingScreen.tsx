'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '../logo.png';
import {
  UtensilsCrossed,
  Leaf,
  Beef,
  Drumstick,
  Fish,
  Cookie,
  Snowflake,
  Sparkles
} from 'lucide-react';

interface FoodLoadingScreenProps {
  message?: string;
  subMessage?: string;
}

const FOOD_ITEMS = [
  { icon: Leaf, title: '100% Plant-Based', color: 'text-[#656B4F]', bg: 'bg-[#EAF0E5]', ring: 'border-[#656B4F]/30' },
  { icon: UtensilsCrossed, title: 'Chef-Crafted Recipes', color: 'text-[#50563D]', bg: 'bg-[#EAF0E5]', ring: 'border-[#50563D]/30' },
  { icon: Beef, title: 'Rich Veg Mutton Alternatives', color: 'text-amber-800', bg: 'bg-amber-100/70', ring: 'border-amber-300' },
  { icon: Drumstick, title: 'Tender Veg Poultry Cuts', color: 'text-[#50563D]', bg: 'bg-[#EAF0E5]', ring: 'border-[#50563D]/30' },
  { icon: Fish, title: 'Seafood Plant Alternatives', color: 'text-teal-800', bg: 'bg-teal-100/70', ring: 'border-teal-300' },
  { icon: Cookie, title: 'Crispy Veg Starters', color: 'text-orange-800', bg: 'bg-orange-100/70', ring: 'border-orange-300' },
  { icon: Snowflake, title: 'Deep Frozen at -18°C', color: 'text-blue-700', bg: 'bg-blue-100/70', ring: 'border-blue-300' },
  { icon: Sparkles, title: 'Authentic Flavor & Nutrition', color: 'text-[#656B4F]', bg: 'bg-[#EAF0E5]', ring: 'border-[#656B4F]/30' },
];

export default function FoodLoadingScreen({
  message = 'Loading Sakthi Frozen Foods...',
  subMessage = 'Preparing 100% pure vegetarian & plant-based essentials',
}: FoodLoadingScreenProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % FOOD_ITEMS.length);
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  const current = FOOD_ITEMS[index];
  const CurrentIcon = current.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F7F9F3] text-[#1E201D] select-none overflow-hidden px-4"
    >
      {/* Background ambient decorative glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#656B4F]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#656B4F]/20 blur-3xl pointer-events-none" />

      {/* Main Brand & Animation Card */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center space-y-5">
        
        {/* Logo Container */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 drop-shadow-sm">
          <Image src={logo} alt="Sakthi Frozen Foods" fill className="object-contain" priority />
        </div>

        {/* Animated Food Icon Stage */}
        <div className="relative flex items-center justify-center my-2">
          {/* Pulsing Outer Rings */}
          <div className="absolute w-28 h-28 rounded-full bg-[#EAF0E5] animate-ping opacity-30" />
          <div className={`w-24 h-24 rounded-3xl ${current.bg} border-2 ${current.ring} shadow-md flex items-center justify-center transition-all duration-500 transform hover:scale-105`}>
            <CurrentIcon className={`w-12 h-12 ${current.color} transition-transform duration-500 scale-100 animate-in zoom-in-75`} />
          </div>
        </div>

        {/* Dynamic Food Icon Tag */}
        <div className="h-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-stone-200 shadow-2xs text-xs font-black text-[#50563D] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#656B4F]" />
            {current.title}
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-black text-[#1E201D] tracking-tight font-poppins">
            {message}
          </h2>
          <p className="text-xs text-[#61665D] font-medium leading-relaxed max-w-xs mx-auto">
            {subMessage}
          </p>
        </div>

        {/* Shimmer Progress Indicator Bar */}
        <div className="w-48 h-1.5 bg-stone-200/80 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-[#656B4F] rounded-full w-24 animate-[shimmer_1.5s_infinite_linear]" 
               style={{
                 animation: 'pulseBar 1.6s ease-in-out infinite'
               }} 
          />
        </div>

        {/* Bottom Trust Tags */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-[#656B4F]">
          <span className="bg-white/80 px-2 py-0.5 rounded-md border border-stone-200/60">100% Pure Veg</span>
          <span>•</span>
          <span className="bg-white/80 px-2 py-0.5 rounded-md border border-stone-200/60">No Hormones</span>
          <span>•</span>
          <span className="bg-white/80 px-2 py-0.5 rounded-md border border-stone-200/60">Cold Chain -18°C</span>
        </div>
      </div>

      {/* Inline styles for the smooth bar pulse */}
      <style jsx>{`
        @keyframes pulseBar {
          0% {
            left: 0%;
            width: 20%;
          }
          50% {
            left: 30%;
            width: 60%;
          }
          100% {
            left: 80%;
            width: 20%;
          }
        }
      `}</style>
    </div>
  );
}
