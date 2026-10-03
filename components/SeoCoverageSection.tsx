'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronDown,
  MapPin,
  Leaf,
  Award,
  Flame,
  CheckCircle2,
  Snowflake,
  HelpCircle,
  Store,
  ArrowRight,
} from 'lucide-react';

const COIMBATORE_LOCALITIES = [
  'RS Puram',
  'Gandhipuram',
  'Peelamedu',
  'Saibaba Colony',
  'Saravanampatti',
  'Vadavalli',
  'Thudiyalur',
  'Koundampalayam',
  'Singanallur',
  'Kuniyamuthur',
  'Ganapathy',
  'Kalapatti',
  'Ondipudur',
  'Ukkadam',
  'Podanur',
  'Sulur',
  'Pollachi',
  'Mettupalayam',
  'Annur',
  'Kinathukadavu',
];

const TAMIL_NADU_DISTRICTS = [
  'Coimbatore',
  'Tirupur',
  'Erode',
  'Salem',
  'Chennai',
  'Madurai',
  'Trichy',
  'Nilgiris (Ooty)',
  'Karur',
  'Dindigul',
  'Namakkal',
  'Tirunelveli',
  'Vellore',
  'Thanjavur',
  'Kanchipuram',
  'Cuddalore',
  'Dharmapuri',
  'Krishnagiri',
  'Pudukkottai',
  'Ramanathapuram',
  'Sivaganga',
  'Theni',
  'Thoothukudi',
  'Tiruvannamalai',
  'Villupuram',
  'Virudhunagar',
];

const SEO_FAQS = [
  {
    q: "Why is Sakthi Frozen Foods recognized as India's best plant-based mock meat brand?",
    a: "Sakthi Frozen Foods produces 100% pure vegetarian, plant-based mock meats using premium non-GMO soya, wheat protein, and natural plant fibers. Our chef-crafted recipes deliver authentic juicy texture, rich spice absorption, zero cholesterol, and high protein without any animal products. We are FSSAI licensed (Lic No: 12421008000456) and trusted by thousands of home cooks, chefs, and restaurants across India.",
  },
  {
    q: 'How is cold chain delivery maintained at -18°C across Coimbatore and Tamil Nadu districts?',
    a: 'Every online order placed on buy.tnmockmeat.com is packed inside multi-layer thermal insulation containers with industrial food-grade frozen gel packs. In Coimbatore, our express doorstep delivery fleet delivers directly at -18°C. For all other Tamil Nadu districts, orders are dispatched via temperature-controlled refrigerated logistics to guarantee zero thawing.',
  },
  {
    q: 'What types of mock meat and vegan meat alternatives are available?',
    a: 'We offer an extensive range of frozen vegan meat alternatives: Plant-Based Mutton Chukka, Vegan Mutton Boti, 100% Veg Chicken 65, Vegan Chicken Nuggets, Mock Fish Fingers, Plant-Based Prawns, Vegan Seekh Kebabs, Crispy Corn Cheese Balls, and Veg Burger Patties in retail (400g/500g) and wholesale (1kg/bulk) packs.',
  },
  {
    q: 'How do I cook and store Sakthi Frozen plant-based meats?',
    a: 'Keep products sealed in your freezer at -18°C until cooking. Do not thaw in water. You can directly shallow fry, air fry, deep fry, or simmer in rich South Indian gravies (like Chettinad Mutton Curry, Pepper Fry, Biryani, or Butter Masala). They absorb spices in 5 to 8 minutes.',
  },
  {
    q: 'Which localities in Coimbatore have instant doorstep delivery?',
    a: 'We provide doorstep delivery across all Coimbatore zones including RS Puram, Gandhipuram, Peelamedu, Saibaba Colony, Saravanampatti, Vadavalli, Thudiyalur, Koundampalayam, Singanallur, Kuniyamuthur, Ganapathy, Kalapatti, Ondipudur, Sulur, Pollachi, and Mettupalayam.',
  },
];

export default function SeoCoverageSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // FAQ Schema for Google Rich Snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SEO_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-[#FAFBF7] to-[#F2F6ED] border-t border-[#D4DBC9] relative overflow-hidden">
      {/* Schema.org FAQ Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Header & Badges */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF0E5] border border-[#656B4F]/30 text-[#50563D] text-xs font-black uppercase tracking-wider shadow-2xs">
            <Award className="w-3.5 h-3.5 text-[#50563D]" />
            <span>India&apos;s #1 Plant-Based Mock Meat Destination</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1E201D] font-poppins tracking-tight leading-tight">
            India&apos;s Best Mock Meat &amp; Vegan Meat Express Delivery
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            100% Pure Vegetarian Plant-Based Meat Alternatives crafted from non-GMO soya &amp; wheat protein.
            Enjoy authentic juicy texture with zero cholesterol, high dietary fiber, and express <strong>-18°C frozen cold chain delivery</strong> across Coimbatore and all Tamil Nadu districts.
          </p>
        </div>

        {/* 2. Key Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#D4DBC9] shadow-xs space-y-2 hover:border-[#50563D] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#EAF0E5] flex items-center justify-center text-[#50563D]">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-[#1E201D]">100% Pure Vegetarian</h3>
            <p className="text-xs text-stone-600 leading-snug">
              Certified vegan and vegetarian ingredients. Cruelty-free plant meat with the exact authentic bite and aroma.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D4DBC9] shadow-xs space-y-2 hover:border-[#50563D] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#EAF0E5] flex items-center justify-center text-[#50563D]">
              <Snowflake className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-extrabold text-sm text-[#1E201D]">-18°C Cold Chain Logistics</h3>
            <p className="text-xs text-stone-600 leading-snug">
              Thermal insulated containers with frozen gel packs ensure your mock meats arrive in frozen perfection.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D4DBC9] shadow-xs space-y-2 hover:border-[#50563D] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#EAF0E5] flex items-center justify-center text-[#50563D]">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-extrabold text-sm text-[#1E201D]">FSSAI Licensed &amp; Safe</h3>
            <p className="text-xs text-stone-600 leading-snug">
              Compliant with FSSAI hygiene standards (Lic: <strong>12421008000456</strong>) ensuring pure, uncompromised quality.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D4DBC9] shadow-xs space-y-2 hover:border-[#50563D] transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#EAF0E5] flex items-center justify-center text-[#50563D]">
              <Truck className="w-5 h-5 text-[#50563D]" />
            </div>
            <h3 className="font-extrabold text-sm text-[#1E201D]">All Districts Covered</h3>
            <p className="text-xs text-stone-600 leading-snug">
              Doorstep delivery in Coimbatore and rapid courier dispatch to every single district in Tamil Nadu.
            </p>
          </div>
        </div>

        {/* 3. Coimbatore Localities & Tamil Nadu District Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coimbatore Local Delivery Hubs */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D4DBC9] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#50563D]">
              <MapPin className="w-4 h-4" />
              <h3 className="font-black text-sm uppercase tracking-wider">
                Coimbatore Doorstep Express Delivery Hubs
              </h3>
            </div>
            <p className="text-xs text-stone-600">
              Live local delivery routes active across all major Coimbatore residential &amp; commercial zones:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COIMBATORE_LOCALITIES.map((loc) => (
                <span
                  key={loc}
                  className="px-2.5 py-1 rounded-lg bg-[#FAFBF7] border border-[#D4DBC9] text-[11px] font-bold text-[#2D3823] hover:bg-[#EAF0E5] transition-colors"
                >
                  📍 {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Tamil Nadu All Districts Coverage */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#D4DBC9] shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#50563D]">
              <Truck className="w-4 h-4" />
              <h3 className="font-black text-sm uppercase tracking-wider">
                Tamil Nadu All Districts Frozen Delivery Network
              </h3>
            </div>
            <p className="text-xs text-stone-600">
              Thermal insulated frozen mock meat orders dispatched daily to all Tamil Nadu districts:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {TAMIL_NADU_DISTRICTS.map((dist) => (
                <span
                  key={dist}
                  className="px-2.5 py-1 rounded-lg bg-[#FAFBF7] border border-[#D4DBC9] text-[11px] font-bold text-[#2D3823] hover:bg-[#EAF0E5] transition-colors"
                >
                  ❄️ {dist}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Product Range Categories Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#50563D] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-[#B4CEB1]">
              Full Product Catalog Online
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-poppins">
              Explore India&apos;s Richest Selection of Plant-Based Meats
            </h3>
            <p className="text-xs text-[#EAF0E5] leading-relaxed">
              From traditional South Indian Mutton Chukka and Chettinad Pepper Fry to crispy Vegan Chicken 65, Fish Fingers, and Seekh Kebabs. Available in retail packs and wholesale bulk sizes.
            </p>
          </div>
          <Link
            href="/shop"
            className="px-6 py-3 rounded-2xl bg-white hover:bg-[#FAFBF7] text-[#50563D] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <Store className="w-4 h-4" />
            <span>Shop All Mock Meats</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 5. FAQ Accordion (Schema Optimized) */}
        <div className="space-y-4 pt-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#656B4F]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1E201D] font-poppins">
              Frequently Asked Questions About Sakthi Frozen Mock Meats
            </h3>
          </div>

          <div className="max-w-3xl mx-auto space-y-2.5 pt-2">
            {SEO_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-[#D4DBC9] overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-extrabold text-xs sm:text-sm text-[#1E201D] hover:bg-[#FAFBF7] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#EAF0E5] text-[#50563D] flex items-center justify-center text-xs font-black shrink-0">
                        {idx + 1}
                      </span>
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#656B4F] shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#50563D]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3 bg-[#FCFDF9]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
