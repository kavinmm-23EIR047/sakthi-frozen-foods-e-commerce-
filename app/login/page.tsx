'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/apiConfig';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

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

      if (res.success) {
        login(res.data);
        if (res.data.role === 'Admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError(res.message || 'Invalid mobile number/email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8EEE0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#4F534C]/10 overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#1E201D] tracking-tight">Welcome Back</h1>
            <p className="text-sm text-[#61665D] mt-2">Sign in with Mobile Number or Email</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-red-800 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#4D583F] uppercase tracking-wide">
                  Mobile Number or Email
                </label>
                <span className="text-[10px] text-[#61665D] font-semibold">
                  {isNumericOnly && identifier.trim().length > 0 ? 'Mobile Mode' : 'Email/Mobile'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {isNumericOnly && identifier.trim().length > 0 ? (
                    <Phone className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Mail className="h-4 w-4 text-[#61665D]" />
                  )}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F] focus:border-transparent transition-all shadow-sm placeholder:text-[#A7ADA9]"
                  placeholder="9876543210 or you@example.com"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4D583F] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#61665D]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F] focus:border-transparent transition-all shadow-sm placeholder:text-[#A7ADA9]"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-[#61665D] hover:text-[#4D583F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4D583F]" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#4D583F] text-[#FAFAF5] font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#414b35] transition-all shadow-md active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#61665D] mt-8 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#4D583F] font-bold hover:underline">
              Create Account
            </Link>
          </p>
          <Link href="/forgot-password" className="mt-3 block text-center text-xs font-bold text-[#4D583F] hover:underline">
            Forgot password?
          </Link>
          <div className="mt-4 pt-4 border-t border-[#4F534C]/10 text-center">
            <Link href="/" className="text-[11px] text-[#A7ADA9] hover:text-[#4D583F] font-bold">
              &larr; Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
