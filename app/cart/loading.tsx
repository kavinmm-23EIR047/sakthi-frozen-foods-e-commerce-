import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-[#F3FBEE] text-[#1E201D] flex flex-col font-sans">
      <Navbar />
      <main className="mx-auto w-full max-w-[1320px] px-3 py-5 sm:px-5 sm:py-8 flex-1 animate-pulse space-y-6">
        <div className="h-6 bg-stone-200 rounded w-36" />
        <div className="bg-white rounded-3xl p-6 border border-stone-200/60 shadow-sm space-y-4">
          <div className="h-8 bg-stone-200 rounded w-48" />
          <div className="h-20 bg-stone-200 rounded-xl w-full" />
          <div className="h-20 bg-stone-200 rounded-xl w-full" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
