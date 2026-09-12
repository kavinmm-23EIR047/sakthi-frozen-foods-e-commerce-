'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/apiConfig';
import { OrderType } from '@/lib/types';
import { Package, Clock, Truck, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await fetchApi('/orders/mine');
        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.error || 'Failed to load orders.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm('Cancel this order?')) return;
    setCancellingId(orderId);
    const data = await fetchApi(`/orders/${orderId}/cancel`, { method: 'POST' });
    if (data.success) setOrders((current) => current.map((order) => order.id === orderId ? data.data : order));
    else setError(data.error || 'Unable to cancel order.');
    setCancellingId(null);
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#EAF0E5] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white rounded-3xl shadow-md border border-[#4D583F]/20 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#1E201D] mb-2 font-poppins">Please Login</h2>
            <p className="text-sm text-[#61665D] mb-6">You need to be logged in to view your orders.</p>
            <Link href="/login" className="inline-block px-6 py-3 bg-[#4D583F] text-white font-bold rounded-xl hover:bg-[#414b35] transition-all">
              Go to Login
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'Processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'Delivered':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F3FBEE] text-[#1E201D] flex flex-col font-sans">
      <Navbar />

      <main className="mx-auto w-full max-w-[1180px] px-3 py-5 sm:px-4 sm:py-8 md:py-10 flex-1">
        <div className="mb-6 sm:mb-8 max-w-2xl">
          <p className="text-xs font-black tracking-[0.16em] text-[#3D4533] uppercase mb-1.5">Purchase History</p>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1E16] font-poppins">My Orders</h1>
          <p className="text-sm font-semibold text-[#3C4136] mt-1.5">Track and manage your past and current orders.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-40 animate-pulse border border-[#4F534C]/15 shadow-sm" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 font-bold text-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#4F534C]/15 shadow-sm max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#EAF0E5] flex items-center justify-center mx-auto mb-4 text-[#4D583F]">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-[#1A1E16] font-poppins">No Orders Found</h3>
            <p className="text-sm font-semibold text-[#3C4136] mt-2 mb-6">Looks like you haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="inline-block px-6 py-3 bg-[#4D583F] text-white font-extrabold rounded-xl hover:bg-[#414b35] transition-all shadow-md">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-[#4F534C]/20 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                <div className="bg-[#EAF0E5] px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4D583F]/20">
                  <div>
                    <span className="text-xs font-black text-[#262E1F] uppercase tracking-wider block mb-1 font-mono">
                      Order {order.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-[#3E4536] block">
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
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3E4536]">Total Amount</span>
                    <span className="text-xl font-black text-[#1A1E16]">₹{order.totalAmount}</span>
                    {order.convenienceFee ? (
                      <span className="text-[10px] font-bold text-[#4D583F]">
                        (Incl. ₹{order.convenienceFee} fee)
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-between">
                    <div className="flex-1 space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3.5 sm:gap-4">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#4D583F] text-white flex items-center justify-center font-black text-sm shadow-xs flex-shrink-0">
                            {item.quantity}x
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-extrabold text-[#1A1E16] leading-snug">{item.name}</h4>
                            <div className="text-xs font-bold text-[#3E4536] mt-1">
                              {item.weight} • ₹{item.price} each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="w-full md:w-64 space-y-4 border-t md:border-t-0 md:border-l border-[#4F534C]/15 pt-4 md:pt-0 md:pl-6">
                      <div>
                        <span className="block text-xs font-black uppercase tracking-wider text-[#3E4536] mb-1.5">Order Status</span>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-black ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="block text-xs font-black uppercase tracking-wider text-[#3E4536] mb-1">Shipping Details</span>
                        <p className="text-sm font-bold text-[#1A1E16] leading-snug">{order.shippingAddress}</p>
                      </div>

                      <div>
                        <span className="block text-xs font-black uppercase tracking-wider text-[#3E4536] mb-1">Payment Method</span>
                        <p className="text-sm font-bold text-[#1A1E16]">{order.paymentMethod}</p>
                      </div>

                      {order.status === 'Pending' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 px-3.5 py-2 text-xs font-black text-red-800 transition-colors disabled:opacity-50 shadow-xs"
                        >
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
