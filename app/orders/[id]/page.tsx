'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { fetchApi, invalidateCache } from '@/lib/apiConfig';
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
  CreditCard,
  Copy,
  ChevronRight,
  AlertCircle,
  Loader2,
  Lock,
  Printer,
} from 'lucide-react';
import { printCommercialBill } from '@/lib/printUtils';
import OptimizedImage from '@/components/OptimizedImage';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const WHATSAPP_PHONE = '918056389214';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { clearCart } = useCart();

  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [now, setNow] = useState<number>(Date.now());

  /*
   * Live 1-second clock for the payment grace period.
   * Runs only while the order is waiting for Razorpay payment.
   */
  useEffect(() => {
    if (
      !order ||
      order.paymentStatus !== 'Pending' ||
      order.paymentMethod !== 'Razorpay (Online)'
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [order?.paymentStatus, order?.paymentMethod]);

  /*
   * Fetch order details.
   */
  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) {
      setError('Invalid order ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetchApi<OrderType>(`/orders/${orderId}`);

      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setOrder(null);
        setError(res.error || 'Order not found');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load order details';

      setOrder(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  /*
   * success=true is redirected to the canonical order success page.
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && orderId) {
      const isSuccess = new URLSearchParams(window.location.search).get('success') === 'true';
      if (isSuccess) {
        router.replace(`/order-success/${orderId}`);
      }
    }
  }, [orderId, router]);

  /*
   * Store the confirmed order locally for the success page.
   *
   * No custom setCachedData() is used here because that function was
   * not defined/imported in the original file.
   */
  const cacheConfirmedOrder = useCallback(
    (confirmedOrder: any, confirmedId: string) => {
      if (!confirmedOrder) return;

      const keys = [
        confirmedId,
        confirmedOrder._id,
        confirmedOrder.id,
        confirmedOrder.orderNumber,
        order?.id,
        order?._id,
        order?.orderNumber,
      ].filter(Boolean) as string[];

      const uniqueKeys = [...new Set(keys)];

      try {
        uniqueKeys.forEach((key) => {
          sessionStorage.setItem(
            `order_cache_${key}`,
            JSON.stringify(confirmedOrder)
          );

          localStorage.setItem(
            `order_cache_${key}`,
            JSON.stringify(confirmedOrder)
          );
        });

        sessionStorage.setItem(
          'latest_completed_order',
          JSON.stringify(confirmedOrder)
        );

        localStorage.setItem(
          'latest_completed_order',
          JSON.stringify(confirmedOrder)
        );
      } catch {
        /*
         * Storage can fail in private browsing or when browser storage
         * is unavailable. Payment/order confirmation must not fail
         * because of local storage.
         */
      }
    },
    [order]
  );

  /*
   * Retry Razorpay payment.
   */
  const handleRetryPayment = async () => {
    if (!order || retrying) return;

    if (typeof window === 'undefined' || typeof window.Razorpay === 'undefined') {
      alert('Payment gateway is loading. Please try again in a few seconds.');
      return;
    }

    setRetrying(true);

    try {
      const retryRes = await fetchApi<any>(
        `/orders/${order.id}/retry-payment`,
        {
          method: 'POST',
        }
      );

      if (!retryRes.success) {
        alert(retryRes.error || 'Payment retry window expired.');
        await fetchOrderDetail();
        return;
      }

      /*
       * Backend already confirmed the payment.
       */
      if (retryRes.alreadyPaid) {
        invalidateCache('user_orders_cache');

        clearCart();

        const confirmedOrder = retryRes.data || order;

        const confirmedId =
          confirmedOrder?.id ||
          confirmedOrder?._id ||
          order.id;

        cacheConfirmedOrder(confirmedOrder, confirmedId);

        router.replace(`/order-success/${confirmedId}`);
        return;
      }

      const {
        razorpayOrderId,
        razorpayAmount,
        razorpayKeyId,
      } = retryRes;

      if (!razorpayOrderId) {
        throw new Error('Razorpay order ID was not returned by the server.');
      }

      if (!razorpayAmount) {
        throw new Error('Razorpay amount was not returned by the server.');
      }

      const razorpayKey =
        razorpayKeyId ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        '';

      if (!razorpayKey) {
        throw new Error('Razorpay key is not configured.');
      }

      const options = {
        key: razorpayKey,
        amount: razorpayAmount,
        currency: 'INR',
        name: 'Sakthi Frozen Foods',
        description: `Payment for Order #${order.orderNumber}`,
        order_id: razorpayOrderId,

        prefill: {
          name: order.customerName || '',
          email: order.customerEmail || '',
          contact: order.customerPhone || '',
        },

        theme: {
          color: '#656B4F',
        },

        handler: async function (response: any) {
          try {
            if (
              !response?.razorpay_order_id ||
              !response?.razorpay_payment_id ||
              !response?.razorpay_signature
            ) {
              throw new Error(
                'Incomplete payment response received from Razorpay.'
              );
            }

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

              const confirmedId =
                confirmedOrder?.id ||
                confirmedOrder?._id ||
                order.id;

              cacheConfirmedOrder(
                confirmedOrder,
                confirmedId
              );

              router.replace(`/order-success/${confirmedId}`);
              return;
            }

            alert(
              'Payment verification failed: ' +
              (verifyData.error || 'Unknown error')
            );
          } catch (err: unknown) {
            const message =
              err instanceof Error
                ? err.message
                : 'Network error';

            alert(`Error verifying payment: ${message}`);
          } finally {
            setRetrying(false);
          }
        },

        modal: {
          ondismiss: function () {
            setRetrying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (response: any) {
        alert(
          'Payment Failed: ' +
          (response?.error?.description ||
            'Transaction declined')
        );

        setRetrying(false);
      });

      razorpay.open();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong';

      alert(`Failed to start payment: ${message}`);
      setRetrying(false);
    }
  };

  /*
   * Cancel order.
   */
  const cancelOrder = async () => {
    if (!order || cancelling) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmed) return;

    setCancelling(true);

    try {
      const data = await fetchApi<any>(
        `/orders/${order.id}/cancel`,
        {
          method: 'POST',
        }
      );

      if (data.success && data.data) {
        setOrder(data.data);
        invalidateCache('user_orders_cache');
      } else {
        alert(data.error || 'Unable to cancel order.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to cancel order.';

      alert(message);
    } finally {
      setCancelling(false);
    }
  };

  /*
   * Copy order number.
   */
  const copyOrderNumber = async () => {
    if (!order?.orderNumber) return;

    try {
      await navigator.clipboard.writeText(order.orderNumber);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert('Unable to copy order number.');
    }
  };

  /*
   * Calculate remaining payment grace period.
   */
  const getRemainingSeconds = (createdAtStr: string) => {
    const createdTime = new Date(createdAtStr).getTime();

    if (Number.isNaN(createdTime)) {
      return 0;
    }

    const expiryTime = createdTime + 30 * 60 * 1000;

    const diff = Math.floor(
      (expiryTime - now) / 1000
    );

    return Math.max(0, diff);
  };

  /*
   * Status badge.
   */
  const getStatusBadge = (
    status?: string,
    paymentStatus?: string
  ) => {
    if (
      paymentStatus === 'Paid' ||
      status === 'Confirmed'
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#EAF0E5] text-[#2D3823] border border-[#656B4F]/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#656B4F]" />
          Paid & Confirmed
        </span>
      );
    }

    if (
      paymentStatus === 'Failed' ||
      status === 'Payment Failed' ||
      status === 'Cancelled'
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          {status === 'Cancelled'
            ? 'Order Cancelled'
            : 'Payment Failed'}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Awaiting Payment
      </span>
    );
  };

  const isOnline =
    order?.paymentMethod === 'Razorpay (Online)';

  const isPendingPayment =
    order?.paymentStatus === 'Pending';

  const remainingSecs =
    isOnline &&
      isPendingPayment &&
      order
      ? getRemainingSeconds(order.createdAt)
      : 0;

  const mins = Math.floor(remainingSecs / 60);
  const secs = remainingSecs % 60;

  const isWithinGracePeriod =
    remainingSecs > 0 &&
    !order?.isLocked &&
    order?.paymentStatus !== 'Failed' &&
    order?.status !== 'Cancelled';

  const isExpiredFailed =
    (isOnline &&
      isPendingPayment &&
      remainingSecs === 0) ||
    order?.paymentStatus === 'Failed' ||
    order?.status === 'Cancelled' ||
    order?.status === 'Payment Failed';

  const isPaid =
    order?.paymentStatus === 'Paid' ||
    order?.status === 'Confirmed';

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Navbar />

      <main className="site-shell py-6 sm:py-10 flex-1">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Top Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#50563D] hover:text-[#1E201D] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Orders</span>
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#50563D] hover:underline"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>



          {/* Grace Period Pending Alert */}
          {isWithinGracePeriod && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />

                <div>
                  <p className="text-xs font-black text-amber-950">
                    Payment Pending — {mins}m{' '}
                    {secs.toString().padStart(2, '0')}s remaining
                    to complete
                  </p>

                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Please complete your payment before the timer
                    expires to confirm your cold-chain delivery.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={retrying}
                className="px-4 py-2 bg-[#656B4F] hover:bg-[#50563D] text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {retrying ? (
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

          {/* Expired / Failed Notice */}
          {isExpiredFailed && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 shadow-xs">
              <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />

              <div className="text-xs">
                <p className="font-black text-red-900">
                  {order?.status === 'Cancelled'
                    ? 'Order Cancelled'
                    : 'Payment Window Expired (>30 mins) — Order Cancelled'}
                </p>

                <p className="text-red-700 mt-0.5">
                  This order is closed and cannot be paid. You can
                  place a fresh order from our shop.
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-sm space-y-4">
              <div className="w-10 h-10 border-3 border-[#50563D] border-t-transparent rounded-full animate-spin mx-auto" />

              <p className="text-xs font-bold text-[#61665D]">
                Retrieving verified order details from server...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-white rounded-3xl p-8 text-center border border-red-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <h3 className="text-base font-black text-[#1E201D]">
                Order Not Found
              </h3>

              <p className="text-xs text-[#61665D] max-w-md mx-auto">
                {error}
              </p>

              <Link
                href="/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#50563D] text-white text-xs font-black shadow-xs hover:bg-[#3D4533] transition-all"
              >
                View Your Orders
              </Link>
            </div>
          )}

          {/* Order Details Card */}
          {!loading && order && (
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md overflow-hidden">

              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4 bg-stone-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#61665D]">
                      Order Reference:
                    </span>

                    <button
                      type="button"
                      onClick={copyOrderNumber}
                      className="text-sm font-black text-[#1E201D] hover:text-[#50563D] flex items-center gap-1.5 group cursor-pointer"
                      title="Click to copy"
                    >
                      <span>{order.orderNumber}</span>

                      <Copy className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#50563D]" />
                    </button>

                    {copied && (
                      <span className="text-[10px] font-bold text-emerald-600">
                        Copied!
                      </span>
                    )}
                  </div>

                  <p suppressHydrationWarning className="text-xs text-stone-500">
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleString(
                      'en-IN',
                      {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }
                    )}
                  </p>
                </div>

                <div>
                  {getStatusBadge(
                    order.status,
                    order.paymentStatus
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 sm:p-6 border-b border-stone-100 space-y-4">
                <h3 className="text-xs font-black text-[#1E201D] uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#50563D]" />
                  Ordered Items ({order.items.length})
                </h3>

                <div className="divide-y divide-stone-100">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${item.weight}-${idx}`}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          {item.image ? (
                            <OptimizedImage
                              src={item.image}
                              alt={item.name}
                              width={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-[#1E201D] truncate">
                            {item.name}
                          </h4>

                          <p className="text-[11px] text-stone-500">
                            {item.weight} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-black text-[#1E201D]">
                          ₹{item.price * item.quantity}
                        </span>

                        <p className="text-[10px] text-stone-400">
                          ₹{item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Price Breakdown */}
              <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50/40 border-b border-stone-100">

                {/* Shipping Info */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-black text-[#1E201D] uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#50563D]" />
                    Delivery Destination
                  </h4>

                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 space-y-1">
                    <p className="font-bold text-[#1E201D]">
                      {order.customerName}
                    </p>

                    <p className="text-stone-600">
                      {order.customerPhone}
                    </p>

                    <p className="text-stone-600 leading-relaxed">
                      {order.shippingAddress}
                    </p>

                    {order.deliveryMode && (
                      <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EAF0E5] text-[#50563D]">
                        Mode: {order.deliveryMode} Express
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-black text-[#1E201D] uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#50563D]" />
                    Payment Summary
                  </h4>

                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 space-y-2">
                    <div className="flex justify-between text-stone-600">
                      <span>Items Subtotal:</span>

                      <span className="font-bold text-[#1E201D]">
                        ₹
                        {order.subtotal ??
                          (order.totalAmount -
                            (order.deliveryFee || 0) -
                            (order.convenienceFee || 0))}
                      </span>
                    </div>

                    <div className="flex justify-between text-stone-600">
                      <span>Cold-Chain Express Delivery:</span>

                      <span className="font-bold text-[#1E201D]">
                        ₹{order.deliveryFee ?? 0}
                      </span>
                    </div>

                    {Boolean(order.convenienceFee) && (
                      <div className="flex justify-between text-stone-600">
                        <span>
                          Gateway Convenience Fee (2.5%):
                        </span>

                        <span className="font-bold text-[#1E201D]">
                          ₹{order.convenienceFee}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-black text-[#1E201D]">
                      <span>Total Amount:</span>

                      <span className="text-[#50563D]">
                        {isPaid
                          ? 'Total Paid: '
                          : 'Total: '}
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3 bg-white">

                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                    `Hi Sakthi Frozen Foods! I want to check the status of my order ${order.orderNumber}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-bold text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Support</span>
                </a>

                <div className="flex flex-wrap items-center gap-2">

                  {/* Pending Order Actions */}
                  {isWithinGracePeriod && (
                    <>
                      <button
                        type="button"
                        onClick={cancelOrder}
                        disabled={cancelling}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {cancelling ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-800" />
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <span>Cancel Order</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleRetryPayment}
                        disabled={retrying}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#656B4F] hover:bg-[#50563D] text-white font-black text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {retrying ? (
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
                    </>
                  )}

                  {/* Paid Order Actions */}
                  {isPaid && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          printCommercialBill(order)
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#EAF0E5] border border-[#656B4F]/40 font-bold text-xs text-[#1E201D] transition-colors shadow-2xs cursor-pointer"
                        title="Print clean 1-page commercial slip"
                      >
                        <Printer className="w-4 h-4 text-[#656B4F]" />
                        <span>Print Slip</span>
                      </button>

                      <a
                        href={`/api/orders/${order.id}/invoice`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 font-bold text-xs text-[#1E201D] transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[#50563D]" />
                        <span>Download PDF</span>
                      </a>
                    </>
                  )}

                  {/* Shop More */}
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#50563D] hover:bg-[#3D4533] text-white font-black text-xs transition-all shadow-xs"
                  >
                    <span>
                      {isExpiredFailed
                        ? 'Place Fresh Order'
                        : 'Shop More'}
                    </span>

                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
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