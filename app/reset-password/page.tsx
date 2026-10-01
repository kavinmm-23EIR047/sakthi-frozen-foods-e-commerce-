'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/apiConfig';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    const response = await fetchApi('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });

    if (response.success) {
      setSuccess(true);
      setMessage('Password reset successfully!');
    } else {
      setError(response.message || response.error || 'Unable to reset password.');
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#E8EEE0] p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#4F534C]/10 overflow-hidden">
        <div className="p-8 sm:p-10">
          {success ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-[#EAF0E5] flex items-center justify-center mx-auto mb-5 border border-[#656B4F]/20">
                <CheckCircle2 className="w-10 h-10 text-[#656B4F]" />
              </div>
              <h1 className="text-2xl font-black text-[#1E201D] mb-2">Password Updated!</h1>
              <p className="text-sm text-[#61665D] mb-8">{message}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#656B4F] text-white font-bold rounded-xl text-sm hover:bg-[#50563D] transition-all shadow-md"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-black text-[#1E201D]">Reset Password</h1>
                <p className="text-sm text-[#61665D] mt-2">Choose a new password with at least 8 characters.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-red-800 leading-relaxed">{error}</p>
                </div>
              )}

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#656B4F] mb-1.5 uppercase tracking-wide">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#61665D]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      minLength={8}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#656B4F] focus:border-transparent transition-all shadow-sm placeholder:text-[#A7ADA9]"
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#61665D] hover:text-[#656B4F]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#656B4F] mb-1.5 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#61665D]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      minLength={8}
                      required
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
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#4F534C]/10 text-center">
                <Link href="/login" className="block text-xs font-bold text-[#656B4F] hover:underline">
                  ← Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
