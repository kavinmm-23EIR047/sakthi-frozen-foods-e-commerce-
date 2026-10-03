import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#1E201D] flex flex-col font-sans">
      <Navbar />
      <main className="site-shell py-8 flex-1 animate-pulse space-y-6 max-w-2xl mx-auto w-full">
        <div className="h-8 bg-stone-200 rounded w-1/3" />
        <div className="bg-white p-6 rounded-3xl border border-stone-200/60 space-y-4">
          <div className="h-10 bg-stone-200 rounded-xl" />
          <div className="h-10 bg-stone-200 rounded-xl" />
          <div className="h-10 bg-stone-200 rounded-xl" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
