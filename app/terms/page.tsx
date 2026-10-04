'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  Snowflake,
  RefreshCw,
  Truck,
  Building2,
  Lock,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MAIN_SITE_URL } from '@/lib/config';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FBFDF8] text-[#1E201D] flex flex-col font-sans selection:bg-[#50563D] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO HEADER */}
        <section className="bg-gradient-to-b from-[#EBF2E4] via-[#F4F8F0] to-[#FBFDF8] py-10 sm:py-14 border-b border-[#50563D]/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#50563D]/10 text-[#50563D] text-xs font-bold mb-3">
              <FileText className="w-4 h-4 text-[#50563D]" />
              <span>Legal, Delivery & Storage Policies</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#22271D] tracking-tight font-display mb-3">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-[#52574E] max-w-xl mx-auto">
              Please review these terms governing your orders, -18°C cold-chain delivery, and storage obligations with Sakthi Frozen Foods Traders.
            </p>
            <p className="text-[11px] text-stone-500 mt-2 font-medium">Last updated: October 2026 • Effective for all D2C Orders</p>
          </div>
        </section>

        {/* MAIN TERMS CONTENT */}
        <section className="py-10 sm:py-14 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-10 text-xs sm:text-sm leading-relaxed text-stone-700">

            {/* Quick Table of Contents / Highlights */}
            <div className="bg-[#FAFBF7] rounded-2xl p-5 border border-stone-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#50563D] mb-3">
                Key Policy Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <a href="#storage" className="flex items-center gap-2 text-stone-700 hover:text-[#50563D] font-medium">
                  <Snowflake className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>Mandatory -18°C Freezer Storage</span>
                </a>
                <a href="#cancellation" className="flex items-center gap-2 text-stone-700 hover:text-[#50563D] font-medium">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>24-Hour Freshness Guarantee</span>
                </a>
                <a href="#shipping" className="flex items-center gap-2 text-stone-700 hover:text-[#50563D] font-medium">
                  <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Shipping &amp; Delivery Policy</span>
                </a>
                <a href="#privacy" className="flex items-center gap-2 text-stone-700 hover:text-[#50563D] font-medium">
                  <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>100% Secure &amp; Encrypted Payments</span>
                </a>
              </div>
            </div>

            {/* 1. Introduction & Operating Entity */}
            <div id="intro" className="space-y-3">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-gray-900 border-b border-stone-200 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#50563D] text-white text-xs flex items-center justify-center font-bold">1</span>
                <h2>Introduction & Operating Entity</h2>
              </div>
              <p>
                These Terms and Conditions govern your access to and purchase of products from the online store <strong>Sakthi Frozen Foods</strong> (accessible at <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] font-mono">buy.tnmockmeat.com</code>). 
                The platform is owned and operated by <strong>Sakthi Frozen Food Traders</strong>, having its main office and cold chain facility at <em>Peons Colony, Kalpana Theatre Opposite, Edayarpalayam - Koundampalayam Road, Kavundampalayam, Coimbatore, Tamil Nadu 641030</em>.
              </p>
              <p>
                By placing an order on this website, you agree to be bound by these terms, our storage guidelines, and privacy policy.
              </p>
            </div>

            {/* 2. Product Specifications & 100% Plant-Based Guarantee */}
            <div id="products" className="space-y-3">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-gray-900 border-b border-stone-200 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#50563D] text-white text-xs flex items-center justify-center font-bold">2</span>
                <h2>100% Plant-Based Guarantee & Food Safety</h2>
              </div>
              <p>
                All food products listed on this website—including mock mutton chukka, vegan chicken pieces, soya chaap, fish alternatives, veg seekh kebabs, and crispy snack items—are <strong>100% pure vegetarian</strong> and plant-based.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                <li>Products are crafted using high-grade soya protein, wheat gluten, pea isolate, and natural authentic spice blends.</li>
                <li>All products are manufactured and handled in compliance with the Food Safety and Standards Authority of India (<strong>FSSAI</strong>).</li>
                <li>All allergen information (e.g. Soya, Gluten) is explicitly indicated on individual product packaging.</li>
              </ul>
            </div>

            {/* 3. Mandatory Cold Storage Obligations */}
            <div id="storage" className="space-y-3">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-gray-900 border-b border-stone-200 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#50563D] text-white text-xs flex items-center justify-center font-bold">3</span>
                <h2>Mandatory -18°C Storage & Customer Handling</h2>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <p className="font-bold text-amber-900 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Crucial Cold Storage Instruction:
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  Because our products contain no artificial chemical preservatives, they <strong>must be stored in a deep freezer at -18°C or below immediately upon receipt</strong>. 
                  Sakthi Frozen Foods cannot accept liability for product deterioration if the customer leaves the products at ambient room temperature or regular non-freezer refrigeration.
                </p>
              </div>
            </div>

            {/* 4. Pricing, Billing & Online Payments */}
            <div id="pricing" className="space-y-3">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-gray-900 border-b border-stone-200 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#50563D] text-white text-xs flex items-center justify-center font-bold">4</span>
                <h2>Pricing, Billing & Payment Security</h2>
              </div>
              <p>
                All prices displayed on the website are in Indian Rupees (INR) and are inclusive of all applicable GST taxes.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                <li><strong>Strictly 100% Pre-Paid Online Orders Only:</strong> We accept online payments via UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, and all major Debit & Credit Cards.</li>
                <li><strong>No Cash on Delivery (COD):</strong> Due to the temperature-sensitive nature of frozen food requiring custom insulated cold-chain packaging and rapid logistics dispatch, Cash on Delivery (COD) is strictly NOT accepted.</li>
                <li>Online transactions are processed through 256-bit SSL encrypted and PCI-DSS compliant payment gateways (Razorpay). We never store your payment card numbers or UPI PINs on our servers.</li>
                <li>Promotional discount coupon codes are subject to specific cart value criteria and validity periods.</li>
              </ul>
            </div>

            {/* 5. Cold-Chain Delivery & Timelines */}
            <div id="delivery" className="space-y-3">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-gray-900 border-b border-stone-200 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#50563D] text-white text-xs flex items-center justify-center font-bold">5</span>
                <h2>Cold-Chain Delivery & Timelines</h2>
              </div>
              <p>
                Orders are packed in specialized insulated thermal packaging with dry ice / reusable cold gel packs to maintain sub-zero temperatures throughout the transit period.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                <li><strong>Coimbatore City:</strong> Same-day or scheduled next-day delivery slots.</li>
                <li><strong>Tamil Nadu Regional Districts:</strong> Dispatched via priority express temperature-controlled logistics within 24 to 48 hours.</li>
                <li>The customer is responsible for providing accurate address details, contact numbers, and landmarks to ensure timely delivery handoff.</li>
              </ul>
            </div>

            {/* 6. Shipping Policy */}
            <div id="shipping" className="space-y-3">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-gray-900 border-b border-stone-200 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#50563D] text-white text-xs flex items-center justify-center font-bold">6</span>
                <h2>Shipping &amp; Delivery Policy</h2>
              </div>
              <p>
                All orders from Sakthi Frozen Foods are shipped using temperature-controlled cold-chain logistics to preserve product quality at <strong>-18°C</strong> throughout transit.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <p className="font-bold text-amber-900 text-xs uppercase tracking-wider">Delivery Areas &amp; Timelines</p>
                <ul className="list-disc pl-5 space-y-2 text-stone-700">
                  <li><strong>Coimbatore City &amp; Suburbs (within 25 km):</strong> Same-day or next-business-day delivery. Delivery fee calculated at ₹10/km (minimum ₹40).</li>
                  <li><strong>Tamil Nadu — Key Districts</strong> (Salem, Erode, Tiruppur, Madurai, Chennai, Trichy, etc.): Dispatched via priority express cold-chain courier within <strong>24–48 hours</strong> of order confirmation. Fixed delivery rates apply per destination.</li>
                  <li><strong>Other States:</strong> Currently not serviceable. We ship exclusively within Tamil Nadu and selected districts.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p><strong>Order Processing:</strong> Orders placed before 12:00 PM are processed on the same business day. Orders placed after 12:00 PM are processed the next business day (Monday–Saturday).</p>
                <p><strong>Packaging:</strong> All shipments are packed in insulated thermal boxes with food-grade gel ice packs to maintain sub-zero temperatures during transit.</p>
                <p><strong>Tracking:</strong> Once dispatched, you will receive an order confirmation and delivery update via SMS/WhatsApp on your registered mobile number.</p>
                <p><strong>Failed Delivery:</strong> If a delivery attempt fails due to an incorrect address or recipient unavailability, we will attempt re-delivery once. After two failed attempts, the order may be cancelled and a partial refund issued after deducting logistics costs.</p>
                <p><strong>Shipping Charges:</strong> Displayed transparently at checkout before payment. No hidden charges.</p>
              </div>

              <p className="text-xs text-stone-500 italic">
                For delivery queries, contact us on WhatsApp: <a href="https://wa.me/918056389214" className="text-[#50563D] font-bold underline">+91 80563 89214</a>
              </p>
            </div>

            {/* 7. Cancellation, Return & Refund Policy */}
            <div id="cancellation" className="space-y-3">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-gray-900 border-b border-stone-200 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#50563D] text-white text-xs flex items-center justify-center font-bold">7</span>
                <h2>Cancellation, Return &amp; Refund Policy</h2>
              </div>
              <p>
                Due to the perishable and temperature-sensitive nature of frozen food products, standard non-food return policies do not apply.
              </p>
              <div className="space-y-2 text-stone-700">
                <p><strong>Cancellations:</strong> You may cancel an order before it has been dispatched from our cold storage by contacting our WhatsApp support at <a href="https://wa.me/918056389214" className="text-[#50563D] font-bold underline">+91 80563 89214</a>.</p>
                <p><strong>Freshness & Replacement Guarantee:</strong> If your delivery arrives in a defrosted condition, damaged packaging, or if items are missing/incorrect, please notify us within <strong>24 hours of delivery</strong> with photographs of the received package.</p>
                <p><strong>Refund Timeline:</strong> Once verified, refunds are issued back to the original source account within 3 to 5 business days, or a fresh replacement package is dispatched immediately at zero additional shipping cost.</p>
              </div>
            </div>

            {/* 8. Corporate & Wholesale Linkage */}
            <div id="corporate" className="space-y-3">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-gray-900 border-b border-stone-200 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#50563D] text-white text-xs flex items-center justify-center font-bold">8</span>
                <h2>Wholesale & B2B Institutional Supply</h2>
              </div>
              <p>
                Bulk supply contracts, hotel & catering distribution, private labeling, and commercial cold storage rentals are governed under separate B2B enterprise agreements. For wholesale requirements (50kg+), please visit our Corporate Portal at <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer" className="text-[#50563D] font-bold underline inline-flex items-center gap-1">tnmockmeat.com <ExternalLink className="w-3 h-3" /></a>.
              </p>
            </div>

            {/* 9. Privacy & Data Protection */}
            <div id="privacy" className="space-y-3">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-gray-900 border-b border-stone-200 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#50563D] text-white text-xs flex items-center justify-center font-bold">9</span>
                <h2>Privacy & Data Protection</h2>
              </div>
              <p>
                We value your privacy. Customer information (name, address, telephone number, email) is collected exclusively for processing your order, coordinating delivery, and sending transactional notifications. We strictly do not sell, trade, or share your personal data with third-party marketing networks.
              </p>
            </div>

            {/* 10. Grievance & Customer Care Contact */}
            <div id="contact" className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-2 text-base sm:text-lg font-black text-gray-900 border-b border-stone-200 pb-2">
                <span className="w-6 h-6 rounded-full bg-[#50563D] text-white text-xs flex items-center justify-center font-bold">10</span>
                <h2>Customer Care & Grievance Redressal</h2>
              </div>
              <p>
                If you have any questions, concerns, or feedback regarding your order or these terms, please contact our support team:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAFBF7] border border-stone-200 space-y-2">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp & Phone Support:
                  </p>
                  <p className="text-xs text-stone-600">
                    Mobile: <a href="tel:+918056389214" className="text-[#50563D] font-bold hover:underline">+91 80563 89214</a><br />
                    Office: <a href="tel:+919042539214" className="text-stone-700 font-semibold hover:underline">+91 90425 39214</a>
                  </p>
                  <a
                    href="https://wa.me/918056389214"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:underline pt-1"
                  >
                    <span>Chat on WhatsApp</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFBF7] border border-stone-200 space-y-2">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#50563D]" /> Email & Physical Address:
                  </p>
                  <p className="text-xs text-stone-600">
                    Email: <a href="mailto:sakthifrozenfoods@gmail.com" className="text-[#50563D] font-bold hover:underline">sakthifrozenfoods@gmail.com</a><br />
                    Address: Kalpana Theatre Opp, Kavundampalayam, Coimbatore, TN 641030
                  </p>
                  <Link
                    href="/help"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#50563D] hover:underline pt-1"
                  >
                    <span>Visit Help Desk</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
