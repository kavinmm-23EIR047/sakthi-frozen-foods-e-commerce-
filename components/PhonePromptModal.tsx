'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Phone, AlertCircle, Loader2, X, CheckCircle2 } from 'lucide-react';

interface PhonePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (phone: string) => void;
  title?: string;
  description?: string;
  allowSkip?: boolean;
  tokenOverride?: string;
}

export default function PhonePromptModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Please Enter Your Mobile Number',
  description = 'We need your 10-digit mobile number for order delivery coordination and WhatsApp status updates.',
  allowSkip = true,
  tokenOverride,
}: PhonePromptModalProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { updatePhone } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = phone.replace(/\D/g, '').replace(/^91/, '');
    if (!/^[6-9]\d{9}$/.test(clean)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setLoading(true);
    const res = await updatePhone(clean, tokenOverride);

    if (res.success) {
      setLoading(false);
      onSuccess?.(clean);
      onClose();
    } else {
      setError(res.message || 'Failed to save mobile number. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 relative">
        {allowSkip && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF0E5] text-[#4E553B] flex items-center justify-center shrink-0 shadow-sm">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight leading-tight">
              {title}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4E553B] mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> One-time profile setup
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 mb-5 leading-relaxed">
          {description}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] sm:text-[11px] font-extrabold text-stone-800 uppercase tracking-wider mb-1.5">
              10-DIGIT MOBILE NUMBER <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none gap-1.5 text-stone-500">
                <span className="text-xs font-bold text-stone-700 border-r border-stone-300 pr-2">🇮🇳 +91</span>
              </div>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPhone(val);
                }}
                required
                disabled={loading}
                autoFocus
                placeholder="9876543210"
                className="w-full pl-[4.8rem] pr-4 py-3 sm:py-3.5 rounded-2xl bg-[#EDF2FE] hover:bg-[#E7EEFC] focus:bg-white border border-[#DFE7F8] text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#4E553B]/25 focus:border-[#4E553B] transition-all tracking-wider placeholder:text-stone-400 disabled:opacity-60"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1 pl-1">
              Must be 10 digits starting with 6, 7, 8, or 9
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full sm:flex-1 py-3.5 bg-[#4E553B] hover:bg-[#40472F] active:bg-[#383E28] text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#4E553B]/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Mobile Number...</span>
                </>
              ) : (
                <span>Save & Continue</span>
              )}
            </button>

            {allowSkip && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-3 text-stone-500 hover:text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Skip for now
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

