'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { fetchApi, fetchCachedApi, getCachedData, setCachedData, invalidateCache } from '@/lib/apiConfig';
import { useRouter } from 'next/navigation';
import { OrderType } from '@/lib/types';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Lock,
  FileText,
  Copy,
  MessageCircle,
  Loader2,
  Printer,
  UserRound,
  Mail,
  Phone,
  MapPin,
  LogOut,
  ShieldCheck,
  Bell,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Store,
  Heart,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import NotificationManager from '@/components/NotificationManager';
import { printCommercialBill } from '@/lib/printUtils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const WHATSAPP_PHONE = '918056389214';

export default function OrdersAndAccountPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const { clearCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'notifications'>('orders');
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Live 1-second clock for 30-minute grace period timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = async (silent = false, bypassCache = false) => {
    if (!silent && orders.length === 0) setLoading(true);
    try {
      const data = await fetchCachedApi<OrderType[]>('/orders/mine', {
        cacheKey: 'user_orders_cache',
        ttlMs: 30000,
        bypassCache: bypassCache || !silent,
      });
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else if (!data.success) {
        setError(data.error || 'Failed to load orders.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const cached = getCachedData<OrderType[]>('user_orders_cache');
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setOrders(cached);
      setLoading(false);
    }
    fetchOrders(Boolean(cached && cached.length > 0));
  }, [user]);

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    const data = await fetchApi<any>(`/orders/${orderId}/cancel`, { method: 'POST' });
    if (data.success) {
      invalidateCache('user_orders_cache');
      setOrders((current) => current.map((order) => (order.id === orderId ? data.data : order)));
    } else {
      setError(data.error || 'Unable to cancel order.');
    }
    setCancellingId(null);
  };

  // Launch Razorpay Payment for Pending Order within 30 mins
  const handleRetryPayment = async (order: OrderType) => {
    if (typeof window.Razorpay === 'undefined') {
      alert('Payment system is loading. Please try again in a few seconds.');
      return;
    }

    setRetryingOrderId(order.id);
    setError('');

    try {
      const retryRes = await fetchApi<any>(`/orders/${order.id}/retry-payment`, {
        method: 'POST',
      });

      if (!retryRes.success) {
        alert(retryRes.error || 'Payment retry window expired.');
        fetchOrders(true, true);
        setRetryingOrderId(null);
        return;
      }

      if (retryRes.alreadyPaid) {
        invalidateCache('user_orders_cache');
        clearCart();
        const confirmedOrder = retryRes.data || order;
        const confirmedId = confirmedOrder?.id || confirmedOrder?._id || order.id;
        if (confirmedOrder) {
          const keys = [confirmedId, confirmedOrder._id, confirmedOrder.id, confirmedOrder.orderNumber, order.id, order._id, order.orderNumber].filter(Boolean);
          keys.forEach((k: string) => {
            setCachedData('order_detail_' + k, confirmedOrder);
            try {
              sessionStorage.setItem('order_cache_' + k, JSON.stringify(confirmedOrder));
              localStorage.setItem('order_cache_' + k, JSON.stringify(confirmedOrder));
            } catch (e) {}
          });
          try {
            sessionStorage.setItem('latest_completed_order', JSON.stringify(confirmedOrder));
            localStorage.setItem('latest_completed_order', JSON.stringify(confirmedOrder));
          } catch (e) {}
        }
        router.replace(`/order-success/${confirmedId}`);
        return;
      }

      const { razorpayOrderId, razorpayAmount, razorpayKeyId } = retryRes;

      const options = {
        key: razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: razorpayAmount,
        currency: 'INR',
        name: 'Sakthi Frozen Foods',
        description: `Payment for Order #${order.orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: order.customerName,
          email: order.customerEmail,
          contact: order.customerPhone,
        },
        theme: {
          color: '#656B4F',
        },
        handler: async function (response: any) {
          try {
            const verifyData = await fetchApi<any>('/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order.id,
              }),
            });

            if (verifyData.success) {
              invalidateCache('user_orders_cache');
              clearCart();
              const confirmedOrder = verifyData.data || order;
              const confirmedId = confirmedOrder?.id || confirmedOrder?._id || order.id;

              if (confirmedOrder) {
                const keys = [confirmedId, confirmedOrder._id, confirmedOrder.id, confirmedOrder.orderNumber, order.id, order._id, order.orderNumber].filter(Boolean);
                keys.forEach((k: string) => {
                  setCachedData('order_detail_' + k, confirmedOrder);
                  try {
                    sessionStorage.setItem('order_cache_' + k, JSON.stringify(confirmedOrder));
                    localStorage.setItem('order_cache_' + k, JSON.stringify(confirmedOrder));
                  } catch (e) {}
                });
                try {
                  sessionStorage.setItem('latest_completed_order', JSON.stringify(confirmedOrder));
                  localStorage.setItem('latest_completed_order', JSON.stringify(confirmedOrder));
                } catch (e) {}
              }

              router.replace(`/order-success/${confirmedId}`);
              return;
            } else {
              alert('Payment verification failed: ' + (verifyData.error || 'Unknown error'));
            }
          } catch (err: any) {
            alert('Error verifying payment: ' + (err.message || 'Network error'));
          } finally {
            setRetryingOrderId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setRetryingOrderId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        alert('Payment Failed: ' + (resp.error?.description || 'Transaction declined'));
        setRetryingOrderId(null);
      });
      rzp.open();
    } catch (err: any) {
      alert('Failed to start payment: ' + (err.message || 'Something went wrong'));
      setRetryingOrderId(null);
    }
  };

  const getRemainingSeconds = (createdAtStr: string) => {
    const createdTime = new Date(createdAtStr).getTime();
    const expiryTime = createdTime + 30 * 60 * 1000;
    const diff = Math.floor((expiryTime - now) / 1000);
    return Math.max(0, diff);
  };

  const copyReference = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedRef(orderId);
      setTimeout(() => setCopiedRef(null), 2000);
    } catch {
      // Fallback
    }
  };

  const openInvoice = (orderId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('auth_token') || '' : '';
    window.open(`/api/orders/${orderId}/invoice${token ? `?token=${encodeURIComponent(token)}` : ''}`, '_blank');
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to sign out?')) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FBFDF8] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-6">
          <div className="h-32 bg-stone-200/70 rounded-3xl animate-pulse" />
          <div className="h-64 bg-stone-200/70 rounded-3xl animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBFDF8] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center p-8 sm:p-10 bg-white rounded-3xl shadow-lg border border-stone-200 max-w-md w-full">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF0E5] text-[#50563D] flex items-center justify-center mx-auto mb-4">
              <UserRound className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#1E201D] mb-2 font-display">Sign In to Your Account</h2>
            <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
              Sign in to view your profile details, manage delivery addresses, permissions, and track active cold-chain orders.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full py-3 bg-[#50563D] hover:bg-[#3D422E] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Sign In / Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all block text-center"
              >
                Browse Storefront
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFDF8] text-[#1E201D] flex flex-col font-sans selection:bg-[#50563D] selection:text-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <main className="mx-auto w-full max-w-[1180px] px-3 py-5 sm:px-6 sm:py-8 flex-1 space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. TOP USER PROFILE HERO CARD */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#50563D] via-[#656B4F] to-[#7B8563] text-white p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/25 flex items-center justify-center text-white shrink-0 shadow-inner">
                <UserRound className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black truncate tracking-tight font-display">
                    {user.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                    {user.role || 'Customer'}
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-0.5">
                  Sakthi Frozen Foods Verified Account
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {user.role === 'Admin' && (
                <Link
                  href="/admin"
                  className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white text-white hover:text-[#50563D] font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-red-300/30 cursor-pointer disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>

          {/* Quick Profile Contact Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-stone-100 text-xs">
            <div className="bg-white p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EAF0E5] text-[#50563D] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Email Address</span>
                <span className="font-bold text-stone-800 truncate block">{user.email}</span>
              </div>
            </div>

            <div className="bg-white p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EAF0E5] text-[#50563D] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Phone Number</span>
                <span className="font-bold text-stone-800 truncate block">{user.phone || '+91 80563 89214'}</span>
              </div>
            </div>

            <div className="bg-white p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EAF0E5] text-[#50563D] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Delivery Location</span>
                <span className="font-bold text-stone-800 truncate block">
                  {user.address || 'Coimbatore & Tamil Nadu Region'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. TAB CONTROLS */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#50563D] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'orders' ? 'bg-white/25 text-white' : 'bg-stone-200 text-stone-800'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#50563D] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <UserRound className="w-4 h-4" />
            <span>Profile & Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-[#50563D] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications & Permissions</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. TAB CONTENT: MY ORDERS */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {paymentSuccessOrder && (
              <div className="p-4 rounded-2xl bg-[#EAF0E5] border border-[#656B4F]/30 text-[#2D3823] flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
                <CheckCircle2 className="w-6 h-6 text-[#656B4F] shrink-0" />
                <div>
                  <p className="font-extrabold text-sm">Payment Successful for Order #{paymentSuccessOrder}!</p>
                  <p className="text-xs text-[#50563D] mt-0.5">Your order is confirmed and scheduled for cold-chain packing.</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl h-40 animate-pulse border border-stone-200 shadow-xs" />
                ))}
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-200 font-bold text-xs sm:text-sm flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => fetchOrders(false)}
                  className="px-3 py-1 bg-red-800 text-white rounded-lg text-xs hover:bg-red-900 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 px-6 bg-white rounded-3xl border border-stone-200/90 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#EAF0E5] flex items-center justify-center mx-auto mb-4 text-[#50563D]">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 font-display">No Orders Found Yet</h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
                  You haven&apos;t placed any plant-based orders yet. Explore our juicy soya chaap, veg mutton chukka, and crispy momos!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/shop"
                    className="px-5 py-2.5 bg-[#50563D] hover:bg-[#3D422E] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Store className="w-4 h-4" />
                    <span>Start Shopping</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>My Wishlist</span>
                  </Link>
                  <Link
                    href="/help"
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4 text-[#50563D]" />
                    <span>Help Guide</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order, orderIdx) => {
                  const isOnline = order.paymentMethod === 'Razorpay (Online)';
                  const isPendingPayment = order.paymentStatus === 'Pending';
                  const remainingSecs = isOnline && isPendingPayment ? getRemainingSeconds(order.createdAt) : 0;
                  const isWithinGracePeriod = remainingSecs > 0 && !order.isLocked && order.paymentStatus !== 'Failed';
                  const isExpiredFailed =
                    (isOnline && isPendingPayment && remainingSecs === 0) ||
                    order.paymentStatus === 'Failed' ||
                    (order.status === 'Cancelled' && isPendingPayment);
                  const isPaid = order.paymentStatus === 'Paid' || order.status === 'Confirmed';
                  const isCOD = order.paymentMethod === 'Cash on Delivery';

                  const mins = Math.floor(remainingSecs / 60);
                  const secs = remainingSecs % 60;

                  const whatsappQueryUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                    `Hi Sakthi Frozen Foods, I have a question regarding my Order #${order.orderNumber}.`
                  )}`;

                  return (
                    <div
                      key={order.id || (order as any)._id || order.orderNumber || `order-${orderIdx}`}
                      className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden transition-shadow hover:shadow-md"
                    >
                      {/* Order Card Header */}
                      <div className="bg-[#FAFBF7] px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200">
                        <div>
                          <span className="text-xs font-black text-[#262E1F] uppercase tracking-wider block mb-0.5 font-mono">
                            Order #{order.orderNumber}
                          </span>
                          <span suppressHydrationWarning className="text-[11px] sm:text-xs font-semibold text-stone-500 block">
                            Placed on{' '}
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-0.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                            Total Paid Amount
                          </span>
                          <span className="text-lg sm:text-xl font-black text-[#1A1E16]">₹{order.totalAmount}</span>
                          {order.convenienceFee ? (
                            <span className="text-[10px] font-bold text-[#656B4F]">
                              (Incl. ₹{order.convenienceFee} handling fee)
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="p-5 sm:p-6">
                        {/* 30-Minute Grace Alert Bar for Pending Online Orders */}
                        {isWithinGracePeriod && (
                          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                              <div>
                                <p className="text-xs font-black text-amber-950">
                                  Payment Pending — {mins}m {secs.toString().padStart(2, '0')}s remaining to complete
                                </p>
                                <p className="text-[11px] text-amber-800">
                                  Please complete payment within 30 minutes to confirm your order.
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRetryPayment(order)}
                              disabled={retryingOrderId === order.id}
                              className="px-4 py-2 bg-[#50563D] hover:bg-[#3D422E] text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                            >
                              {retryingOrderId === order.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                  <span>Connecting...</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Pay Now / Retry</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Expired Notice */}
                        {isExpiredFailed && (
                          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                            <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <p className="font-black text-red-900">Payment Window Expired — Order Cancelled</p>
                              <p className="text-red-700 mt-0.5">
                                This order can no longer be paid. You can place a fresh order anytime.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-between">
                          {/* Items List */}
                          <div className="flex-1 space-y-4">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3.5 sm:gap-4">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#50563D] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                                  {item.quantity}x
                                </div>
                                <div>
                                  <h4 className="text-sm sm:text-base font-extrabold text-stone-900 leading-snug">
                                    {item.name}
                                  </h4>
                                  <div className="text-xs font-bold text-[#50563D] mt-0.5">
                                    {item.weight} • ₹{item.price} each
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Reference ID */}
                            <div className="mt-4 pt-3 border-t border-stone-200/80">
                              <p className="text-[10px] font-black uppercase tracking-wider text-[#656B4F] mb-1">
                                Reference Order ID
                              </p>
                              <div className="flex items-center gap-2">
                                <code className="text-[11px] font-mono font-bold text-stone-800 bg-stone-100 px-2 py-1 rounded-md border border-stone-200 select-all">
                                  {order.id}
                                </code>
                                <button
                                  onClick={() => copyReference(order.id)}
                                  className="p-1.5 rounded-md hover:bg-[#EAF0E5] transition-colors cursor-pointer"
                                  title="Copy reference"
                                >
                                  {copiedRef === order.id ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Status & Direct Actions */}
                          <div className="w-full md:w-64 space-y-4 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-6">
                            <div>
                              <span className="block text-xs font-black uppercase tracking-wider text-stone-400 mb-1.5">
                                Order Status
                              </span>
                              <div
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black ${
                                  isExpiredFailed
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : isPaid || isCOD || order.status === 'Confirmed'
                                    ? 'bg-[#EAF0E5] text-[#2D3823] border-[#656B4F]/30'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {isExpiredFailed ? (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                ) : isPaid || isCOD || order.status === 'Confirmed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#50563D]" />
                                ) : (
                                  <Clock className="w-4 h-4 text-amber-600" />
                                )}
                                <span>
                                  {isExpiredFailed
                                    ? order.status === 'Cancelled'
                                      ? 'Order Cancelled'
                                      : 'Payment Failed'
                                    : isPaid || isCOD || order.status === 'Confirmed'
                                    ? 'Order Confirmed'
                                    : 'Awaiting Payment'}
                                </span>
                              </div>
                            </div>

                            <div>
                              <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-0.5">
                                Payment Mode
                              </span>
                              <p className="text-xs font-bold text-stone-900">{order.paymentMethod}</p>
                            </div>

                            <div>
                              <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-0.5">
                                Shipping Address
                              </span>
                              <p className="text-xs font-semibold text-stone-600 leading-snug">
                                {order.shippingAddress}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 space-y-2">
                              {isWithinGracePeriod && (
                                <button
                                  onClick={() => handleRetryPayment(order)}
                                  disabled={retryingOrderId === order.id}
                                  className="w-full rounded-xl bg-[#50563D] hover:bg-[#3D422E] px-3.5 py-2.5 text-xs font-black text-white transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  {retryingOrderId === order.id ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                      <span>Connecting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="w-3.5 h-3.5" />
                                      <span>Pay Now (Retry)</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {isPaid || isCOD || order.status === 'Confirmed' ? (
                                <div className="grid grid-cols-2 gap-2 w-full">
                                  <button
                                    onClick={() => printCommercialBill(order)}
                                    className="w-full rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-2 py-2 text-xs font-bold text-stone-700 transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                                    title="Print packing slip"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-[#50563D]" />
                                    <span>Print Slip</span>
                                  </button>

                                  <button
                                    onClick={() => openInvoice(order.id)}
                                    className="w-full rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-2 py-2 text-xs font-bold text-stone-700 transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                                    title="Download PDF invoice"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#50563D]" />
                                    <span>Invoice</span>
                                  </button>

                                  <a
                                    href={whatsappQueryUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="col-span-2 w-full rounded-xl bg-[#25D366] hover:bg-[#20ba59] px-3 py-2 text-xs font-bold text-white transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp Support</span>
                                  </a>
                                </div>
                              ) : (
                                <a
                                  href={whatsappQueryUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full rounded-xl bg-[#25D366] hover:bg-[#20ba59] px-3 py-2 text-xs font-bold text-white transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp Help</span>
                                </a>
                              )}

                              {(order.status === 'Pending' || order.status === 'Awaiting Payment') &&
                                !isExpiredFailed && (
                                  <button
                                    onClick={() => cancelOrder(order.id)}
                                    disabled={cancellingId === order.id}
                                    className="w-full rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 px-3.5 py-2 text-xs font-bold text-red-800 transition-colors disabled:opacity-50 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    {cancellingId === order.id ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-800" />
                                        <span>Cancelling...</span>
                                      </>
                                    ) : (
                                      'Cancel Order'
                                    )}
                                  </button>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. TAB CONTENT: PROFILE & ADDRESSES */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 font-display">Account Profile</h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Manage your personal and delivery details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Full Name</span>
                  <p className="font-bold text-stone-900 text-sm">{user.name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Email Address</span>
                  <p className="font-bold text-stone-900 text-sm">{user.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Contact Number</span>
                  <p className="font-bold text-stone-900 text-sm">{user.phone || '+91 80563 89214'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Account Type</span>
                  <p className="font-bold text-stone-900 text-sm">{user.role || 'Verified Customer'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Default Shipping Address</span>
                  <p className="font-bold text-stone-900 text-sm leading-relaxed">
                    {user.address || 'Peons Colony, Kalpana Theatre Opposite, Edayarpalayam - Koundampalayam Rd, Kavundampalayam, Coimbatore, Tamil Nadu 641030'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EAF0E5] border border-[#50563D]/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#50563D] shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">100% Pure Veg & FSSAI Certified</h4>
                    <p className="text-[11px] text-[#50563D]">All orders handled with express -18°C cold chain logistics.</p>
                  </div>
                </div>
                <Link
                  href="/terms"
                  className="text-xs font-bold text-[#50563D] hover:underline shrink-0"
                >
                  View Policies
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. TAB CONTENT: NOTIFICATIONS & PERMISSIONS */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <NotificationManager />
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
