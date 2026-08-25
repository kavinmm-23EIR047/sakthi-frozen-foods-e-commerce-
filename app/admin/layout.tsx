'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'Admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8EEE0] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#4D583F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only render children if user is Admin
  if (user && user.role === 'Admin') {
    return <>{children}</>;
  }

  // Prevent flash of content while redirecting
  return null;
}
