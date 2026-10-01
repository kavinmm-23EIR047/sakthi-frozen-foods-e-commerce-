'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { fetchApi, fetchCachedApi, getCachedData } from '@/lib/apiConfig';
import { OrderType } from '@/lib/types';
import { Package, Clock, CheckCircle2, XCircle, CreditCard, Lock, FileText, Copy, MessageCircle } from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const WHATSAPP_PHONE = '919876543210';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Live 1-second clock for 30-minute grace period timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = async (silent = false) => {
    if (!silent && orders.length === 0) setLoading(true);
    try {
      const data = await fetchCachedApi<OrderType[]>('/orders/mine', { cacheKey: 'user_orders_cache', ttlMs: 30000, bypassCache: !silent });
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
    // Instant cache hydration
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
    const data = await fetchApi(`/orders/${orderId}/cancel`, { method: 'POST' });
    if (data.success) {
      setOrders((current) => current.map((order) => order.id === orderId ? data.data : order));
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
      // 1. Request fresh Razorpay order initialization from backend
      const retryRes = await fetchApi(`/orders/${order.id}/retry-payment`, {
        method: 'POST',
      });

      if (!retryRes.success) {
        alert(retryRes.error || 'Payment retry window expired.');
        fetchOrders(true);
        setRetryingOrderId(null);
        return;
      }

      const { razorpayOrderId, razorpayAmount, razorpayKeyId } = retryRes;

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Tb3aRjusts7JYy',
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
            // 3. Verify Payment
            const verifyData = await fetchApi('/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order.id,
              }),
            });

            if (verifyData.success) {
              setPaymentSuccessOrder(order.orderNumber);
              fetchOrders(true);
              setTimeout(() => setPaymentSuccessOrder(null), 8000);
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

  // Copy reference ID to clipboard
  const copyReference = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedRef(orderId);
      setTimeout(() => setCopiedRef(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Open invoice in new tab
  const openInvoice = (orderId: string) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('auth_token') : '';
    window.open(`/api/orders/${orderId}/invoice?token=${encodeURIComponent(token || '')}`, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#EAF0E5] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white rounded-3xl shadow-md border border-[#656B4F]/20 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#1E201D] mb-2 font-poppins">Please Login</h2>
            <p className="text-sm text-[#61665D] mb-6">You need to be logged in to view your orders.</p>
            <Link href="/login" className="inline-block px-6 py-3 bg-[#656B4F] text-white font-bold rounded-xl hover:bg-[#50563D] transition-all shadow-md">
              Go to Login
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />

      <main className="mx-auto w-full max-w-[1180px] px-3 py-5 sm:px-4 sm:py-8 md:py-10 flex-1">
        <div className="mb-6 sm:mb-8 max-w-2xl">
          <p className="text-xs font-black tracking-[0.16em] text-[#50563D] uppercase mb-1.5">Purchase History</p>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1E16] font-poppins">My Orders</h1>
          <p className="text-sm font-semibold text-[#50563D] mt-1.5">View your order details and download official invoices.</p>
        </div>

        {paymentSuccessOrder && (
          <div className="mb-6 p-4 rounded-2xl bg-[#EAF0E5] border border-[#656B4F]/30 text-[#2D3823] flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-6 h-6 text-[#656B4F] shrink-0" />
            <div>
              <p className="font-extrabold text-sm">Payment Successful for Order #{paymentSuccessOrder}!</p>
              <p className="text-xs text-[#50563D] mt-0.5">Your order is confirmed and being prepared.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-40 animate-pulse border border-[#D4DBC9] shadow-xs" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 font-bold text-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D4DBC9] shadow-xs max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#EAF0E5] flex items-center justify-center mx-auto mb-4 text-[#656B4F]">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-[#1A1E16] font-poppins">No Orders Found</h3>
            <p className="text-sm font-semibold text-[#50563D] mt-2 mb-6">Looks like you haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="inline-block px-6 py-3 bg-[#656B4F] text-white font-extrabold rounded-xl hover:bg-[#50563D] transition-all shadow-md">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isOnline = order.paymentMethod === 'Razorpay (Online)';
              const isPendingPayment = order.paymentStatus === 'Pending';
              const remainingSecs = isOnline && isPendingPayment ? getRemainingSeconds(order.createdAt) : 0;
              const isWithinGracePeriod = remainingSecs > 0 && !order.isLocked && order.paymentStatus !== 'Failed';
              const isExpiredFailed = (isOnline && isPendingPayment && remainingSecs === 0) || order.paymentStatus === 'Failed' || (order.status === 'Cancelled' && isPendingPayment);
              const isPaid = order.paymentStatus === 'Paid';
              const isCOD = order.paymentMethod === 'Cash on Delivery';

              const mins = Math.floor(remainingSecs / 60);
              const secs = remainingSecs % 60;

              const whatsappQueryUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi Sakthi Frozen Foods, I have a question regarding my Order #${order.orderNumber}.`)}`;

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-[#D4DBC9] shadow-xs overflow-hidden transition-shadow hover:shadow-md">
                  {/* Order Header */}
                  <div className="bg-[#EAF0E5] px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4DBC9]">
                    <div>
                      <span className="text-xs font-black text-[#262E1F] uppercase tracking-wider block mb-1 font-mono">
                        Order #{order.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-[#50563D] block">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-0.5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#50563D]">Total Amount</span>
                      <span className="text-xl font-black text-[#1A1E16]">₹{order.totalAmount}</span>
                      {order.convenienceFee ? (
                        <span className="text-[10px] font-bold text-[#656B4F]">
                          (Incl. ₹{order.convenienceFee} fee)
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
                              Please complete payment within 30 minutes to confirm your order. Unpaid orders will auto-cancel.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRetryPayment(order)}
                          disabled={retryingOrderId === order.id}
                          className="px-4 py-2 bg-[#656B4F] hover:bg-[#50563D] text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50 shrink-0"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{retryingOrderId === order.id ? 'Connecting...' : 'Pay Now / Retry'}</span>
                        </button>
                      </div>
                    )}

                    {/* Expired / Failed Notice */}
                    {isExpiredFailed && (
                      <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                        <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-black text-red-900">Payment Window Expired (&gt;30 mins) — Order Cancelled</p>
                          <p className="text-red-700 mt-0.5">
                            This order can no longer be paid. You can place a fresh order anytime.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-between">
                      {/* Left Column: Items List */}
                      <div className="flex-1 space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3.5 sm:gap-4">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#656B4F] text-white flex items-center justify-center font-black text-sm shadow-xs flex-shrink-0">
                              {item.quantity}x
                            </div>
                            <div>
                              <h4 className="text-sm sm:text-base font-extrabold text-[#1A1E16] leading-snug">{item.name}</h4>
                              <div className="text-xs font-bold text-[#50563D] mt-1">
                                {item.weight} • ₹{item.price} each
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Reference ID */}
                        <div className="mt-4 pt-3 border-t border-[#D4DBC9]/60">
                          <p className="text-[10px] font-black uppercase tracking-wider text-[#656B4F] mb-1">Reference ID</p>
                          <div className="flex items-center gap-2">
                            <code className="text-[11px] font-mono font-bold text-[#50563D] bg-[#F9FAF6] px-2 py-1 rounded-md border border-[#D4DBC9] select-all">
                              {order.id}
                            </code>
                            <button
                              onClick={() => copyReference(order.id)}
                              className="p-1.5 rounded-md hover:bg-[#EAF0E5] transition-colors"
                              title="Copy reference"
                            >
                              {copiedRef === order.id ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#656B4F]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-[#656B4F]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Order Summary, Status & Direct Actions */}
                      <div className="w-full md:w-64 space-y-4 border-t md:border-t-0 md:border-l border-[#D4DBC9] pt-4 md:pt-0 md:pl-6">
                        <div>
                          <span className="block text-xs font-black uppercase tracking-wider text-[#50563D] mb-1.5">Order Status</span>
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-black ${
                            isExpiredFailed ? 'bg-red-100 text-red-800 border-red-200' :
                            isPaid || isCOD || order.status === 'Confirmed' ? 'bg-[#EAF0E5] text-[#2D3823] border-[#656B4F]/30' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {isExpiredFailed ? <XCircle className="w-4 h-4 text-red-600" /> :
                             isPaid || isCOD || order.status === 'Confirmed' ? <CheckCircle2 className="w-4 h-4 text-[#656B4F]" /> :
                             <Clock className="w-4 h-4 text-amber-600" />}
                            <span>
                              {isExpiredFailed ? (order.status === 'Cancelled' ? 'Order Cancelled' : 'Payment Failed') :
                               isPaid || isCOD || order.status === 'Confirmed' ? 'Order Confirmed' :
                               'Awaiting Payment'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="block text-xs font-black uppercase tracking-wider text-[#50563D] mb-1">Payment Method</span>
                          <p className="text-xs font-bold text-[#1A1E16]">{order.paymentMethod}</p>
                        </div>
                        
                        <div>
                          <span className="block text-xs font-black uppercase tracking-wider text-[#50563D] mb-1">Delivery Address</span>
                          <p className="text-xs font-semibold text-[#50563D] leading-snug">{order.shippingAddress}</p>
                        </div>

                        {/* ─── Clean Action Buttons (Side-by-Side Horizontal Buttons on Mobile & Desktop) ──────────────────────── */}
                        <div className="pt-2 space-y-2">
                          {isWithinGracePeriod && (
                            <button
                              onClick={() => handleRetryPayment(order)}
                              disabled={retryingOrderId === order.id}
                              className="w-full rounded-xl bg-[#656B4F] hover:bg-[#50563D] px-3.5 py-2.5 text-xs font-black text-white transition-colors disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>{retryingOrderId === order.id ? 'Launching Gateway...' : 'Pay Now (Retry)'}</span>
                            </button>
                          )}

                          {/* Left and Right Horizontal Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 w-full">
                            {(isPaid || isCOD || order.status === 'Confirmed') ? (
                              <button
                                onClick={() => openInvoice(order.id)}
                                className="w-full rounded-xl border border-[#656B4F]/40 bg-[#F9FAF6] hover:bg-[#EAF0E5] px-2 sm:px-3.5 py-2.5 text-[11px] sm:text-xs font-black text-[#656B4F] transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                              >
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Download PDF</span>
                              </button>
                            ) : null}

                            {/* WhatsApp Direct Help Button */}
                            <a
                              href={whatsappQueryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-full rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] px-2 sm:px-3.5 py-2.5 text-[11px] sm:text-xs font-black text-white transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center ${(isPaid || isCOD || order.status === 'Confirmed') ? '' : 'col-span-2'}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">WhatsApp Help</span>
                            </a>
                          </div>

                          {(order.status === 'Pending' || order.status === 'Awaiting Payment') && !isExpiredFailed && (
                            <button
                              onClick={() => cancelOrder(order.id)}
                              disabled={cancellingId === order.id}
                              className="w-full rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 px-3.5 py-2 text-xs font-black text-red-800 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                            >
                              {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                          )}

                          {isExpiredFailed && (
                            <Link
                              href="/shop"
                              className="w-full rounded-xl bg-[#656B4F] hover:bg-[#50563D] px-3.5 py-2.5 text-xs font-black text-white text-center transition-colors block shadow-xs"
                            >
                              Place Fresh Order
                            </Link>
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
      </main>

      <Footer />
    </div>
  );
}
