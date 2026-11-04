'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { fetchApi } from '@/lib/apiConfig';

export type UserType = {
  _id: string;
  name: string;
  email: string;
  role: 'Customer' | 'Admin';
  token: string;
  phone?: string;
  address?: string;
  avatar?: string;
  authProvider?: 'local' | 'google';
  googleId?: string;
};

interface AuthContextType {
  user: UserType | null;
  login: (userData: UserType) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<UserType>) => void;
  updatePhone: (phone: string, tokenOverride?: string) => Promise<{ success: boolean; message?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  updatePhone: async () => ({ success: false }),
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Check session via Next.js proxy route which reads the HttpOnly cookie or Bearer token
    const checkSession = async () => {
      try {
        const storedToken =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
            : null;

        const headers: Record<string, string> = {};
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
        }

        const res = await fetch('/api/auth/me', {
          headers,
          credentials: 'include',
        });

        if (res.ok) {
          const text = await res.text();
          if (text && text.trim()) {
            const data = JSON.parse(text);
            if (data.success && data.data) {
              setUser(data.data);
            }
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const login = (userData: UserType) => {
    setUser(userData);
    if (userData.token) {
      sessionStorage.setItem('auth_token', userData.token);
      localStorage.setItem('auth_token', userData.token);
    }
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const updateUser = (updatedData: Partial<UserType>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const updatePhone = async (phone: string, tokenOverride?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const storedToken =
        tokenOverride ||
        user?.token ||
        (typeof window !== 'undefined'
          ? sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')
          : null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }

      const res = await fetchApi('/auth/phone', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ phone }),
      });

      if (res.success && res.data) {
        setUser((prev) => (prev ? { ...prev, phone: res.data.phone } : res.data));
        showToast('Mobile number saved successfully!', 'success');
        return { success: true };
      }
      return { success: false, message: res.message || res.error || 'Failed to update mobile number' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error occurred' };
    }
  };

  const logout = async () => {
    setUser(null);
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token');
    try {
      // Clear the HttpOnly cookie
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    showToast('Logged out successfully', 'info');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, updatePhone, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
