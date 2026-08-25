'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

export type UserType = {
  _id: string;
  name: string;
  email: string;
  role: 'Customer' | 'Admin';
  token: string;
};

interface AuthContextType {
  user: UserType | null;
  login: (userData: UserType) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Check local storage for user token on load
    const storedUser = localStorage.getItem('sakthi_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: UserType) => {
    setUser(userData);
    localStorage.setItem('sakthi_user', JSON.stringify(userData));
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sakthi_user');
    showToast('Logged out successfully', 'info');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
