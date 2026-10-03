import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
      <Navbar />
      <main className="site-shell py-8 flex-1 animate-pulse space-y-4 max-w-4xl mx-auto w-full">
        <div className="h-8 bg-stone-200 rounded w-1/3" />
        <div className="h-4 bg-stone-200 rounded w-1/2 mb-6" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="p-5 rounded-2xl bg-white border border-stone-200/60 shadow-xs space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-stone-200 rounded w-1/4" />
              <div className="h-4 bg-stone-200 rounded w-16" />
            </div>
            <div className="h-12 bg-stone-200 rounded-xl" />
          </div>
        ))}
      </main>
      <Footer />
    </div>
  );
}
