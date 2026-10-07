'use client';

import React from 'react';
import { Star, ExternalLink, ShieldCheck, Info } from 'lucide-react';

export const GOOGLE_MAPS_REVIEW_URL =
  'https://g.page/r/CdXIyhvyDoQ6EBM/review';

export const GOOGLE_RATING = 4.9;
export const GOOGLE_REVIEW_COUNT = 33;

export function GoogleGIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12c0 2.06.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

interface GoogleReviewSummaryProps {
  variant?: 'card' | 'dark' | 'compact' | 'hero-badge';
  className?: string;
}

export default function GoogleReviewSummary({
  variant = 'card',
  className = '',
}: GoogleReviewSummaryProps) {
  // Hero Pill Badge
  if (variant === 'hero-badge') {
    return (
      <a
        href={GOOGLE_MAPS_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View Google Rating: 4.9 out of 5 stars based on 33 reviews"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-[#50563D]/25 shadow-2xs hover:shadow-md hover:border-[#50563D]/60 hover:scale-[1.02] transition-all group ${className}`}
      >
        <GoogleGIcon className="w-4 h-4 shrink-0" />
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-[#2C382A]">4.9</span>
          <div className="flex items-center text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[11px] text-[#656B4F] font-semibold">
            (33 Google Reviews)
          </span>
        </div>
        <ExternalLink className="w-3 h-3 text-[#656B4F] group-hover:text-[#2C382A] group-hover:translate-x-0.5 transition-all" />
      </a>
    );
  }

  // Compact Badge for Footers & Sidebars
  if (variant === 'compact') {
    return (
      <div
        className={`rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 p-3.5 text-white shadow-sm flex flex-col gap-2.5 ${className}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-1 shadow-2xs">
              <GoogleGIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#A9F2B7] block leading-tight">
                Google Reviews
              </span>
              <span className="text-[9px] text-white/70 block leading-tight">
                mock meat &amp; frozen foods supplier
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full">
            <span className="text-xs font-black text-amber-300">4.9</span>
            <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
          </div>
        </div>

        <a
          href={GOOGLE_MAPS_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-[#1E201D] text-xs font-extrabold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <GoogleGIcon className="w-3.5 h-3.5" />
          <span>Read 33 Reviews &amp; Add Yours</span>
          <ExternalLink className="w-3 h-3 text-[#656B4F]" />
        </a>
      </div>
    );
  }

  // Dark High-Fidelity UI matching Google Maps Card Screenshot
  if (variant === 'dark') {
    return (
      <div
        className={`rounded-2xl sm:rounded-3xl bg-[#202124] text-[#E8EAED] p-5 sm:p-6 border border-[#3C4043] shadow-lg ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3C4043]/60 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1">
              <GoogleGIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                Reviews
              </h3>
              <p className="text-[11px] text-[#9AA0A6] leading-tight">
                mock meat &amp; frozen foods supplier
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#303134] text-[10px] text-[#9AA0A6]">
            <ShieldCheck className="w-3 h-3 text-[#8AB4F8]" />
            <span>Verified Google</span>
          </div>
        </div>

        {/* Google review summary Title */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs sm:text-sm font-semibold text-[#E8EAED] flex items-center gap-1.5">
            <span>Google review summary</span>
            <Info className="w-3.5 h-3.5 text-[#9AA0A6]" />
          </h4>
        </div>

        {/* Rating Bars & Big Score */}
        <div className="grid grid-cols-12 gap-3 items-center mb-5">
          {/* Distribution Bars (Col 7) */}
          <div className="col-span-7 space-y-1.5">
            {/* 5 Stars */}
            <div className="flex items-center gap-2 text-[11px] text-[#9AA0A6]">
              <span className="w-2.5 font-bold">5</span>
              <div className="flex-1 h-2 rounded-full bg-[#3C4043] overflow-hidden">
                <div className="h-full bg-[#FABB05] rounded-full w-[94%]" />
              </div>
            </div>
            {/* 4 Stars */}
            <div className="flex items-center gap-2 text-[11px] text-[#9AA0A6]">
              <span className="w-2.5 font-bold">4</span>
              <div className="flex-1 h-2 rounded-full bg-[#3C4043] overflow-hidden">
                <div className="h-full bg-[#FABB05] rounded-full w-[12%]" />
              </div>
            </div>
            {/* 3 Stars */}
            <div className="flex items-center gap-2 text-[11px] text-[#9AA0A6]">
              <span className="w-2.5 font-bold">3</span>
              <div className="flex-1 h-2 rounded-full bg-[#3C4043] overflow-hidden">
                <div className="h-full bg-[#FABB05] rounded-full w-[0%]" />
              </div>
            </div>
            {/* 2 Stars */}
            <div className="flex items-center gap-2 text-[11px] text-[#9AA0A6]">
              <span className="w-2.5 font-bold">2</span>
              <div className="flex-1 h-2 rounded-full bg-[#3C4043] overflow-hidden">
                <div className="h-full bg-[#FABB05] rounded-full w-[0%]" />
              </div>
            </div>
            {/* 1 Star */}
            <div className="flex items-center gap-2 text-[11px] text-[#9AA0A6]">
              <span className="w-2.5 font-bold">1</span>
              <div className="flex-1 h-2 rounded-full bg-[#3C4043] overflow-hidden">
                <div className="h-full bg-[#FABB05] rounded-full w-[0%]" />
              </div>
            </div>
          </div>

          {/* Big Score (Col 5) */}
          <div className="col-span-5 flex flex-col items-center justify-center text-center pl-2 border-l border-[#3C4043]/60">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
              4.9
            </span>
            <div className="flex items-center text-[#FABB05] mt-1 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-[#FABB05] text-[#FABB05]" />
              ))}
            </div>
            <span className="text-[11px] text-[#9AA0A6] font-medium mt-1">
              (33)
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-1">
          <a
            href={GOOGLE_MAPS_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-[#8AB4F8] hover:bg-[#AECBFA] text-[#202124] font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.02]"
          >
            <GoogleGIcon className="w-4 h-4" />
            <span>Add Your Review on Google</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Standard Light / Theme Card (Default for Loved by Customers section)
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl bg-white text-[#1E201D] p-4 sm:p-5 border border-stone-200/90 shadow-2xs relative overflow-hidden flex flex-col justify-between gap-3.5 ${className}`}
    >
      {/* Header with Google Logo, Score, Stars & Verified Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8F9FA] border border-stone-200 flex items-center justify-center p-2 shadow-2xs shrink-0">
            <GoogleGIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-[#2C382A] leading-tight">
              Google Customer Reviews
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs sm:text-sm font-black text-[#2C382A]">4.9</span>
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[11px] text-[#656B4F] font-bold">
                (33 Reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF0E5] text-[#50563D] text-[10.5px] font-extrabold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#50563D]" />
          <span>Verified 4.9 ★</span>
        </div>
      </div>

      {/* Direct Action Button */}
      <a
        href={GOOGLE_MAPS_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 px-4 rounded-xl bg-[#50563D] hover:bg-[#3D422E] text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xs hover:scale-[1.01] active:scale-[0.98]"
      >
        <GoogleGIcon className="w-4 h-4 bg-white rounded-full p-0.5" />
        <span>Add Your Review on Google</span>
        <ExternalLink className="w-3.5 h-3.5 text-white/80" />
      </a>
    </div>
  );
}
