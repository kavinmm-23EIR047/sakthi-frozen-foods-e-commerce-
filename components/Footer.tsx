'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, Heart, FileText, RefreshCw, Lock, X } from 'lucide-react';
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
    <footer className="relative z-20 overflow-hidden bg-[#182117] text-[#FAFAF5] pt-12 pb-24 md:pb-10">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-[#8E9D64]/15 blur-3xl pointer-events-none" />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Main 4-Column Content Grid */}
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_.8fr_.9fr_1.15fr]">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-16 h-10 sm:w-20 sm:h-12 flex items-center justify-center">
                <Image src={logo} alt="Sakthi Frozen Foods" fill className="object-contain object-left" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white block leading-none font-display">
                  MOCK MEAT & FROZEN FOODS
                </span>
                <span className="text-xs font-semibold tracking-widest text-[#E8EEE0] uppercase block mt-1">
                  SAKTHI FROZEN FOODS TRADERS
                </span>
              </div>
            </Link>

            <p className="text-[15px] text-[#CFD7C7] leading-7">
              India's premier manufacturer of 100% plant-based, cruelty-free vegan meats. Authentic juicy texture, deep spice absorption, and zero compromise on taste.
            </p>

            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-sm text-[#D6E9C5] font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>FSSAI Certified • ISO 22000 Certified</span>
            </div>
          </div>

          {/* Column 2: Product Categories (Dynamic Backend Only) */}
          <div>
            <h4 className="text-sm font-black text-[#BDCAA9] uppercase tracking-[0.14em] mb-5">
              Product Categories
            </h4>
            <ul className="space-y-3 text-[15px] text-[#D9E0D2]">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id || cat.name}>
                    <Link href={`/shop?category=${encodeURIComponent(cat.name)}`} className="hover:text-white transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#BDCAA9]" />
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-[#E8EEE0]/50 italic text-sm">Loading categories...</li>
              )}
            </ul>
          </div>

          {/* Column 3: Quick Links & Legal Policies */}
          <div>
            <h4 className="text-sm font-black text-[#BDCAA9] uppercase tracking-[0.14em] mb-5">
              Legal & Support Policies
            </h4>
            <ul className="space-y-3 text-[15px] text-[#D9E0D2]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Storefront Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('refund')}
                  className="hover:text-white text-left transition-colors flex items-center gap-1.5 text-emerald-400 font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refund & Return Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('terms')}
                  className="hover:text-white text-left transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#8E9D64]" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('privacy')}
                  className="hover:text-white text-left transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#8E9D64]" />
                  <span>Privacy Policy</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & WhatsApp Support */}
          <div>
            <h4 className="text-sm font-black text-[#BDCAA9] uppercase tracking-[0.14em] mb-5">
              Contact & Support
            </h4>
            <ul className="space-y-3.5 text-[15px] leading-6 text-[#D9E0D2]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#8E9D64] shrink-0 mt-0.5" />
                <span>Sakthi Frozen Foods Industrial Park, Guindy, Chennai - 600032</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#8E9D64] shrink-0" />
                <span>+91 98765 43210 / 044-24567890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#8E9D64] shrink-0" />
                <span>orders@sakthifrozenfoods.com</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-[#4F534C]/20">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] font-bold text-sm hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp Support</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal Links Bar */}
        <div className="pt-7 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#BFC9B7] font-medium">
          <p>
            &copy; {new Date().getFullYear()} Sakthi Frozen Foods Traders. All rights reserved. 
            <span className="block sm:inline sm:ml-1 mt-1 sm:mt-0 text-white font-bold">100% Plant-Based Meat & Vegan Options</span>
          </p>

          <div className="hidden">
            <button onClick={() => setActivePolicyModal('refund')} className="hover:text-white transition-colors">
              Refund Policy
            </button>
            <span>•</span>
            <button onClick={() => setActivePolicyModal('terms')} className="hover:text-white transition-colors">
              Terms & Conditions
            </button>
            <span>•</span>
            <button onClick={() => setActivePolicyModal('privacy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
          </div>

          <p className="flex items-center gap-1 text-sm">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for healthy plant-based living.
          </p>
        </div>

      </div>

      {/* POPUP MODALS FOR LEGAL POLICIES */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-[#1E201D] rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-[#4F534C]/20 max-h-[90vh] flex flex-col overflow-hidden">
            
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
  );
}
