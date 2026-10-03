'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/apiConfig';
import Link from 'next/link';
import Image from 'next/image';
const logo = '/logo.png';
import {
  ArrowRight,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const targetRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/';

  const isNumericOnly = /^\d+$/.test(identifier.trim().replace(/\+91|\s/g, ''));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanInput = identifier.trim();
    if (!cleanInput) {
      setError('Please enter your mobile number or email address');
      return;
    }

    setLoading(true);

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: cleanInput, password }),
      });

      if (res.success && res.data) {
        login(res.data);
        const destination = res.data.role === 'Admin' ? '/admin' : targetRedirect;
        router.replace(destination);
      } else {
        setError(res.message || 'Invalid mobile number/email or password');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8F0] via-[#EBF2E4] to-[#F0F5EB] flex items-center justify-center p-3 sm:p-5 lg:p-8 font-sans selection:bg-[#50563D] selection:text-white relative overflow-hidden">

      {/* Main Card */}
      <div className="w-full max-w-[1200px] relative z-10">
        <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-[0_25px_80px_-20px_rgba(80,86,61,0.18)] border border-stone-200/70 overflow-hidden flex flex-col lg:flex-row">

          {/* ─── Left Panel: Custom Curve & Image Collage ─── */}
          <div className="relative w-full lg:w-1/2 bg-gradient-to-br from-[#50563D] via-[#474D36] to-[#383D2A] text-white p-5 sm:p-8 lg:p-12 flex flex-col justify-between overflow-hidden min-h-[220px] lg:min-h-[700px] rounded-b-[60px] lg:rounded-b-none lg:rounded-r-[150px]">

            {/* Decorative Background SVG Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <svg className="w-full h-full" viewBox="0 0 500 700" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-50 100 Q 200 50, 400 200 T 600 500" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M100 600 Q 300 700, 500 500" stroke="white" strokeWidth="1" />
                <circle cx="150" cy="150" r="4" fill="white" />
                <circle cx="400" cy="500" r="3" fill="white" />
                <circle cx="50" cy="500" r="2" fill="white" />
                <path d="M 400 100 C 420 120, 450 100, 480 130" stroke="#86EFAC" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Logo & Brand - Top */}
            <div className="relative z-10 mb-4 lg:mb-8">
              <Link href="/" className="flex items-center gap-2.5 lg:gap-3">
                <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg p-1.5">
                  <Image src={logo} alt="Sakthi Frozen Foods" fill className="object-contain" priority />
                </div>
                <div>
                  <span className="text-sm lg:text-base font-black tracking-tight block leading-tight">MOCK MEAT</span>
                  <span className="text-[9px] lg:text-[10px] font-bold tracking-widest text-white/60 uppercase block">SAKTHI FROZEN FOODS</span>
                </div>
              </Link>
            </div>

            {/* Image Collage - Center (Shortened on Mobile) */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-4 lg:my-6">
              <div className="grid grid-cols-2 gap-2 lg:gap-5 w-full max-w-[180px] sm:max-w-[280px] lg:max-w-md">
                <div className="space-y-2 lg:space-y-5">
                  <div className="aspect-square rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/20 rotate-3 relative group">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789200235/sakthi-frozen-foods/products/kth5umi9goth7ysb8bef.webp"
                      alt="Mock Meat Product"
                      className="w-full h-full object-cover opacity-90 brightness-95 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <div className="aspect-[4/3] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/20 -rotate-2 relative group">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789109104/sakthi-frozen-foods/products/agmpachausl3cvtlzgnt.webp"
                      alt="Mock Meat Product"
                      className="w-full h-full object-cover opacity-90 brightness-95 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                </div>
                <div className="space-y-2 lg:space-y-5 pt-6 lg:pt-12">
                  <div className="aspect-[4/3] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/20 -rotate-3 relative group">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789111701/sakthi-frozen-foods/products/dplxqn7yetyl4pzpvzie.webp"
                      alt="Mock Meat Product"
                      className="w-full h-full object-cover opacity-90 brightness-95 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <div className="aspect-square rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/20 rotate-2 relative group">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789111892/sakthi-frozen-foods/products/mucozhoq31dby2awvkow.webp"
                      alt="Mock Meat Product"
                      className="w-full h-full object-cover opacity-90 brightness-95 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tagline - Bottom */}
            <div className="relative z-10 mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-white/10">
              <p className="text-xs lg:text-base font-black italic text-white/30 tracking-wide text-center lg:text-left">
                &ldquo;Good Food, Greener Tomorrow&rdquo;
              </p>
            </div>
          </div>

          {/* ─── Right Panel: Compact Login Form ─── */}
          <div className="w-full lg:w-1/2 bg-white p-6 sm:p-10 lg:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">

              {/* Tab Switcher */}
              <div className="flex items-center justify-center lg:justify-start mb-6 lg:mb-8">
                <div className="inline-flex items-center p-1 bg-stone-100 rounded-full">
                  <span className="px-6 py-2.5 rounded-full bg-[#50563D] text-white text-xs font-bold shadow-sm">
                    Sign In
                  </span>
                  <Link
                    href={targetRedirect !== '/' ? `/register?redirect=${encodeURIComponent(targetRedirect)}` : '/register'}
                    className="px-6 py-2.5 rounded-full text-stone-500 hover:text-stone-800 text-xs font-bold transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </div>

              {/* Welcome Header */}
              <div className="mb-6 lg:mb-8 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-stone-900 tracking-tight leading-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
                  Sign in to manage your orders and track deliveries.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-200 text-red-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4 lg:space-y-5">
                {/* Email / Mobile Input */}
                <div>
                  <label className="block text-[10px] lg:text-[11px] font-extrabold text-[#50563D] uppercase tracking-wider mb-2">
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                      {isNumericOnly && identifier.trim().length > 0 ? (
                        <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-[#50563D]" />
                      ) : (
                        <Mail className="h-4 w-4 lg:h-5 lg:w-5" />
                      )}
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full pl-11 lg:pl-12 pr-4 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 text-xs lg:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#50563D]/40 focus:border-[#50563D] transition-all placeholder:text-stone-400 disabled:opacity-60"
                      placeholder="kavinmm200@gmail.com"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] lg:text-[11px] font-extrabold text-[#50563D] uppercase tracking-wider">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-[10px] lg:text-[11px] font-bold text-[#50563D] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                      <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full pl-11 lg:pl-12 pr-12 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 text-xs lg:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#50563D]/40 focus:border-[#50563D] transition-all placeholder:text-stone-400 disabled:opacity-60"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-stone-400 hover:text-[#50563D] transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Eye className="h-4 w-4 lg:h-5 lg:w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 lg:py-4 bg-gradient-to-r from-[#4A7C59] to-[#3D6B4A] hover:from-[#3D6B4A] hover:to-[#2F5A3C] text-white font-black rounded-xl lg:rounded-2xl text-xs lg:text-sm flex items-center justify-center gap-3 shadow-lg shadow-[#4A7C59]/25 hover:shadow-xl hover:shadow-[#4A7C59]/30 transition-all active:scale-[0.98] disabled:opacity-75 cursor-pointer mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Link */}
              <div className="mt-6 lg:mt-8 text-center pt-4 lg:pt-6 border-t border-stone-100">
                <p className="text-xs lg:text-sm text-stone-500 font-medium">
                  New to Sakthi Foods?{' '}
                  <Link
                    href={targetRedirect !== '/' ? `/register?redirect=${encodeURIComponent(targetRedirect)}` : '/register'}
                    className="text-[#50563D] font-black hover:underline"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F8F0] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-stone-200/60 animate-pulse space-y-4">
            <div className="h-8 bg-stone-200 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-stone-200 rounded w-1/3 mx-auto" />
            <div className="h-12 bg-stone-200 rounded-2xl" />
            <div className="h-12 bg-stone-200 rounded-2xl" />
            <div className="h-12 bg-stone-200 rounded-2xl" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}