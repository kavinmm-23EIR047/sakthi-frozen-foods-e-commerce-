'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/apiConfig';
const logo = '/logo.png';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

type Step = 'email' | 'otp' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ─── Step 1: Request OTP ────────────────────────────────────────────────
  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.success) {
        setMessage(res.message || 'A 6-digit OTP has been sent to your email.');
        setStep('otp');
        setResendCooldown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(res.message || 'Failed to send OTP. Please check your email address.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─── OTP Input Handler ──────────────────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
      e.preventDefault();
    }
  }

  // ─── Step 2: Verify OTP ─────────────────────────────────────────────────
  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetchApi('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), otp: otpValue }),
      });

      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setMessage('OTP verified! Please set your new password.');
        setStep('reset');
      } else {
        setError(res.message || 'Invalid or expired OTP code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 3: Reset Password ─────────────────────────────────────────────
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, password }),
      });

      if (res.success) {
        setStep('success');
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Resend OTP ─────────────────────────────────────────────────────────
  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setMessage('New OTP sent to your email.');
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'otp', label: 'Verify OTP', icon: ShieldCheck },
    { key: 'reset', label: 'New Password', icon: KeyRound },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EEF4E8] via-[#E4EDE0] to-[#E9F1E5] text-[#1E2218] flex flex-col justify-center items-center p-3 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-[#4E553B] selection:text-white">
      {/* Decorative Organic Background Graphics */}
      <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none opacity-40">
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M-50 150 C 50 80, 120 0, 200 -50 C 150 100, 80 180, -50 150 Z" fill="#D6E5CE" />
          <path d="M0 220 C 100 150, 160 80, 260 20" stroke="#C4D7B9" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none opacity-45">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M450 200 C 350 260, 260 350, 200 450 C 320 400, 390 320, 450 200 Z" fill="#D2E3C9" />
          <path d="M220 420 C 280 320, 360 240, 440 180" stroke="#B8CCA9" strokeWidth="1.5" strokeDasharray="5 5" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Brand Header */}
        <div className="text-center mb-5">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-11 h-11 shrink-0 flex items-center justify-center p-1 bg-white rounded-2xl shadow-md border border-[#DCE4D4]">
              <Image src={logo} alt="Sakthi Frozen Foods" fill className="object-contain p-1" priority />
            </div>
            <div className="text-left">
              <span className="text-sm font-black tracking-tight text-[#4E553B] block leading-tight">
                MOCK MEAT
              </span>
              <span className="text-[9px] font-bold tracking-widest text-stone-500 uppercase block">
                SAKTHI FROZEN FOODS
              </span>
            </div>
          </Link>
        </div>

        {/* Step Progress Indicators */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === currentStepIndex;
              const isCompleted = i < currentStepIndex;
              return (
                <React.Fragment key={s.key}>
                  {i > 0 && (
                    <div
                      className={`h-0.5 w-6 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-[#4E553B]' : 'bg-stone-300'
                      }`}
                    />
                  )}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#4E553B] text-white shadow-xs scale-105'
                        : isCompleted
                        ? 'bg-[#EAEFE6] text-[#4E553B]'
                        : 'bg-white text-stone-400 border border-stone-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{s.label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Card Box */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_25px_70px_-15px_rgba(50,60,40,0.16)] border border-[#DCE4D4]/80 overflow-hidden p-6 sm:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 rounded-2xl flex items-start gap-2.5 border border-red-200 text-red-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {message && step !== 'success' && (
            <div className="mb-5 p-3.5 bg-[#EAEFE6] rounded-2xl flex items-start gap-2.5 border border-[#4E553B]/20 text-[#2D3823] text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#4E553B] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{message}</span>
            </div>
          )}

          {/* ─── STEP: Email ──────────────────────────────────────── */}
          {step === 'email' && (
            <>
              <div className="text-center mb-6">
                <div className="w-13 h-13 rounded-2xl bg-[#EAEFE6] text-[#4E553B] flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-black text-stone-900 tracking-tight">Forgot Password?</h1>
                <p className="text-xs text-stone-500 mt-1">
                  Enter your email address and we&apos;ll send you a 6-digit OTP code to reset it.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-800 uppercase tracking-wider mb-2">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#EDF2FE] hover:bg-[#E7EEFC] focus:bg-white border border-[#DFE7F8] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E553B]/25 focus:border-[#4E553B] transition-all placeholder:text-stone-400 disabled:opacity-60"
                      placeholder="Enter your email address"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#4E553B] hover:bg-[#40472F] active:bg-[#383E28] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4E553B]/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-75 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ─── STEP: OTP Verification ──────────────────────────── */}
          {step === 'otp' && (
            <>
              <div className="text-center mb-6">
                <div className="w-13 h-13 rounded-2xl bg-[#EAEFE6] text-[#4E553B] flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-black text-stone-900 tracking-tight">Verify 6-Digit OTP</h1>
                <p className="text-xs text-stone-500 mt-1">
                  Enter the code sent to <strong className="text-stone-900">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-2xl border-2 transition-all focus:outline-none ${
                        digit
                          ? 'border-[#4E553B] bg-[#EDF2FE] text-stone-900'
                          : 'border-[#DFE7F8] bg-[#EDF2FE] text-stone-400'
                      } focus:border-[#4E553B] focus:bg-white`}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full py-3.5 bg-[#4E553B] hover:bg-[#40472F] active:bg-[#383E28] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4E553B]/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Code</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-stone-500">
                    Didn&apos;t receive code?{' '}
                    {resendCooldown > 0 ? (
                      <span className="font-bold text-[#4E553B]">Resend in {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="font-black text-[#4E553B] hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </p>
                </div>
              </form>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError('');
                  setMessage('');
                }}
                className="mt-4 w-full text-center text-xs font-bold text-stone-500 hover:text-[#4E553B] flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change email address
              </button>
            </>
          )}

          {/* ─── STEP: Reset Password ────────────────────────────── */}
          {step === 'reset' && (
            <>
              <div className="text-center mb-6">
                <div className="w-13 h-13 rounded-2xl bg-[#EAEFE6] text-[#4E553B] flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-black text-stone-900 tracking-tight">Create New Password</h1>
                <p className="text-xs text-stone-500 mt-1">Choose a secure password with at least 6 characters.</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-stone-800 uppercase tracking-wider mb-2">
                    NEW PASSWORD
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-[#EDF2FE] hover:bg-[#E7EEFC] focus:bg-white border border-[#DFE7F8] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E553B]/25 focus:border-[#4E553B] transition-all placeholder:text-stone-400"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
                      aria-label={showPassword ? 'Hide' : 'Show'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-stone-800 uppercase tracking-wider mb-2">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-[#EDF2FE] hover:bg-[#E7EEFC] focus:bg-white border border-[#DFE7F8] text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E553B]/25 focus:border-[#4E553B] transition-all placeholder:text-stone-400"
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || password.length < 6 || password !== confirmPassword}
                  className="w-full py-3.5 bg-[#4E553B] hover:bg-[#40472F] active:bg-[#383E28] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4E553B]/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ─── STEP: Success ────────────────────────────────────── */}
          {step === 'success' && (
            <div className="text-center py-3">
              <div className="w-14 h-14 rounded-2xl bg-[#EAEFE6] text-[#4E553B] flex items-center justify-center mx-auto mb-4 border border-[#4E553B]/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-black text-stone-900 tracking-tight">Password Updated!</h1>
              <p className="text-xs text-stone-500 mt-1 mb-6 leading-relaxed">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link
                href="/login"
                className="w-full py-3.5 bg-[#4E553B] hover:bg-[#40472F] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#4E553B]/20 transition-all active:scale-[0.98]"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Footer Links */}
          {step !== 'success' && (
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <Link href="/login" className="font-bold text-[#4E553B] hover:underline">
                ← Back to Sign In
              </Link>
              <Link href="/" className="font-semibold text-stone-400 hover:text-[#4E553B]">
                Storefront
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
