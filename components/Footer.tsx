'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ShieldCheck, FileText, RefreshCw, Lock, MessageCircle, X } from 'lucide-react';
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
    <footer className="relative z-20 bg-[#656b4f] text-[#FAFAF5] pt-12 pb-24 md:pb-8">
      <div className="site-shell relative">
        <div className="grid grid-cols-1 gap-9 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.95fr_1.15fr]">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-16 h-10 sm:w-20 sm:h-12 flex items-center justify-center">
                <Image src={logo} alt="Sakthi Frozen Foods" fill sizes="(max-width: 768px) 100vw, 200px" className="object-contain object-left" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white block leading-none font-display">
                  MOCK MEAT & FROZEN FOODS
                </span>
                <span className="text-[11px] font-bold tracking-wide text-[#F2F4E9] uppercase block mt-1">
                  SAKTHI FROZEN FOODS TRADERS
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-6 text-[#F1F3EA]">
              Premium plant-based frozen foods made for everyday cooking and authentic flavour.
            </p>

            <div className="inline-flex items-center gap-2 rounded-lg border border-[#D8F4C7]/45 bg-[#42644A]/45 px-3 py-2 text-sm text-[#F4F9ED] font-bold">
              <ShieldCheck className="w-5 h-5 text-[#A9F2B7]" />
              <span>FSSAI Certified • ISO 22000 Certified</span>
            </div>
          </div>

          {/* Column 2: Product Categories (Dynamic Backend Only) */}
          <div>
            <h4 className="text-xs font-black text-[#EEF1D5] uppercase tracking-[0.14em] mb-4">
              Product Categories
            </h4>
            <ul className="space-y-3 text-sm text-[#F4F6EF]">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id || cat.name}>
                    <Link href={`/shop?category=${encodeURIComponent(cat.name)}`} className="hover:text-white transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E9F2D3]" />
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
            <h4 className="text-xs font-black text-[#EEF1D5] uppercase tracking-[0.14em] mb-4">
              Store & Policies
            </h4>
            <ul className="space-y-3 text-sm text-[#F4F6EF]">
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
                  className="hover:text-white text-left transition-colors flex items-center gap-1.5 text-[#91F0B1] font-semibold"
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
                  <FileText className="w-3.5 h-3.5 text-[#E8F1D2]" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('privacy')}
                  className="hover:text-white text-left transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#E8F1D2]" />
                  <span>Privacy Policy</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & WhatsApp Support */}
          <div>
            <h4 className="text-xs font-black text-[#EEF1D5] uppercase tracking-[0.14em] mb-4">
              Contact & Support
            </h4>
            <ul className="space-y-3.5 text-sm leading-6 text-[#F4F6EF]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E8F1D2] shrink-0 mt-0.5" />
                <span>Sakthi Frozen Foods Industrial Park, Guindy, Chennai - 600032</span>
              </li>
              <li>
                <a href="tel:+919876543210" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                  <Phone className="w-4 h-4 shrink-0 text-[#E8F1D2]" />
                  <span>+91 98765 43210 / 044-24567890</span>
                </a>
              </li>
              <li>
                <a href="mailto:orders@sakthifrozenfoods.com" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                  <Mail className="w-4 h-4 shrink-0 text-[#E8F1D2]" />
                  <span>orders@sakthifrozenfoods.com</span>
                </a>
              </li>
            </ul>

            <div className="mt-5 border-t border-white/15 pt-4">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with Sakthi Frozen Foods on WhatsApp"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#244a38] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1b3b2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <MessageCircle className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        <div className="pt-6 text-center text-xs font-medium text-[#F0F3E9] sm:text-left">
          <p>© 2026 Sakthi Frozen Foods Traders. All rights reserved.</p>

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
  );
}
