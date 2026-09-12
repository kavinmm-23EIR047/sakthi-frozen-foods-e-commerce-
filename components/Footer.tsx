'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, FileText, RefreshCw, Lock, MessageCircle, X, Snowflake, Leaf, Flame } from 'lucide-react';
import { fetchApi } from '@/lib/apiConfig';
import logo from '../logo.png';

export default function Footer() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [activePolicyModal, setActivePolicyModal] = useState<'refund' | 'terms' | 'privacy' | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchApi('/categories');
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories in Footer:', err);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="pt-8">
      <footer className="relative z-20 bg-[#4D583F] text-[#FAFAF5] pt-16 md:pt-20 pb-10 md:pb-12 rounded-t-[3rem] md:rounded-t-[6rem] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
        
        {/* Background Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          <Snowflake className="absolute top-12 left-[15%] w-32 h-32 text-white/[0.04] -rotate-12 animate-pulse" style={{ animationDuration: '4s' }} />
          <Leaf className="absolute bottom-16 right-[10%] w-48 h-48 text-white/[0.05] rotate-45 animate-pulse" style={{ animationDuration: '6s' }} />
          <Flame className="absolute top-24 right-[45%] w-24 h-24 text-white/[0.03] rotate-12 animate-pulse" style={{ animationDuration: '5s' }} />
        </div>

        <div className="site-shell relative z-10">
          <div className="grid grid-cols-1 gap-10 border-b border-white/15 pb-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.95fr_1.15fr]">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-24 h-16 sm:w-28 sm:h-20 shrink-0 flex items-center justify-center">
                <Image src={logo} alt="Sakthi Frozen Foods" fill sizes="(max-width: 768px) 100vw, 200px" className="object-contain object-left" />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white block leading-none font-display">
                  MOCK MEAT & FROZEN FOODS
                </span>
                <span className="text-xs md:text-sm font-bold tracking-widest text-[#E8F1D2] uppercase block mt-1.5">
                  SAKTHI FROZEN FOODS TRADERS
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-base leading-relaxed text-[#F4F9ED]">
              Premium plant-based frozen foods made for everyday cooking and authentic flavour.
            </p>

            <div className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-base text-white font-bold shadow-lg backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#A9F2B7]" />
              <span>FSSAI & ISO 22000 Certified</span>
            </div>
          </div>

          {/* Column 2: Product Categories (Dynamic Backend Only) */}
          <div>
            <h4 className="text-xs sm:text-sm md:text-base font-black text-white uppercase tracking-[0.15em] mb-4 md:mb-5">
              Product Categories
            </h4>
            <ul className="space-y-3 md:space-y-4 text-[13px] md:text-base text-[#E8F1D2] font-medium">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id || cat.name}>
                    <Link href={`/shop?category=${encodeURIComponent(cat.name)}`} className="hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center gap-2.5 group">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/30 group-hover:bg-white transition-colors shrink-0" />
                      <span className="leading-snug">{cat.name}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-[#E8F1D2]/70 italic text-base">Loading categories...</li>
              )}
            </ul>
          </div>

          {/* Column 3: Quick Links & Legal Policies */}
          <div>
            <h4 className="text-xs sm:text-sm md:text-base font-black text-white uppercase tracking-[0.15em] mb-4 md:mb-5">
              Store & Policies
            </h4>
            <ul className="space-y-3 md:space-y-4 text-[13px] md:text-base text-[#E8F1D2] font-medium">
              <li>
                <Link href="/" className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">
                  Storefront Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">
                  Product Catalog
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('refund')}
                  className="hover:text-white text-left hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#A9F2B7] group-hover:text-white transition-colors" />
                  <span>Refund & Return Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('terms')}
                  className="hover:text-white text-left hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group"
                >
                  <FileText className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('privacy')}
                  className="hover:text-white text-left hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group"
                >
                  <Lock className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" />
                  <span>Privacy Policy</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & WhatsApp Support */}
          <div>
            <h4 className="text-xs sm:text-sm md:text-base font-black text-white uppercase tracking-[0.15em] mb-4 md:mb-5">
              Contact & Support
            </h4>
            <ul className="space-y-4 md:space-y-5 text-[13px] md:text-base leading-relaxed text-[#E8F1D2] font-medium">
              <li className="flex items-start gap-3">
                <div className="p-2 bg-white/10 rounded-lg mt-0.5">
                  <MapPin className="w-5 h-5 text-[#A9F2B7] shrink-0" />
                </div>
                <span>Sakthi Frozen Foods Industrial Park, Guindy, Chennai - 600032</span>
              </li>
              <li>
                <a href="tel:+919876543210" className="inline-flex items-center gap-3 transition-colors hover:text-white group">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    <Phone className="w-5 h-5 shrink-0 text-[#A9F2B7]" />
                  </div>
                  <span>+91 98765 43210 / 044-24567890</span>
                </a>
              </li>
              <li>
                <a href="mailto:orders@sakthifrozenfoods.com" className="inline-flex items-center gap-3 transition-colors hover:text-white group">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                    <Mail className="w-5 h-5 shrink-0 text-[#A9F2B7]" />
                  </div>
                  <span>orders@sakthifrozenfoods.com</span>
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with Sakthi Frozen Foods on WhatsApp"
                className="inline-flex min-h-[52px] w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] px-7 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
              >
                <MessageCircle className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        <div className="pt-8 text-center text-xs md:text-sm font-medium text-white/60 sm:text-left flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1.5">
            <p>© 2026 Sakthi Frozen Foods Traders. All rights reserved.</p>
            <p className="text-white/40">
              Developed by <a href="https://akwebflairtechnologies.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[#A9F2B7]/70 hover:text-[#A9F2B7] transition-colors underline underline-offset-2">akwebflairtechnologies</a>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActivePolicyModal('refund')} className="hover:text-white transition-colors">
              Refund Policy
            </button>
            <span className="text-white/30">•</span>
            <button onClick={() => setActivePolicyModal('terms')} className="hover:text-white transition-colors">
              Terms & Conditions
            </button>
            <span className="text-white/30">•</span>
            <button onClick={() => setActivePolicyModal('privacy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
          </div>
        </div>

      </div>

      {/* POPUP MODALS FOR LEGAL POLICIES */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-[#1E201D] rounded-xl max-w-xl w-full my-auto shadow-xl border border-[#4F534C]/20 max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#1E201D] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#8E9D64]" />
                <h3 className="font-extrabold text-base">
                  {activePolicyModal === 'refund' && 'Refund & Return Policy'}
                  {activePolicyModal === 'terms' && 'Terms & Conditions'}
                  {activePolicyModal === 'privacy' && 'Privacy Policy'}
                </h3>
              </div>
              <button
                onClick={() => setActivePolicyModal(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-4 text-xs sm:text-sm text-[#52574E] overflow-y-auto flex-1 leading-relaxed">
              
              {activePolicyModal === 'refund' && (
                <>
                  <p className="font-extrabold text-[#1E201D] text-base">Cold-Chain Freshness Guarantee & Refund Policy</p>
                  <p>At <strong>Sakthi Frozen Foods</strong>, all orders are packed in thermal insulated containers and dispatched at <strong>-18°C</strong> to preserve authentic juicy texture and quality.</p>
                  
                  <h4 className="font-bold text-[#1E201D] text-xs uppercase tracking-wider pt-2 border-t border-[#4F534C]/15">1. Eligible Conditions for Refunds & Replacements</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Package received in damaged condition or defrosted state due to transit delay.</li>
                    <li>Incorrect items or missing products delivered in your order.</li>
                    <li>Quality non-conformance reported within 24 hours of delivery.</li>
                  </ul>

                  <h4 className="font-bold text-[#1E201D] text-xs uppercase tracking-wider pt-2 border-t border-[#4F534C]/15">2. Refund Request Procedure</h4>
                  <p>To initiate a refund or replacement, please contact our support team via WhatsApp at <strong>+91 98765 43210</strong> or email <strong>orders@sakthifrozenfoods.com</strong> within 24 hours of delivery along with photos of the delivered package.</p>

                  <h4 className="font-bold text-[#1E201D] text-xs uppercase tracking-wider pt-2 border-t border-[#4F534C]/15">3. Processing Time</h4>
                  <p>Approved refunds are processed back to your original payment method within 3 to 5 business days.</p>
                </>
              )}

              {activePolicyModal === 'terms' && (
                <>
                  <p className="font-extrabold text-[#1E201D] text-base">Terms of Service & Ordering Guidelines</p>
                  
                  <h4 className="font-bold text-[#1E201D] text-xs uppercase tracking-wider pt-2 border-t border-[#4F534C]/15">1. Product Quality & Storage Instructions</h4>
                  <p>All products sold by Sakthi Frozen Foods are 100% plant-based, vegetarian, and cruelty-free. Customers must store products in a freezer at <strong>-18°C</strong> immediately upon receipt.</p>

                  <h4 className="font-bold text-[#1E201D] text-xs uppercase tracking-wider pt-2 border-t border-[#4F534C]/15">2. Orders & Dispatch</h4>
                  <p>Orders are dispatched through specialized cold-chain logistics partners. Delivery timings depend on pin-code serviceability and weather conditions.</p>

                  <h4 className="font-bold text-[#1E201D] text-xs uppercase tracking-wider pt-2 border-t border-[#4F534C]/15">3. Pricing & FSSAI Compliance</h4>
                  <p>All prices listed on the website are inclusive of applicable taxes. Sakthi Frozen Foods complies strictly with FSSAI hygiene standards and ISO 22000 quality guidelines.</p>
                </>
              )}

              {activePolicyModal === 'privacy' && (
                <>
                  <p className="font-extrabold text-[#1E201D] text-base">Privacy & Data Security Policy</p>
                  
                  <h4 className="font-bold text-[#1E201D] text-xs uppercase tracking-wider pt-2 border-t border-[#4F534C]/15">1. Information Collection</h4>
                  <p>We collect essential customer information such as name, shipping address, email address, and phone number solely for order fulfillment and delivery tracking.</p>

                  <h4 className="font-bold text-[#1E201D] text-xs uppercase tracking-wider pt-2 border-t border-[#4F534C]/15">2. Zero Third-Party Sharing</h4>
                  <p>Your personal data is encrypted and strictly protected. Sakthi Frozen Foods does not sell, rent, or trade customer information to any third-party marketing companies.</p>

                  <h4 className="font-bold text-[#1E201D] text-xs uppercase tracking-wider pt-2 border-t border-[#4F534C]/15">3. Secure Payments</h4>
                  <p>All online payment transactions are processed via secure SSL encrypted payment gateways. No credit card or banking credentials are stored on our servers.</p>
                </>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#E8EEE0] border-t border-[#4F534C]/15 flex items-center justify-between text-xs text-[#61665D]">
              <span className="font-bold text-[#4D583F] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Sakthi Frozen Foods Official Policy
              </span>
              <button
                onClick={() => setActivePolicyModal(null)}
                className="px-5 py-2 rounded-xl bg-[#1E201D] text-white font-bold text-xs hover:bg-[#4D583F] transition-colors shadow-sm"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      </footer>
    </div>
  );
}
