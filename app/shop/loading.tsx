import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
      <Navbar />
      <main className="site-shell py-5 sm:py-7 lg:py-9 flex-1 animate-pulse space-y-6">
        <div className="h-28 sm:h-36 rounded-3xl bg-stone-200/70 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="rounded-2xl bg-white p-3.5 border border-stone-200/60 shadow-xs space-y-3">
              <div className="aspect-[4/3] bg-stone-200 rounded-xl" />
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
              <div className="h-9 bg-stone-200 rounded-xl" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
