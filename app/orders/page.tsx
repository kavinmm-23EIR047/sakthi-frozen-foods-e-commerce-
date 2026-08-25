'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/apiConfig';
import { OrderType } from '@/lib/seedData';
import { Package, Clock, Truck, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await fetchApi(`/orders?email=${encodeURIComponent(user.email)}`);
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
    <div className="min-h-screen bg-[#FAFAF5] text-[#1E201D] flex flex-col font-sans">
      <Navbar />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1E201D] font-poppins">My Orders</h1>
          <p className="text-sm text-[#61665D] mt-1">Track and manage your past and current orders.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-40 animate-pulse border border-[#4F534C]/10" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#4F534C]/10 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#EAF0E5] flex items-center justify-center mx-auto mb-4 text-[#4D583F]">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[#1E201D] font-poppins">No Orders Found</h3>
            <p className="text-sm text-[#61665D] mt-2 mb-6">Looks like you haven't placed any orders yet.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-[#4D583F] text-white font-bold rounded-xl hover:bg-[#414b35] transition-all">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-[#4F534C]/15 shadow-sm overflow-hidden">
                <div className="bg-[#EAF0E5] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4D583F]/10">
                  <div>
                    <span className="text-xs font-bold text-[#4D583F] uppercase tracking-wider block mb-1">
                      Order {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-[#61665D] block">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <span className="text-sm text-[#61665D]">Total Amount</span>
                    <span className="text-lg font-black text-[#1E201D]">₹{order.totalAmount}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8 justify-between">
                    <div className="flex-1 space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#E8EEE0] flex items-center justify-center text-[#4D583F] font-bold shadow-inner flex-shrink-0">
                            {item.quantity}x
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#1E201D]">{item.name}</h4>
                            <div className="text-[11px] text-[#61665D] mt-0.5">
                              {item.weight} • ₹{item.price} each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="w-full md:w-64 space-y-4 border-t md:border-t-0 md:border-l border-[#4F534C]/10 pt-4 md:pt-0 md:pl-6">
                      <div>
                        <span className="block text-xs font-semibold text-[#61665D] mb-1">Order Status</span>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </div>
                      
                      <div>
                        <span className="block text-xs font-semibold text-[#61665D] mb-1">Shipping Details</span>
                        <p className="text-sm font-medium text-[#1E201D]">{order.shippingAddress}</p>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold text-[#61665D] mb-1">Payment Method</span>
                        <p className="text-sm font-medium text-[#1E201D]">{order.paymentMethod}</p>
                      </div>
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
