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
    <div className="pt-5 sm:pt-7">
      <footer className="relative z-20 bg-[#656B4F] text-[#FAFAF5] pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6 rounded-t-[1.25rem] sm:rounded-t-[1.75rem] lg:rounded-t-[2.5rem] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.12)]">
        
        {/* Quiet decorative SVG accents */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute -right-8 top-8 h-36 w-36 text-white/[0.045] sm:right-[8%] sm:top-10 sm:h-48 sm:w-48" viewBox="0 0 160 160" fill="none">
            <path d="M20 112C44 94 57 68 60 30C95 49 121 72 126 103C130 127 111 143 87 141C61 139 39 123 20 112Z" fill="currentColor" />
            <path d="M28 126C58 100 79 79 113 51" stroke="#656B4F" strokeWidth="3" strokeLinecap="round" />
            <path d="M61 98L54 69M80 81L77 55M97 67L96 48" stroke="#656B4F" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <svg className="absolute -bottom-10 left-[18%] h-28 w-28 text-white/[0.035] sm:left-[38%] sm:h-36 sm:w-36" viewBox="0 0 120 120" fill="none">
            <path d="M60 15C72 31 93 39 93 64C93 84 78 100 59 100C39 100 25 85 25 66C25 46 42 34 60 15Z" fill="currentColor" />
            <path d="M59 40V83M59 61L43 51M59 70L75 57" stroke="#656B4F" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto w-[calc(100%-1.5rem)] max-w-[1500px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-b border-white/20 pb-5 sm:gap-x-7 sm:gap-y-7 sm:pb-7 lg:grid-cols-4 lg:gap-x-6">
          
          {/* Column 1: Brand Info */}
          <div className="col-span-2 space-y-2.5 sm:space-y-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-14 h-10 sm:w-20 sm:h-14 shrink-0 flex items-center justify-center">
                <Image src={logo} alt="Sakthi Frozen Foods" fill sizes="(max-width: 768px) 100vw, 200px" className="object-contain object-left" />
              </div>
              <div>
                <span className="text-sm sm:text-lg font-extrabold tracking-tight text-white block leading-tight font-display">
                  MOCK MEAT & FROZEN FOODS
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold tracking-wider text-white uppercase block mt-0.5">
                  SAKTHI FROZEN FOODS TRADERS
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-[11px] sm:text-sm leading-relaxed text-white/90">
              Premium plant-based frozen foods made for everyday cooking and authentic flavour.
            </p>

            <div className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-2.5 py-1.5 text-[10px] sm:text-xs text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-[#A9F2B7]" />
              <span>FSSAI & ISO 22000 Certified</span>
            </div>
          </div>

          {/* Column 2: Product Categories (Dynamic Backend Only) */}
          <div>
            <h4 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.1em] mb-2">
              Product Categories
            </h4>
            <ul className="space-y-1.5 text-[10px] leading-snug sm:space-y-2 sm:text-[13px] text-white font-medium">
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
                <li className="text-white/70 italic text-xs">Browse our product catalog for all categories.</li>
              )}
            </ul>
          </div>

          {/* Column 3: Quick Links & Legal Policies */}
          <div>
            <h4 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.1em] mb-2">
              Store & Policies
            </h4>
            <ul className="space-y-1.5 text-[10px] leading-snug sm:space-y-2 sm:text-[13px] text-white font-medium">
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

          {/* Column 4: Contact & Store Location with Google Map */}
          <div className="col-span-2 space-y-3 lg:col-span-1">
            <div>
              <h4 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.1em] mb-2">
                Store Location & Contact
              </h4>
              <ul className="grid grid-cols-1 gap-2 text-[10px] leading-snug sm:text-xs lg:text-[13px] text-white font-medium">
                <li className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-white/10 rounded-lg mt-0.5 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-[#A9F2B7]" />
                  </div>
                  <a
                    href="https://maps.google.com/?q=Sakthi+Frozen+Food+Traders+Tank+Road+Puens+colony+Koundampalayam+Coimbatore+Tamil+Nadu+641030"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-white transition-colors"
                  >
                    Tank Road, Puens colony, Koundampalayam, Coimbatore, Tamil Nadu 641030
                  </a>
                </li>
                <li>
                  <a href="tel:+919876543210" className="inline-flex items-center gap-2.5 transition-colors hover:text-white group">
                    <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors shrink-0">
                      <Phone className="w-3.5 h-3.5 text-[#A9F2B7]" />
                    </div>
                    <span>+91 98765 43210 / 0422-2456789</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:orders@sakthifrozenfoods.com" className="inline-flex items-center gap-2.5 transition-colors hover:text-white group">
                    <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors shrink-0">
                      <Mail className="w-3.5 h-3.5 text-[#A9F2B7]" />
                    </div>
                    <span>orders@sakthifrozenfoods.com</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Embedded Google Map Preview */}
            <div className="rounded-xl overflow-hidden border border-white/20 shadow-md bg-white/5 h-[120px] w-full relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125310.08213131265!2d76.81346682338442!3d11.0431204487083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8590cc15b53eb%3A0x46fec529d6a8bb00!2sSakthi%20Frozen%20Food%20Traders!5e0!3m2!1sen!2sin!4v1790868798009!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Sakthi Frozen Food Traders Location Map"
                className="w-full h-full"
              />
            </div>

            <div>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with Sakthi Frozen Foods on WhatsApp"
                className="inline-flex min-h-8 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

        <div className="pt-4 text-center text-[9px] sm:text-xs font-medium text-white/85 sm:text-left flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-col items-center sm:items-start gap-0.5">
            <p>© 2026 Sakthi Frozen Foods Traders. All rights reserved.</p>
            <p className="text-white/70">
              Developed by <a href="https://akwebflairtechnologies.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[#A9F2B7]/70 hover:text-[#A9F2B7] transition-colors underline underline-offset-2">akwebflairtechnologies</a>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <button onClick={() => setActivePolicyModal('refund')} className="hover:text-white transition-colors">
              Refund Policy
            </button>
            <span className="text-white/55">•</span>
            <button onClick={() => setActivePolicyModal('terms')} className="hover:text-white transition-colors">
              Terms & Conditions
            </button>
            <span className="text-white/55">•</span>
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
              <span className="font-bold text-[#656B4F] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#656B4F]" /> Sakthi Frozen Foods Official Policy
              </span>
              <button
                onClick={() => setActivePolicyModal(null)}
                className="px-5 py-2 rounded-xl bg-[#1E201D] text-white font-bold text-xs hover:bg-[#656B4F] transition-colors shadow-sm"
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
