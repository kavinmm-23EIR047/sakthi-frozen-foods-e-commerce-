'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/apiConfig';
import { Mail, ArrowRight, ShieldCheck, KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

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
        body: JSON.stringify({ email }),
      });

      if (res.success) {
        setMessage(res.message || 'OTP sent to your email.');
        setStep('otp');
        setResendCooldown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
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
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetchApi('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: otpValue }),
      });

      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setMessage('OTP verified! Set your new password.');
        setStep('reset');
      } else {
        setError(res.message || 'Invalid OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 3: Reset Password ─────────────────────────────────────────────
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
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
      setError(err.message || 'Network error');
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
        body: JSON.stringify({ email }),
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

  // ─── Step Indicator ─────────────────────────────────────────────────────
  const steps = [
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'otp', label: 'Verify OTP', icon: ShieldCheck },
    { key: 'reset', label: 'New Password', icon: KeyRound },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <main className="min-h-screen bg-[#E8EEE0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Step Progress */}
        {step !== 'success' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === currentStepIndex;
              const isCompleted = i < currentStepIndex;
              return (
                <React.Fragment key={s.key}>
                  {i > 0 && (
                    <div className={`h-0.5 w-8 rounded-full transition-all duration-500 ${isCompleted ? 'bg-[#656B4F]' : 'bg-[#656B4F]/20'}`} />
                  )}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    isActive ? 'bg-[#656B4F] text-white shadow-md scale-105' :
                    isCompleted ? 'bg-[#656B4F]/20 text-[#656B4F]' :
                    'bg-white/60 text-[#A7ADA9]'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-[#4F534C]/10 overflow-hidden">
          <div className="p-8 sm:p-10">

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-red-800 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {message && step !== 'success' && (
              <div className="mb-6 p-4 bg-[#EAF0E5] rounded-2xl flex items-start gap-3 border border-[#656B4F]/30">
                <CheckCircle2 className="w-5 h-5 text-[#656B4F] shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-[#2D3823] leading-relaxed">{message}</p>
              </div>
            )}

            {/* ─── STEP: Email ──────────────────────────────────────── */}
            {step === 'email' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-[#656B4F]/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-[#656B4F]" />
                  </div>
                  <h1 className="text-2xl font-black text-[#1E201D]">Forgot Password?</h1>
                  <p className="text-sm text-[#61665D] mt-2">Enter your email and we&apos;ll send a 6-digit OTP to reset your password.</p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#656B4F] mb-1.5 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-[#61665D]" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#656B4F] focus:border-transparent transition-all shadow-sm placeholder:text-[#A7ADA9]"
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#656B4F] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#50563D] transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send OTP</span>
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
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-[#EAF0E5] flex items-center justify-center mx-auto mb-4 border border-[#656B4F]/20">
                    <ShieldCheck className="w-8 h-8 text-[#656B4F]" />
                  </div>
                  <h1 className="text-2xl font-black text-[#1E201D]">Verify OTP</h1>
                  <p className="text-sm text-[#61665D] mt-2">
                    Enter the 6-digit code sent to <strong className="text-[#1E201D]">{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 shadow-sm ${
                          digit
                            ? 'border-[#656B4F] bg-[#656B4F]/5 text-[#1E201D]'
                            : 'border-[#4F534C]/20 bg-[#FAFAF5] text-[#A7ADA9]'
                        } focus:border-[#656B4F] focus:shadow-md`}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full py-3.5 bg-[#656B4F] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#50563D] transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify OTP</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-xs text-[#61665D]">
                      Didn&apos;t receive the code?{' '}
                      {resendCooldown > 0 ? (
                        <span className="font-bold text-[#A7ADA9]">Resend in {resendCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="font-bold text-[#656B4F] hover:underline disabled:opacity-50"
                        >
                          Resend OTP
                        </button>
                      )}
                    </p>
                  </div>
                </form>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setMessage(''); }}
                  className="mt-4 w-full text-center text-xs font-bold text-[#656B4F] hover:underline flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change email
                </button>
              </>
            )}

            {/* ─── STEP: Reset Password ────────────────────────────── */}
            {step === 'reset' && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-black text-[#1E201D]">Set New Password</h1>
                  <p className="text-sm text-[#61665D] mt-2">Choose a strong password with at least 8 characters.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#656B4F] mb-1.5 uppercase tracking-wide">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#61665D]" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#656B4F] focus:border-transparent transition-all shadow-sm placeholder:text-[#A7ADA9]"
                        placeholder="Min 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#61665D] hover:text-[#656B4F]"
                        aria-label={showPassword ? 'Hide' : 'Show'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Password strength */}
                    {password.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              password.length >= level * 3
                                ? level <= 2 ? 'bg-red-400' : level === 3 ? 'bg-amber-400' : 'bg-[#656B4F]'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#656B4F] mb-1.5 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#61665D]" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#656B4F] focus:border-transparent transition-all shadow-sm placeholder:text-[#A7ADA9]"
                        placeholder="Re-enter password"
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || password.length < 8 || password !== confirmPassword}
                    className="w-full py-3.5 bg-[#656B4F] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#50563D] transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-[#EAF0E5] flex items-center justify-center mx-auto mb-5 border border-[#656B4F]/20">
                  <CheckCircle2 className="w-10 h-10 text-[#656B4F]" />
                </div>
                <h1 className="text-2xl font-black text-[#1E201D] mb-2">Password Reset!</h1>
                <p className="text-sm text-[#61665D] mb-8">Your password has been updated successfully. You can now login with your new password.</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#656B4F] text-white font-bold rounded-xl text-sm hover:bg-[#50563D] transition-all shadow-md"
                >
                  <span>Go to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Footer Links */}
            {step !== 'success' && (
              <div className="mt-6 pt-4 border-t border-[#4F534C]/10 text-center space-y-2">
                <Link href="/login" className="block text-xs font-bold text-[#656B4F] hover:underline">
                  ← Back to Login
                </Link>
                <Link href="/" className="block text-[11px] text-[#A7ADA9] hover:text-[#656B4F] font-bold">
                  ← Back to Store
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
