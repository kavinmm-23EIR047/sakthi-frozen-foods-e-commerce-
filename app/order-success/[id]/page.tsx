'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { fetchApi } from '@/lib/apiConfig';
import { OrderType } from '@/lib/types';
import {
  CheckCircle2,
  Package,
  Clock,
  Truck,
  FileText,
  MessageCircle,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Copy,
  ChevronRight,
  AlertCircle,
  Loader2,
  Printer,
  MapPin,
  Phone,
  User,
  Check,
  Snowflake,
  ExternalLink,
} from 'lucide-react';
import { printCommercialBill } from '@/lib/printUtils';
import OptimizedImage from '@/components/OptimizedImage';

const WHATSAPP_PHONE = '918056389214';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { clearCart } = useCart();

  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const cartClearedRef = useRef(false);

  // Clear cart and pending payment session flags on landing
  useEffect(() => {
    if (!cartClearedRef.current && typeof window !== 'undefined') {
      cartClearedRef.current = true;
      try {
        localStorage.removeItem('sakthi_pending_payment');
        localStorage.setItem('sakthi_cart', JSON.stringify([]));
        sessionStorage.removeItem('active_checkout_rzp_order_id');
        sessionStorage.removeItem('active_checkout_order_id');
      } catch (e) {
        console.error('Failed clearing storage session', e);
      }
      clearCart();
    }
  }, [clearCart]);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetchApi<OrderType>(`/orders/${orderId}`);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.error || 'Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order confirmation details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPaid = order?.paymentStatus === 'Paid' || order?.status === 'Confirmed';

  return (
    <div className="min-h-screen bg-[#F3FBEE] text-[#1E201D] flex flex-col font-sans selection:bg-[#656B4F] selection:text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-[960px] px-3 sm:px-6 py-6 sm:py-10 flex-1">
        <div className="space-y-6">

          {/* Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#50563D] hover:text-[#1E201D] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to All Orders</span>
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#50563D] hover:underline"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#4F534C]/15 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 border-4 border-[#656B4F] border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-base font-black text-[#1A1E16]">Finalizing Your Order Confirmation...</h3>
              <p className="text-xs font-semibold text-[#61665D]">Retrieving verified payment receipt from server</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-red-200 shadow-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-[#1E201D]">Unable to Retrieve Order</h2>
              <p className="text-xs sm:text-sm text-[#61665D] max-w-md mx-auto">{error}</p>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#656B4F] text-white text-xs font-black shadow-md hover:bg-[#50563D] transition-all"
                >
                  View My Orders
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EAF0E5] text-[#50563D] text-xs font-black hover:bg-[#DDE8D6] transition-all border border-[#656B4F]/20"
                >
                  Return to Shop
                </Link>
              </div>
            </div>
          )}

          {/* Success Hero Card with Animated Tick */}
          {!loading && order && (
            <div className="bg-white rounded-3xl border border-[#4F534C]/15 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-400">
              
              {/* Header Hero Banner with Animated Tick */}
              <div className="relative overflow-hidden bg-gradient-to-b from-[#EAF0E5] via-[#F3FBEE] to-white px-6 py-8 sm:py-10 text-center border-b border-[#4F534C]/10">
                
                {/* Decorative Sparkle Icons */}
                <div className="absolute top-6 left-8 text-[#656B4F]/30 animate-sparkle hidden sm:block">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="absolute top-10 right-10 text-[#656B4F]/30 animate-sparkle delay-700 hidden sm:block">
                  <Sparkles className="w-5 h-5" />
                </div>

                {/* ANIMATED TICK SYMBOL */}
                <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
                  {/* Outer Pulsing Glow */}
                  <div className="absolute inset-0 rounded-full bg-[#656B4F]/15 animate-glow-ring" />

                  {/* SVG Animated Tick */}
                  <div className="relative w-20 h-20 rounded-full bg-[#656B4F] flex items-center justify-center shadow-lg shadow-[#656B4F]/30 animate-checkmark-pop">
                    <svg
                      className="w-12 h-12 text-white drop-shadow-sm"
                      viewBox="0 0 52 52"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="26"
                        cy="26"
                        r="23"
                        stroke="rgba(255, 255, 255, 0.35)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="animate-checkmark-circle"
                      />
                      <path
                        d="M15 27L22.5 34.5L37 19"
                        stroke="#FAFAF5"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-checkmark-check"
                      />
                    </svg>
                  </div>
                </div>

                {/* Title & Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#656B4F] text-white shadow-xs mb-3 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Payment Verified & Confirmed</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-[#1A1E16] font-poppins tracking-tight">
                  Thank You for Your Order!
                </h1>

                <p className="mt-2 text-xs sm:text-sm text-[#4A5043] font-semibold max-w-lg mx-auto leading-relaxed">
                  Your order has been successfully placed with Sakthi Frozen Foods. Our dispatch team is packing your cold-chain products under strict -18°C temperature control.
                </p>

                {/* Quick Info Bar */}
                <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 bg-white/90 backdrop-blur-xs px-5 py-3 rounded-2xl border border-[#4F534C]/15 shadow-xs text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#61665D] font-bold">Order ID:</span>
                    <button
                      type="button"
                      onClick={copyOrderNumber}
                      className="font-mono font-black text-[#1A1E16] hover:text-[#50563D] flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#EAF0E5] border border-[#656B4F]/20 cursor-pointer transition-all active:scale-95"
                      title="Click to copy Order ID"
                    >
                      <span>{order.orderNumber}</span>
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#656B4F]" />
                      )}
                    </button>
                    {copied && <span className="text-[11px] font-black text-emerald-700">Copied!</span>}
                  </div>

                  <span className="hidden sm:inline text-stone-300">•</span>

                  <div className="flex items-center gap-1.5 text-[#61665D]">
                    <Clock className="w-3.5 h-3.5 text-[#656B4F]" />
                    <span className="font-semibold">
                      {new Date(order.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span className="hidden sm:inline text-stone-300">•</span>

                  <div className="flex items-center gap-1.5">
                    <Snowflake className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-extrabold text-sky-900">-18°C Cold Chain Protected</span>
                  </div>
                </div>

              </div>

              {/* Order Content Details */}
              <div className="p-5 sm:p-8 space-y-6">

                {/* Ordered Items List */}
                <div className="space-y-3">
                  <h2 className="text-xs font-black text-[#1E201D] uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#656B4F]" />
                    <span>Items in this Order ({order.items.length})</span>
                  </h2>

                  <div className="rounded-2xl border border-[#4F534C]/15 overflow-hidden divide-y divide-stone-100 bg-[#FAFAF5]/50">
                    {order.items.map((item, idx) => (
                      <div
                        key={`${item.productId}-${item.weight}-${idx}`}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-stone-200/80 shadow-2xs">
                            {item.image ? (
                              <OptimizedImage
                                src={item.image}
                                alt={item.name}
                                width={56}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-50">
                                <Package className="w-6 h-6 text-[#656B4F]" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs sm:text-sm font-extrabold text-[#1A1E16] truncate">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#52594B]">
                              <span className="font-bold bg-[#EAF0E5] text-[#50563D] px-2 py-0.5 rounded-md text-[10px]">
                                {item.weight}
                              </span>
                              <span className="font-semibold">Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-black text-[#1A1E16]">
                            ₹{item.price * item.quantity}
                          </div>
                          <div className="text-[10px] text-[#61665D] font-medium">
                            ₹{item.price} each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info & Price Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* Delivery Address Card */}
                  <div className="rounded-2xl border border-[#4F534C]/15 p-4 sm:p-5 bg-white space-y-3">
                    <h3 className="text-xs font-black text-[#1E201D] uppercase tracking-wider flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#656B4F]" />
                      <span>Delivery Information</span>
                    </h3>

                    <div className="space-y-2 text-xs text-[#3E4536]">
                      <div className="flex items-start gap-2">
                        <User className="w-3.5 h-3.5 text-[#656B4F] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#1A1E16] block">{order.customerName}</span>
                          <span className="text-stone-500 font-medium">{order.customerEmail}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#656B4F] shrink-0" />
                        <span className="font-extrabold text-[#1A1E16]">{order.customerPhone}</span>
                      </div>

                      <div className="flex items-start gap-2 pt-1 border-t border-stone-100">
                        <MapPin className="w-3.5 h-3.5 text-[#656B4F] shrink-0 mt-0.5" />
                        <div className="leading-relaxed font-semibold text-[#1A1E16]">
                          {order.shippingAddress}
                          {order.landmark && (
                            <span className="block text-stone-500 text-[11px] mt-0.5">
                              Landmark: {order.landmark}
                            </span>
                          )}
                          {(order.city || order.pincode) && (
                            <span className="block text-[#50563D] font-bold text-[11px] mt-0.5">
                              {order.city} {order.pincode ? `- ${order.pincode}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {order.deliveryMode && (
                        <div className="pt-1">
                          <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#EAF0E5] text-[#50563D] border border-[#656B4F]/20">
                            Express Logistics: {order.deliveryMode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Breakdown Card */}
                  <div className="rounded-2xl border border-[#4F534C]/15 p-4 sm:p-5 bg-white space-y-3">
                    <h3 className="text-xs font-black text-[#1E201D] uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#656B4F]" />
                      <span>Payment Summary</span>
                    </h3>

                    <div className="space-y-2 text-xs font-medium text-[#4A5043]">
                      <div className="flex justify-between">
                        <span>Items Subtotal:</span>
                        <span className="font-bold text-[#1A1E16]">
                          ₹{order.subtotal ?? (order.totalAmount - (order.deliveryFee || 0) - (order.convenienceFee || 0))}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Cold-Chain Express Delivery:</span>
                        <span className="font-bold text-[#1A1E16]">
                          {(order.deliveryFee || 0) === 0 ? (
                            <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                              FREE
                            </span>
                          ) : (
                            `₹${order.deliveryFee}`
                          )}
                        </span>
                      </div>

                      {Boolean(order.convenienceFee) && (
                        <div className="flex justify-between">
                          <span>Gateway Convenience Fee (2.5%):</span>
                          <span className="font-bold text-[#1A1E16]">₹{order.convenienceFee}</span>
                        </div>
                      )}

                      <div className="flex justify-between pt-1 border-t border-stone-100 text-stone-500">
                        <span>Payment Method:</span>
                        <span className="font-bold text-[#50563D]">{order.paymentMethod}</span>
                      </div>

                      <div className="pt-2 border-t border-[#4F534C]/20 flex justify-between items-baseline">
                        <span className="text-sm font-black text-[#1A1E16]">Total Amount Paid:</span>
                        <span className="text-xl font-black text-[#50563D]">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Action Center Buttons */}
                <div className="pt-4 border-t border-[#4F534C]/15 flex flex-wrap items-center justify-between gap-3">
                  {/* WhatsApp Support Link */}
                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                      `Hello Sakthi Frozen Foods, I placed order #${order.orderNumber} for ₹${order.totalAmount}. Please share my dispatch update.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] font-extrabold text-xs transition-colors cursor-pointer border border-[#25D366]/30"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp Order Support</span>
                  </a>

                  {/* Operational & Nav Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Print Slip Button */}
                    <button
                      type="button"
                      onClick={() => printCommercialBill(order)}
                      className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white hover:bg-[#EAF0E5] border border-[#656B4F]/30 font-bold text-xs text-[#1E201D] transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Print Commercial Invoice Slip"
                    >
                      <Printer className="w-4 h-4 text-[#656B4F]" />
                      <span>Print Receipt</span>
                    </button>

                    {/* Download PDF Invoice */}
                    <a
                      href={`/api/orders/${order.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 font-bold text-xs text-[#1E201D] transition-colors"
                    >
                      <FileText className="w-4 h-4 text-[#50563D]" />
                      <span>Download PDF</span>
                    </a>

                    {/* View My Orders */}
                    <Link
                      href="/orders"
                      className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white font-black text-xs transition-all shadow-md active:scale-95"
                    >
                      <span>Track & View Orders</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
