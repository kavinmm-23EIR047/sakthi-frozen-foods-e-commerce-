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

  if (loading) return null;

  // Only render children if user is Admin
  if (user && user.role === 'Admin') {
    return <>{children}</>;
  }

  // Prevent flash of content while redirecting
  return null;
}
