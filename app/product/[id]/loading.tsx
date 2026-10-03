import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
      <Navbar />
      <main className="site-shell py-8 flex-1 animate-pulse space-y-6">
        <div className="h-4 bg-stone-200 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 aspect-square bg-stone-200 rounded-3xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-200 rounded w-1/2" />
            <div className="h-10 bg-stone-200 rounded-2xl w-1/3" />
            <div className="h-24 bg-stone-200 rounded-2xl w-full" />
            <div className="h-12 bg-stone-200 rounded-2xl w-full" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
