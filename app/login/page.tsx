'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/apiConfig';
import Link from 'next/link';
import Image from 'next/image';
const logo = '/logo.png';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import PhonePromptModal from '@/components/PhonePromptModal';
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [authToken, setAuthToken] = useState<string>('');
  const authTokenRef = useRef<string>('');
  const [pendingDestination, setPendingDestination] = useState<string>('');

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const targetRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/';

  // Timer for OTP resend countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetchApi('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (res.success) {
        setStep('otp');
        setCountdown(30);
        setSuccessMsg(`Verification code sent to ${cleanEmail}`);
      } else {
        setError(res.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Log In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit code sent to your email.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetchApi('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: cleanOtp }),
      });

      if (res.success && res.data) {
        if (res.data.token) {
          authTokenRef.current = res.data.token;
          setAuthToken(res.data.token);
        }
        login(res.data);
        const destination = res.data.role === 'Admin' ? '/admin' : targetRedirect;

        // If user doesn't have a phone number, ask for it
        if (!res.data.phone) {
          setPendingDestination(destination);
          setShowPhoneModal(true);
        } else {
          router.replace(destination);
        }
      } else {
        setError(res.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF4E8] via-[#E4EDE0] to-[#E9F1E5] flex items-center justify-center p-3 sm:p-5 lg:p-8 font-sans selection:bg-[#4E553B] selection:text-white relative overflow-hidden">
      
      {/* Floating Back to Home Navigation Button on Right Side */}
      <Link
        href="/"
        prefetch={true}
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

          {/* ─── Left Panel: Organic Wave Background with Botanical Leaf Art ─── */}
          <div className="relative w-full lg:w-[48%] xl:w-[47%] min-h-[360px] sm:min-h-[440px] lg:min-h-[690px] flex flex-col justify-between p-5 sm:p-7 lg:p-10 z-10 overflow-hidden text-white">

            {/* Desktop Organic S-Curve Wave Background with Botanical Art */}
            <svg
              className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 520 720"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="desktopWaveGrad" x1="0" y1="0" x2="520" y2="720" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#50573D" />
                  <stop offset="50%" stopColor="#464D33" />
                  <stop offset="100%" stopColor="#373D26" />
                </linearGradient>
              </defs>

              <path
                d="M 0 0 L 470 0 C 470 90, 365 140, 355 240 C 345 345, 485 395, 500 515 C 510 605, 475 675, 430 720 L 0 720 Z"
                fill="url(#desktopWaveGrad)"
              />

              <path
                d="M 40 720 C 30 630, 95 560, 180 560 C 235 610, 225 675, 195 720 Z"
                fill="#6E7D52"
                fillOpacity="0.45"
              />

              <path
                d="M 85 720 C 65 655, 70 580, 120 535 C 145 580, 140 655, 115 720"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />
            </svg>

            {/* Mobile / Tablet Organic Wave Background */}
            <svg
              className="lg:hidden absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 480"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mobileWaveGrad" x1="0" y1="0" x2="400" y2="480" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#50573D" />
                  <stop offset="70%" stopColor="#464D33" />
                  <stop offset="100%" stopColor="#373D26" />
                </linearGradient>
              </defs>
              <path
                d="M 0 0 L 400 0 L 400 420 C 300 460, 200 400, 100 440 C 50 460, 20 475, 0 480 Z"
                fill="url(#mobileWaveGrad)"
              />
            </svg>

            {/* Top Brand / Logo */}
            <div className="relative z-10 mb-2 sm:mb-4 lg:mb-6">
              <Link href="/" prefetch={true} className="inline-flex items-center gap-3 group">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-2xl flex items-center justify-center shadow-md p-1.5 transition-transform group-hover:scale-105">
                  <Image src={logo} alt="Sakthi Frozen Foods" fill className="object-contain p-1" priority />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-black tracking-tight block leading-tight text-white">
                    MOCK MEAT &amp; FROZEN FOODS
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
                <div className="space-y-2.5 sm:space-y-3.5 lg:space-y-4">
                  <div className="aspect-[1.05/1] rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden shadow-xl border-2 border-white/25 relative group bg-[#3B4228]">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789200235/sakthi-frozen-foods/products/kth5umi9goth7ysb8bef.webp"
                      alt="Crispy French Fries"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="aspect-[1.3/1] rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden shadow-xl border-2 border-white/25 relative group bg-[#3B4228]">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789111701/sakthi-frozen-foods/products/dplxqn7yetyl4pzpvzie.webp"
                      alt="Savory Plant-based Cutlets"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3.5 lg:space-y-4 pt-4 sm:pt-6 lg:pt-8">
                  <div className="aspect-[1.3/1] rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden shadow-xl border-2 border-white/25 relative group bg-[#3B4228]">
                    <img
                      src="https://res.cloudinary.com/q4rjd6rf/image/upload/v1789109104/sakthi-frozen-foods/products/agmpachausl3cvtlzgnt.webp"
                      alt="Spiced Mock Meatballs"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
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

            {/* Bottom Tagline */}
            <div className="relative z-10 mt-3 sm:mt-4 lg:mt-6 text-center lg:text-left">
              <p className="text-xs sm:text-sm lg:text-[15px] font-medium italic text-white/90 tracking-wide">
                <span className="relative inline-block pb-0.5 border-b-2 border-white/50">
                  &ldquo;Good Food,
                </span>{' '}
                Greener Tomorrow&rdquo;
              </p>
            </div>
          </div>

          {/* ─── Right Panel: Clean Form Area (Passwordless OTP) ─── */}
          <div className="w-full lg:w-[52%] xl:w-[53%] bg-white p-6 sm:p-10 lg:p-12 xl:p-16 flex flex-col justify-center">
            <div className="max-w-[400px] mx-auto w-full">

              {/* Tab Switcher */}
              <div className="flex items-center justify-center lg:justify-start mb-6 sm:mb-8">
                <div className="inline-flex items-center p-1 bg-[#EEF2E8] rounded-full">
                  <span className="px-6 sm:px-7 py-2 rounded-full bg-[#4E553B] text-white text-xs sm:text-sm font-bold shadow-sm">
                    Sign In
                  </span>
                  <Link
                    href={targetRedirect !== '/' ? `/register?redirect=${encodeURIComponent(targetRedirect)}` : '/register'}
                    prefetch={true}
                    className="px-6 sm:px-7 py-2 rounded-full text-stone-500 hover:text-stone-900 text-xs sm:text-sm font-bold transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </div>

              {/* Welcome Header */}
              <div className="mb-6 sm:mb-8 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1E2218] tracking-tight leading-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
                  Sign in with 1-click Google or a fast email verification code. No password required.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-200 text-red-800 text-xs font-semibold animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="mb-5 p-3.5 bg-green-50 rounded-2xl flex items-start gap-3 border border-green-200 text-green-800 text-xs font-semibold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{successMsg}</span>
                </div>
              )}

              {/* Fast 1-Click Google Sign In (Placed at Top) */}
              <div className="mb-5 sm:mb-6">
                <GoogleAuthButton
                  redirectUrl={targetRedirect}
                  onError={(err) => setError(err)}
                  onLoadingChange={(v) => setGoogleLoading(v)}
                  disabled={loading || googleLoading}
                />

                <div className="relative my-4 sm:my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-stone-400 font-extrabold tracking-wider uppercase text-[10px] sm:text-[11px]">
                      Or sign in with email OTP
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── Passwordless OTP Form ─── */}
              {step === 'email' ? (
                /* Step 1: Enter Email */
                <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-extrabold text-stone-800 uppercase tracking-wider mb-2">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading || googleLoading}
                        className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl bg-[#EDF2FE] hover:bg-[#E7EEFC] focus:bg-white border border-[#DFE7F8] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E553B]/25 focus:border-[#4E553B] transition-all placeholder:text-stone-400 disabled:opacity-60"
                        placeholder="Enter your email address"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || googleLoading || !email.trim()}
                    className="w-full py-3.5 sm:py-4 bg-[#4E553B] hover:bg-[#40472F] active:bg-[#383E28] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4E553B]/20 hover:shadow-xl hover:shadow-[#4E553B]/30 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Login Code</span>
                        <ArrowRight className="w-4 h-4 sm:h-5 sm:w-5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-Digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] sm:text-[11px] font-extrabold text-stone-800 uppercase tracking-wider">
                        6-DIGIT VERIFICATION CODE
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email');
                          setError('');
                        }}
                        className="text-xs font-bold text-[#4E553B] hover:underline"
                      >
                        Change email
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                        <KeyRound className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        disabled={loading || googleLoading}
                        className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl bg-[#EDF2FE] hover:bg-[#E7EEFC] focus:bg-white border border-[#DFE7F8] text-sm sm:text-base font-bold text-stone-900 tracking-[6px] focus:outline-none focus:ring-2 focus:ring-[#4E553B]/25 focus:border-[#4E553B] transition-all placeholder:text-stone-400 placeholder:tracking-normal disabled:opacity-60"
                        placeholder="123456"
                        autoComplete="one-time-code"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1.5 pl-1">
                      Check your inbox or spam folder for code sent to <strong className="text-stone-700">{email}</strong>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || googleLoading || otp.length !== 6}
                    className="w-full py-3.5 sm:py-4 bg-[#4E553B] hover:bg-[#40472F] active:bg-[#383E28] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4E553B]/20 hover:shadow-xl hover:shadow-[#4E553B]/30 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Sign In</span>
                        <ArrowRight className="w-4 h-4 sm:h-5 sm:w-5" />
                      </>
                    )}
                  </button>

                  {/* Resend Code Option */}
                  <div className="text-center pt-2">
                    {countdown > 0 ? (
                      <span className="text-xs text-stone-400 font-semibold">
                        Resend code in {countdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={loading}
                        className="text-xs font-bold text-[#4E553B] hover:text-[#3B4228] inline-flex items-center gap-1.5 hover:underline"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend verification code</span>
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Footer Link */}
              <div className="mt-6 sm:mt-8 text-center pt-4 sm:pt-6 border-t border-stone-100 space-y-3">
                <p className="text-xs sm:text-sm text-stone-500 font-medium">
                  New to Sakthi Foods?{' '}
                  <Link
                    href={targetRedirect !== '/' ? `/register?redirect=${encodeURIComponent(targetRedirect)}` : '/register'}
                    prefetch={true}
                    className="text-stone-900 font-extrabold hover:text-[#4E553B] hover:underline"
                  >
                    Create Account
                  </Link>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      <PhonePromptModal
        isOpen={showPhoneModal}
        tokenOverride={authTokenRef.current || authToken}
        onClose={() => {
          setShowPhoneModal(false);
          router.replace(pendingDestination || targetRedirect);
        }}
        onSuccess={() => {
          setShowPhoneModal(false);
          router.replace(pendingDestination || targetRedirect);
        }}
        title="Please Enter Your Mobile Number"
        description="Your account is verified! Please enter your 10-digit mobile number for order delivery coordination and WhatsApp status updates."
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EEF4E8] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4E553B]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
