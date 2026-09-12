'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/apiConfig';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetchApi('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
    setMessage(response.message || 'If an account exists, reset instructions have been sent.');
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#E8EEE0] p-4"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-lg"><h1 className="text-2xl font-black">Forgot Password</h1><p className="text-sm text-[#61665D]">Enter your email and we will send reset instructions if an account exists.</p><input className="w-full rounded-xl border border-[#4F534C]/20 px-4 py-3" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /><button className="w-full rounded-xl bg-[#4D583F] px-4 py-3 font-bold text-white disabled:opacity-50" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>{message && <p className="text-sm text-[#4D583F]">{message}</p>}<Link href="/login" className="block text-sm font-bold text-[#4D583F]">Back to login</Link></form></main>;
}
