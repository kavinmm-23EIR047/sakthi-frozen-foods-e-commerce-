'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/apiConfig';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
    setMessage(response.message || response.error || 'Unable to reset password.');
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#E8EEE0] p-4"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-lg"><h1 className="text-2xl font-black">Reset Password</h1><p className="text-sm text-[#61665D]">Choose a new password with at least 8 characters.</p><input className="w-full rounded-xl border border-[#4F534C]/20 px-4 py-3" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" /><button className="w-full rounded-xl bg-[#4D583F] px-4 py-3 font-bold text-white disabled:opacity-50" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>{message && <p className="text-sm text-[#4D583F]">{message}</p>}<Link href="/login" className="block text-sm font-bold text-[#4D583F]">Go to login</Link></form></main>;
}
