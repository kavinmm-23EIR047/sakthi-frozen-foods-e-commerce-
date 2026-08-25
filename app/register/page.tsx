'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/apiConfig';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, User as UserIcon, Phone, MapPin, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        login(res.data);
        router.push('/');
      } else {
        setError(res.message || 'Failed to create account');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8EEE0] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#4F534C]/10 overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#1E201D] tracking-tight">Create Account</h1>
            <p className="text-sm text-[#61665D] mt-2">Join Sakthi Frozen Foods</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-red-800 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#4D583F] mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-[#61665D]" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F] shadow-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4D583F] mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#61665D]" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F] shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4D583F] mb-1.5 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-[#61665D]" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F] shadow-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#4D583F] mb-1.5 uppercase tracking-wide">
                Shipping Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-[#61665D]" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F] shadow-sm"
                  placeholder="123 Main St, City, Zip"
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
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF5] border border-[#4F534C]/20 text-sm font-medium text-[#1E201D] focus:outline-none focus:ring-2 focus:ring-[#4D583F] shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#4D583F] text-[#FAFAF5] font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#414b35] transition-all shadow-md active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#61665D] mt-8 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4D583F] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
