'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Truck,
  ShieldCheck,
  Snowflake,
  Clock,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Building2,
  FileText,
  Flame,
  Utensils,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MAIN_SITE_URL } from '@/lib/config';

interface FAQItem {
  question: string;
  answer: string;
  category: 'ordering' | 'delivery' | 'storage' | 'b2b';
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'ordering',
    question: 'How do I place an online order on Sakthi Frozen Foods?',
    answer: 'Simply browse our product catalog at /shop, select your desired plant-based mock meat or starter packs (e.g. Mock Mutton Chukka, Veg Chicken, Soya Chaap, Spring Rolls), choose the pack weight, add to cart, and proceed to checkout. You can pay securely online via UPI, Cards, or Net Banking.'
  },
  {
    category: 'delivery',
    question: 'How does cold-chain delivery work? Will the food stay frozen?',
    answer: 'All orders are dispatched directly from our -18°C cold storage facility packed inside insulated thermal bags with cold-retention ice gel packs. This ensures your products stay rock-solid frozen during transit until they reach your doorstep.'
  },
  {
    category: 'delivery',
    question: 'What are your delivery areas and delivery timelines?',
    answer: 'We offer express delivery across Coimbatore city (RS Puram, Peelamedu, Gandhipuram, Saravanampatti, Kavundampalayam, etc.) typically within 2 to 4 hours or scheduled next-day slots. We also ship across all Tamil Nadu districts via temperature-controlled logistics.'
  },
  {
    category: 'storage',
    question: 'How should I store the products once delivered?',
    answer: 'Immediately transfer all received packages into your deep freezer at -18°C or below. Do not leave the frozen items at room temperature unless you are preparing to cook them within the next 15-20 minutes.'
  },
  {
    category: 'storage',
    question: 'What is the shelf life of Sakthi Frozen Mock Meat products?',
    answer: 'When stored properly at -18°C in an airtight freezer compartment, our products maintain optimum flavour, texture, and nutrition for 6 to 12 months from the date of manufacture. Check each package for the specific best-before date.'
  },
  {
    category: 'ordering',
    question: 'What if my package arrives thawed, defrosted, or damaged?',
    answer: 'We have a 100% Freshness Guarantee. In the rare event your order arrives defrosted or compromised due to transit delays, send photos of the package to our WhatsApp support (+91 80563 89214) or email us within 24 hours of delivery. We will issue an immediate replacement or full refund.'
  },
  {
    category: 'b2b',
    question: 'Do you offer bulk supply for restaurants, caterers, or retail distributors?',
    answer: 'Yes! Sakthi Frozen Foods is one of South India’s largest B2B plant-based mock meat suppliers and cold storage operators. For wholesale orders (50kg+), private labelling, or distributor inquiries, visit our Corporate Website at tnmockmeat.com or contact us directly on WhatsApp.'
  },
  {
    category: 'ordering',
    question: 'Are all products 100% pure vegetarian and FSSAI certified?',
    answer: 'Yes, 100%! All our mock meats and snacks are made from premium plant proteins (non-GMO soya, wheat gluten, pea protein, authentic natural spices) and manufactured under strict FSSAI hygiene standards. No animal products or non-veg cross-contamination ever.'
  }
];

export default function HelpPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [faqFilter, setFaqFilter] = useState<'all' | 'ordering' | 'delivery' | 'storage' | 'b2b'>('all');

  const filteredFaqs = faqFilter === 'all' 
    ? FAQ_DATA 
    : FAQ_DATA.filter((item) => item.category === faqFilter);

  return (
    <div className="min-h-screen bg-[#FBFDF8] text-[#1E201D] flex flex-col font-sans selection:bg-[#50563D] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF2E4] via-[#F4F8F0] to-[#FBFDF8] py-10 sm:py-16 border-b border-[#50563D]/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#50563D]/10 text-[#50563D] text-xs sm:text-sm font-bold mb-4">
              <HelpCircle className="w-4 h-4 text-[#50563D]" />
              <span>Customer Help Desk & Ordering Guide</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#22271D] tracking-tight font-display mb-4">
              How Can We Help You Today?
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#52574E] leading-relaxed">
              Find instant answers to ordering, express <strong className="text-[#50563D] font-bold">-18°C cold chain delivery</strong>, 
              storage tips, or connect directly with our support team in Coimbatore.
            </p>

            {/* Quick Action Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/918056389214?text=Hi%20Sakthi%20Frozen%20Foods%2C%20I%20need%20assistance%20with%20an%20order%2Fdelivery."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp (+91 80563 89214)</span>
              </a>

              <a
                href="tel:+918056389214"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-50 text-[#50563D] border border-[#50563D]/25 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all"
              >
                <Phone className="w-4 h-4 text-[#50563D]" />
                <span>Call +91 80563 89214</span>
              </a>

              <a
                href="mailto:sakthifrozenfoods@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-50 text-[#50563D] border border-[#50563D]/25 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all"
              >
                <Mail className="w-4 h-4 text-[#50563D]" />
                <span>Email Support</span>
              </a>
            </div>
          </div>
        </section>

        {/* 3 CONTACT CHANNELS CARDS */}
        <section className="py-10 sm:py-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#656B4F]">Direct Support Channels</h2>
            <p className="text-xl sm:text-2xl font-black text-[#22271D] mt-1">We’re Here When You Need Us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: WhatsApp Support */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#25D366]/30 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-[#25D366] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                Fastest Response
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366] mb-4">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">WhatsApp Instant Help</h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Fast resolution for live order status, custom pack sizes, local delivery timing, or product recommendations.
                </p>
                <div className="space-y-1 mb-6 text-xs text-gray-700 font-medium">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Average reply time: <strong>5 - 10 minutes</strong></span>
                  </p>
                  <p className="text-gray-500">Mon - Sun: 9:00 AM – 9:00 PM</p>
                </div>
              </div>
              <a
                href="https://wa.me/918056389214?text=Hi%20Sakthi%20Frozen%20Foods%2C%20I%20need%20help%20with%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs text-center flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Start WhatsApp Chat
              </a>
            </div>

            {/* Card 2: Phone Calling */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#EAF2E4] flex items-center justify-center text-[#50563D] mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Direct Phone Call</h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Speak directly with our customer support and dispatch manager for instant ordering or address changes.
                </p>
                <div className="space-y-2 mb-6 text-xs text-gray-800">
                  <a href="tel:+918056389214" className="flex items-center gap-2 font-bold text-[#50563D] hover:underline">
                    <Phone className="w-3.5 h-3.5" /> +91 80563 89214 (Customer Care)
                  </a>
                  <a href="tel:+919042539214" className="flex items-center gap-2 text-gray-600 hover:text-black">
                    <Phone className="w-3.5 h-3.5" /> +91 90425 39214 (Office & Dispatch)
                  </a>
                </div>
              </div>
              <a
                href="tel:+918056389214"
                className="w-full py-2.5 rounded-xl bg-[#50563D] hover:bg-[#3D422E] text-white font-bold text-xs text-center flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4" /> Call Us Directly
              </a>
            </div>

            {/* Card 3: Email & Location */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Email & Store Visit</h3>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  For order complaints, invoices, feedback, or direct pickup from our Kavundampalayam cold store.
                </p>
                <div className="space-y-2 mb-6 text-xs text-gray-700">
                  <a href="mailto:sakthifrozenfoods@gmail.com" className="flex items-center gap-2 font-semibold hover:text-[#50563D] break-all">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" /> sakthifrozenfoods@gmail.com
                  </a>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#50563D] mt-0.5" />
                    <span>Kalpana Theatre Opp, Kavundampalayam, Coimbatore - 641030</span>
                  </div>
                </div>
              </div>
              <a
                href="mailto:sakthifrozenfoods@gmail.com"
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs text-center flex items-center justify-center gap-2 transition-colors"
              >
                <Mail className="w-4 h-4" /> Send Email Message
              </a>
            </div>
          </div>
        </section>

        {/* 5-STEP E-COMMERCE ORDERING & COLD CHAIN PROCESS */}
        <section className="py-12 sm:py-16 bg-[#F4F8F0] border-y border-[#50563D]/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#50563D] bg-white px-3 py-1 rounded-full border border-[#50563D]/20">
                <PackageCheck className="w-3.5 h-3.5 text-[#50563D]" /> Easy 5-Step Process
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#22271D] mt-2 font-display">
                How E-Commerce Ordering & Delivery Works
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                From farm-sourced plant protein to your deep freezer in seamless -18°C temperature control.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col relative group hover:border-[#50563D] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#50563D] text-white font-black text-xs flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <ShoppingBag className="w-5 h-5 text-stone-400 group-hover:text-[#50563D] transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5">Select Products</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Browse our plant-based vegan meat collection, soya chaap, and crispy snacks at <Link href="/shop" className="text-[#50563D] font-bold hover:underline">/shop</Link>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col relative group hover:border-[#50563D] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#50563D] text-white font-black text-xs flex items-center justify-center shadow-xs">
                    2
                  </span>
                  <Sparkles className="w-5 h-5 text-stone-400 group-hover:text-[#50563D] transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5">Cart & Pack Size</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Choose your pack weight (250g, 400g, 1kg) or money-saver combo packs and add to cart.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col relative group hover:border-[#50563D] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#50563D] text-white font-black text-xs flex items-center justify-center shadow-xs">
                    3
                  </span>
                  <ShieldCheck className="w-5 h-5 text-stone-400 group-hover:text-[#50563D] transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5">Secure Checkout</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Enter your exact address with landmark and phone number. Pay securely via UPI, Card, or Net Banking.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col relative group hover:border-[#50563D] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#50563D] text-white font-black text-xs flex items-center justify-center shadow-xs">
                    4
                  </span>
                  <Snowflake className="w-5 h-5 text-cyan-600 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5">-18°C Thermal Pack</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Items are packed with insulated thermal foil & ice gel packs to maintain sub-zero freeze during delivery.
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col relative group hover:border-[#50563D] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-[#50563D] text-white font-black text-xs flex items-center justify-center shadow-xs">
                    5
                  </span>
                  <Truck className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5">Doorstep & Storage</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Receive your package and put it directly into your freezer at -18°C or cook fresh right away!
                </p>
              </div>
            </div>

            {/* Quick Cooking & Storage Callout */}
            <div className="mt-8 bg-white rounded-2xl p-5 sm:p-6 border border-[#50563D]/20 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl shrink-0 mt-0.5">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">How to Cook from Frozen?</h4>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    <strong>For snacks (Spring Rolls, Momos, Nuggets):</strong> Fry or air-fry directly without thawing.<br />
                    <strong>For curries (Mock Mutton, Soya Chaap):</strong> Thaw for 10-15 mins in room temp water before tossing into your curry gravy.
                  </p>
                </div>
              </div>

              <Link
                href="/shop"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#50563D] hover:bg-[#3D422E] text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#656B4F]">Knowledge Base</h2>
            <p className="text-2xl sm:text-3xl font-black text-[#22271D] mt-1 font-display">Frequently Asked Questions</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'ordering', label: 'Ordering & Payment' },
              { id: 'delivery', label: 'Cold-Chain Delivery' },
              { id: 'storage', label: 'Storage & Cooking' },
              { id: 'b2b', label: 'B2B & Wholesale' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFaqFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  faqFilter === tab.id
                    ? 'bg-[#50563D] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#22271D] hover:text-[#50563D] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#50563D]' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-stone-100 bg-[#FAFBF7]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Still have questions banner */}
          <div className="mt-10 p-6 rounded-2xl bg-[#EAF2E4] border border-[#50563D]/20 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-sm font-bold text-[#22271D]">Still have questions or need custom assistance?</h4>
              <p className="text-xs text-[#52574E] mt-0.5">Our team in Coimbatore is available 7 days a week.</p>
            </div>
            <a
              href="https://wa.me/918056389214"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us Directly</span>
            </a>
          </div>
        </section>

        {/* B2B / CORPORATE BANNER */}
        <section className="pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#50563D] to-[#363B28] text-white p-6 sm:p-10 relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold">
                  <Building2 className="w-3.5 h-3.5 text-[#A9F2B7]" /> For Hotels, Caterers & Wholesale Distributors
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                  Looking for Bulk Supply or Cold Storage Services?
                </h3>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  Visit our Corporate & Wholesale portal to explore 100kg+ commercial pricing, custom recipe manufacturing, and state-of-the-art cold storage facilities.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <a
                  href={MAIN_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-white text-[#50563D] font-bold text-xs hover:bg-[#FAFBF7] transition-all flex items-center gap-2 shadow-md hover:scale-105"
                >
                  <span>Visit Corporate Site</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <Link
                  href="/terms"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-2 border border-white/20"
                >
                  <FileText className="w-4 h-4" />
                  <span>Terms & Policies</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
