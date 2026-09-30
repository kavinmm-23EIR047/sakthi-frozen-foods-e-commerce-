'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/apiConfig';
import { OrderType } from '@/lib/types';
import { UserRound, Mail, Phone, MapPin, Package, ArrowRight, LogIn, LogOut, Clock3 } from 'lucide-react';

export default function AccountPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setOrdersLoading(true);
    fetchApi('/orders/mine')
      .then((response) => {
        if (active && response.success && Array.isArray(response.data)) setOrders(response.data);
      })
      .catch((error) => console.error('Could not load account orders:', error))
      .finally(() => { if (active) setOrdersLoading(false); });
    return () => { active = false; };
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F8F1] text-[#1E201D]">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-24 sm:py-10">
        <div className="mb-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#647160]">Your Sakthi account</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#50563D]">My Account</h1>
          <p className="mt-1 text-sm text-[#687263]">Account details and your recent orders in one place.</p>
        </div>

        {authLoading ? (
          <div className="h-48 animate-pulse rounded-3xl bg-white shadow-sm" />
        ) : user ? (
          <>
            <section className="overflow-hidden rounded-3xl border border-[#e1e9dd] bg-white shadow-sm">
              <div className="flex items-center gap-4 bg-[#173425] px-5 py-5 text-white sm:px-7">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><UserRound className="h-7 w-7" /></div>
                <div className="min-w-0"><h2 className="truncate text-xl font-extrabold">{user.name}</h2><p className="mt-0.5 text-xs text-white/70">{user.role} account</p></div>
              </div>
              <div className="grid gap-px bg-[#edf1ea] sm:grid-cols-2">
                <div className="flex min-w-0 items-start gap-3 bg-white p-4 sm:p-5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#656B4F]" /><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a8275]">Email</p><p className="mt-1 break-all text-sm font-semibold">{user.email}</p></div></div>
                <div className="flex min-w-0 items-start gap-3 bg-white p-4 sm:p-5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#656B4F]" /><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a8275]">Phone</p><p className="mt-1 text-sm font-semibold">{user.phone || 'Not added'}</p></div></div>
                <div className="flex min-w-0 items-start gap-3 bg-white p-4 sm:p-5 sm:col-span-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#656B4F]" /><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a8275]">Address</p><p className="mt-1 text-sm font-semibold">{user.address || 'No saved address'}</p></div></div>
              </div>
              <div className="flex flex-wrap gap-3 border-t border-[#edf1ea] p-4 sm:px-5">
                <button onClick={logout} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#ead8d4] px-4 text-sm font-bold text-[#9a3e32] hover:bg-[#fff7f5]"><LogOut className="h-4 w-4" />Log out</button>
                <Link href="/shop" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173425] px-4 text-sm font-bold text-white hover:bg-[#244c35]">Continue shopping<ArrowRight className="h-4 w-4" /></Link>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#647160]">Purchase history</p><h2 className="mt-1 text-xl font-black text-[#50563D]">Recent orders</h2></div><Link href="/orders" className="inline-flex items-center gap-1 text-xs font-bold text-[#656B4F]">All orders<ArrowRight className="h-3.5 w-3.5" /></Link></div>
              {ordersLoading ? <div className="h-28 animate-pulse rounded-2xl bg-white" /> : orders.length ? (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <Link key={order.id} href="/orders" className="flex items-center justify-between gap-3 rounded-2xl border border-[#e1e9dd] bg-white p-4 shadow-sm transition hover:border-[#afc5a7]">
                      <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4e9] text-[#656B4F]"><Package className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate text-sm font-extrabold">Order #{order.orderNumber}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-[#737c70]"><Clock3 className="h-3 w-3" />{new Date(order.createdAt).toLocaleDateString('en-IN')} · {order.items.length} items</p></div></div>
                      <div className="shrink-0 text-right"><p className="text-sm font-extrabold">₹{order.totalAmount}</p><p className="mt-0.5 text-[10px] font-bold text-[#656B4F]">{order.status}</p></div>
                    </Link>
                  ))}
                </div>
              ) : <div className="rounded-2xl border border-dashed border-[#ced9c8] bg-white px-5 py-8 text-center"><Package className="mx-auto h-7 w-7 text-[#789071]" /><p className="mt-2 text-sm font-bold">No orders yet</p><Link href="/shop" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#656B4F]">Browse products<ArrowRight className="h-4 w-4" /></Link></div>}
            </section>
          </>
        ) : (
          <section className="rounded-3xl border border-[#e1e9dd] bg-white px-5 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4e9] text-[#656B4F]"><UserRound className="h-7 w-7" /></div>
            <h2 className="mt-4 text-xl font-black text-[#50563D]">Sign in to your account</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#687263]">View your account details and track orders after signing in.</p>
            <Link href="/login" className="mx-auto mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173425] px-5 text-sm font-bold text-white"><LogIn className="h-4 w-4" />Sign in / Create account</Link>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
