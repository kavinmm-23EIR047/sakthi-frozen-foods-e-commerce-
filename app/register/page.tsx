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
  ArrowLeft,
  Home,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const targetRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = formData.phone.replace(/\D/g, '').replace(/^91/, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          phone: cleanPhone,
        }),
      });

      if (res.success && res.data) {
        if (login) {
          login(res.data);
        }
        router.replace(targetRedirect);
      } else {
        setError(res.message || 'Failed to create account. Please check your details.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF4E8] via-[#E4EDE0] to-[#E9F1E5] flex items-center justify-center p-3 sm:p-5 lg:p-8 font-sans selection:bg-[#4E553B] selection:text-white relative overflow-hidden">
      
      {/* Floating Back to Home Navigation Button on Right Side */}
      <Link
        href="/"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-[#4E553B] text-xs font-bold shadow-md border border-[#DCE4D4] backdrop-blur-md transition-all active:scale-95 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Home</span>
      </Link>
      
      {/* Outer Decorative Leaf Shapes */}
      <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none opacity-40">
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M-50 150 C 50 80, 120 0, 200 -50 C 150 100, 80 180, -50 150 Z" fill="#D6E5CE" />
          <path d="M0 220 C 100 150, 160 80, 260 20" stroke="#C4D7B9" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none opacity-50">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M450 200 C 350 260, 260 350, 200 450 C 320 400, 390 320, 450 200 Z" fill="#D2E3C9" />
          <path d="M220 420 C 280 320, 360 240, 440 180" stroke="#B8CCA9" strokeWidth="1.5" strokeDasharray="5 5" />
          <path d="M300 420 Q 380 330, 440 250" stroke="#A7BE99" strokeWidth="1.2" />
        </svg>
      </div>

      {/* Main Split Card */}
      <div className="w-full max-w-[1180px] relative z-10">
        <div className="bg-white rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] shadow-[0_25px_80px_-20px_rgba(50,60,40,0.18)] border border-[#DCE4D4]/80 overflow-hidden flex flex-col lg:flex-row">

          {/* ─── Left Panel: Organic Wave S-Curve Background with Botanical Leaf Art ─── */}
          <div className="relative w-full lg:w-[48%] xl:w-[47%] min-h-[360px] sm:min-h-[440px] lg:min-h-[720px] flex flex-col justify-between p-5 sm:p-7 lg:p-10 z-10 overflow-hidden text-white">

            {/* Desktop Organic S-Curve Wave Background with Botanical Art */}
            <svg
              className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 520 720"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="regDesktopWaveGrad" x1="0" y1="0" x2="520" y2="720" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#50573D" />
                  <stop offset="50%" stopColor="#464D33" />
                  <stop offset="100%" stopColor="#373D26" />
                </linearGradient>
              </defs>

              {/* Precise Organic S-Wave Body */}
              <path
                d="M 0 0 L 470 0 C 470 90, 365 140, 355 240 C 345 345, 485 395, 500 515 C 510 605, 475 675, 430 720 L 0 720 Z"
                fill="url(#regDesktopWaveGrad)"
              />

              {/* Soft Lighter Green Botanical Patch behind Leaf */}
              <path
                d="M 40 720 C 30 630, 95 560, 180 560 C 235 610, 225 675, 195 720 Z"
                fill="#6E7D52"
                fillOpacity="0.45"
              />

              {/* Botanical Line-Art Leaves at Bottom */}
              <path
                d="M 85 720 C 65 655, 70 580, 120 535 C 145 580, 140 655, 115 720"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.85"
              />
              <path
                d="M 100 720 C 95 650, 103 590, 120 535"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />

              <path
                d="M 115 720 C 130 660, 170 610, 215 585 C 205 640, 170 685, 135 720"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.85"
              />
              <path
                d="M 125 720 C 145 665, 175 630, 215 585"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />

              {/* Orbital Dashed Curves */}
              <path
                d="M -30 180 C 130 60, 310 90, 460 220"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.3"
                strokeDasharray="4 6"
              />
              <path
                d="M -40 400 C 160 260, 350 370, 500 230"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.3"
                strokeDasharray="5 7"
              />
              <path
                d="M 50 610 C 200 530, 370 640, 500 540"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1.3"
                strokeDasharray="4 6"
              />

              {/* Constellation Glow Dots */}
              <circle cx="85" cy="180" r="3.5" fill="white" opacity="0.85" />
              <circle cx="210" cy="95" r="2.5" fill="white" opacity="0.75" />
              <circle cx="430" cy="190" r="3" fill="white" opacity="0.8" />
              <circle cx="45" cy="380" r="2" fill="white" opacity="0.65" />
              <circle cx="465" cy="360" r="3.5" fill="white" opacity="0.85" />
              <circle cx="380" cy="500" r="3" fill="white" opacity="0.8" />
              <circle cx="270" cy="610" r="2.5" fill="white" opacity="0.75" />
            </svg>

            {/* Mobile / Tablet Organic Wave Background */}
            <svg
              className="lg:hidden absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 420"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="regMobileWaveGrad" x1="0" y1="0" x2="400" y2="420" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#50573D" />
                  <stop offset="50%" stopColor="#464D33" />
                  <stop offset="100%" stopColor="#373D26" />
                </linearGradient>
              </defs>

              {/* Organic Curved Bottom */}
              <path
                d="M 0 0 L 400 0 L 400 365 C 340 405, 230 425, 150 400 C 80 380, 40 395, 0 375 Z"
                fill="url(#regMobileWaveGrad)"
              />

              {/* Botanical Line Art on Mobile Bottom */}
              <path
                d="M 310 420 C 300 370, 320 330, 355 300 C 365 335, 355 385, 335 420"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />
              <path
                d="M 320 420 C 325 375, 335 340, 355 300"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />

              {/* Orbital Dashed Curves */}
              <path
                d="M -20 140 C 90 60, 240 80, 380 160"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
              />
              <circle cx="70" cy="135" r="3" fill="white" opacity="0.8" />
              <circle cx="340" cy="150" r="3" fill="white" opacity="0.8" />
            </svg>

            {/* Top Brand / Logo */}
            <div className="relative z-10 mb-2 sm:mb-4 lg:mb-6">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-2xl flex items-center justify-center shadow-md p-1.5 transition-transform group-hover:scale-105">
                  <Image src={logo} alt="Sakthi Frozen Foods" fill className="object-contain p-1" priority />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black tracking-tight block leading-tight text-white">
                    MOCK MEAT
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-white/70 uppercase block">
                    SAKTHI FROZEN FOODS
                  </span>
                </div>
              </Link>
            </div>

            {/* Center Food Dishes Collage */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-2 sm:my-3 lg:my-6">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:gap-4 w-full max-w-[270px] sm:max-w-[330px] lg:max-w-[380px]">
                {/* Column 1 */}
                <div className="space-y-2.5 sm:space-y-3.5 lg:space-y-4">
                  {/* Top-Left: Fries with Dips */}
                  <div className="aspect-[1.05/1] rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden shadow-xl border-2 border-white/25 relative group bg-[#3B4228]">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789200235/sakthi-frozen-foods/products/kth5umi9goth7ysb8bef.webp"
                      alt="Crispy French Fries & Dips"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Bottom-Left: Sliced Roast / Cutlet */}
                  <div className="aspect-[1.3/1] rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden shadow-xl border-2 border-white/25 relative group bg-[#3B4228]">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789111701/sakthi-frozen-foods/products/dplxqn7yetyl4pzpvzie.webp"
                      alt="Savory Plant-based Cutlets"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-2.5 sm:space-y-3.5 lg:space-y-4 pt-4 sm:pt-6 lg:pt-8">
                  {/* Top-Right: Spiced Meatballs */}
                  <div className="aspect-[1.3/1] rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden shadow-xl border-2 border-white/25 relative group bg-[#3B4228]">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789109104/sakthi-frozen-foods/products/agmpachausl3cvtlzgnt.webp"
                      alt="Spiced Mock Meatballs"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Bottom-Right: Crispy Nuggets / Tenders */}
                  <div className="aspect-[1.05/1] rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden shadow-xl border-2 border-white/25 relative group bg-[#3B4228]">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789111892/sakthi-frozen-foods/products/mucozhoq31dby2awvkow.webp"
                      alt="Golden Crispy Tenders"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tagline with elegant underline */}
            <div className="relative z-10 mt-3 sm:mt-4 lg:mt-6 text-center lg:text-left">
              <p className="text-xs sm:text-sm lg:text-[15px] font-medium italic text-white/90 tracking-wide">
                <span className="relative inline-block pb-0.5 border-b-2 border-white/50">
                  &ldquo;Good Food,
                </span>{' '}
                Greener Tomorrow&rdquo;
              </p>
            </div>
          </div>

          {/* ─── Right Panel: Clean Register Form ─── */}
          <div className="w-full lg:w-[52%] xl:w-[53%] bg-white p-6 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-center">
            <div className="max-w-[420px] mx-auto w-full">

              {/* Tab Switcher */}
              <div className="flex items-center justify-center lg:justify-start mb-5 sm:mb-6">
                <div className="inline-flex items-center p-1 bg-[#EEF2E8] rounded-full">
                  <Link
                    href={targetRedirect !== '/' ? `/login?redirect=${encodeURIComponent(targetRedirect)}` : '/login'}
                    className="px-6 sm:px-7 py-2 rounded-full text-stone-500 hover:text-stone-900 text-xs sm:text-sm font-bold transition-colors"
                  >
                    Sign In
                  </Link>
                  <span className="px-6 sm:px-7 py-2 rounded-full bg-[#4E553B] text-white text-xs sm:text-sm font-bold shadow-sm">
                    Register
                  </span>
                </div>
              </div>

              {/* Header */}
              <div className="mb-5 sm:mb-6 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1E2218] tracking-tight leading-tight">
                  Create Account
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
                  Join to start ordering fresh mock meats today.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-200 text-red-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-3.5 sm:space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-stone-800 uppercase tracking-wider mb-1.5">
                    FULL NAME <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                      <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-2xl bg-[#EDF2FE] hover:bg-[#E7EEFC] focus:bg-white border border-[#DFE7F8] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E553B]/25 focus:border-[#4E553B] transition-all placeholder:text-stone-400 disabled:opacity-60"
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-extrabold text-stone-800 uppercase tracking-wider mb-1.5">
                    EMAIL ADDRESS <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 rounded-2xl bg-[#EDF2FE] hover:bg-[#E7EEFC] focus:bg-white border border-[#DFE7F8] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E553B]/25 focus:border-[#4E553B] transition-all placeholder:text-stone-400 disabled:opacity-60"
                      placeholder="Enter your email address"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Mobile & Password Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Mobile Number */}
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-extrabold text-stone-800 uppercase tracking-wider mb-1.5">
                      MOBILE <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none gap-1.5 text-stone-500">
                        <Phone className="h-4 w-4" />
                        <span className="text-[11px] font-bold text-stone-700 border-r border-stone-300 pr-2">+91</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, phone: onlyNums });
                        }}
                        required
                        disabled={loading}
                        className="w-full pl-[4.5rem] pr-3 py-3 sm:py-3.5 rounded-2xl bg-[#EDF2FE] hover:bg-[#E7EEFC] focus:bg-white border border-[#DFE7F8] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E553B]/25 focus:border-[#4E553B] transition-all placeholder:text-stone-400 disabled:opacity-60 tracking-wider"
                        placeholder="Enter your mobile number"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-extrabold text-stone-800 uppercase tracking-wider mb-1.5">
                      PASSWORD <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full pl-10 pr-11 py-3 sm:py-3.5 rounded-2xl bg-[#EDF2FE] hover:bg-[#E7EEFC] focus:bg-white border border-[#DFE7F8] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E553B]/25 focus:border-[#4E553B] transition-all placeholder:text-stone-400 disabled:opacity-60"
                        placeholder="Enter your password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 sm:py-4 bg-[#4E553B] hover:bg-[#40472F] active:bg-[#383E28] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4E553B]/20 hover:shadow-xl hover:shadow-[#4E553B]/30 transition-all active:scale-[0.98] disabled:opacity-75 cursor-pointer mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:h-5 sm:w-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Link */}
              <div className="mt-5 sm:mt-6 text-center pt-3.5 sm:pt-4 border-t border-stone-100 space-y-3">
                <p className="text-xs sm:text-sm text-stone-500 font-medium">
                  Already registered?{' '}
                  <Link
                    href={targetRedirect !== '/' ? `/login?redirect=${encodeURIComponent(targetRedirect)}` : '/login'}
                    className="text-stone-900 font-extrabold hover:text-[#4E553B] hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
                <div>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#4E553B] transition-colors"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Return to Store Home</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EEF4E8] flex items-center justify-center p-4">
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
      <RegisterForm />
    </Suspense>
  );
}